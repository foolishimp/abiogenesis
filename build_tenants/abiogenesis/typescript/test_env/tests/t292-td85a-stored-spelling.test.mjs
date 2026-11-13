// TD-85a (T-292). A synchronous canonical-path check asks whether a path is
// spelled as stored: the system `realpath` (`realpathSync.native`, through
// `shared/stored_spelling.ts`) returns the path unchanged. The JavaScript
// `realpathSync` resolves symbolic links and keeps the letters it is given, so
// on a volume that ignores letter case or Unicode normalization form a check
// that compared a path with it passed another spelling of a stored name.
//   - The command-execution parent (`realizeWorksiteCommandExecution`): an
//     archive root that names the event-log directory in another letter case
//     or normalization form, and a source subject that enters a protected root
//     through another spelling, are refused at their check with its existing
//     message; nothing is written, and the protected file is never opened (it
//     is made unreadable first). A binding root declared in another spelling
//     is compared in its stored spelling, so a stored-spelled source inside
//     it meets the existing protected-root refusal.
//   - The revision gates (`worksiteRevisionPhysicalMatches`,
//     `retainedWorksitePhysicalMatches`) report a recorded subject stale after
//     a rename that changes only the letter case or the normalization form of
//     the root, a directory or the file, and current under its new stored
//     spelling.
// Tests named "changed" are red on the build before TD-85a (run with
// ABG_WORKSITE_BUILD_ROOT set to that build's `build/code/src`). Every other
// test passes on both builds and pins a verdict that does not change.
// The lane first asks this volume, for each kind of variant, whether two names
// that differ only that way name one node; the cases of a kind the volume
// keeps apart are skipped with that reason.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const product = { ...(await load('product/index.js')), ...(await load('product/worksite_command_execution.js')),
  ...(await load('product/worksite_effect.js')), ...(await load('product/environment.js')), ...(await load('shared/digests.js')),
  ...(await load('product/worksite_construction_identity.js')) };
const { realizeWorksiteCommandExecution } = await load('implementation/worksite_command_execution.js');
const { worksiteRevisionPhysicalMatches, retainedWorksitePhysicalMatches } = await load('abg/worksite_revision.js');

// The two normalization forms of one name. NFC composes é (U+00E9); NFD writes
// e (U+0065) and the combining acute accent (U+0301).
const NFC = 'café';
const NFD = 'café';
assert.equal(NFC.normalize('NFD'), NFD);
assert.notEqual(NFC, NFD);

// Whether the volume under the lane's temporary directory names one node by
// two names that differ only in one way: the first is created, the second is
// created with the exclusive flag, and an EEXIST with the same inode answers yes.
async function volumeAliases(stored, variant) {
  const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'td85a-volume-')));
  try {
    await fs.writeFile(join(scratch, stored), 'stored\n', { flag: 'wx' });
    try {
      await fs.writeFile(join(scratch, variant), 'variant\n', { flag: 'wx' });
      return false;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const [a, b] = [lstatSync(join(scratch, stored)), lstatSync(join(scratch, variant))];
    return a.dev === b.dev && a.ino === b.ino && readdirSync(scratch).length === 1;
  } finally {
    await fs.rm(scratch, { recursive: true, force: true });
  }
}
const aliases = { case: await volumeAliases('Alpha', 'alpha'), normalization: await volumeAliases(NFC, NFD) };
const kinds = { case: 'letter case', normalization: 'normalization form' };
const skipUnless = kind => aliases[kind] ? false :
  `this volume keeps two names that differ only in ${kinds[kind]} apart, so no path in another ${kinds[kind]} names a stored one`;

test('the volume: two names that differ only in letter case, and two that differ only in normalization form, are each tested on it', t => {
  assert.equal(typeof aliases.case, 'boolean');
  assert.equal(typeof aliases.normalization, 'boolean');
  t.diagnostic(`letter case aliased: ${aliases.case}; normalization form aliased: ${aliases.normalization}`);
});

