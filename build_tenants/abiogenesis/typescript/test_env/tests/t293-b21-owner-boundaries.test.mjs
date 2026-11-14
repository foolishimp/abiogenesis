// T-293 B21 / RC14 owner boundaries: the actual asynchronous C0 subject owner
// and the actual C2 helper admission, each observed at its own effects.
//
// C0 cases call the built owner in process and record every filesystem call it
// makes through the patched `node:fs/promises` exports (opens, path reads,
// listings, every content read through an opened handle and every effect).
// C2 cases run the actual built helper as its own Node process under a module
// hook that records the same calls plus command spawns; a negative is proved
// by the helper's own refusal with zero protected reads and zero snapshot,
// result or command effects, never by final-tree rollback.
//
// Substituted premises, labelled where used: cold owner coordinates
// (`worksiteFixture`: no ABG admission); a controlled toolchain layout (the
// built package copied under `<toolchain>/node_modules/@abiogenesis/
// typescript-tenant`, dependencies linked) instead of a packed and installed
// Product; for helper-independence negatives the exact attempt manifests are
// published directly, as a host that did not apply the rule would, after the
// actual host refusal is asserted. No installed, Public, provider or release
// claim is made here.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { execFile } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import fs from 'node:fs/promises';
import { constants, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const product = await loadWorksiteOwner();
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const observation = await load('shared/physical_path_observation.js');
const c2 = await load('product/worksite_command_execution.js');
const launch = await load('product/worksite_command_launch.js');
const revision = await load('product/worksite_revision.js');
const implementation = await load('implementation/worksite_command_execution.js');
const { canonicalJson } = await load('shared/canonical_json.js');
const loaded = observation.physicalPathNative();
const native = typeof loaded === 'string' ? null : loaded;
const nativeGate = native === null && `declared native observer unavailable: ${loaded}`;
const DATA = '/System/Volumes/Data';
const NO_ALIAS = 'host premise absent: no /System/Volumes/Data alias of the worksite';

const dataAlias = path => DATA + path;
const spellings = path => [path, dataAlias(path)];
/** The B21 host premise: the path and its Data spelling are one directory and both are realpath-self-canonical. */
function aliasHolds(path) {
  if (process.platform !== 'darwin') return false;
  try {
    const a = lstatSync(path, { bigint: true }), b = lstatSync(dataAlias(path), { bigint: true });
    return a.dev === b.dev && a.ino === b.ino && realpathSync.native(path) === path && realpathSync.native(dataAlias(path)) === dataAlias(path);
  } catch { return false; }
}
const verdict = value => value?.kind === 'worksite_effect_refusal' ? `refused ${value.code}: ${value.message}` : JSON.stringify(value?.kind ?? value);

// ---------------------------------------------------------------------------
// In-process C0 instrumentation.

const EFFECTS = ['mkdir', 'link', 'rename', 'rmdir', 'unlink', 'writeFile', 'rm', 'copyFile', 'symlink'];
const CONTENT_METHODS = ['read', 'readFile', 'readv', 'readLines', 'createReadStream', 'readableWebStream'];
const WRITE_FLAGS = constants.O_WRONLY | constants.O_RDWR | constants.O_CREAT | constants.O_TRUNC | constants.O_APPEND;
const writes = flags => typeof flags === 'string' ? /[wa+]/u.test(flags) : typeof flags === 'number' && (flags & WRITE_FLAGS) !== 0;

/** Records every open, path read, listing, handle content read and effect the run makes. */
async function watched(run) {
  const names = [...EFFECTS, 'open', 'readFile', 'readdir'];
  const originals = Object.fromEntries(names.map(name => [name, fs[name]]));
  const calls = [];
  for (const name of names) fs[name] = async (...args) => {
    const path = String(args[0]);
    calls.push({ syscall: name === 'open' && writes(args[1]) ? 'open-write' : name, path });
    const value = await originals[name](...args);
    if (name === 'open') for (const method of CONTENT_METHODS) {
      const original = value[method];
      if (typeof original === 'function') value[method] = (...rest) => { calls.push({ syscall: 'content', path }); return original.apply(value, rest); };
    }
    return value;
  };
  syncBuiltinESMExports();
  try { return { result: await run(), calls }; }
  finally { Object.assign(fs, originals); syncBuiltinESMExports(); }
}
const effects = calls => calls.filter(call => EFFECTS.includes(call.syscall) || call.syscall === 'open-write');
/** Opens, path reads, handle content reads or listings of one node in either spelling. */
const touches = (calls, path) => calls.filter(call => ['open', 'open-write', 'readFile', 'content', 'readdir'].includes(call.syscall) &&
  spellings(path).includes(call.path));
const contentReads = (calls, path) => calls.filter(call => ['readFile', 'content'].includes(call.syscall) && spellings(path).includes(call.path));
const listingsWithin = (calls, root) => calls.filter(call => call.syscall === 'readdir' &&
  spellings(root).some(spelling => call.path === spelling || call.path.startsWith(spelling + '/')));

const defaultRoots = scratch => Object.fromEntries(['toolchain', 'product', 'eventLog', 'runtimeState', 'projection', 'archive']
  .map(name => [`${name}Root`, join(scratch, name)]));
async function writeFiles(root, files) {
  for (const [relativePath, bytes] of Object.entries(files)) {
    const path = join(root, ...relativePath.split('/'));
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, bytes);
  }
}
async function c0Fixture(t, files, roots = null) {
  const env = await worksiteFixture(product, roots === null ? {} : { roots: (scratch, canonicalRoot) => ({ ...defaultRoots(scratch), ...roots(scratch, canonicalRoot) }) });
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await writeFiles(env.canonicalRoot, files);
  return env;
}
function subjectFor(env, relativePath) {
  const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding,
    relativePath, subjectUri: pathToFileURL(resolve(env.canonicalRoot, ...relativePath.split('/'))).href });
  assert.equal(subject.kind, 'worksite_subject', JSON.stringify(subject));
  return subject;
}
const observe = (env, relativePath, protectedInstallRoots) => product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding,
  subjectFor(env, relativePath), ...(protectedInstallRoots === undefined ? [] : [protectedInstallRoots]));
