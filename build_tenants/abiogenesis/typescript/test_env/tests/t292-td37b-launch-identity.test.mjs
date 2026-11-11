// TD-37b (T-292). The launch identity of one C2 command attempt has one owner
// in Product: the attempt reference, the authority-free occurrence rule and the
// launch manifest (type, body, digest and reference). The Worker (parent)
// builds the manifest and the command helper, a separate process, re-admits it
// from disk. These lanes state the unchanged contract, so they pass on the build
// before the owner existed (run with ABG_WORKSITE_BUILD_ROOT set to that build's
// `build/code/src`) and on the build with it:
//   - the parent's manifest for a task at each command locus is admitted by the
//     helper's re-admission, with the attempt reference of the abg export, the
//     manifest digest recomputed from its body, and the archive path segment;
//   - the parent's occurrence verdict equals the helper's on the manifest that
//     carries the occurrence;
//   - the helper refuses a manifest with one changed field, raw or re-minted;
//   - through the process boundary, the built helper refuses a raw one-field
//     change with "helper received an invalid command-execution launch
//     manifest", non-canonical bytes with "helper launch manifest bytes or locus
//     are not canonical", and admits the parent's manifest past both checks
//     (it stops at the task, which this lane does not construct).
// The end-to-end run of a real task through the installed helper is
// t287-worksite-command-execution. The parent and helper functions are private;
// they are linked from the built module in a VM with an export appended, as
// t292-td37a-worksite-subject does. The parent's helper plan is supplied by the
// lane: the real one needs an admitted Product task.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const execFileAsync = promisify(execFile);
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const { sha256Canonical, sha256Bytes } = await load('shared/digests.js');
const { canonicalJson } = await load('shared/canonical_json.js');
const { worksiteCommandExecutionAttemptRef } = await load('abg/index.js');
const { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } = await load('product/contracts.js');
const { WORKSITE_COMMAND_EXECUTION_IDS: CE } = await load('product/worksite_command_execution_identity.js');
const { WORKSITE_REVISION_IDS: REV } = await load('product/worksite_revision_identity.js');
const { WORKSITE_COMMAND_FORWARD_IDS: FWD } = await load('product/worksite_command_forward_identity.js');
const helperModulePath = join(buildRoot, 'implementation/worksite_command_helper.js');

let suppliedHelperPlan = null;
async function component(name, suffix, transform = source => source) {
  const path = join(buildRoot, `${name}.js`);
  const module = new SourceTextModule(transform(await fs.readFile(path, 'utf8')) + suffix, { identifier: path });
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier);
    const exports = { ...actual };
    if (specifier.endsWith('/product/worksite_command_execution.js')) {
      exports.worksiteCommandExecutionHelperPlan = (task, attemptRef) => suppliedHelperPlan(task, attemptRef);
    }
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}
const parent = await component('implementation/worksite_command_execution',
  '\nexport { constructWorksiteCommandExecutionLaunchPlan, exactAuthorityFreeOccurrence };');
const helper = await component('implementation/worksite_command_helper',
  '\nexport { isWorksiteCommandExecutionLaunchManifest };',
  source => {
    const replaced = source.replace(/await main\(\);\s*$/u, '');
    assert.notEqual(replaced, source, 'helper main is not run');
    return replaced;
  });

const LOCI = [
  ['worksite_command_execution_task', CE],
  ['worksite_revision_command_execution_task', REV],
  ['worksite_command_forward_task', FWD],
];
const occurrenceAt = (label, nodeRef) => ({ cCallRef: `c-call://t292/td37b/${label}`, runId: `run://t292/td37b/${label}`,
  graphCallId: `graph-call://t292/td37b/${label}`, frameId: `frame://t292/td37b/${label}`, programLocusRef: nodeRef,
  taskOrdinal: 0, attempt: 1, executionAuthority: null });

async function scratchRoots(t) {
  const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 't292-td37b-')));
  t.after(() => fs.rm(scratch, { recursive: true, force: true }));
  const archiveRoot = join(scratch, 'archive');
  await fs.mkdir(archiveRoot);
  return { scratch, archiveRoot };
}

