// T-293 / RC14 native build inputs: the qualified recipe's native build (`build-native.mjs --protected-inputs`)
// executes only the declared protected toolchain bytes, without ambient fallback (D4/D5 "RC14 exact candidate
// preparation and native auxiliary inputs"; D6 section 2; PROOF_PLAN nativeRelocationEvidence/coldLoadEvidence).
//
// Disposable relocation roots, fixtures and candidate copies live below process.env.TMPDIR (the Operator's external
// proof scratch). Protected copies are staged exactly as the preparation stages auxiliary rows (verified bytes,
// create-only writeFile), which reproduces the C2 snapshot's loss of executable modes. When
// ABI5_NATIVE_BUILD_PROOF_RECORD is supplied, the compact relocated-build evidence is written there and the two
// relocation roots with their outputs are kept for Operator readback; otherwise the scratch is removed. No raw
// SDK/header/compiler bytes or per-member inventories enter tracked source or the record. Host toolchain paths are
// read only, as the declared acquisition sources; nothing here changes them, a protected copy or the candidate.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, posix, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EXECUTION_VIEW_MODE, EXECUTION_VIEW_RELATIVE_PATH, INPUTS_RELATIVE_PATH, deriveExecutionView, inventoryDigest, parseNativeBuildInputs,
  placementCollisions, protectedCommand, protectedPlacementRows, protectedRootOf, readNativeBuildInputs, sha256Bytes, verifyPlacedRows,
  within } from '../../scripts/native-build/protected-inputs.mjs';
import { nativeAuxiliaryInputs, nativePlacement, recipeAuxiliarySources } from '../qualification/native-inputs.mjs';
import { isolatedCompiledCopy } from '../support/isolated-compiled-copy.mjs';

const TENANT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCUMENT = JSON.parse(await readFile(join(TENANT, INPUTS_RELATIVE_PATH), 'utf8'));
const inputs = parseNativeBuildInputs(structuredClone(DOCUMENT), TENANT), toolchain = inputs.toolchain;
const rows = protectedPlacementRows(inputs), executionRows = rows.filter(row => row.execution);
const ROOT = inputs.protectedPlacement.root, HOST_ROOTS = inputs.protectedPlacement.hierarchy.map(root => root.hostRoot);
const relativeOf = host => rows.find(row => row.hostPath === host)?.relativePath;
const declared = JSON.parse(await readFile(join(TENANT, 'test_env/qualification/recipe/declared-commands.json'), 'utf8'));
const BUILD = declared.commands.find(command => command.commandId === 'command://abiogenesis/qualification/build-native');
const PACKAGE_FILES = [INPUTS_RELATIVE_PATH, 'scripts/build-native.mjs', 'scripts/native-build/protected-inputs.mjs', inputs.source.path];
const RECORD = process.env.ABI5_NATIVE_BUILD_PROOF_RECORD;
const ORDINARY = join(TENANT, inputs.output);
const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-native-inputs-')));
after(async () => {
  if (RECORD === undefined || RECORD === '') return rm(scratch, { recursive: true, force: true });
  for (const name of await readdir(scratch)) if (!name.startsWith('relocation-')) await rm(join(scratch, name), { recursive: true, force: true });
});

const digestsOf = async (root, paths) => Object.fromEntries(await Promise.all(paths.map(async path => [path, sha256Bytes(await readFile(join(root, path)))])));
const tenantSourceBefore = await digestsOf(TENANT, PACKAGE_FILES);
// The preparation's own auxiliary rows and acquisition sources: refuses here when a declared host input changed.
const AUX = await nativeAuxiliaryInputs(TENANT);
const SOURCES = await recipeAuxiliarySources({ dependencyRoot: join(scratch, 'dependencies') });
const byteCountOf = new Map(AUX.map(row => [row.relativePath.slice(ROOT.length + 1), row.byteCount]));
const evidence = { runs: [], negatives: [] };
const firstLine = text => String(text).split('\n').map(line => line.trim()).find(line => line !== '') ?? '';
const absent = async path => { try { await lstat(path); return false; } catch (error) { if (error.code === 'ENOENT') return true; throw error; } };

// Child custody. When the Operator selects ABI5_NATIVE_BUILD_PROOF_RECORD, one fresh directory below the record's
// parent (the external proof scratch) receives every actual child request, its exact stdout/stderr bytes and its
// status/error/signal/duration, plus the material classification observations, each written create-only before any
// assertion over it, so a first failure keeps them. These are partial observations; the successful
// native_relocation_proof conjunction stays the separate record written last. Unrecorded runs keep nothing.
const RECORD_PATH = RECORD === undefined || RECORD === '' ? null : resolve(RECORD);
if (RECORD_PATH !== null) await mkdir(dirname(RECORD_PATH), { recursive: true });
const CUSTODY = RECORD_PATH === null ? null : await realpath(await mkdtemp(join(dirname(RECORD_PATH), 'native-input-children-')));
let custodySequence = 0;
const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 64);
/** Retains one observation (and any raw byte streams beside it) create-only; returns its actual path, or null. */
async function retain(testCase, label, value, streams = {}) {
  if (CUSTODY === null) return null;
  const sequence = ++custodySequence, base = join(CUSTODY, `${String(sequence).padStart(3, '0')}-${slug(testCase)}-${slug(label)}`), files = {};
  for (const [name, bytes] of Object.entries(streams)) {
    if (bytes === null) { files[name] = null; continue; }
    await writeFile(`${base}.${name}`, bytes, { flag: 'wx' });
    files[name] = { path: `${base}.${name}`, bytes: bytes.length, sha256: sha256Bytes(bytes) };
  }
  await writeFile(base + '.json', JSON.stringify({ sequence, case: testCase, label, custody: CUSTODY, ...value, streams: files }, null, 2) + '\n', { flag: 'wx' });
  return base + '.json';
}
const errorValue = error => error == null ? null
  : { code: error.code ?? null, errno: error.errno ?? null, syscall: error.syscall ?? null, path: error.path ?? null, message: String(error.message ?? error) };
/** One actual child process; its request, exact output bytes and result are retained before the caller sees them. */
async function spawnRetained(testCase, label, executable, args, options) {
  const started = performance.now();
  const result = spawnSync(executable, args, { ...options, encoding: 'buffer' });
  const durationMs = Math.round(performance.now() - started);
  const custody = await retain(testCase, label, {
    request: { executable, argv: [executable, ...args], cwd: options.cwd ?? process.cwd(), env: options.env ?? null, timeoutMs: options.timeout ?? null, maxBuffer: options.maxBuffer ?? null },
    result: { pid: result.pid ?? null, status: result.status, signal: result.signal, error: errorValue(result.error), durationMs } },
  { stdout: result.stdout ?? null, stderr: result.stderr ?? null });
  return { pid: result.pid, status: result.status, signal: result.signal, error: result.error, argv: [executable, ...args], durationMs, custody,
    stdout: result.stdout == null ? null : result.stdout.toString('utf8'), stderr: result.stderr == null ? null : result.stderr.toString('utf8') };
}
/** A defensive read for retained observations only; assertions still read and judge the actual values. */
const observe = async read => { try { return await read(); } catch (error) { return { unavailable: error.code ?? String(error) }; } };