async function replace(env, relativePath, predecessorObservation, protectedInstallRoots = []) {
  const { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, executionBasis, cCall, implementationSet } = env;
  const request = product.constructWorksiteFileReplaceRequest({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    subject: subjectFor(env, relativePath), territory: env.territory, predecessorObservation, replacementBytes: Buffer.from('b21 owner replacement\n') });
  const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request, executionBasis, cCall, implementationSet });
  return product.replaceWorksiteFile({ workspaceAuthorityBasis, workspaceBinding, request, executionBasis, cCall, implementationSet,
    authorization, protectedInstallRoots });
}

test('actual async C0 subject observation excludes a Data-aliased protected root before opening or reading it', { skip: nativeGate }, async t => {
  // A binding root reached only through the Data alias of a worksite directory.
  const env = await c0Fixture(t, { 'src/sibling.txt': 'lawful sibling\n', 'protected/kept.txt': 'protected bytes\n',
    'vendor/install/secret.txt': 'install bytes\n' }, (_scratch, canonicalRoot) => ({ runtimeStateRoot: dataAlias(join(canonicalRoot, 'protected')) }));
  if (!aliasHolds(env.canonicalRoot)) return t.skip(NO_ALIAS);
  const kept = join(env.canonicalRoot, 'protected', 'kept.txt'), sibling = join(env.canonicalRoot, 'src', 'sibling.txt');
  const installDir = join(env.canonicalRoot, 'vendor', 'install'), secret = join(installDir, 'secret.txt');
  const keptBefore = readFileSync(kept);
  for (const relativePath of ['protected/kept.txt', 'protected/absent.txt']) {
    const { result, calls } = await watched(() => observe(env, relativePath));
    assert.equal(result?.code, 'subject_outside_territory', `${relativePath}: ${verdict(result)}`);
    assert.match(result.message, /overlaps a protected install\/runtime root/u);
    assert.deepEqual(touches(calls, join(env.canonicalRoot, ...relativePath.split('/'))), [], `${relativePath}: the protected node is never opened or read`);
    assert.deepEqual(listingsWithin(calls, join(env.canonicalRoot, 'protected')), [], 'the protected directory is never listed');
    assert.deepEqual(effects(calls), [], relativePath);
  }
  assert.deepEqual(readFileSync(kept), keptBefore);

  // The subject owner now receives the complete install input: a lexical
  // install refuses as a protected root; its Data spelling refuses physically.
  for (const [installs, code] of [[[installDir], 'binding_mismatch'], [[dataAlias(installDir)], 'subject_outside_territory']]) {
    const { result, calls } = await watched(() => observe(env, 'vendor/install/secret.txt', installs));
    assert.equal(result?.code, code, `${installs}: ${verdict(result)}`);
    assert.deepEqual(touches(calls, secret), [], `${installs}: the install member is never opened or read`);
    assert.deepEqual(listingsWithin(calls, installDir), []);
    assert.deepEqual(effects(calls), []);
  }

  // Lawful sibling under the same binding and install input.
  const { result: lawful, calls } = await watched(() => observe(env, 'src/sibling.txt', [dataAlias(installDir)]));
  assert.equal(lawful.kind, 'worksite_observation', verdict(lawful));
  assert.equal(lawful.state, 'file');
  assert.equal(lawful.fileDigest, product.sha256Bytes(readFileSync(sibling)));
  assert.ok(contentReads(calls, sibling).length >= 1, 'the lawful sibling is read through the actual owner (instrumentation live)');
  assert.deepEqual([...touches(calls, kept), ...touches(calls, secret)], []);
  assert.deepEqual(effects(calls), []);
});