// A tree listing by stored names, with each node's inode, so a write anywhere
// under the scratch directory shows.
function listing(root) {
  const rows = [];
  const walk = (directory, prefix) => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name), status = lstatSync(path);
      rows.push(`${prefix}${name} ${status.ino} ${status.isDirectory() ? 'd' : status.size}`);
      if (status.isDirectory()) walk(path, `${prefix}${name}/`);
    }
  };
  walk(root, '');
  return rows;
}

const hash = value => product.sha256Canonical(value);
const digest = label => hash({ label });
const id = (scheme, value) => `${scheme}://abiogenesis/${value.slice('sha256:'.length)}`;

// A cold worksite: `src/source.mjs`; the event-log directory `.abg/events`
// holding a log file; an NFC-named directory `.abg/café` holding `state.json`;
// the archive, runtime and projection directories; a Product and a toolchain
// directory beside the worksite.
async function worksite(t) {
  const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'td85a-')));
  t.after(() => fs.rm(scratch, { recursive: true, force: true }));
  const W = join(scratch, 'worksite');
  const write = async (relativePath, text) => {
    const path = join(W, ...relativePath.split('/'));
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, text, { flag: 'wx' });
    return path;
  };
  await write('src/source.mjs', 'export const x = 1;\n');
  await write('.abg/events/runtime.events.jsonl', 'log\n');
  await write(`.abg/${NFC}/state.json`, '{}\n');
  for (const name of ['archive', 'runtime', 'projection']) await fs.mkdir(join(W, '.abg', name));
  await fs.mkdir(join(scratch, 'product'));
  await fs.writeFile(join(scratch, 'product', 'package.json'), '{}\n');
  await fs.mkdir(join(scratch, 'toolchain'));
  const roots = {
    toolchainRoot: join(scratch, 'toolchain'), productRoot: join(scratch, 'product'),
    eventLogRoot: join(W, '.abg', 'events'), runtimeStateRoot: join(W, '.abg', 'runtime'),
    projectionRoot: join(W, '.abg', 'projection'), archiveRoot: join(W, '.abg', 'archive'),
  };
  return { scratch, W, roots, write };
}

function basisAndBinding(W, roots) {
  const manifest = { workspaceId: 'workspace://td85a/c2', canonicalRoot: W, authorityMode: 'trusted_developer', authorizedActorRef: 'actor://td85a/c2' };
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({ ...manifest,
    authorityManifestRef: 'manifest://td85a/c2', authorityManifestDigest: hash(manifest) });
  assert.equal(workspaceAuthorityBasis.kind, 'workspace_authority_basis');
  const bindingBody = { workspaceId: manifest.workspaceId, authorityBasisId: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest, authorizedActorRef: manifest.authorizedActorRef,
    productSetId: 'product-set://td85a/c2', productSetDigest: digest('products'), lockId: 'lock://td85a/c2', lockDigest: digest('lock'), roots };
  const bindingDigest = hash(bindingBody);
  const workspaceBinding = { kind: 'workspace_binding', schemaVersion: '5.0.0', bindingId: id('workspace-binding', bindingDigest), bindingDigest,
    ...bindingBody, admissionEventRef: 'event://td85a/c2/binding' };
  return { manifest, workspaceAuthorityBasis, workspaceBinding };
}

const subjectFor = (workspaceAuthorityBasis, workspaceBinding, relativePath) => product.constructWorksiteSubject({
  workspaceAuthorityBasis, workspaceBinding, relativePath,
  subjectUri: pathToFileURL(resolve(workspaceAuthorityBasis.canonicalRoot, ...relativePath.split('/'))).href });

function observe(subject, path) {
  const status = lstatSync(path), bytes = readFileSync(path);
  return product.constructWorksiteObservation({ subject, state: 'file', fileIdentity: `${status.dev}:${status.ino}`,
    fileDigest: product.sha256Bytes(bytes), byteLength: bytes.length });
}