/** One inventory digest of the declared host rows as they are now (paths, bytes, lengths, modes). */
async function hostDigest() {
  const members = [];
  for (const row of rows) {
    const bytes = await readFile(row.hostPath), status = await stat(row.hostPath);
    members.push({ relativePath: row.relativePath, sha256: sha256Bytes(bytes), byteCount: bytes.length, mode: status.mode & 0o7777 });
  }
  return inventoryDigest(members);
}

/**
 * A relocation package: the native build script, its module, the inputs document and the C source, plus every
 * native auxiliary row at its worksite path. `snapshot` stages as the preparation and C2 snapshot do (verified
 * bytes, create-only writeFile, so no executable mode survives); `clone` is a cheaper fixture for refusal cases.
 */
async function stagePackage(root, placement) {
  await mkdir(root);
  for (const path of PACKAGE_FILES) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), await readFile(join(TENANT, path)), { flag: 'wx' });
  }
  for (const row of AUX) {
    const from = SOURCES.sourceOf(row), to = join(root, row.relativePath);
    await mkdir(dirname(to), { recursive: true });
    // A clone copies a symbolic link itself (libSystem.tbd is one on the host); the placed member is its target's bytes.
    if (placement === 'clone') { await copyFile(await realpath(from), to, constants.COPYFILE_EXCL | constants.COPYFILE_FICLONE); continue; }
    const bytes = await readFile(from);
    assert.equal('sha256:' + sha256Bytes(bytes), row.digest, row.relativePath);
    assert.equal(bytes.length, row.byteCount, row.relativePath);
    await writeFile(to, bytes, { flag: 'wx' });
  }
  return root;
}

/** The declared recipe command, exactly: executable, arguments, cwd and closed environment; retained as one child. */
function runDeclared(testCase, label, root, args = BUILD.args) {
  return spawnRetained(testCase, label, BUILD.executable, args, { cwd: join(root, BUILD.relativeCwd), env: { ...BUILD.environment },
    timeout: BUILD.timeoutMs, maxBuffer: 1 << 24 });
}

// --- Mach-O load commands (read only) ---------------------------------------------------------------------------
const FAT_MAGIC = 0xcafebabe, FAT_MAGIC_64 = 0xcafebabf, MH_MAGIC_64 = 0xfeedfacf, CPU_TYPE_ARM64 = 0x0100000c, CPU_TYPE_X86_64 = 0x01000007;
const DYLIB_COMMANDS = new Set([0xc, 0x20, 0x80000018, 0x8000001f, 0x80000023]), LC_RPATH = 0x8000001c;
function arm64Slice(bytes) {
  const magic = bytes.readUInt32BE(0);
  if (magic === FAT_MAGIC || magic === FAT_MAGIC_64) {
    const wide = magic === FAT_MAGIC_64, size = wide ? 32 : 20;
    for (let index = 0; index < bytes.readUInt32BE(4); index++) {
      const at = 8 + index * size;
      if (bytes.readUInt32BE(at) !== CPU_TYPE_ARM64) continue;
      const offset = wide ? Number(bytes.readBigUInt64BE(at + 8)) : bytes.readUInt32BE(at + 8);
      const length = wide ? Number(bytes.readBigUInt64BE(at + 16)) : bytes.readUInt32BE(at + 12);
      return bytes.subarray(offset, offset + length);
    }
    return null;
  }
  return bytes.readUInt32LE(0) === MH_MAGIC_64 && bytes.readUInt32LE(4) === CPU_TYPE_ARM64 ? bytes : null;
}
function loadCommands(slice) {
  const dylibs = [], rpaths = [];
  let at = 32;
  for (let index = 0; index < slice.readUInt32LE(16); index++) {
    const command = slice.readUInt32LE(at), size = slice.readUInt32LE(at + 4);
    const text = () => { const start = at + slice.readUInt32LE(at + 8), end = slice.indexOf(0, start);
      return slice.toString('utf8', start, end === -1 || end > at + size ? at + size : end); };
    if (DYLIB_COMMANDS.has(command)) dylibs.push(text());
    else if (command === LC_RPATH) rpaths.push(text());
    at += size;
  }
  return { dylibs, rpaths };
}
const systemLibrary = name => name.startsWith('/usr/lib/') || name.startsWith('/System/Library/');

// --- Linker trace classification (read only) ----------------------------------------------------------------------
/** The install names and re-exported libraries one text-based stub (.tbd) declares, read from its exact bytes. */
function stubDeclaredNames(text) {
  const names = new Set();
  let reexports = false;
  for (const line of text.split('\n')) {
    if (/^[^\s-]/u.test(line)) reexports = line.startsWith('reexported-libraries:');
    const install = /^install-name:\s*'?([^'\s]+)'?\s*$/u.exec(line);
    if (install !== null) names.add(install[1]);
    if (reexports) for (const [, name] of line.matchAll(/'(\/[^']+)'/gu)) names.add(name);
  }
  return names;
}
/**
 * One `-Wl,-t` display name as exactly one of: the work object; an exact protected acquisition (a bound row at its
 * protected placement); an OS install name or re-export declared by a protected SDK stub the same trace acquired;
 * the accepted OS/system-loader substrate (the exact OS libraries named by the executed toolchain members' own load
 * commands); otherwise unknown, which refuses. A display name alone, existing on the host or not, is not a read.
 */
const classifyTraceEntry = (path, { object, protectedRoot, placedRelative, declaredBySdk, substrate }) =>
  path === object ? 'work'
    : within(path, protectedRoot) ? (placedRelative.has(path.slice(protectedRoot.length + 1)) ? 'protected' : 'unknown')
      : systemLibrary(path) && declaredBySdk.has(path) ? 'sdk-declared'
        : systemLibrary(path) && substrate.has(path) ? 'system-substrate' : 'unknown';