test('actual C0 replacement refuses a Data-aliased install target before reading it or making any effect', { skip: nativeGate }, async t => {
  const env = await c0Fixture(t, { 'src/sibling.txt': 'lawful sibling\n', 'vendor/install/secret.txt': 'install bytes\n' });
  if (!aliasHolds(env.canonicalRoot)) return t.skip(NO_ALIAS);
  const installDir = join(env.canonicalRoot, 'vendor', 'install'), secret = join(installDir, 'secret.txt');
  const sibling = join(env.canonicalRoot, 'src', 'sibling.txt'), installs = [dataAlias(installDir)];
  // O0 premise: observed by the actual owner before the install input was
  // supplied, as an earlier lawful observation would have been.
  const o0 = await observe(env, 'vendor/install/secret.txt');
  assert.equal(o0.kind, 'worksite_observation', verdict(o0));
  const secretBefore = readFileSync(secret);
  const { result, calls } = await watched(() => replace(env, 'vendor/install/secret.txt', o0, installs));
  assert.equal(result?.code, 'subject_outside_territory', verdict(result));
  assert.match(result.message, /overlaps a protected install\/runtime root/u);
  assert.equal(result.phase, undefined, 'no physical outcome');
  assert.deepEqual(touches(calls, secret), [], 'the protected target is never opened or read');
  assert.deepEqual(effects(calls), [], 'the refusal precedes every effect');
  assert.deepEqual(readFileSync(secret), secretBefore);

  const s0 = await observe(env, 'src/sibling.txt', installs);
  assert.equal(s0.kind, 'worksite_observation', verdict(s0));
  const lawful = await watched(() => replace(env, 'src/sibling.txt', s0, installs));
  assert.equal(lawful.result.kind, 'worksite_file_replace_result', verdict(lawful.result));
  assert.ok(contentReads(lawful.calls, sibling).length >= 1, 'the lawful target is read for currentness');
  assert.deepEqual(touches(lawful.calls, secret), []);
  assert.equal(readFileSync(sibling, 'utf8'), 'b21 owner replacement\n');
});

