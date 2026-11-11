// TD-37a (T-292). Worksite subjects whose first segment begins with two dots
// (`..x`, `..x/f`, `...`) across Product construction, the parent's dispatch
// checks and the command helper. Lanes marked "changed" are red on the build
// at 52afade26 (run with ABG_WORKSITE_BUILD_ROOT set to that build's
// `build/code/src`); every other lane passes on both builds and pins a verdict
// the rulings keep, the root itself among them.
//   - Product refuses the three names at subject and territory construction
//     with the refusal it gives for a `..` segment, and still admits `a/..x`
//     (changed);
//   - Product's context observation of a worksite that holds a top-level
//     `..x` entry refuses, through the same normalizer (changed);
//   - Product flags a subject under a protected root at `.abg/events/..x/f`;
//   - the parent still refuses the names at Worker dispatch, now flags the
//     protected-root subject (changed), and sees binding roots nested under a
//     dotted name as overlapping (changed);
//   - the helper refuses the names when it copies protected sources (changed)
//     and as launch paths (changed), and keeps a command cwd named `..x`.
// The parent and helper checks are private; they are linked from the built
// module in a VM with an export appended, as t287-lifecycle-failure-carrier does.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const product = await loadWorksiteOwner();
const hash = product.sha256Canonical;
const id = (scheme, digest) => `${scheme}://abiogenesis/${digest.slice('sha256:'.length)}`;
const dotted = ['..x', '..x/f', '...'];

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

test('changed: Product subject construction refuses a dotted first segment with its parent-traversal refusal', async t => {
  const env = await fixture(t);
  const traversal = subject(env, '../x');
  assert.equal(traversal.code, 'invalid_relative_path');
  for (const name of dotted) assert.deepEqual(subject(env, name), traversal, name);
  const nested = subject(env, 'a/..x');
  assert.equal(nested.kind, 'worksite_subject', 'a nested dotted segment is admitted');
  assert.equal(nested.relativePath, 'a/..x');
  assert.deepEqual(subject(env, '.'), traversal, 'the root itself is not a subject, as before');
});

test('changed: Product territory construction refuses a dotted first segment and still admits the root', async t => {
  const env = await fixture(t);
  const traversal = territory(env, '../x');
  assert.equal(traversal.code, 'invalid_relative_path');
  for (const name of dotted) assert.deepEqual(territory(env, name), traversal, name);
  assert.equal(territory(env, '.').kind, 'worksite_territory', 'the root itself is a territory, as before');
  assert.equal(territory(env, 'a/..x').kind, 'worksite_territory');
});

test('changed: context observation of a worksite with a top-level dotted entry refuses through the normalizer', async t => {
  const env = await fixture(t);
  await file(env.canonicalRoot, 'a/..x/f');
  const read = readRoots => product.observeWorksiteContext({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, readRoots, maxFiles: 20, maxBytes: 10000 });
  const control = await read(['.']);
  assert.equal(control.kind, 'worksite_context_observation', 'a nested dotted entry is observed');
  assert.ok(control.entries.some(entry => entry.relativePath === 'a/..x/f'));
  await file(env.canonicalRoot, '..x/f');
  const refused = await read(['.']);
  assert.equal(refused.kind, 'worksite_effect_refusal');
  assert.equal(refused.code, 'invalid_relative_path');
  assert.equal(refused.message, 'worksite path must be normalized and relative');
  const root = await read(['..x']);
  assert.equal(root.code, 'invalid_coordinate', 'a dotted read root is refused with the read-root refusal');
});

test('Product flags a subject under a protected root at .abg/events/..x/f', async t => {
  const env = await fixture(t);
  const binding = remintBinding(env.workspaceBinding, { roots: { ...env.workspaceBinding.roots,
    eventLogRoot: join(env.canonicalRoot, '.abg', 'events') } });
  assert.equal(product.isExactWorkspaceBinding(binding), true);
  const flagged = subject(env, '.abg/events/..x/f', binding);
  assert.equal(flagged.code, 'invalid_coordinate');
  assert.equal(subject(env, '.abg/events/f', binding).code, 'invalid_coordinate');
  assert.equal(subject(env, '.abg/other/f', binding).kind, 'worksite_subject', 'control: outside the protected root');
});

const parentTask = (env, roots = env.workspaceBinding.roots) => ({
  workspaceAuthorityBasis: { canonicalRoot: env.canonicalRoot }, workspaceBinding: { roots } });