test('mandatory native closure and hierarchy are exact', async () => {
  // The linker's actual @rpath closure is exactly the four bound libraries; they and the compiler load only OS libraries.
  const traced = async host => {
    const bytes = await readFile(host);
    assert.equal(sha256Bytes(bytes), rows.find(row => row.hostPath === host).sha256, 'traced bytes are the declared bytes: ' + host);
    const slice = arm64Slice(bytes);
    assert.notEqual(slice, null, 'an arm64 slice: ' + host);
    return loadCommands(slice);
  };
  const ld = await traced(toolchain.linker), clang = await traced(toolchain.clang);
  assert.ok(ld.rpaths.includes('@executable_path/../lib/'), JSON.stringify(ld.rpaths));
  const rpathed = ld.dylibs.filter(name => name.startsWith('@rpath/')).map(name => name.slice('@rpath/'.length)).sort();
  assert.deepEqual(rpathed, ['libLTO.dylib', 'libcodedirectory.dylib', 'libswiftDemangle.dylib', 'libtapi.dylib']);
  assert.deepEqual(ld.dylibs.filter(name => !name.startsWith('@rpath/') && !systemLibrary(name)), [], 'the linker loads nothing else');
  assert.deepEqual(clang.dylibs.filter(name => !systemLibrary(name)), [], 'the compiler loads only OS libraries');
  assert.deepEqual(toolchain.linkerLoadedLibraries.map(path => basename(path)).sort(), rpathed);
  for (const library of toolchain.linkerLoadedLibraries) {
    assert.equal(dirname(library), join(dirname(toolchain.toolchainBin), 'lib'), library);
    const loaded = await traced(library);
    assert.deepEqual(loaded.dylibs.filter(name => !systemLibrary(name)), [], 'only OS libraries below ' + library);
  }
  for (const name of ['libtapi.dylib', 'libcodedirectory.dylib', 'libswiftDemangle.dylib'])
    assert.equal(DOCUMENT.inputFiles.filter(row => basename(row.path) === name && dirname(row.path) === join(dirname(toolchain.toolchainBin), 'lib')).length, 1, name);

  // The retained rows plus the three mandatory libraries, by hierarchy root; every row bound once.
  assert.equal(DOCUMENT.inputFiles.length, 196);
  assert.equal(new Set(DOCUMENT.inputFiles.map(row => row.path)).size, 196);
  const perRoot = {};
  for (const row of rows) { const id = inputs.protectedPlacement.hierarchy.find(root => within(row.hostPath, root.hostRoot)).id; perRoot[id] = (perRoot[id] ?? 0) + 1; }
  assert.deepEqual(perRoot, { toolchain: 19, sdk: 172, 'node-headers': 5 });
  assert.deepEqual(inputs.protectedPlacement.executionMembers.slice().sort(), [toolchain.clang, toolchain.linker, ...toolchain.linkerLoadedLibraries].sort(),
    'the execution view holds exactly the compiler, linker and its libraries');

  // Each row keeps its suffix below its hierarchy root; the toolchain bin/lib/resource, SDK and header shapes survive.
  for (const row of rows) {
    const root = inputs.protectedPlacement.hierarchy.find(candidate => within(row.hostPath, candidate.hostRoot));
    assert.equal(row.relativePath, root.relativeRoot + row.hostPath.slice(root.hostRoot.length), row.hostPath);
  }
  const ldRelative = relativeOf(toolchain.linker);
  assert.equal(ldRelative, 'toolchain/XcodeDefault.xctoolchain/usr/bin/ld');
  assert.equal(relativeOf(toolchain.clang), 'toolchain/XcodeDefault.xctoolchain/usr/bin/clang');
  for (const library of toolchain.linkerLoadedLibraries)
    assert.equal(relativeOf(library), posix.join(posix.dirname(ldRelative), '../lib', basename(library)), '@executable_path/../lib/ stays inside the view');
  const toolchainRoot = inputs.protectedPlacement.hierarchy.find(root => root.id === 'toolchain');
  assert.ok(within(toolchain.resourceDir, toolchainRoot.hostRoot));
  const resourceRelative = toolchainRoot.relativeRoot + toolchain.resourceDir.slice(toolchainRoot.hostRoot.length);
  assert.equal(resourceRelative, 'toolchain/XcodeDefault.xctoolchain/usr/lib/clang/21');
  assert.ok(rows.some(row => row.relativePath === resourceRelative + '/lib/darwin/libclang_rt.osx.a'));
  assert.ok(rows.filter(row => within(row.relativePath, resourceRelative + '/include')).length >= 10);
  for (const suffix of ['sdk/MacOSX.sdk/SDKSettings.json', 'sdk/MacOSX.sdk/usr/lib/libSystem.tbd', 'node/include/node/node_api.h', 'node/include/node/node_version.h'])
    assert.ok(rows.some(row => row.relativePath === suffix), suffix);
  assert.deepEqual(placementCollisions(rows.map(row => row.relativePath)), []);

  // The recipe's auxiliary carrier: one row per input at its worksite placement, each with one declared source.
  const placement = await nativePlacement(TENANT);
  assert.equal(placement.root, 'qualification-inputs/native');
  assert.deepEqual(AUX.map(row => row.relativePath), rows.map(row => ROOT + '/' + row.relativePath));
  assert.deepEqual(AUX.map(row => row.digest), rows.map(row => 'sha256:' + row.sha256));
  assert.ok(AUX.every(row => Number.isSafeInteger(row.byteCount) && row.byteCount > 0 && Object.keys(row).sort().join(',') === 'byteCount,digest,relativePath'));
  assert.equal(SOURCES.native, 196);
  assert.deepEqual(AUX.map(row => SOURCES.sourceOf(row)), rows.map(row => row.hostPath));
  const dependencies = JSON.parse(await readFile(join(TENANT, 'test_env/qualification/recipe/dependencies.json'), 'utf8'));
  assert.equal(SOURCES.npm, dependencies.dependencies.length);
  assert.ok(dependencies.dependencies.every(row => row.path.startsWith('qualification-inputs/dependencies/') && row.path.endsWith('.tgz')),
    'dependencies.json stays npm-only');
  // sourceOf consumes the auxiliary carrier {relativePath,digest,byteCount}, which the preparation builds from each
  // dependency row; the dependency declaration row ({path,...}) is not that carrier and keeps refusing.
  const dependency = dependencies.dependencies[0];
  const dependencyCarrier = { relativePath: dependency.path, digest: dependency.digest, byteCount: dependency.byteCount };
  assert.equal(SOURCES.sourceOf(dependencyCarrier), join(scratch, 'dependencies', basename(dependency.path)));
  assert.throws(() => SOURCES.sourceOf(dependency), /no single declared source/);
  assert.throws(() => SOURCES.sourceOf({ relativePath: ROOT + '/sdk/MacOSX.sdk/usr/include/abi5-undeclared.h' }), /no single declared source/);
  await assert.rejects(recipeAuxiliarySources({ dependencyRoot: 'relative/dependencies' }), /one absolute path/);
});