// The parent's plan for a task: its manifest bytes are the bytes it writes to launch.json.
function parentManifest(archiveRoot, kind, occurrence, label = 'task') {
  const taskBytes = Buffer.from(`${canonicalJson({ kind, label })}\n`, 'utf8');
  const taskDigest = sha256Canonical({ kind, label });
  const task = { kind, taskRef: `task://t292/td37b/${label}`, taskDigest, workspaceBinding: { roots: { archiveRoot } } };
  suppliedHelperPlan = (_task, attemptRef) => {
    const attemptRoot = join(archiveRoot, 'worksite-command-execution', taskDigest.slice(7), sha256Canonical({ attemptRef }).slice(7));
    return { taskManifestPath: join(attemptRoot, 'task.json'), taskManifestDigest: sha256Bytes(taskBytes),
      taskManifestByteLength: taskBytes.byteLength, helperModulePath };
  };
  const plan = parent.constructWorksiteCommandExecutionLaunchPlan(task, occurrence);
  return { plan, manifest: plan.launchManifest, bytes: Buffer.from(`${canonicalJson(plan.launchManifest)}\n`, 'utf8'), taskBytes };
}

// The manifest re-minted after a change: every derived member recomputed.
function remint(manifest) {
  const attemptRef = worksiteCommandExecutionAttemptRef(manifest.occurrence);
  const { launchManifestRef: _r, launchManifestDigest: _d, ...body } = { ...manifest,
    occurrenceDigest: sha256Canonical(manifest.occurrence), attemptRef, attemptDigest: sha256Canonical({ attemptRef }) };
  const launchManifestDigest = sha256Canonical(body);
  return { ...body, launchManifestRef: `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice(7)}`, launchManifestDigest };
}

test('TD-37b parent manifest at each command locus is admitted by the helper with the same attempt reference and digest', async (t) => {
  const { archiveRoot } = await scratchRoots(t);
  for (const [kind, ids] of LOCI) {
    const occurrence = occurrenceAt(kind, ids.nodeRef);
    const { plan, manifest, bytes } = parentManifest(archiveRoot, kind, occurrence);
    const reread = JSON.parse(bytes.toString('utf8'));
    assert.equal(helper.isWorksiteCommandExecutionLaunchManifest(reread), true, kind);
    assert.equal(manifest.attemptRef, worksiteCommandExecutionAttemptRef(occurrence), kind);
    assert.equal(manifest.attemptDigest, sha256Canonical({ attemptRef: manifest.attemptRef }), kind);
    assert.equal(manifest.occurrenceDigest, sha256Canonical(occurrence), kind);
    assert.equal(plan.attemptDigest, manifest.attemptDigest, kind);
    const { launchManifestRef, launchManifestDigest, ...body } = reread;
    assert.equal(launchManifestDigest, sha256Canonical(body), kind);
    assert.equal(launchManifestRef, `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice(7)}`, kind);
    assert.equal(plan.launchManifestRef, launchManifestRef, kind);
    assert.equal(plan.launchManifestByteDigest, sha256Bytes(bytes), kind);
    assert.equal(manifest.attemptRoot, join(archiveRoot, 'worksite-command-execution', manifest.taskDigest.slice(7), manifest.attemptDigest.slice(7)), kind);
    assert.equal(manifest.launchManifestPath, join(manifest.attemptRoot, 'launch.json'), kind);
    assert.deepEqual([manifest.implementationRef, manifest.implementationBindingRef], [ids.implementationRef, ids.implementationBindingRef], kind);
    assert.deepEqual([manifest.packageName, manifest.packageVersion], [ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION], kind);
    assert.equal(remint(reread).launchManifestDigest, launchManifestDigest, `${kind}: the re-mint is the identity on an exact manifest`);
  }
});

