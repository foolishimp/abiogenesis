// TD-37a (T-292). Worksite paths whose first segment begins with two dots
// (`..x`, `..x/f`, `...`) are strict descendants of their root (T287 W2 R3 C0:
// only `.` and `..` spellings refuse). Tests named "changed" are red on the
// build at 52afade26 (run with ABG_WORKSITE_BUILD_ROOT set to that build's
// `build/code/src`), where these sites had the prefix form
// `relation.startsWith("..")`; every other test passes on both builds and pins
// a verdict that does not change: real escapes and the root itself at each
// site, Product construction and context observation, the helper.
//   - Product admits the names at subject and territory construction and
//     observes a worksite that holds them, as at the base;
//   - Product flags a subject under a protected root at `.abg/events/..x/f`;
//   - the parent's dispatch admits the names (changed), flags the
//     protected-root subject (changed), admits an attempt path under a dotted
//     name in the archive root (changed) and sees binding roots nested under a
//     dotted name as overlapping (changed);
//   - ABG admits an actor archive file and a retained subject under a dotted
//     name (changed);
//   - the helper copies, launches and runs under the names, as at the base.
// The parent and helper checks are private; they are linked from the built
// module in a VM with an export appended, as t287-lifecycle-failure-carrier does.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const product = await loadWorksiteOwner();
const hash = product.sha256Canonical;
const id = (scheme, digest) => `${scheme}://abiogenesis/${digest.slice('sha256:'.length)}`;
const dotted = ['..x', '..x/f', '...'];
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const { isAdmittedActorArchiveFile } = await load('abg/transport_contracts.js');
const { retainedWorksitePhysicalMatches } = await load('abg/worksite_revision.js');