test('missing changed and colliding native inputs refuse before execution', async t => {
  // Declaration law, before anything is read or placed.
  const host = name => join(dirname(toolchain.toolchainBin), 'lib', name);
  const sdkRow = rows.find(row => row.relativePath.startsWith('sdk/MacOSX.sdk/usr/include/') && /^[a-z_]+\.h$/.test(basename(row.hostPath)));
  const documentCases = [
    ['mandatory linker library unbound', d => { d.inputFiles = d.inputFiles.filter(row => row.path !== host('libtapi.dylib')); }, /toolchain member is not a bound input: .*libtapi/],
    ['execution view lacks a mandatory library', d => { d.protectedPlacement.executionMembers = d.protectedPlacement.executionMembers.filter(path => path !== host('libcodedirectory.dylib')); },
      /execution view lacks a required member: .*libcodedirectory/],
    ['execution member is not a bound input', d => { d.protectedPlacement.executionMembers.push('/usr/lib/libSystem.B.dylib'); }, /execution member is not a bound input/],
    ['bound input outside every hierarchy root', d => { d.inputFiles.push({ path: '/usr/include/stdio.h', sha256: 'a'.repeat(64) }); }, /outside every declared hierarchy root/],
    ['placed paths collide by case', d => { d.inputFiles.push({ path: dirname(sdkRow.hostPath) + '/' + basename(sdkRow.hostPath).toUpperCase(), sha256: 'b'.repeat(64) }); },
      /protected placement collision/],
    ['hierarchy roots share one placed subtree', d => { d.protectedPlacement.hierarchy[2].relativeRoot = 'Toolchain/XcodeDefault.xctoolchain/usr/include'; },
      /protected placement collision/],
    ['hierarchy host roots overlap', d => { d.protectedPlacement.hierarchy.push({ id: 'nested', hostRoot: toolchain.toolchainBin, relativeRoot: 'nested' }); }, /overlap/],
    ['hierarchy row carries another field', d => { d.protectedPlacement.hierarchy[1].fallback = '/'; }, /exactly \{id,hostRoot,relativeRoot\}/],
    ['unnormalized relative root', d => { d.protectedPlacement.hierarchy[1].relativeRoot = 'sdk/../sdk/MacOSX.sdk'; }, /normalized relative path/],
    ['placement inside the build territory', d => { d.protectedPlacement.root = 'build/qualification-inputs'; }, /outside the build/],
    ['no protected placement', d => { delete d.protectedPlacement; }, /protectedPlacement must be one object/],
    ['duplicate input row', d => { d.inputFiles.push({ ...d.inputFiles[0] }); }, /duplicate input row/],
    ['compiler outside the declared toolchain bin', d => { d.toolchain.clang = '/usr/bin/clang'; }, /declared toolchain bin directory/],
    ['undeclared compiler resource directory', d => { delete d.toolchain.resourceDir; }, /toolchain\.resourceDir must be one normalized absolute path/],
  ];
  for (const [name, mutate, pattern] of documentCases) {
    const document = structuredClone(DOCUMENT);
    mutate(document);
    assert.throws(() => parseNativeBuildInputs(document, TENANT), error => /^native build refused: /.test(error.message) && pattern.test(error.message), name);
  }
  for (const [paths, pattern] of [[['a/B.h', 'a/b.h'], /name one placed entry/], [['a/é.h', 'a/é.h'], /name one placed entry/],
    [['a', 'a/b.h'], /placed as a file but is a directory/], [['../a.h'], /not a normalized/], [['/a.h'], /not a normalized/], [['a//b.h'], /not a normalized/],
    [['a/./b.h'], /not a normalized/], [[''], /not a normalized/]]) {
    const problems = placementCollisions(paths);
    assert.ok(problems.length > 0 && problems.every(problem => pattern.test(problem)), `${JSON.stringify(paths)}: ${problems.join('; ')}`);
  }

  // Changed or missing host acquisition sources refuse the preparation's auxiliary rows; nothing is substituted.
  for (const [name, mutate, pattern] of [
    ['changed host bytes', d => { d.inputFiles.find(row => row.path === sdkRow.hostPath).sha256 = 'c'.repeat(64); }, /declared native inputs changed or missing: .*sha256/],
    ['missing host input', d => { d.inputFiles.find(row => row.path === sdkRow.hostPath).path = dirname(sdkRow.hostPath) + '/abi5-absent.h'; }, /declared native inputs changed or missing: .*ENOENT/],
  ]) {
    const root = join(scratch, 'host-' + name.replaceAll(' ', '-')), document = structuredClone(DOCUMENT);
    mutate(document);
    await mkdir(join(root, 'scripts'), { recursive: true });
    await writeFile(join(root, INPUTS_RELATIVE_PATH), JSON.stringify(document, null, 2) + '\n', { flag: 'wx' });
    await assert.rejects(nativeAuxiliaryInputs(root), pattern, name);
  }

  // The protected build over one placed package: a missing, changed, linked or absent protected input refuses
  // before any build territory exists, although every host input is present and unchanged.
  const root = await stagePackage(join(scratch, 'refusals'), 'clone'), placed = join(root, ROOT), aside = join(scratch, 'refusals-aside');
  await mkdir(aside);
  const verified = await runDeclared(t.name, 'verify placed inputs', root, ['scripts/build-native.mjs', '--verify-inputs', '--protected-inputs']);
  const verifiedBuildAbsent = await absent(join(root, 'build'));
  await retain(t.name, 'verify placed inputs observed', { child: verified.custody, buildTerritoryAbsent: verifiedBuildAbsent });
  assert.equal(verified.status, 0, verified.stderr);
  assert.match(verified.stdout, /protected native inputs verified: 196 files under qualification-inputs\/native/);
  assert.ok(verifiedBuildAbsent, 'verification creates no build territory');
  const header = sdkRow.relativePath, library = relativeOf(host('libswiftDemangle.dylib')), tapi = relativeOf(host('libtapi.dylib'));
  const moveAside = async relative => { await rename(join(placed, relative), join(aside, 'member')); return () => rename(join(aside, 'member'), join(placed, relative)); };
  const cases = [
    ['protected placement absent', async () => { await rename(placed, join(aside, 'placement')); return () => rename(join(aside, 'placement'), placed); }, ROOT],
    ['protected header missing', () => moveAside(header), header],
    ['protected header changed', async () => { const restore = await moveAside(header);
      await writeFile(join(placed, header), Buffer.concat([await readFile(join(aside, 'member')), Buffer.from('\n')]), { flag: 'wx' });
      return async () => { await rm(join(placed, header)); await restore(); }; }, header],
    ['protected header is a link to its host input', async () => { const restore = await moveAside(header);
      await symlink(sdkRow.hostPath, join(placed, header));
      return async () => { await rm(join(placed, header)); await restore(); }; }, header],
    ['mandatory linker library changed', async () => { const restore = await moveAside(library);
      const bytes = Buffer.from(await readFile(join(aside, 'member'))); bytes[bytes.length - 1] ^= 0xff;
      await writeFile(join(placed, library), bytes, { flag: 'wx' });
      return async () => { await rm(join(placed, library)); await restore(); }; }, library],
    ['mandatory linker library missing', () => moveAside(tapi), tapi],
  ];
  for (const [name, mutate, member] of cases) {
    const restore = await mutate();
    let refused;
    try { refused = await runDeclared(t.name, name, root); } finally { await restore(); }
    const buildAbsent = await absent(join(root, 'build'));
    await retain(t.name, name + ' observed', { child: refused.custody, member, exitCode: refused.status, refusal: firstLine(refused.stderr ?? ''),
      namesMember: (refused.stderr ?? '').includes(member), buildTerritoryAbsent: buildAbsent });
    assert.equal(refused.error, undefined, String(refused.error));
    assert.equal(refused.status, 1, `${name}: ${refused.stdout}${refused.stderr}`);
    assert.match(refused.stderr, /^native build refused: declared native inputs changed or missing:/, name);
    assert.ok(refused.stderr.includes(member), `${name} names ${member}: ${refused.stderr}`);
    assert.ok(buildAbsent, name + ': refused before the build territory or any compiler use');
    evidence.negatives.push({ case: name, exitCode: refused.status, refusal: firstLine(refused.stderr), buildTerritoryCreated: false });
  }
  const restored = await runDeclared(t.name, 'verify restored inputs', root, ['scripts/build-native.mjs', '--verify-inputs', '--protected-inputs']);
  assert.equal(restored.status, 0, 'every refusal case was restored: ' + restored.stderr);
});