test('existing C0 refusal premises keep their precedence without content reads; changed bytes remain stale', { skip: nativeGate }, async t => {
  const env = await c0Fixture(t, { 'src/linked.txt': 'linked\n', 'src/sibling.txt': 'lawful sibling\n', 'src/dir/member.txt': 'member\n' });
  await fs.symlink('linked.txt', join(env.canonicalRoot, 'src', 'link.txt'));
  await fs.link(join(env.canonicalRoot, 'src', 'linked.txt'), join(env.canonicalRoot, 'src', 'hard.txt'));
  const anyContent = calls => calls.filter(call => ['readFile', 'content'].includes(call.syscall));
  for (const [relativePath, codes] of [
    ['src/link.txt', ['symlink_forbidden']],
    ['src/hard.txt', ['aliased_subject']],
    ['src/dir', ['target_not_file']],
    ['missing/x.txt', ['target_parent_missing']],
    // A case-insensitive host resolves SRC to src: a parent alias; otherwise the parent is missing.
    ['SRC/sibling.txt', ['aliased_subject', 'target_parent_missing']],
  ]) {
    const { result, calls } = await watched(() => observe(env, relativePath));
    assert.ok(codes.includes(result?.code), `${relativePath}: ${verdict(result)}`);
    assert.deepEqual(anyContent(calls), [], `${relativePath}: refused before any content read`);
    assert.deepEqual(effects(calls), [], relativePath);
  }
  const sibling = join(env.canonicalRoot, 'src', 'sibling.txt');
  const o0 = await observe(env, 'src/sibling.txt');
  assert.equal(o0.kind, 'worksite_observation', verdict(o0));
  await fs.writeFile(sibling, 'changed after O0\n');
  const { result, calls } = await watched(() => replace(env, 'src/sibling.txt', o0));
  assert.equal(result?.code, 'stale_observation', verdict(result));
  assert.notEqual(result.lastObservation?.fileDigest, o0.fileDigest, 'the refusal names the current bytes');
  assert.deepEqual(effects(calls), [], 'a stale O0 makes no effect');
  assert.equal(readFileSync(sibling, 'utf8'), 'changed after O0\n');
});

// ---------------------------------------------------------------------------
// Actual C2 helper admission.

const packageRoot = resolve(buildRoot, '../../..');
let toolchainBase = null, toolchainLayout = null;
after(() => toolchainBase === null ? undefined : fs.rm(toolchainBase, { recursive: true, force: true }));

/** The first `node_modules` above the package that resolves its dependencies, as Node's own lookup does. */
function dependencyRoot() {
  for (let cursor = packageRoot; ; cursor = dirname(cursor)) {
    const candidate = join(cursor, 'node_modules');
    try { lstatSync(join(candidate, 'effect')); return candidate; } catch { /* continue upward */ }
    if (dirname(cursor) === cursor) throw new Error(`no node_modules above ${packageRoot} provides effect`);
  }
}

// Loaded in the helper process only (`--import`); records the helper's own
// filesystem calls and spawns, one JSON line each, before the helper module
// evaluates.
const HOOK_SOURCE = `import fs from 'node:fs/promises';
import childProcess from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
const log = process.env.ABG_B21_HELPER_LOG;
if (log && (process.argv[1] ?? '').endsWith('/implementation/worksite_command_helper.js')) {
  const note = (op, path) => appendFileSync(log, JSON.stringify({ op, path: String(path) }) + '\\n');
  const open = fs.open;
  fs.open = async (path, ...rest) => {
    note('open', path);
    const handle = await open(path, ...rest);
    for (const method of ${JSON.stringify(CONTENT_METHODS)}) {
      const original = handle[method];
      if (typeof original === 'function') handle[method] = (...args) => { note('content', path); return original.apply(handle, args); };
    }
    return handle;
  };
  for (const name of ['readFile', 'readdir', ${EFFECTS.map(name => `'${name}'`).join(', ')}]) {
    const original = fs[name];
    fs[name] = async (path, ...rest) => { note(name, path); return original(path, ...rest); };
  }
  const spawn = childProcess.spawn;
  childProcess.spawn = (command, ...rest) => { note('spawn', command); return spawn(command, ...rest); };
  syncBuiltinESMExports();
}
`;

/** One controlled toolchain layout per file: the built package where the helper plan names it. */
function controlledToolchain() {
  toolchainLayout ??= (async () => {
    toolchainBase = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'abi5-b21-owner-toolchain-')));
    const toolchainRoot = join(toolchainBase, 'toolchain');
    const tenant = join(toolchainRoot, 'node_modules', '@abiogenesis', 'typescript-tenant');
    await fs.mkdir(tenant, { recursive: true });
    await fs.cp(join(packageRoot, 'build'), join(tenant, 'build'), { recursive: true });
    for (const name of ['package.json', 'product-toolchain-manifest.json', 'contracts']) {
      try { await fs.cp(join(packageRoot, name), join(tenant, name), { recursive: true }); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    await fs.symlink(dependencyRoot(), join(tenant, 'node_modules'), 'dir');
    const hook = join(toolchainBase, 'helper-effects.mjs');
    await fs.writeFile(hook, HOOK_SOURCE);
    return { toolchainRoot, hookUrl: pathToFileURL(hook).href };
  })();
  return toolchainLayout;
}

