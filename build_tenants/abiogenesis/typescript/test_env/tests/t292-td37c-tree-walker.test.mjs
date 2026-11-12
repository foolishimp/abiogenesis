// TD-37c (T-292). Three sites walk a tree and read every file: the C2 Worker
// (parent) digests the installed Product root before and after a command, the
// file replace compares the conservation roots' inventories before and after
// its effect, and the command helper inventories the Product root and its
// sandbox and records their delta in its artifact. These lanes state the
// contract that the shared walker must not change, with values the lane
// computes from its own lstat, readlink and the bytes it wrote; they passed on
// the build before the walker existed (run with ABG_WORKSITE_BUILD_ROOT set to
// that build's `build/code/src`) and on the build with it. TD-81 orders names
// by code units, so the walk order and the delta order below hold from that
// build on:
//   - for one small tree, the parent's digest, the file replace's rows and the
//     helper's frozen rows, in walk order (code-unit order of names, each
//     directory before its children, symlinks recorded and not followed);
//   - the helper's product delta for one change of that tree;
//   - each site's refusal for a special node and for a root it does not admit.
// The file replace and helper functions are private; they are linked from the
// built module in a VM with an export appended, as t292-td37b-launch-identity
// does.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

async function component(name, suffix, transform = source => source) {
  const path = join(buildRoot, `${name}.js`);
  const module = new SourceTextModule(transform(await fs.readFile(path, 'utf8')) + suffix, { identifier: path });
  await module.link(async specifier => {
    const exports = { ...await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier) };
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}
const { installedProductInventoryDigest } = await import(pathToFileURL(join(buildRoot, 'implementation/worksite_command_execution.js')).href);
const replace = await component('implementation/worksite_file_replace', '\nexport { installedProductInventory };');
const helper = await component('implementation/worksite_command_helper', '\nexport { filesystemInventory, worksiteDelta };',
  source => {
    const replaced = source.replace(/^#!.*\n/u, '').replace(/await main\(\);\s*$/u, '');
    assert.notEqual(replaced, source, 'helper main is not run');
    return replaced;
  });

const sha256 = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
// Canonical JSON for these values: object keys in code-unit order, no whitespace.
const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
  : value !== null && typeof value === 'object'
    ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
    : JSON.stringify(value);

// The tree, in the walk order the three sites record. `B.txt` precedes `a.txt`
// (code units: every capital letter before every small one); `link-dir` is
// not followed.
const TREE = [
  ['..x', 'file', 'dotted\n'],
  ['B.txt', 'file', 'same\n'],
  ['a.txt', 'file', 'same\n'],
  ['dangling', 'symlink', 'missing'],
  ['dir', 'directory'],
  ['dir/deeper', 'directory'],
  ['dir/nested.txt', 'file', 'nested\n'],
  ['link-dir', 'symlink', 'dir'],
  ['link-file', 'symlink', 'a.txt'],
];

async function makeTree(t) {
  const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 't292-td37c-')));
  t.after(() => fs.rm(scratch, { recursive: true, force: true }));
  const root = join(scratch, 'root');
  await fs.mkdir(root);
  // Created out of walk order, so the order is the walk's own.
  for (const [path, kind, value] of [...TREE].reverse()) {
    if (kind === 'directory') await fs.mkdir(join(root, path), { recursive: true });
    else if (kind === 'file') { await fs.mkdir(dirname(join(root, path)), { recursive: true }); await fs.writeFile(join(root, path), value); }
    else await fs.symlink(value, join(root, path));
  }
  return { scratch, root };
}

// The rows each site records, from the lane's own lstat and the declared content.
async function expectedRows(root, tree = TREE) {
  const rows = [];
  for (const [relativePath, nodeKind, value] of tree) {
    const status = await fs.lstat(join(root, relativePath));
    const bytes = nodeKind === 'file' ? Buffer.from(value, 'utf8') : null;
    const digest = sha256(nodeKind === 'file' ? bytes : Buffer.from(nodeKind === 'symlink' ? value : 'directory', 'utf8'));
    rows.push({
      installed: { relativePath, nodeKind, symlinkTarget: nodeKind === 'symlink' ? value : null,
        byteLength: bytes === null ? null : bytes.byteLength, digest, fileIdentity: `${status.dev}:${status.ino}:${status.nlink}` },
      helper: { kind: 'worksite_path_observation', schemaVersion: '5.0.0', relativePath, nodeKind, digest,
        byteLength: bytes === null ? null : bytes.byteLength, symlinkTarget: nodeKind === 'symlink' ? value : null },
    });
  }
  return rows;
}