test('protected placement rewrites every compiler input without ambient fallback', async t => {
  // The rewrite relation over arbitrary roots: every host root replaced, nothing appended from the host.
  const P = '/abi5-protected/qualification-inputs/native', E = '/abi5-package/build/.native-build/inputs';
  const command = protectedCommand(inputs, { protectedRoot: P, executionRoot: E });
  const view = E + '/toolchain/XcodeDefault.xctoolchain/usr/bin', sdk = P + '/sdk/MacOSX.sdk', include = P + '/node/include/node';
  const resourceDir = P + '/toolchain/XcodeDefault.xctoolchain/usr/lib/clang/21';
  assert.deepEqual({ compiler: command.compiler, linker: command.linker, linkerDirectory: command.linkerDirectory, resourceDir: command.resourceDir, sdk: command.sdk, include: command.include },
    { compiler: view + '/clang', linker: view + '/ld', linkerDirectory: view, resourceDir, sdk, include });
  const swap = arg => arg === toolchain.sdk ? sdk : arg === '-I' + toolchain.nodeApiInclude ? '-I' + include : arg === '-B' + toolchain.toolchainBin ? '-B' + view : arg;
  assert.deepEqual(command.compileArgs, [...inputs.compileArgs.map(swap), '-resource-dir', resourceDir]);
  assert.deepEqual(command.linkArgs, [...inputs.linkArgs.map(swap), '-resource-dir', resourceDir]);
  assert.deepEqual(command.environment, { ...inputs.environment, PATH: view }, 'PATH holds only the execution view bin');
  const values = [command.compiler, command.linker, ...command.compileArgs, ...command.linkArgs, ...Object.values(command.environment)];
  for (const value of values) assert.ok(!HOST_ROOTS.some(root => value.includes(root)) && !value.includes('/Applications/') && !value.includes('/opt/homebrew'), value);
  assert.ok(command.compileArgs.includes('--no-default-config') && command.linkArgs.includes('--no-default-config'));
  const negatives = [
    ['host header argument without placement', d => { d.compileArgs.push('-include', toolchain.sdk + '/usr/include/stdio.h'); }, /argument names a host input with no protected placement/],
    ['host library search directory', d => { d.linkArgs.push('-L' + toolchain.sdk + '/usr/lib'); }, /argument names a host input with no protected placement/],
    ['host compiler resource argument', d => { d.compileArgs.push('-resource-dir', toolchain.resourceDir); }, /argument names a host input with no protected placement/],
    ['host SDK environment', d => { d.environment.SDKROOT = toolchain.sdk; }, /protected command still names host inputs/],
    ['host header environment', d => { d.environment.CPATH = toolchain.nodeApiInclude; }, /protected command still names host inputs/],
  ];
  for (const [name, mutate, pattern] of negatives) {
    const document = structuredClone(DOCUMENT);
    mutate(document);
    assert.throws(() => protectedCommand(parseNativeBuildInputs(document, TENANT), { protectedRoot: P, executionRoot: E }), pattern, name);
    evidence.negatives.push({ case: name, refusal: pattern.source });
  }

  // The actual relation: a derived execution view, then the compiler's own dependency list and the linker's
  // load trace name only protected copies (and the work files); no existing host file is read.
  const root = await stagePackage(join(scratch, 'rewrite'), 'clone'), fixtureInputs = await readNativeBuildInputs(root);
  const fixtureRows = protectedPlacementRows(fixtureInputs), protectedRoot = await protectedRootOf(root, fixtureInputs);
  assert.deepEqual((await verifyPlacedRows(protectedRoot, fixtureRows)).failures, []);
  const executionRoot = join(root, EXECUTION_VIEW_RELATIVE_PATH);
  const derived = await deriveExecutionView(protectedRoot, executionRoot, fixtureRows);
  assert.equal(derived.members.length, executionRows.length);
  assert.ok(derived.members.every(member => member.mode === EXECUTION_VIEW_MODE));
  await assert.rejects(deriveExecutionView(protectedRoot, executionRoot, fixtureRows), /execution view already exists/);
  const actual = protectedCommand(fixtureInputs, { protectedRoot, executionRoot });
  const work = join(root, 'build/.native-build'), object = join(work, 'abg_physical_path.o'), linked = join(work, 'abg_physical_path.node');
  const compile = (label, args) => spawnRetained(t.name, label, actual.compiler, args, { cwd: work, env: { ...actual.environment, TMPDIR: work }, timeout: 120000, maxBuffer: 1 << 24 });
  const placedRelative = new Set(fixtureRows.map(row => row.relativePath));

  const listed = await compile('compiler dependency list', [...actual.compileArgs, '-M', fixtureInputs.sourcePath]);
  const dependencies = (listed.stdout ?? '').replace(/\\\n/g, ' ').replace(/\\ /g, '\u0000').split(/\s+/).slice(1).filter(Boolean).map(path => path.replace(/\u0000/g, ' '));
  await retain(t.name, 'compiler dependency classification', { child: listed.custody, protectedRoot, sourcePath: fixtureInputs.sourcePath,
    dependencies: dependencies.map(path => ({ path, protected: within(path, protectedRoot), boundRow: within(path, protectedRoot) && placedRelative.has(path.slice(protectedRoot.length + 1)) })) });
  assert.equal(listed.status, 0, listed.stderr);
  assert.equal(dependencies[0], fixtureInputs.sourcePath);
  for (const path of dependencies.slice(1)) {
    assert.ok(within(path, protectedRoot), 'compiler input outside the protected placement: ' + path);
    assert.ok(placedRelative.has(path.slice(protectedRoot.length + 1)), 'compiler input is a bound row: ' + path);
  }
  for (const prefix of [actual.sdk, actual.include, actual.resourceDir]) assert.ok(dependencies.some(path => within(path, prefix)), 'headers from ' + prefix);

  const compiled = await compile('compile object', [...actual.compileArgs, '-o', object, fixtureInputs.sourcePath]);
  assert.equal(compiled.status, 0, compiled.stderr);
  const trace = await compile('link trace', [...actual.linkArgs, '-Wl,-t', '-o', linked, object]);

  // Classify every display name before judging any: exact protected acquisitions; OS names declared by the exact
  // protected SDK stubs this trace acquired (their bytes are the pinned rows); the accepted OS/system-loader substrate
  // the executed toolchain members load; anything else is unknown and refuses.
  const displayed = `${trace.stdout ?? ''}\n${trace.stderr ?? ''}`.split('\n').map(line => line.trim()).filter(line => line.startsWith('/'));
  const loaded = displayed.map(line => line.replace(/\(.*\)$/u, ''));
  const bound = new Map(fixtureRows.map(row => [row.relativePath, row]));
  const stubs = [], declaredBySdk = new Set(), substrate = new Set();
  for (const path of new Set(loaded)) {
    const row = within(path, protectedRoot) ? bound.get(path.slice(protectedRoot.length + 1)) : undefined;
    if (row === undefined || !path.endsWith('.tbd') || !within(path, actual.sdk)) continue;
    const bytes = await readFile(path), names = sha256Bytes(bytes) === row.sha256 ? stubDeclaredNames(bytes.toString('utf8')) : new Set();
    for (const name of names) declaredBySdk.add(name);
    stubs.push({ path, sha256: sha256Bytes(bytes), pinned: row.sha256, declaredNames: names.size });
  }
  for (const row of fixtureRows.filter(row => row.execution)) {
    const slice = arm64Slice(await readFile(join(executionRoot, row.relativePath)));
    if (slice !== null) for (const name of loadCommands(slice).dylibs) if (systemLibrary(name)) substrate.add(name);
  }
  const context = { object, protectedRoot, placedRelative, declaredBySdk, substrate };
  const entries = [];
  for (const [index, path] of loaded.entries()) {
    const kind = classifyTraceEntry(path, context);
    entries.push({ display: displayed[index], path, class: kind, ...(kind === 'work' || kind === 'protected' ? {} : { entryPresent: await observe(async () => !(await absent(path))) }) });
  }
  const count = kind => entries.filter(entry => entry.class === kind).length;
  const unknown = entries.filter(entry => entry.class === 'unknown');
  const classification = await retain(t.name, 'linker trace classification', { child: trace.custody, object, protectedRoot, executionRoot, sdk: actual.sdk,
    stubs, declaredBySdk: [...declaredBySdk].sort(), substrate: [...substrate].sort(), entries,
    counts: { work: count('work'), protected: count('protected'), sdkDeclared: count('sdk-declared'), systemSubstrate: count('system-substrate'), unknown: unknown.length } });
  assert.equal(trace.status, 0, trace.stderr);
  assert.ok(entries.some(entry => entry.class === 'protected' && within(entry.path, actual.sdk)), 'the linker reads the protected SDK: ' + loaded.join(', '));
  assert.ok(stubs.every(stub => stub.sha256 === stub.pinned), 'acquired SDK stubs are their pinned bytes: ' + JSON.stringify(stubs));
  assert.deepEqual(unknown.map(entry => entry.path), [], 'linker entry outside the protected placement, the declared SDK names and the system substrate');
  // Discriminators of the classification: a host-root acquisition, a non-system external entry, an undeclared OS
  // name and an unbound path inside the protected placement all remain unknown, whether or not they exist.
  for (const path of [join(toolchain.sdk, 'usr/lib/libSystem.tbd'), join(toolchain.nodeApiInclude, 'node_api.h'), '/opt/homebrew/lib/libabi5-external.dylib',
    '/usr/lib/system/libabi5_undeclared.dylib', join(protectedRoot, 'sdk/MacOSX.sdk/usr/lib/libabi5-unbound.tbd')])
    assert.equal(classifyTraceEntry(path, context), 'unknown', path);
  const final = await verifyPlacedRows(executionRoot, fixtureRows.filter(row => row.execution));
  assert.equal(final.digest, derived.digest, 'compiler use leaves the view unchanged');
  evidence.dependencyTrace = { compilerInputs: dependencies.length - 1, linkerReads: count('work') + count('protected'), outsideProtected: unknown.length,
    sdkDeclaredNames: count('sdk-declared'), systemSubstrate: count('system-substrate'), classification };
});