test('TD-37b parent and helper give the same occurrence verdict', async (t) => {
  const { archiveRoot } = await scratchRoots(t);
  const base = occurrenceAt('verdict', CE.nodeRef);
  const { manifest } = parentManifest(archiveRoot, 'worksite_command_execution_task', base, 'verdict');
  const variants = [
    ['exact', {}], ['task ordinal null', { taskOrdinal: null }], ['large attempt', { attempt: 2 ** 53 - 1 }],
    ['padded run id', { runId: ' run ' }], ['run id with NUL', { runId: 'run\0x' }],
    ['blank frame', { frameId: ' ' }], ['empty call', { cCallRef: '' }], ['numeric graph call', { graphCallId: 1 }],
    ['other locus', { programLocusRef: 'node://t292/elsewhere@5' }], ['negative ordinal', { taskOrdinal: -1 }],
    ['fractional ordinal', { taskOrdinal: 1.5 }], ['unsafe ordinal', { taskOrdinal: 2 ** 53 }], ['string ordinal', { taskOrdinal: '0' }],
    ['zero attempt', { attempt: 0 }], ['unsafe attempt', { attempt: 2 ** 53 }], ['null attempt', { attempt: null }],
    ['authority', { executionAuthority: {} }], ['extra key', { extra: 1 }],
  ];
  for (const [label, change] of variants) {
    const occurrence = { ...base, ...change };
    let parentAdmits = true;
    try { parent.exactAuthorityFreeOccurrence(occurrence); } catch { parentAdmits = false; }
    const carried = remint({ ...manifest, occurrence });
    assert.equal(helper.isWorksiteCommandExecutionLaunchManifest(JSON.parse(canonicalJson(carried))), parentAdmits, label);
  }
  for (const key of ['cCallRef', 'runId', 'graphCallId', 'frameId', 'programLocusRef', 'taskOrdinal', 'attempt', 'executionAuthority']) {
    const { [key]: _drop, ...occurrence } = base;
    assert.throws(() => parent.exactAuthorityFreeOccurrence(occurrence), /exact authority-free C2 occurrence/u, key);
    // Without the coordinate no attempt reference exists to re-mint; the occurrence rule refuses first.
    assert.equal(helper.isWorksiteCommandExecutionLaunchManifest({ ...manifest, occurrence }), false, key);
  }
});

test('TD-37b helper refuses a manifest with one changed field, raw or re-minted', async (t) => {
  const { archiveRoot } = await scratchRoots(t);
  const { manifest } = parentManifest(archiveRoot, 'worksite_command_execution_task', occurrenceAt('mutation', CE.nodeRef), 'mutation');
  const zero = `sha256:${'0'.repeat(64)}`;
  const raw = {
    kind: 'worksite_command_execution_launch_manifest_v2', schemaVersion: '5.0.1', launchManifestRef: `worksite-command-launch-manifest://abiogenesis/${'0'.repeat(64)}`,
    launchManifestDigest: zero, taskRef: 'task://t292/td37b/other', taskDigest: zero, taskManifestPath: '/elsewhere/task.json', taskManifestDigest: zero,
    taskManifestByteLength: 0, occurrence: { ...manifest.occurrence, attempt: 2 }, occurrenceDigest: zero,
    attemptRef: `worksite-command-attempt://abiogenesis/${'0'.repeat(64)}`, attemptDigest: zero, archiveRoot: '/elsewhere', attemptRoot: '/elsewhere/attempt',
    launchManifestPath: '/elsewhere/launch.json', helperModulePath: '/elsewhere/helper.js', implementationRef: REV.implementationRef,
    implementationBindingRef: FWD.implementationBindingRef, packageName: '@t292/other', packageVersion: '0.0.0',
  };
  assert.deepEqual(Object.keys(raw).sort(), Object.keys(manifest).sort(), 'every manifest field is changed once');
  for (const [key, value] of Object.entries(raw)) {
    assert.equal(helper.isWorksiteCommandExecutionLaunchManifest({ ...manifest, [key]: value }), false, `raw ${key}`);
  }
  // Re-minted: the digests agree with the change, so the rule itself refuses it.
  for (const [key, value] of Object.entries({ implementationRef: REV.implementationRef, implementationBindingRef: FWD.implementationBindingRef,
    packageName: '@t292/other', packageVersion: '0.0.0', schemaVersion: '5.0.1', taskManifestByteLength: 0, taskRef: ' padded ',
    occurrence: { ...manifest.occurrence, executionAuthority: {} } })) {
    assert.equal(helper.isWorksiteCommandExecutionLaunchManifest(remint({ ...manifest, [key]: value })), false, `re-minted ${key}`);
  }
  // A re-minted change of a coordinate the predicate cannot judge alone is admitted here
  // and refused later, against the task and the filesystem (helper admitLaunchManifest).
  assert.equal(helper.isWorksiteCommandExecutionLaunchManifest(remint({ ...manifest, taskRef: 'task://t292/td37b/other' })), true);
});