/** Binding roots outside the worksite unless overridden; every root exists in its canonical spelling. */
async function c2Fixture(t, roots, files) {
  const { toolchainRoot, hookUrl } = await controlledToolchain();
  const env = await worksiteFixture(product, { roots: (scratch, canonicalRoot) => ({ ...defaultRoots(scratch), toolchainRoot,
    ...roots(scratch, canonicalRoot) }) });
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  for (const root of Object.values(env.workspaceBinding.roots)) if (root !== toolchainRoot) {
    await fs.mkdir(root.startsWith(DATA + '/') ? root.slice(DATA.length) : root, { recursive: true });
  }
  await fs.writeFile(join(env.scratch, 'product', 'payload.js'), 'payload\n');
  await writeFiles(env.canonicalRoot, files);
  return { ...env, hookUrl, log: join(env.scratch, 'helper-effects.jsonl') };
}
const COMMAND = { commandId: 'command://t293-b21/owner', executable: process.execPath, args: ['-e', ''], relativeCwd: '.',
  environment: {}, timeoutMs: 5_000, terminationGraceMs: 1_000, expectedReports: [] };
const commandTask = (env, observedFiles) => c2.constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
  workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, observedFiles, commands: [COMMAND],
  outcomePredicates: [], allowedWriteTerritories: [] }, null);
const occurrenceFor = (task, label) => ({ cCallRef: `c-call://t293-b21/${label}`, runId: `run://t293-b21/${label}`,
  graphCallId: `graph-call://t293-b21/${label}`, frameId: `frame://t293-b21/${label}`,
  programLocusRef: revision.worksiteExecutionLocus(task), taskOrdinal: 0, attempt: 1, executionAuthority: null });
const planFor = (task, occurrence) => c2.worksiteCommandExecutionHelperPlan(task, launch.worksiteCommandExecutionAttemptRef(occurrence));
async function observedSubject(env, relativePath) {
  const subject = subjectFor(env, relativePath);
  const observed = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
  assert.equal(observed.kind, 'worksite_observation', `${relativePath}: ${verdict(observed)}`);
  return { subject, observation: observed };
}