const MODE_BITS = 0o7777;
async function placedModes(root) {
  const modes = new Set();
  for (const row of AUX) modes.add((await lstat(join(root, row.relativePath))).mode & MODE_BITS);
  return [...modes];
}
async function treeOf(root) {
  const out = [];
  const walk = async directory => {
    for (const name of (await readdir(directory)).sort()) {
      const path = join(directory, name), status = await lstat(path);
      out.push(path.slice(root.length + 1) + (status.isDirectory() ? '/' : ''));
      if (status.isDirectory()) await walk(path);
    }
  };
  await walk(root);
  return out;
}

test('snapshot mode loss permits two byte equal relocated native builds', async t => {
  assert.ok(BUILD !== undefined && BUILD.args.join(' ') === 'scripts/build-native.mjs --protected-inputs', 'the recipe declares the protected build');
  const ordinaryBytes = await readFile(ORDINARY), ordinary = { path: ORDINARY, bytes: ordinaryBytes.length, sha256: sha256Bytes(ordinaryBytes) };
  evidence.ordinary = ordinary;
  for (const name of ['relocation-a', 'relocation-b']) {
    const root = await stagePackage(join(scratch, name), 'snapshot');
    const modes = await placedModes(root);
    const placedCompiler = join(root, ROOT, relativeOf(toolchain.clang));
    const direct = await spawnRetained(t.name, name + ' protected compiler direct', placedCompiler, ['--version'], { env: {} });
    const sourceBefore = await digestsOf(root, PACKAGE_FILES), hostBefore = await hostDigest();
    const protectedBefore = await verifyPlacedRows(join(root, ROOT), rows);
    await retain(t.name, name + ' before', { root, snapshotModes: modes, directChild: direct.custody, sourceBefore, hostBefore,
      protectedBeforeDigest: protectedBefore.digest, protectedBeforeFailures: protectedBefore.failures });
    assert.equal(modes.length, 1, 'one snapshot mode: ' + modes.map(mode => mode.toString(8)).join(','));
    assert.equal(modes[0] & 0o111, 0, 'the snapshot carries no executable mode');
    assert.equal(direct.error?.code, 'EACCES', 'the protected compiler copy itself is not executable');
    assert.deepEqual(protectedBefore.failures, []);

    const run = await runDeclared(t.name, name + ' protected build', root);
    const outputPath = join(root, inputs.output), protectedAfter = await verifyPlacedRows(join(root, ROOT), rows);
    await retain(t.name, name + ' observed', { root, child: run.custody, exitCode: run.status, signal: run.signal, error: errorValue(run.error),
      output: await observe(async () => { const bytes = await readFile(outputPath); return { path: outputPath, bytes: bytes.length, sha256: sha256Bytes(bytes), equalsOrdinary: bytes.equals(ordinaryBytes) }; }),
      buildTree: await observe(() => treeOf(join(root, 'build'))), placedModesAfter: await observe(() => placedModes(root)),
      protectedAfterDigest: protectedAfter.digest, protectedAfterFailures: protectedAfter.failures });
    assert.equal(run.error, undefined, String(run.error));
    assert.equal(run.signal, null);
    assert.equal(run.status, 0, run.stderr);
    const reports = run.stdout.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line)).filter(row => row.kind === 'abg_native_protected_build');
    assert.equal(reports.length, 1, run.stdout);
    const report = reports[0], executionRoot = join(root, EXECUTION_VIEW_RELATIVE_PATH), view = join(executionRoot, 'toolchain/XcodeDefault.xctoolchain/usr/bin');
    assert.deepEqual({ protectedRoot: report.protectedRoot, executionRoot: report.executionRoot, compiler: report.compiler, linker: report.linker,
      linkerDirectory: report.linkerDirectory, sdk: report.sdk, include: report.include, resourceDir: report.resourceDir, environment: report.environment },
    { protectedRoot: join(root, ROOT), executionRoot, compiler: view + '/clang', linker: view + '/ld', linkerDirectory: view,
      sdk: join(root, ROOT, 'sdk/MacOSX.sdk'), include: join(root, ROOT, 'node/include/node'),
      resourceDir: join(root, ROOT, 'toolchain/XcodeDefault.xctoolchain/usr/lib/clang/21'), environment: { ...inputs.environment, PATH: view } });
    for (const arg of [...report.compileArgv, ...report.linkArgv]) {
      const path = arg.replace(/^-[IB]/u, '');
      if (path.startsWith('/')) assert.ok(within(path, root), 'relocated argument outside the run root: ' + arg);
      assert.ok(!HOST_ROOTS.some(hostRoot => arg.includes(hostRoot)), 'host root in argument: ' + arg);
    }
    for (const [flag, value] of [['-isysroot', report.sdk], ['-resource-dir', report.resourceDir]])
      for (const argv of [report.compileArgv, report.linkArgv]) assert.equal(argv[argv.indexOf(flag) + 1], value, flag);
    assert.ok(report.compileArgv.includes('-I' + report.include) && report.linkArgv.includes('-B' + report.linkerDirectory));
    assert.equal(report.protectedMembers, rows.length);
    assert.equal(report.executionMembers, executionRows.length);

    const output = await readFile(outputPath);
    assert.deepEqual(report.output, { path: outputPath, bytes: output.length, sha256: sha256Bytes(output) });
    assert.ok(output.equals(ordinaryBytes), name + ' output equals the ordinary build output');
    assert.deepEqual(await treeOf(join(root, 'build')), ['native/', 'native/abg_physical_path.node'], 'closed build output; the execution view is gone');
    assert.deepEqual(await placedModes(root), modes, 'protected copies keep their snapshot mode');
    const entry = { name, root, report, run: { argv: run.argv, cwd: join(root, BUILD.relativeCwd), exitCode: run.status, signal: run.signal, durationMs: run.durationMs },
      snapshotInputMode: modes[0], sourceBefore, sourceAfter: await digestsOf(root, PACKAGE_FILES), hostBefore, hostAfter: await hostDigest(),
      protectedBefore: protectedBefore.digest, protectedAfter: protectedAfter.digest, protectedAfterFailures: protectedAfter.failures };
    await retain(t.name, name + ' run evidence', entry);
    evidence.runs.push(entry);
  }
  assert.notEqual(evidence.runs[0].root, evidence.runs[1].root);
  assert.equal(evidence.runs[0].report.output.sha256, evidence.runs[1].report.output.sha256, 'two relocated builds are byte equal');
});