async function runHelper(path) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [helperModulePath, '--task', path], { encoding: 'utf8' });
    return { status: 0, stdout, stderr };
  } catch (error) {
    return { status: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}
async function writeAttempt(manifest, bytes, taskBytes) {
  await fs.mkdir(manifest.attemptRoot, { recursive: true });
  await fs.writeFile(manifest.taskManifestPath, taskBytes, { flag: 'wx' });
  await fs.writeFile(manifest.launchManifestPath, bytes, { flag: 'wx' });
}

test('TD-37b built helper process: the parent manifest passes re-admission; a changed field and non-canonical bytes are refused', async (t) => {
  const { archiveRoot } = await scratchRoots(t);
  const invalid = 'helper received an invalid command-execution launch manifest';
  const notCanonical = 'helper launch manifest bytes or locus are not canonical';
  const notTask = 'helper task manifest does not retain one exact Product task';
  // The parent's manifest: past the manifest rule, the bytes and the locus, the helper
  // stops at the task, which this lane does not construct.
  const exact = parentManifest(archiveRoot, 'worksite_command_execution_task', occurrenceAt('process-exact', CE.nodeRef), 'process-exact');
  await writeAttempt(exact.manifest, exact.bytes, exact.taskBytes);
  const admitted = await runHelper(exact.manifest.launchManifestPath);
  assert.notEqual(admitted.status, 0);
  assert.match(admitted.stderr, new RegExp(notTask), admitted.stderr);
  assert.doesNotMatch(admitted.stderr, new RegExp(`${invalid}|${notCanonical}`), admitted.stderr);
  // One raw changed field (the occurrence's attempt), at an otherwise exact attempt locus.
  const changed = parentManifest(archiveRoot, 'worksite_command_execution_task', occurrenceAt('process-changed', CE.nodeRef), 'process-changed');
  const changedValue = { ...changed.manifest, occurrence: { ...changed.manifest.occurrence, attempt: 2 } };
  await writeAttempt(changed.manifest, Buffer.from(`${canonicalJson(changedValue)}\n`, 'utf8'), changed.taskBytes);
  const refused = await runHelper(changed.manifest.launchManifestPath);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, new RegExp(invalid), refused.stderr);
  // A re-minted implementation binding for another locus: the rule refuses it.
  const crossed = parentManifest(archiveRoot, 'worksite_command_execution_task', occurrenceAt('process-crossed', CE.nodeRef), 'process-crossed');
  await writeAttempt(crossed.manifest, Buffer.from(`${canonicalJson(remint({ ...crossed.manifest, implementationBindingRef: REV.implementationBindingRef }))}\n`, 'utf8'), crossed.taskBytes);
  const crossedRun = await runHelper(crossed.manifest.launchManifestPath);
  assert.notEqual(crossedRun.status, 0);
  assert.match(crossedRun.stderr, new RegExp(invalid), crossedRun.stderr);
  // The exact manifest written with a second trailing newline.
  const loose = parentManifest(archiveRoot, 'worksite_command_execution_task', occurrenceAt('process-loose', CE.nodeRef), 'process-loose');
  await writeAttempt(loose.manifest, Buffer.concat([loose.bytes, Buffer.from('\n')]), loose.taskBytes);
  const looseRun = await runHelper(loose.manifest.launchManifestPath);
  assert.notEqual(looseRun.status, 0);
  assert.match(looseRun.stderr, new RegExp(notCanonical), looseRun.stderr);
});