async function component(name, suffix, transform = source => source) {
  const path = join(buildRoot, `${name}.js`);
  const module = new SourceTextModule(transform(await fs.readFile(path, 'utf8')) + suffix, { identifier: path });
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier);
    return new SyntheticModule(Object.keys(actual), function () {
      for (const [key, value] of Object.entries(actual)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}
const parent = await component('implementation/worksite_command_execution',
  '\nexport { observeWorksiteSubjectSync, assertArchiveExecutionBoundary };');
const helper = await component('implementation/worksite_command_helper',
  '\nconst runCommandOnHost = (...args) => runHelperProgram(runCommand(...args));' +
  '\nexport { materializeSnapshot, canonicalExistingPathWithinRoot, assertLaunchArchiveBoundary, runCommandOnHost as runCommand };',
  source => {
    const replaced = source.replace(/await main\(\);\s*$/u, '');
    assert.notEqual(replaced, source, 'helper main is not run');
    return replaced;
  });

async function fixture(t) {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  return env;
}
async function file(root, relativePath, text = 'bytes\n') {
  const path = join(root, ...relativePath.split('/'));
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, text);
  return path;
}
function remintBinding(binding, changes) {
  const { kind, schemaVersion, bindingId: _i, bindingDigest: _d, admissionEventRef, ...body } = binding;
  const next = { ...body, ...changes };
  const bindingDigest = hash(next);
  return { kind, schemaVersion, bindingId: id('workspace-binding', bindingDigest), bindingDigest, ...next, admissionEventRef };
}
const subject = (env, relativePath, binding = env.workspaceBinding) => product.constructWorksiteSubject({
  workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: binding, relativePath,
  subjectUri: pathToFileURL(resolve(env.canonicalRoot, ...relativePath.split('/'))).href });
const territory = (env, relativeRoot) => product.constructWorksiteTerritory({
  workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding, relativeRoot,
  territoryUri: pathToFileURL(resolve(env.canonicalRoot, ...relativeRoot.split('/'))).href });
// Real escapes, written as worksite-relative paths: the parent, a path beside
// the root, a sibling whose name has the root's name as prefix.
const escapes = env => ['..', '../x', `../${basename(env.canonicalRoot)}2/f`];

test('Product subject construction admits a dotted first segment and refuses the root and real escapes, as at the base', async t => {
  const env = await fixture(t);
  for (const name of [...dotted, 'a/..x']) {
    const admitted = subject(env, name);
    assert.equal(admitted.kind, 'worksite_subject', name);
    assert.equal(admitted.relativePath, name);
  }
  for (const name of ['.', ...escapes(env), '/elsewhere/f']) {
    assert.equal(subject(env, name).code, 'invalid_relative_path', name);
  }
});

test('Product territory construction admits a dotted first segment and the root, as at the base', async t => {
  const env = await fixture(t);
  for (const name of ['.', ...dotted, 'a/..x']) assert.equal(territory(env, name).kind, 'worksite_territory', name);
  for (const name of [...escapes(env), '/elsewhere']) assert.equal(territory(env, name).code, 'invalid_relative_path', name);
});

test('context observation of a worksite with a top-level dotted entry succeeds, as at the base', async t => {
  const env = await fixture(t);
  await file(env.canonicalRoot, '..x/f');
  await file(env.canonicalRoot, '...');
  await file(env.canonicalRoot, 'a/..x/f');
  const read = readRoots => product.observeWorksiteContext({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, readRoots, maxFiles: 20, maxBytes: 10000 });
  const whole = await read(['.']);
  assert.equal(whole.kind, 'worksite_context_observation');
  const paths = whole.entries.map(entry => entry.relativePath);
  for (const path of ['..x/f', '...', 'a/..x/f']) assert.ok(paths.includes(path), path);
  const dottedRoot = await read(['..x']);
  assert.equal(dottedRoot.kind, 'worksite_context_observation', 'a dotted read root is observed');
  assert.ok(dottedRoot.entries.some(entry => entry.relativePath === '..x/f'));
  assert.equal((await read(['../x'])).code, 'invalid_coordinate', 'a real escape is refused as before');
});

test('Product flags a subject under a protected root at .abg/events/..x/f', async t => {
  const env = await fixture(t);
  const binding = remintBinding(env.workspaceBinding, { roots: { ...env.workspaceBinding.roots,
    eventLogRoot: join(env.canonicalRoot, '.abg', 'events') } });
  assert.equal(product.isExactWorkspaceBinding(binding), true);
  assert.equal(subject(env, '.abg/events/..x/f', binding).code, 'invalid_coordinate');
  assert.equal(subject(env, '.abg/events/f', binding).code, 'invalid_coordinate');
  assert.equal(subject(env, '.abg/other/f', binding).kind, 'worksite_subject', 'control: outside the protected root');
});

const parentTask = (env, roots = env.workspaceBinding.roots) => ({
  workspaceAuthorityBasis: { canonicalRoot: env.canonicalRoot }, workspaceBinding: { roots } });
const escapesRoot = /^TypeError: protected subject escapes the canonical worksite root$/u;

test('changed: parent dispatch admits a dotted first segment', async t => {
  const env = await fixture(t);
  for (const name of [...dotted, 'a/..x']) {
    await file(env.canonicalRoot, name);
    const admitted = subject(env, name);
    assert.equal(admitted.kind, 'worksite_subject', name);
    const observation = parent.observeWorksiteSubjectSync(parentTask(env), admitted);
    assert.equal(observation.state, 'file', name);
    assert.equal(observation.subjectRef, admitted.subjectRef, name);
    await fs.rm(join(env.canonicalRoot, name.split('/')[0]), { recursive: true });
  }
});

test('parent dispatch refuses the root itself and real escapes, as at the base', async t => {
  const env = await fixture(t);
  await file(dirname(env.canonicalRoot), 'x');
  await file(dirname(env.canonicalRoot), `${basename(env.canonicalRoot)}2/f`);
  for (const relativePath of ['', ...escapes(env)]) {
    assert.throws(() => parent.observeWorksiteSubjectSync(parentTask(env), { relativePath }), escapesRoot, JSON.stringify(relativePath));
  }
});

test('changed: parent dispatch flags a subject inside a protected root under a dotted name', async t => {
  const env = await fixture(t);
  const roots = { ...env.workspaceBinding.roots, eventLogRoot: join(env.canonicalRoot, '.abg', 'events') };
  await file(env.canonicalRoot, '.abg/events/..x/f');
  // A real subject, constructed under the fixture binding, whose roots lie outside the worksite.
  const protectedSubject = subject(env, '.abg/events/..x/f');
  assert.equal(protectedSubject.kind, 'worksite_subject');
  assert.equal(parent.observeWorksiteSubjectSync(parentTask(env), protectedSubject).state, 'file', 'control: no protected root there');
  assert.throws(() => parent.observeWorksiteSubjectSync(parentTask(env, roots), protectedSubject),
    /^TypeError: protected subject enters a WorkspaceBinding protected root$/u);
  await file(env.canonicalRoot, 'log');
  assert.throws(() => parent.observeWorksiteSubjectSync(parentTask(env, { ...roots, eventLogRoot: join(env.canonicalRoot, 'log') }),
    { relativePath: 'log' }), /^TypeError: protected subject enters a WorkspaceBinding protected root$/u,
  'a protected root equal to the subject counts as inside, as before');
});

async function archiveFixture(t) {
  const env = await fixture(t);
  const roots = { ...env.workspaceBinding.roots };
  await fs.mkdir(roots.archiveRoot);
  const planAt = attemptRoot => ({ attemptRoot, launchManifestPath: join(attemptRoot, 'launch.json'), helperPlan: {
    taskManifestPath: join(attemptRoot, 'task.json'), artifactPath: join(attemptRoot, 'artifact.json'), sandboxRoot: join(attemptRoot, 'sandbox') } });
  const plan = planAt(join(roots.archiveRoot, 'worksite-command-execution', 'task', 'attempt'));
  return { env, roots, plan, planAt, check: (changes, planned = plan) =>
    parent.assertArchiveExecutionBoundary({ workspaceBinding: { roots: { ...roots, ...changes } } }, planned) };
}
const attemptEscapes = /^TypeError: command execution attempt path escapes its archive root$/u;

test('parent archive boundary: control, the root itself and real escapes keep their verdicts', async t => {
  const { roots, planAt, check } = await archiveFixture(t);
  assert.doesNotThrow(() => check({}));
  assert.throws(() => check({ projectionRoot: roots.archiveRoot }),
    /^TypeError: command execution archive root overlaps a protected workspace root$/u, 'a root equal to the archive overlaps');
  assert.throws(() => check({}, planAt(roots.archiveRoot)), attemptEscapes, 'the archive root itself is not an attempt path');
  for (const outside of [join(dirname(roots.archiveRoot), 'x', 'attempt'), `${roots.archiveRoot}2/attempt`, '/elsewhere/attempt']) {
    assert.throws(() => check({}, planAt(outside)), attemptEscapes, outside);
  }
});

test('changed: parent archive boundary admits an attempt path under a dotted name in the archive root', async t => {
  const { roots, planAt, check } = await archiveFixture(t);
  for (const name of dotted) assert.doesNotThrow(() => check({}, planAt(join(roots.archiveRoot, ...name.split('/'), 'attempt'))), name);
});

test('changed: parent archive boundary sees binding roots under a dotted name as overlapping', async t => {
  const { roots, planAt, check } = await archiveFixture(t);
  assert.throws(() => check({ runtimeStateRoot: join(roots.productRoot, '..x', 'state') }),
    /^TypeError: command execution workspace mechanics overlap the Product root$/u);
  assert.throws(() => check({ projectionRoot: join(roots.archiveRoot, '..x', 'projection') }),
    /^TypeError: command execution archive root overlaps a protected workspace root$/u);
  const nestedArchive = join(roots.toolchainRoot, '..x', 'archive');
  await fs.mkdir(nestedArchive, { recursive: true });
  assert.throws(() => check({ archiveRoot: nestedArchive }, planAt(join(nestedArchive, 'worksite-command-execution', 'task', 'attempt'))),
    /^TypeError: command execution archive root overlaps a protected workspace root$/u);
});

test('changed: ABG admits an actor archive file under a dotted name; the root itself and real escapes stay refused', async t => {
  const env = await fixture(t);
  const archive = env.workspaceBinding.roots.archiveRoot;
  for (const name of ['..x', '..y/f', '...']) {
    assert.equal(isAdmittedActorArchiveFile(archive, await file(archive, name)), true, name);
  }
  assert.equal(isAdmittedActorArchiveFile(archive, await file(archive, 'a/f')), true, 'control');
  assert.equal(isAdmittedActorArchiveFile(archive, archive), false, 'the root itself is not a file');
  for (const outside of [await file(dirname(archive), 'x'), await file(dirname(archive), `${basename(archive)}2/f`)]) {
    assert.equal(isAdmittedActorArchiveFile(archive, outside), false, outside);
  }
});

test('changed: ABG matches a retained worksite subject under a dotted name', async t => {
  const env = await fixture(t);
  const retained = async name => {
    await file(env.canonicalRoot, name);
    const row = subject(env, name);
    const observation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, row);
    assert.equal(observation.state, 'file', name);
    return { subject: row, observation };
  };
  assert.equal(retainedWorksitePhysicalMatches(env.workspaceAuthorityBasis, [await retained('a/f')]), true, 'control');
  for (const name of ['..x/f', '...', 'b/..x']) {
    assert.equal(retainedWorksitePhysicalMatches(env.workspaceAuthorityBasis, [await retained(name)]), true, name);
  }
});