test('relocated build preserves original protected and execution bytes', async t => {
  // The build's reported execution-view digests are its receipts from before and after compiler use; the view is
  // removed by the build's own cleanup and is not rehashed here.
  const expectedExecution = inventoryDigest(executionRows.map(row => ({ relativePath: row.relativePath, sha256: row.sha256,
    byteCount: byteCountOf.get(row.relativePath), mode: EXECUTION_VIEW_MODE })));
  const candidateSourceAfter = await digestsOf(TENANT, PACKAGE_FILES);
  await retain(t.name, 'conjunction premises', { runs: evidence.runs.length, expectedExecutionDigest: expectedExecution, candidateSourceBefore: tenantSourceBefore,
    candidateSourceAfter, negatives: evidence.negatives.length, dependencyTrace: evidence.dependencyTrace ?? null });
  assert.equal(evidence.runs.length, 2, 'both relocated builds ran');
  const bare = /^[0-9a-f]{64}$/u;
  for (const entry of evidence.runs) {
    const { report } = entry;
    assert.deepEqual(entry.protectedAfterFailures, []);
    assert.equal(report.protectedBeforeDigest, entry.protectedBefore, 'the build verified the staged protected inventory');
    assert.equal(report.protectedAfterDigest, report.protectedBeforeDigest);
    assert.equal(entry.protectedAfter, entry.protectedBefore, 'protected copies unchanged after the build');
    assert.equal(report.executionBeforeDigest, expectedExecution, 'the view is exactly the declared execution bytes with the view mode');
    assert.equal(report.executionAfterDigest, report.executionBeforeDigest, 'the view is unchanged by compiler use');
    assert.notEqual(report.executionBeforeDigest, report.protectedBeforeDigest, 'the view is digested separately');
    assert.equal(entry.hostAfter, entry.hostBefore, 'the host toolchain is unchanged');
    assert.deepEqual(entry.sourceAfter, entry.sourceBefore, 'the relocated package source is unchanged');
    for (const digest of [report.protectedBeforeDigest, report.protectedAfterDigest, report.executionBeforeDigest, report.executionAfterDigest, entry.hostBefore, entry.hostAfter, report.output.sha256])
      assert.match(digest, bare);
  }
  assert.equal(evidence.runs[0].protectedBefore, evidence.runs[1].protectedBefore, 'both roots placed one protected inventory');
  assert.deepEqual(candidateSourceAfter, tenantSourceBefore, 'the candidate source is unchanged');
  assert.equal(evidence.runs[0].hostBefore, evidence.runs[1].hostAfter);
  assert.ok(evidence.negatives.length >= 11 && evidence.dependencyTrace?.outsideProtected === 0, 'the ambient-fallback negatives ran first');

  if (RECORD === undefined || RECORD === '') return;
  const record = {
    kind: 'native_relocation_proof', schemaVersion: 1, qualification: false, ambientFallbackRefused: true,
    scratch, declaredCommand: { commandId: BUILD.commandId, executable: BUILD.executable, args: BUILD.args, relativeCwd: BUILD.relativeCwd, environment: BUILD.environment },
    inputs: { document: tenantSourceBefore[INPUTS_RELATIVE_PATH], rows: rows.length, executionRows: executionRows.length, placementRoot: ROOT },
    ordinary: evidence.ordinary,
    runs: evidence.runs.map(({ root, report, run, snapshotInputMode, sourceBefore, sourceAfter, hostBefore, hostAfter }) => ({
      root, protectedRoot: report.protectedRoot, executionRoot: report.executionRoot, compiler: report.compiler, linker: report.linker,
      linkerDirectory: report.linkerDirectory, resourceDir: report.resourceDir, sdk: report.sdk, include: report.include, environment: report.environment,
      argv: run.argv, cwd: run.cwd, exitCode: run.exitCode, signal: run.signal, durationMs: run.durationMs, compileArgv: report.compileArgv, linkArgv: report.linkArgv,
      output: report.output, protectedMembers: report.protectedMembers, executionMembers: report.executionMembers,
      protectedBeforeDigest: report.protectedBeforeDigest, protectedAfterDigest: report.protectedAfterDigest,
      executionBeforeDigest: report.executionBeforeDigest, executionAfterDigest: report.executionAfterDigest, expectedExecutionDigest: expectedExecution,
      hostBeforeDigest: hostBefore, hostAfterDigest: hostAfter, snapshotInputMode,
      sourceConserved: JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter), outputEqualsOrdinary: report.output.sha256 === evidence.ordinary.sha256 })),
    candidateSourceConserved: true,
    dependencyTrace: evidence.dependencyTrace,
    ambientFallbackNegatives: evidence.negatives,
    childCustody: CUSTODY,
  };
  const path = resolve(RECORD);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
});