test('parent dispatch still refuses a dotted first segment and the root itself', async t => {
  const env = await fixture(t);
  for (const name of dotted) {
    await file(env.canonicalRoot, name);
    assert.throws(() => parent.observeWorksiteSubjectSync(parentTask(env), { relativePath: name }),
      /^TypeError: protected subject escapes the canonical worksite root$/u, name);
    await fs.rm(join(env.canonicalRoot, name.split('/')[0]), { recursive: true });
  }
  assert.throws(() => parent.observeWorksiteSubjectSync(parentTask(env), { relativePath: '' }),
    /^TypeError: protected subject escapes the canonical worksite root$/u, 'the root itself');
  await file(env.canonicalRoot, 'a/..x');
  const nested = subject(env, 'a/..x');
  assert.equal(nested.kind, 'worksite_subject');
  const observation = parent.observeWorksiteSubjectSync(parentTask(env), nested);
  assert.equal(observation.state, 'file', 'a nested dotted segment is observed');
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
  const attemptRoot = join(roots.archiveRoot, 'worksite-command-execution', 'task', 'attempt');
  const plan = { attemptRoot, launchManifestPath: join(attemptRoot, 'launch.json'), helperPlan: {
    taskManifestPath: join(attemptRoot, 'task.json'), artifactPath: join(attemptRoot, 'artifact.json'), sandboxRoot: join(attemptRoot, 'sandbox') } };
  return { env, roots, plan, check: (changes, planned = plan) =>
    parent.assertArchiveExecutionBoundary({ workspaceBinding: { roots: { ...roots, ...changes } } }, planned) };
}

test('parent archive boundary: control, the root itself and a dotted attempt path keep their verdicts', async t => {
  const { roots, plan, check } = await archiveFixture(t);
  assert.doesNotThrow(() => check({}));
  assert.throws(() => check({ projectionRoot: roots.archiveRoot }),
    /^TypeError: command execution archive root overlaps a protected workspace root$/u, 'the root itself overlaps');
  const dottedAttempt = join(roots.archiveRoot, '..x', 'attempt');
  assert.throws(() => check({}, { ...plan, attemptRoot: dottedAttempt }),
    /^TypeError: command execution attempt path escapes its archive root$/u);
});

test('changed: parent archive boundary sees binding roots under a dotted name as overlapping', async t => {
  const { roots, check } = await archiveFixture(t);
  assert.throws(() => check({ runtimeStateRoot: join(roots.productRoot, '..x', 'state') }),
    /^TypeError: command execution workspace mechanics overlap the Product root$/u);
  assert.throws(() => check({ projectionRoot: join(roots.archiveRoot, '..x', 'projection') }),
    /^TypeError: command execution archive root overlaps a protected workspace root$/u);
  const nestedArchive = join(roots.toolchainRoot, '..x', 'archive');
  await fs.mkdir(nestedArchive, { recursive: true });
  const attemptRoot = join(nestedArchive, 'worksite-command-execution', 'task', 'attempt');
  assert.throws(() => check({ archiveRoot: nestedArchive }, { attemptRoot, launchManifestPath: join(attemptRoot, 'launch.json'),
    helperPlan: { taskManifestPath: join(attemptRoot, 'task.json'), artifactPath: join(attemptRoot, 'artifact.json'), sandboxRoot: join(attemptRoot, 'sandbox') } }),
  /^TypeError: command execution archive root overlaps a protected workspace root$/u);
});

function snapshotTask(env, relativePath, bytes) {
  const observation = { fileDigest: product.sha256Bytes(bytes), byteLength: bytes.byteLength,
    observationRef: 'worksite-observation://abiogenesis/t292', observationDigest: hash('observation') };
  return { kind: 'worksite_command_forward_task', workspaceAuthorityBasis: { canonicalRoot: env.canonicalRoot },
    snapshotSources: [{ sourceMemberRef: 'member://t292/0', source: 'source://t292/0', subject: { relativePath }, observation }] };
}

test('changed: the helper refuses a dotted first segment when it copies a protected source', async t => {
  const env = await fixture(t);
  const bytes = Buffer.from('bytes\n');
  for (const [ordinal, name] of ['..x/f', '...'].entries()) {
    await file(env.canonicalRoot, name, 'bytes\n');
    await assert.rejects(helper.materializeSnapshot(snapshotTask(env, name, bytes), join(env.scratch, `snapshot-${ordinal}`)),
      /^TypeError: relative path escapes its declared root$/u, name);
  }
  await file(env.canonicalRoot, 'a/..x/f', 'bytes\n');
  const copied = await helper.materializeSnapshot(snapshotTask(env, 'a/..x/f', bytes), join(env.scratch, 'snapshot-nested'));
  assert.equal(copied.snapshotMembers[0].relativePath, 'a/..x/f', 'a nested dotted segment is copied');
});

test('changed: the helper refuses a launch path under a dotted name in its root; the root itself stays refused', async t => {
  const env = await fixture(t);
  const archive = env.workspaceBinding.roots.archiveRoot;
  await file(archive, '..x/f');
  await assert.rejects(helper.canonicalExistingPathWithinRoot(archive, join(archive, '..x', 'f'), 'file'),
    /^TypeError: helper launch path escapes its declared root$/u);
  await assert.rejects(helper.canonicalExistingPathWithinRoot(archive, archive, 'directory'),
    /^TypeError: helper launch path escapes its declared root$/u, 'the root itself');
  await file(archive, 'a/..x/f');
  assert.equal(await helper.canonicalExistingPathWithinRoot(archive, join(archive, 'a', '..x', 'f'), 'file'), join(archive, 'a', '..x', 'f'));
});

test('the helper archive overlap check sees a dotted nested root and the root itself, as before', async t => {
  const env = await fixture(t);
  const roots = { ...env.workspaceBinding.roots };
  await fs.mkdir(roots.archiveRoot);
  const check = changes => helper.assertLaunchArchiveBoundary({ workspaceBinding: { roots: { ...roots, ...changes } } }, null);
  await check({});
  for (const changes of [{ projectionRoot: join(roots.archiveRoot, '..x', 'projection') }, { projectionRoot: roots.archiveRoot }]) {
    await assert.rejects(check(changes), /^TypeError: command execution archive root overlaps a protected workspace root$/u);
  }
});

test('the helper keeps a command cwd named ..x in the execution root (command locators unchanged)', {
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