test('TD-37c each site records the same tree in walk order with its own row shape and digest', async (t) => {
  const { root } = await makeTree(t);
  const expected = await expectedRows(root);
  const installed = expected.map(row => row.installed);
  assert.equal(installedProductInventoryDigest(root), sha256(canonical(installed)), 'parent digest');
  const replaced = await replace.installedProductInventory(root);
  assert.equal(JSON.stringify(replaced), JSON.stringify(installed), 'file replace rows, keys in order');
  const inventory = await helper.filesystemInventory(root);
  assert.ok(inventory instanceof Map);
  assert.deepEqual([...inventory.keys()], TREE.map(([path]) => path), 'helper map order');
  assert.equal(JSON.stringify([...inventory.values()]), JSON.stringify(expected.map(row => row.helper)), 'helper rows, keys in order');
  assert.ok([...inventory.values()].every(row => Object.isFrozen(row)), 'helper rows are frozen');
  assert.equal(sha256(canonical([...inventory.values()])), sha256(canonical(expected.map(row => row.helper))));
  // Equal bytes give equal digests and distinct identities.
  assert.equal(installed[1].digest, installed[2].digest);
  assert.notEqual(installed[1].fileIdentity, installed[2].fileIdentity);
});

test('TD-37c the helper product delta for one change of the tree', async (t) => {
  const { root } = await makeTree(t);
  const before = await helper.filesystemInventory(root);
  const digestBefore = installedProductInventoryDigest(root);
  await fs.writeFile(join(root, 'a.txt'), 'changed bytes\n');
  await fs.rm(join(root, 'B.txt'));
  await fs.writeFile(join(root, 'dir/created.txt'), 'created\n');
  await fs.rm(join(root, 'link-file'));
  await fs.symlink('B.txt', join(root, 'link-file'));
  const after = await helper.filesystemInventory(root);
  assert.notEqual(installedProductInventoryDigest(root), digestBefore);
  const row = (relativePath, nodeKind, value) => ({ kind: 'worksite_path_observation', schemaVersion: '5.0.0', relativePath, nodeKind,
    digest: sha256(Buffer.from(value, 'utf8')), byteLength: nodeKind === 'file' ? Buffer.byteLength(value) : null,
    symlinkTarget: nodeKind === 'symlink' ? value : null });
  const delta = (ordinal, changeKind, relativePath, prior, next) => ({ kind: 'worksite_path_delta', schemaVersion: '5.0.0', ordinal,
    changeKind, relativePath, before: prior, after: next, matchedTerritoryRef: null });
  const expected = [
    delta(0, 'deleted', 'B.txt', row('B.txt', 'file', 'same\n'), null),
    delta(1, 'changed', 'a.txt', row('a.txt', 'file', 'same\n'), row('a.txt', 'file', 'changed bytes\n')),
    delta(2, 'created', 'dir/created.txt', null, row('dir/created.txt', 'file', 'created\n')),
    delta(3, 'changed', 'link-file', row('link-file', 'symlink', 'a.txt'), row('link-file', 'symlink', 'B.txt')),
  ];
  const productDelta = helper.worksiteDelta(null, before, after, false);
  assert.equal(canonical(productDelta), canonical(expected));
});

test('TD-37c each site keeps its own refusal for a special node and a root it does not admit', async (t) => {
  const { scratch, root } = await makeTree(t);
  execFileSync('mkfifo', [join(root, 'dir/pipe')]);
  const refuses = async (label, run, message) => {
    let error = null;
    try { await run(); } catch (caught) { error = caught; }
    assert.ok(error instanceof TypeError, `${label}: ${error}`);
    assert.equal(error.message, message, label);
  };
  await refuses('parent special node', () => installedProductInventoryDigest(root), 'installed Product inventory encountered a special node');
  await refuses('file replace special node', () => replace.installedProductInventory(root), 'installed Product inventory encountered a special node');
  await refuses('helper special node', () => helper.filesystemInventory(root), 'worksite inventory encountered a special filesystem node');
  await fs.rm(join(root, 'dir/pipe'));
  await fs.symlink(root, join(scratch, 'root-link'));
  for (const [label, rootValue, helperMessage] of [
    ['symlink root', join(scratch, 'root-link'), 'declared root must be one concrete directory'],
    ['file root', join(root, 'a.txt'), 'declared root must be one concrete directory'],
    ['trailing separator', `${root}/`, 'declared root must be lexical- and physical-canonical'],
    ['dotted spelling', `${root}/../root`, 'declared root must be lexical- and physical-canonical'],
  ]) {
    await refuses(`parent ${label}`, () => installedProductInventoryDigest(rootValue), 'installed Product root must remain canonical');
    await refuses(`file replace ${label}`, () => replace.installedProductInventory(rootValue),
      'installed Product root must be one canonical concrete directory');
    await refuses(`helper ${label}`, () => helper.filesystemInventory(rootValue), helperMessage);
  }
  for (const run of [() => installedProductInventoryDigest(join(scratch, 'absent')), () => replace.installedProductInventory(join(scratch, 'absent')),
    () => helper.filesystemInventory(join(scratch, 'absent'))]) {
    await assert.rejects(async () => run(), error => error.code === 'ENOENT' && error.syscall === 'lstat');
  }
});