// --- Cold candidate copies -------------------------------------------------------------------------------------
const SUPPORT = pathToFileURL(join(TENANT, 'test_env/support/t287-generic-job-worksite.mjs')).href;
/** One fresh Node process over the copy: public import, then the existing owner's write-root check (read only). */
async function coldOwner(copy, label, testCase) {
  const caseRoot = await realpath(await mkdtemp(join(scratch, 'cold-' + label + '-')));
  const script = `
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
const support = await import(${JSON.stringify(SUPPORT)});
const publicProduct = await import(${JSON.stringify(pathToFileURL(copy.path('product/index.js')).href)});
const observation = await import(${JSON.stringify(pathToFileURL(copy.path('shared/physical_path_observation.js')).href)});
const owner = await support.loadWorksiteOwner();
const env = await support.worksiteFixture(owner);
mkdirSync(join(env.canonicalRoot, 'src'));
mkdirSync(join(env.scratch, 'install'));
const tree = root => { const out = []; const walk = dir => { for (const name of readdirSync(dir).sort()) { const path = join(dir, name), status = lstatSync(path);
  out.push(relative(root, path) + (status.isDirectory() ? '/' : '')); if (status.isDirectory()) walk(path); } }; walk(root); return out; };
const before = tree(env.scratch);
const refusal = await owner.checkWorksiteWriteRoots({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding,
  writeRoots: ['src'], protectedInstallRoots: [join(env.scratch, 'install')] });
const after = tree(env.scratch);
const native = observation.physicalPathNative();
console.log(JSON.stringify({ buildRoot: support.buildRoot, publicExports: Object.keys(publicProduct).length, publicDigest: publicProduct.sha256Canonical({ cold: true }),
  refusal, native: typeof native === 'string' ? native : { target: { ...native.target } }, before, after, installPresent: existsSync(join(env.scratch, 'install')) }));
`;
  const result = await spawnRetained(testCase, 'cold owner ' + label, process.execPath, ['--input-type=module', '-e', script], { cwd: caseRoot, timeout: 120000,
    env: { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: process.env.HOME ?? caseRoot, TMPDIR: caseRoot, ABG_WORKSITE_BUILD_ROOT: copy.path('') } });
  assert.equal(result.error, undefined, String(result.error));
  assert.equal(result.status, 0, result.stderr);
  const observed = JSON.parse(result.stdout.trim().split('\n').at(-1));
  assert.equal(observed.buildRoot, copy.path(''), 'the owner was loaded cold from the copy');
  assert.ok(observed.publicExports > 0 && /^sha256:[0-9a-f]{64}$/u.test(observed.publicDigest), 'the public import is unaffected');
  assert.deepEqual(observed.after, observed.before, 'no target effect');
  assert.equal(observed.installPresent, true);
  return observed;
}

/** A disposable candidate copy whose addon is intact and admits a lawful sibling, then changed by `mutate`. */
async function coldAddonCase(t, label, mutate) {
  const ordinaryBefore = sha256Bytes(await readFile(ORDINARY));
  const copy = isolatedCompiledCopy(t), addon = copy.path('../../native/abg_physical_path.node');
  const physicalAddon = join(await realpath(dirname(addon)), basename(addon)), copyAddon = sha256Bytes(await readFile(addon));
  await retain(t.name, label + ' copy', { tmpdir: tmpdir(), addon, physicalAddon, ordinary: ORDINARY, ordinarySha256: ordinaryBefore, copyAddonSha256: copyAddon });
  assert.ok(addon.startsWith(tmpdir() + '/'), 'the copy lives below TMPDIR: ' + addon);
  assert.equal(copyAddon, ordinaryBefore, 'the copy carries the candidate addon');
  const control = await coldOwner(copy, label + '-control', t.name);
  assert.equal(control.refusal, null, 'intact addon: ' + JSON.stringify(control.refusal));
  assert.deepEqual(control.native.target, { platform: 'darwin', arch: 'arm64', abi: 'abg-physical-path/1', nodeApiVersion: 8, mountPopulationLimit: 4096 });
  await mutate(addon);
  const mutatedAddon = await observe(async () => sha256Bytes(await readFile(addon)));
  const observed = await coldOwner(copy, label, t.name);
  const ordinaryAfter = sha256Bytes(await readFile(ORDINARY));
  await retain(t.name, label + ' mutated', { addon, mutatedAddonSha256: mutatedAddon, ordinarySha256After: ordinaryAfter });
  assert.equal(ordinaryAfter, ordinaryBefore, 'the candidate addon is untouched');
  assert.equal(observed.refusal?.kind, 'worksite_effect_refusal', JSON.stringify(observed.refusal));
  assert.equal(observed.refusal.code, 'invalid_coordinate');
  assert.equal(typeof observed.native, 'string');
  assert.equal(observed.refusal.message, 'protected-root separation cannot be established: ' + observed.native, 'the existing uncertainty refusal');
  assert.match(observed.native, /^native physical-path observer is unavailable: /);
  assert.ok(observed.native.includes(physicalAddon) || observed.native.includes(addon), 'the copy loads only its own package member: ' + observed.native);
  assert.ok(!observed.native.includes(ORDINARY), 'never the candidate addon');
  return observed;
}

test('cold missing native addon gives existing uncertainty refusal', async t => {
  const observed = await coldAddonCase(t, 'missing', addon => rm(addon));
  assert.match(observed.native, /Cannot find module/);
});

test('cold incompatible native addon gives existing uncertainty refusal', async t => {
  const observed = await coldAddonCase(t, 'incompatible', async addon => {
    const bytes = Buffer.from(await readFile(addon));
    assert.equal(bytes.readUInt32LE(0), MH_MAGIC_64);
    assert.equal(bytes.readUInt32LE(4), CPU_TYPE_ARM64, 'the candidate addon is one arm64 Mach-O');
    bytes.writeUInt32LE(CPU_TYPE_X86_64, 4);
    bytes.writeUInt32LE(3, 8);
    await rm(addon);
    await writeFile(addon, bytes, { flag: 'wx' });
  });
  assert.doesNotMatch(observed.native, /Cannot find module/, 'the member is present but incompatible');
});