/** Publishes the exact attempt manifests as a host that did not apply the rule would. */
async function publishWithoutHost(task, occurrence, plan) {
  const attemptRoot = dirname(plan.taskManifestPath), launchManifestPath = join(attemptRoot, 'launch.json');
  const manifest = launch.constructWorksiteCommandExecutionLaunchManifest({ taskRef: task.taskRef, taskDigest: task.taskDigest,
    taskManifestPath: plan.taskManifestPath, taskManifestDigest: plan.taskManifestDigest, taskManifestByteLength: plan.taskManifestByteLength,
    occurrence, archiveRoot: task.workspaceBinding.roots.archiveRoot, attemptRoot, launchManifestPath, helperModulePath: plan.helperModulePath });
  await fs.mkdir(attemptRoot, { recursive: true });
  await fs.writeFile(plan.taskManifestPath, `${canonicalJson(task)}\n`, { flag: 'wx' });
  await fs.writeFile(launchManifestPath, `${canonicalJson(manifest)}\n`, { flag: 'wx' });
  assert.equal(product.sha256Bytes(readFileSync(plan.taskManifestPath)), plan.taskManifestDigest, 'the exact planned task bytes');
}
function runHelper(env, plan) {
  const nodeOptions = [process.env.NODE_OPTIONS ?? '', `--import=${env.hookUrl}`].join(' ').trim();
  return new Promise(resolveRun => execFile('/bin/sh', ['-c', plan.toolCommand], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, NODE_OPTIONS: nodeOptions, ABG_B21_HELPER_LOG: env.log } },
  (error, stdout, stderr) => resolveRun({ code: error === null ? 0 : error.code, stdout, stderr })));
}
async function helperLog(env) {
  try { return (await fs.readFile(env.log, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line)); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
const absent = async (path, label) => assert.rejects(fs.lstat(path), { code: 'ENOENT' }, label);

/** The exact transport exchange shape of t287-worksite-command-execution (component carrier values). */
function exactHelperExchange(prepared, plan, label, finalOutput) {
  const request = prepared.workerRequest;
  const emptyDigest = product.sha256Bytes(Buffer.alloc(0));
  return {
    kind: 'actor_process_carrier_validation', schemaVersion: '5.0.0', disposition: 'valid', request,
    observation: {
      actorInvocationRef: `actor-invocation://t293-b21/${label}`, actorRef: request.actorRef, workerBindingRef: request.workerBindingRef,
      implementationRef: request.implementationRef, inputDigest: request.inputDigest, materializationPlanRef: request.materializationPlanRef,
      rendererRef: request.rendererRef, instructionContractRef: request.instructionContractRef, resultContractRef: request.resultContractRef,
      processRef: `process://t293-b21/${label}`, transportBindingRef: `transport-binding://t293-b21/${label}`,
      transportBindingDigest: product.sha256Canonical({ label, kind: 'binding' }), disposition: 'success', failureClass: null, finalOutput,
      observedOutputDigest: product.sha256Bytes(Buffer.from(finalOutput, 'utf8')), promptDigest: product.sha256Canonical(request.prompt),
      transportDigest: product.sha256Canonical({ label, kind: 'transport' }), transportLane: request.transportLane, processStatus: 0,
      processSignal: null, timeoutClass: null, timedOut: false, exitObserved: true, terminationConfirmed: true, signalSequence: [],
      structuredEventCount: 2, progressEventCount: 0, toolCallCount: 1,
      toolInvocations: [{ kind: 'worker_tool_invocation_evidence', schemaVersion: '5.0.0', ordinal: 0, toolUseRef: `tool-use://t293-b21/${label}`,
        toolName: 'Bash', inputDigest: plan.toolInputDigest, inputByteLength: plan.toolInputByteLength }],
      apiRetryCount: 0, stdoutByteLength: 0, stderrByteLength: 0,
      artifactDigests: { output: emptyDigest, prompt: emptyDigest, stderr: emptyDigest, stdout: emptyDigest, transport: emptyDigest },
    },
  };
}

/** The helper refuses on its own: no subject read, snapshot, result or command. */
async function helperRefuses(env, task, label, pattern, forbidden) {
  const occurrence = occurrenceFor(task, label), plan = planFor(task, occurrence);
  await publishWithoutHost(task, occurrence, plan);
  await fs.rm(env.log, { force: true });
  const run = await runHelper(env, plan), log = await helperLog(env);
  assert.notEqual(run.code, 0, `${label}: ${JSON.stringify(run)}`);
  assert.match(run.stderr, pattern, label);
  assert.ok(log.some(entry => entry.op === 'readFile' && entry.path === plan.taskManifestPath), `${label}: the effect hook observed the actual helper`);
  for (const path of forbidden) assert.deepEqual(log.filter(entry => spellings(path).includes(entry.path)), [], `${label}: ${path} is never opened or read`);
  assert.deepEqual(log.filter(entry => entry.op === 'spawn'), [], `${label}: no command launches`);
  assert.deepEqual(log.filter(entry => EFFECTS.includes(entry.op)), [], `${label}: no snapshot or result effect`);
  await absent(plan.sandboxRoot, `${label}: no snapshot`);
  await absent(plan.artifactPath, `${label}: no result`);
}

/** Host realization, the actual helper and Product completion all succeed for a lawful sibling. */
async function helperSucceeds(env, task, label, forbidden) {
  const occurrence = occurrenceFor(task, label), plan = planFor(task, occurrence);
  const prepared = implementation.realizeWorksiteCommandExecution(task, occurrence);
  assert.equal(prepared.kind, 'prepared_probabilistic_leaf_invocation', label);
  await fs.rm(env.log, { force: true });
  const run = await runHelper(env, plan), log = await helperLog(env);
  assert.equal(run.code, 0, `${label}: ${JSON.stringify(run)}`);
  const lines = run.stdout.split('\n');
  assert.deepEqual([lines.length, lines[1]], [2, ''], `${label}: one acknowledgment line`);
  assert.equal(JSON.parse(lines[0]).attemptRef, plan.attemptRef);
  for (const row of revision.worksiteExecutionSources(task)) {
    const path = join(env.canonicalRoot, ...row.subject.relativePath.split('/'));
    assert.ok(log.some(entry => entry.op === 'content' && entry.path === path), `${label}: the helper reads the lawful source ${path}`);
  }
  assert.ok(log.some(entry => entry.op === 'spawn'), `${label}: the declared command launches`);
  for (const path of forbidden) assert.deepEqual(log.filter(entry => spellings(path).includes(entry.path)), [], `${label}: ${path} untouched`);
  const completion = await prepared.complete(exactHelperExchange(prepared, plan, label, run.stdout.trimEnd()));
  assert.equal(completion.disposition, 'success', `${label}: ${JSON.stringify(completion)}`);
}

test('actual C2 helper refuses a Data-aliased protected subject before reading it, snapshotting, publishing or launching', { skip: nativeGate }, async t => {
  const env = await c2Fixture(t, (_scratch, canonicalRoot) => ({ runtimeStateRoot: dataAlias(join(canonicalRoot, 'protected')) }),
    { 'protected/kept.txt': 'protected bytes\n', 'src/sibling.txt': 'lawful sibling\n' });
  if (!aliasHolds(env.canonicalRoot)) return t.skip(NO_ALIAS);
  const kept = join(env.canonicalRoot, 'protected', 'kept.txt');
  // Substituted premise: an O1 built from test-held metadata, standing for an
  // observation a producer without the rule supplied. The actual async owner
  // refuses this subject (first case); here the helper must refuse it again.
  const keptSubject = subjectFor(env, 'protected/kept.txt'), status = lstatSync(kept), bytes = readFileSync(kept);
  const keptObservation = product.constructWorksiteObservation({ subject: keptSubject, state: 'file', fileIdentity: `${status.dev}:${status.ino}`,
    fileDigest: product.sha256Bytes(bytes), byteLength: bytes.byteLength });
  const task = commandTask(env, [{ subject: keptSubject, observation: keptObservation }]);
  const occurrence = occurrenceFor(task, 'protected-subject'), plan = planFor(task, occurrence);
  assert.throws(() => implementation.realizeWorksiteCommandExecution(task, occurrence), /protected subject overlaps a protected workspace root/u,
    'the actual host refuses first');
  await absent(dirname(plan.taskManifestPath), 'the host refusal precedes its attempt manifests');
  await helperRefuses(env, task, 'protected-subject', /protected subject observation refused/u, [kept]);
  assert.deepEqual(readFileSync(kept), bytes);
  await helperSucceeds(env, commandTask(env, [await observedSubject(env, 'src/sibling.txt')]), 'protected-sibling', [kept]);
});

test('actual C2 helper independently applies the directional Product-root rule before any subject read or effect', { skip: nativeGate }, async t => {
  const files = { 'src/sibling.txt': 'lawful sibling\n' };
  const refusedByBoth = async (env, label, pattern) => {
    const task = commandTask(env, [await observedSubject(env, 'src/sibling.txt')]);
    const plan = planFor(task, occurrenceFor(task, label));
    assert.throws(() => implementation.realizeWorksiteCommandExecution(task, occurrenceFor(task, label)), pattern, `${label}: the actual host refuses`);
    await absent(dirname(plan.taskManifestPath), `${label}: the host refusal precedes its attempt manifests`);
    await helperRefuses(env, task, label, pattern, [join(env.canonicalRoot, 'src', 'sibling.txt')]);
  };
  // Lexical: a mechanics root inside the Product root.
  const lexical = await c2Fixture(t, scratch => ({ runtimeStateRoot: join(scratch, 'product', 'state') }), files);
  await refusedByBoth(lexical, 'lexical-mechanics', /command execution workspace mechanics overlap the Product root/u);
  // Physical: the Product root spelled through the Data alias encloses the mechanics root.
  const data = await c2Fixture(t, scratch => ({ productRoot: dataAlias(join(scratch, 'product')), runtimeStateRoot: join(scratch, 'product', 'state') }), files);
  if (!aliasHolds(join(data.scratch, 'product'))) return t.skip(NO_ALIAS);
  await refusedByBoth(data, 'data-mechanics', /command execution workspace mechanics overlaps a protected workspace root/u);
  // Lawful sibling: the same Data-spelled Product root with separate mechanics.
  const lawful = await c2Fixture(t, scratch => ({ productRoot: dataAlias(join(scratch, 'product')) }), files);
  await helperSucceeds(lawful, commandTask(lawful, [await observedSubject(lawful, 'src/sibling.txt')]), 'data-product-sibling', []);
});