// One cold C2 task over the worksite, in the shape of
// test_env/fixtures/c2-component/input.mjs: one command, one exit predicate,
// one source per path. Every source is observed while it is readable.
async function c2Task(env, roots, sources) {
  const { manifest, workspaceAuthorityBasis, workspaceBinding } = basisAndBinding(env.W, roots);
  const grantBody = {
    definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'invoke' }, definitionRef: 'definition://td85a/invoke', definitionDigest: digest('definition'),
    capabilityDefinition: { graphId: 'capability-graph://td85a/c2', graphVersion: '5.0.0', graphDigest: digest('capability-graph'),
      capabilityId: 'capability://abiogenesis/run.invoke', capabilityDefinitionRef: 'capability-definition://td85a/c2', capabilityDefinitionDigest: digest('capability-definition') },
    operationContract: {
      contractCatalog: { productId: 'product://td85a/c2', productContentDigest: digest('product'), catalogId: 'catalog://td85a/c2', catalogVersion: '5.0.0', catalogDigest: digest('catalog') },
      flatRow: { contractId: 'contract://td85a/request', contractVersion: '5.0.0', contractDigest: digest('contract') },
      nestedSelector: { selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null },
    }, operationId: 'abg.operation.run.invoke', capabilityRef: 'capability://abiogenesis/run.invoke', actorRef: manifest.authorizedActorRef,
    approvalRef: workspaceAuthorityBasis.authorityBasisId, approvalDigest: workspaceAuthorityBasis.authorityBasisDigest,
    policyRef: 'policy://td85a/c2', policyDigest: digest('policy'), scopeRef: workspaceBinding.bindingId, scopeDigest: workspaceBinding.bindingDigest,
    authorityBasisRef: workspaceAuthorityBasis.authorityBasisId, authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest,
  };
  const grantDigest = hash(grantBody);
  const capabilityGrant = { kind: 'capability_grant', schemaVersion: '5.0.0', grantRef: id('capability-grant', grantDigest), grantDigest, ...grantBody };
  const protectedObservations = [];
  for (const [ordinal, relativePath] of sources.entries()) {
    const subject = subjectFor(workspaceAuthorityBasis, workspaceBinding, relativePath);
    assert.equal(subject.kind, 'worksite_subject', `subject ${relativePath} is constructed`);
    const observation = observe(subject, resolve(env.W, ...relativePath.split('/')));
    protectedObservations.push({ sourceMemberRef: `td85a:member:${ordinal}`, subject, observation });
  }
  const members = protectedObservations.map(({ sourceMemberRef, observation }, ordinal) => {
    const body = { authorizationRef: `td85a:authorization:${ordinal}`, authorizationDigest: digest(`authorization-${ordinal}`),
      beforeObservationRef: `td85a:before:${ordinal}`, beforeObservationDigest: digest(`before-${ordinal}`),
      afterObservationRef: observation.observationRef, afterObservationDigest: observation.observationDigest, writtenDigest: observation.fileDigest, committed: true };
    const receiptDigest = hash(body);
    return { ordinal, inputMemberRef: sourceMemberRef, outputMemberRef: `td85a:output:${ordinal}`,
      receipt: { kind: 'worksite_file_replace_receipt', schemaVersion: '5.0.0', receiptRef: id('worksite-file-replace-receipt', receiptDigest), receiptDigest, ...body },
      successorObservation: observation };
  });
  const constructionBody = { sourceApplicationRef: product.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef, members };
  const resultDigest = hash(constructionBody);
  const sourceConstructionResult = { kind: 'worksite_construction_result', schemaVersion: '5.0.0',
    resultRef: id('worksite-construction-result', resultDigest), resultDigest, ...constructionBody };
  return product.constructWorksiteCommandExecutionTask({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    sourceConstructionResultRef: sourceConstructionResult.resultRef, sourceConstructionResultDigest: resultDigest, sourceConstructionResult, protectedObservations,
    commands: [{ commandId: 'td85a:command', executable: '/usr/bin/true', args: [], relativeCwd: '.', environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [{ predicateId: 'td85a:exit', predicateKind: 'process_exit', declaration: { validationCommandId: 'td85a:command', equals: 0 } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'evidence' }] });
}
const occurrence = label => ({ cCallRef: `c-call://td85a/c2/${label}`, runId: `run://td85a/c2/${label}`, graphCallId: `graph-call://td85a/c2/${label}`,
  frameId: `frame://td85a/c2/${label}`, programLocusRef: 'node://abiogenesis/worksite/command-execution/fp@5', taskOrdinal: 0, attempt: 1, executionAuthority: null });

// Runs the parent to its Worker request (the Worker is never started) and
// returns its outcome and whether any node under the scratch directory changed.
// `unreadable` names worksite files made unreadable before the call, so a read
// of one before the refusal would fail with EACCES instead.
async function parent(env, task, label, unreadable = []) {
  for (const relativePath of unreadable) await fs.chmod(join(env.W, ...relativePath.split('/')), 0o000);
  const before = listing(env.scratch);
  let outcome;
  try {
    const prepared = realizeWorksiteCommandExecution(task, occurrence(label));
    outcome = { kind: prepared.kind };
  } catch (error) {
    outcome = { refused: error.message };
  }
  for (const relativePath of unreadable) await fs.chmod(join(env.W, ...relativePath.split('/')), 0o644);
  const after = listing(env.scratch);
  return { outcome, written: after.filter(row => !before.includes(row)) };
}

const ARCHIVE_REFUSAL = 'command execution archive root must be one canonical concrete directory';
const ALIAS_REFUSAL = 'protected subject has a symlink or physical alias';
const PROTECTED_REFUSAL = 'protected subject enters a WorkspaceBinding protected root';
const OVERLAP_REFUSAL = 'command execution archive root overlaps a protected workspace root';

test('control: stored roots and a stored source prepare the Worker request; the parent writes only under the archive root', async t => {
  const env = await worksite(t);
  const task = await c2Task(env, env.roots, ['src/source.mjs']);
  const { outcome, written } = await parent(env, task, 'control');
  assert.deepEqual(outcome, { kind: 'prepared_probabilistic_leaf_invocation' });
  assert.ok(written.length >= 3, 'the attempt directory and two manifests are written');
  assert.ok(written.every(row => row.startsWith('worksite/.abg/archive/')), written.join('\n'));
});

test('control: in stored spelling, an archive root equal to the event-log root keeps its overlap refusal; nothing is written', async t => {
  const env = await worksite(t);
  const equal = await c2Task(env, { ...env.roots, archiveRoot: env.roots.eventLogRoot }, ['src/source.mjs']);
  assert.deepEqual(await parent(env, equal, 'equal'), { outcome: { refused: OVERLAP_REFUSAL }, written: [] });
});

test('changed: an archive root that names the event-log directory in another letter case is refused at the archive-root check; nothing is written',
  { skip: skipUnless('case') }, async t => {
    const env = await worksite(t);
    await fs.mkdir(join(env.W, '.abg', 'events', 'archive'));
    for (const [label, archiveRoot] of [['equal', join(env.W, '.abg', 'EVENTS')], ['nested', join(env.W, '.ABG', 'events', 'archive')]]) {
      const task = await c2Task(env, { ...env.roots, archiveRoot }, ['src/source.mjs']);
      assert.deepEqual(await parent(env, task, label), { outcome: { refused: ARCHIVE_REFUSAL }, written: [] }, label);
    }
  });

test('changed: an archive root that names the event-log directory in another normalization form is refused at the archive-root check; nothing is written',
  { skip: skipUnless('normalization') }, async t => {
    const env = await worksite(t);
    const task = await c2Task(env, { ...env.roots, eventLogRoot: join(env.W, '.abg', NFC), archiveRoot: join(env.W, '.abg', NFD) }, ['src/source.mjs']);
    assert.deepEqual(await parent(env, task, 'nfd'), { outcome: { refused: ARCHIVE_REFUSAL }, written: [] });
  });

test('changed: a source that enters the event-log root through another letter case is refused at its component check before it is read; nothing is written',
  { skip: skipUnless('case') }, async t => {
    const env = await worksite(t);
    for (const relativePath of ['.ABG/events/runtime.events.jsonl', '.abg/EVENTS/runtime.events.jsonl']) {
      const task = await c2Task(env, env.roots, [relativePath]);
      assert.deepEqual(await parent(env, task, relativePath, ['.abg/events/runtime.events.jsonl']),
        { outcome: { refused: ALIAS_REFUSAL }, written: [] }, relativePath);
    }
  });

test('changed: a source that enters a protected root through another normalization form is refused at its component check before it is read; nothing is written',
  { skip: skipUnless('normalization') }, async t => {
    const env = await worksite(t);
    const task = await c2Task(env, { ...env.roots, runtimeStateRoot: join(env.W, '.abg', NFC) }, [`.abg/${NFD}/state.json`]);
    assert.deepEqual(await parent(env, task, 'nfd-source', [`.abg/${NFC}/state.json`]), { outcome: { refused: ALIAS_REFUSAL }, written: [] });
  });

test('changed: a binding root declared in another letter case is compared in its stored spelling; a stored-spelled source inside it is refused before it is read',
  { skip: skipUnless('case') }, async t => {
    const env = await worksite(t);
    const task = await c2Task(env, { ...env.roots, eventLogRoot: join(env.W, '.ABG', 'events') }, ['.abg/events/runtime.events.jsonl']);
    assert.deepEqual(await parent(env, task, 'declared-case', ['.abg/events/runtime.events.jsonl']), { outcome: { refused: PROTECTED_REFUSAL }, written: [] });
  });

test('changed: a binding root declared in another normalization form is compared in its stored spelling; a stored-spelled source inside it is refused before it is read',
  { skip: skipUnless('normalization') }, async t => {
    const env = await worksite(t);
    const task = await c2Task(env, { ...env.roots, runtimeStateRoot: join(env.W, '.abg', NFD) }, [`.abg/${NFC}/state.json`]);
    assert.deepEqual(await parent(env, task, 'declared-nfd', [`.abg/${NFC}/state.json`]), { outcome: { refused: PROTECTED_REFUSAL }, written: [] });
  });

// The two revision gates over one recorded subject: the vector of
// `worksiteRevisionPhysicalMatches` and the receipt-backed rows of
// `retainedWorksitePhysicalMatches`, each built from the subject's observation.
async function gates(workspaceAuthorityBasis, workspaceBinding, relativePath) {
  const subject = subjectFor(workspaceAuthorityBasis, workspaceBinding, relativePath);
  assert.equal(subject.kind, 'worksite_subject', relativePath);
  const path = resolve(workspaceAuthorityBasis.canonicalRoot, ...relativePath.split('/'));
  const observation = observe(subject, path);
  const base64 = (await fs.readFile(path)).toString('base64');
  return () => ({
    revision: worksiteRevisionPhysicalMatches({ workspaceAuthorityBasis,
      targets: [{ target: { subject, predecessorObservation: observation }, base64 }] }),
    retained: retainedWorksitePhysicalMatches(workspaceAuthorityBasis, [{ subject, observation }]),
  });
}
// A rename through a third name, so that a volume that ignores the difference
// still records the new spelling.
async function respell(from, to) {
  await fs.rename(from, `${from}.td85a-rename`);
  await fs.rename(`${from}.td85a-rename`, to);
  assert.ok(readdirSync(dirname(to)).includes(basename(to)), `the volume stores ${basename(to)}`);
}
async function revisionWorksite(t, directory) {
  const env = await worksite(t);
  await env.write(`${directory}/a.txt`, 'alpha\n');
  const { workspaceAuthorityBasis, workspaceBinding } = basisAndBinding(env.W, env.roots);
  return { env, workspaceAuthorityBasis, workspaceBinding };
}

test('control: both revision gates report a stored-spelled recorded subject current', async t => {
  const { workspaceAuthorityBasis, workspaceBinding } = await revisionWorksite(t, 'src');
  const check = await gates(workspaceAuthorityBasis, workspaceBinding, 'src/a.txt');
  assert.deepEqual(check(), { revision: true, retained: true });
});

test('changed: after a rename that changes only the letter case of the file, a directory or the root, both revision gates report the recorded subject stale; its new stored spelling is current',
  { skip: skipUnless('case') }, async t => {
    for (const [label, from, to, renamed] of [
      ['file', 'src/a.txt', 'src/A.txt', 'src/A.txt'],
      ['directory', 'src', 'SRC', 'SRC/a.txt'],
    ]) {
      const { env, workspaceAuthorityBasis, workspaceBinding } = await revisionWorksite(t, 'src');
      const recorded = await gates(workspaceAuthorityBasis, workspaceBinding, 'src/a.txt');
      assert.deepEqual(recorded(), { revision: true, retained: true }, `${label}: before the rename`);
      await respell(join(env.W, ...from.split('/')), join(env.W, ...to.split('/')));
      assert.deepEqual(recorded(), { revision: false, retained: false }, `${label}: the recorded spelling after the rename`);
      const current = await gates(workspaceAuthorityBasis, workspaceBinding, renamed);
      assert.deepEqual(current(), { revision: true, retained: true }, `${label}: the stored spelling after the rename`);
    }
    {
      const { env, workspaceAuthorityBasis, workspaceBinding } = await revisionWorksite(t, 'src');
      const recorded = await gates(workspaceAuthorityBasis, workspaceBinding, 'src/a.txt');
      const renamedRoot = join(env.scratch, 'WORKSITE');
      await respell(env.W, renamedRoot);
      assert.deepEqual(recorded(), { revision: false, retained: false }, 'root: the recorded root after the rename');
      const moved = basisAndBinding(renamedRoot, env.roots);
      const current = await gates(moved.workspaceAuthorityBasis, moved.workspaceBinding, 'src/a.txt');
      assert.deepEqual(current(), { revision: true, retained: true }, 'root: the stored root after the rename');
    }
  });

test('changed: after a rename that changes only the normalization form of a directory or the file, both revision gates report the recorded subject stale; its new stored spelling is current',
  { skip: skipUnless('normalization') }, async t => {
    for (const [label, recordedPath, from, to, renamed] of [
      ['directory', `${NFC}/a.txt`, NFC, NFD, `${NFD}/a.txt`],
      ['file', `src/${NFC}.txt`, `src/${NFC}.txt`, `src/${NFD}.txt`, `src/${NFD}.txt`],
    ]) {
      const env = await worksite(t);
      await env.write(recordedPath, 'alpha\n');
      const { workspaceAuthorityBasis, workspaceBinding } = basisAndBinding(env.W, env.roots);
      const recorded = await gates(workspaceAuthorityBasis, workspaceBinding, recordedPath);
      assert.deepEqual(recorded(), { revision: true, retained: true }, `${label}: before the rename`);
      await respell(join(env.W, ...from.split('/')), join(env.W, ...to.split('/')));
      assert.deepEqual(recorded(), { revision: false, retained: false }, `${label}: the recorded spelling after the rename`);
      const current = await gates(workspaceAuthorityBasis, workspaceBinding, renamed);
      assert.deepEqual(current(), { revision: true, retained: true }, `${label}: the stored spelling after the rename`);
    }
  });