function snapshotTask(env, relativePath, bytes) {
  const observation = { fileDigest: product.sha256Bytes(bytes), byteLength: bytes.byteLength,
    observationRef: 'worksite-observation://abiogenesis/t292', observationDigest: hash('observation') };
  return { kind: 'worksite_command_execution_task', workspaceAuthorityBasis: { canonicalRoot: env.canonicalRoot },
    protectedObservations: [{ sourceMemberRef: 'member://t292/0', subject: { relativePath }, observation }] };
}

test('the helper copies a protected source under a dotted first segment and refuses a real escape, as at the base', async t => {
  const env = await fixture(t);
  const bytes = Buffer.from('bytes\n');
  for (const [ordinal, name] of ['..x/f', '...', 'a/..x/f'].entries()) {
    await file(env.canonicalRoot, name, 'bytes\n');
    const copied = await helper.materializeSnapshot(snapshotTask(env, name, bytes), join(env.scratch, `snapshot-${ordinal}`));
    assert.equal(copied.snapshotMembers[0].relativePath, name);
  }
  await file(dirname(env.canonicalRoot), 'x', 'bytes\n');
  await assert.rejects(helper.materializeSnapshot(snapshotTask(env, '../x', bytes), join(env.scratch, 'snapshot-escape')),
    /^TypeError: relative path escapes its declared root$/u);
});

test('the helper admits a launch path under a dotted name in its root; the root itself and real escapes stay refused', async t => {
  const env = await fixture(t);
  const archive = env.workspaceBinding.roots.archiveRoot;
  const launchEscapes = /^TypeError: helper launch path escapes its declared root$/u;
  for (const name of ['..x/f', '...', 'a/..x/f']) {
    await file(archive, name);
    const path = join(archive, ...name.split('/'));
    assert.equal(await helper.canonicalExistingPathWithinRoot(archive, path, 'file'), path, name);
  }
  await assert.rejects(helper.canonicalExistingPathWithinRoot(archive, archive, 'directory'), launchEscapes, 'the root itself');
  for (const outside of [await file(dirname(archive), 'x'), await file(dirname(archive), `${basename(archive)}2/f`), '/elsewhere/f']) {
    await assert.rejects(helper.canonicalExistingPathWithinRoot(archive, outside, 'file'), launchEscapes, outside);
  }
});

test('the helper archive overlap check sees a dotted nested root and the root itself, as at the base', async t => {
  const env = await fixture(t);
  const roots = { ...env.workspaceBinding.roots };
  await fs.mkdir(roots.archiveRoot);
  const check = changes => helper.assertLaunchArchiveBoundary({ workspaceBinding: { roots: { ...roots, ...changes } } }, null);
  await check({});
  for (const changes of [{ projectionRoot: join(roots.archiveRoot, '..x', 'projection') }, { projectionRoot: roots.archiveRoot }]) {
    await assert.rejects(check(changes), /^TypeError: command execution archive root overlaps a protected workspace root$/u);
  }
});

test('the helper keeps a command cwd named ..x in the execution root, as at the base', {
  skip: process.platform === 'win32' && 'the helper runs commands over POSIX process groups',
}, async t => {
  const env = await fixture(t);
  await fs.mkdir(join(env.canonicalRoot, '..x'));
  const task = { taskRef: 'task://t292/cwd', taskDigest: hash('task'), commands: [{ commandId: 'command://t292/cwd',
    executable: process.execPath, args: ['-e', ''], relativeCwd: '..x', environment: [], timeoutMs: 10_000,
    terminationGraceMs: 50, expectedReports: [] }] };
  const result = await helper.runCommand(task, env.canonicalRoot, 0);
  assert.equal(result.exitStatus, 0);
});
