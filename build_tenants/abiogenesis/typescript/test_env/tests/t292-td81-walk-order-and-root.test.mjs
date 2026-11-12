// TD-81 (T-292). The tree walk, the command helper's delta and the helper's
// walk of report files order names by code units, and the three sites that
// walk an installed Product root take one root rule: the spelling the volume
// stores. The lane's expected values come from its own tree and its own
// code-unit sort, never from the sites.
//   - Order. A child process is started three times, under
//     LC_ALL=sv_SE.UTF-8, under LC_ALL=tr_TR.UTF-8 and with no locale
//     variable (LC_ALL, LC_MESSAGES and LANG all unset); each walks one tree,
//     whose names the three collations order differently, through each site's
//     own built function. A process fixes its default locale when it starts,
//     so setting process.env in the lane would prove nothing. Each site's rows
//     and digest are equal in the three children and in code-unit order.
//   - Root. One directory spelled thirteen ways; the C2 Worker (parent), the
//     file replace and the helper admit or refuse each spelling together.
// On the build before TD-81 (ABG_WORKSITE_BUILD_ROOT set to that build's
// `build/code/src`) every case but the first is red: the children's orders
// differ, and the parent admits a root spelled in another letter case or
// Unicode normalization form, which the other two refuse.
// The file replace and helper functions are private; they are linked from the
// built module in a VM with an export appended, as t292-td37c-tree-walker does.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
async function sites() {
  const { installedProductInventoryDigest } = await import(pathToFileURL(join(buildRoot, 'implementation/worksite_command_execution.js')).href);
  const replace = await component('implementation/worksite_file_replace', '\nexport { installedProductInventory };');
  const helper = await component('implementation/worksite_command_helper', '\nexport { filesystemInventory, worksiteDelta, walkFiles };',
    source => {
      const replaced = source.replace(/^#!.*\n/u, '').replace(/await main\(\);\s*$/u, '');
      assert.notEqual(replaced, source, 'helper main is not run');
      return replaced;
    });
  return { installedProductInventoryDigest, replace, helper };
}

// The tree. Every name is a file except the two directories. Swedish sorts
// å, ä and ö after z; Turkish sorts the dotless ı before i and takes the ASCII
// capital I as the capital of ı; English ignores letter case and accents
// unless the names are otherwise equal; code units put every capital before
// every small letter and non-ASCII last. `ia.txt` and `Ib.txt` differ in their
// second letter, so a volume that ignores letter case keeps both.
const TREE = ['a.txt', 'B.txt', 'Z.txt', 'o.txt', 'å.txt', 'ä.txt', 'ö.txt', 'h.txt', 'ia.txt', 'Ib.txt', 'ıc.txt', 'İd.txt',
  'j.txt', '1.txt', '10.txt', '2.txt', 'Dir/', 'Dir/x.txt', 'Dir/Y.txt', 'sv/', 'sv/zz.txt', 'sv/å.txt'];
const NAMES = TREE.filter(path => !path.includes('/'));
const codeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;
// The walk the sites must give: each directory's names in code-unit order,
// each directory before its children.
function expectedWalk(directory = '') {
  const children = TREE.map(path => path.replace(/\/$/u, ''))
    .filter(path => (directory === '' ? !path.includes('/') : path.startsWith(`${directory}/`) && !path.slice(directory.length + 1).includes('/')))
    .sort((left, right) => codeUnits(basename(left), basename(right)));
  return children.flatMap(path => TREE.includes(`${path}/`) ? [path, ...expectedWalk(path)] : [path]);
}
const WALK = expectedWalk();
const FILES = WALK.filter(path => !TREE.includes(`${path}/`));

const SETTINGS = [['LC_ALL=sv_SE.UTF-8', { LC_ALL: 'sv_SE.UTF-8' }], ['LC_ALL=tr_TR.UTF-8', { LC_ALL: 'tr_TR.UTF-8' }],
  ['no locale variable', {}]];

if (process.env.T292_TD81_CHILD === '1') {
  // Child: walk the tree through each site under this process's locale.
  const [tree, empty] = process.argv.slice(2);
  const { installedProductInventoryDigest, replace, helper } = await sites();
  const inventory = await helper.filesystemInventory(tree);
  process.stdout.write(JSON.stringify({
    collatorLocale: new Intl.Collator().resolvedOptions().locale,
    localeOrder: [...NAMES].sort((left, right) => left.localeCompare(right)),
    parentDigest: installedProductInventoryDigest(tree),
    replaceRows: await replace.installedProductInventory(tree),
    helperRows: [...inventory.entries()],
    deltaRows: helper.worksiteDelta(null, await helper.filesystemInventory(empty), inventory, false),
    reportWalk: await helper.walkFiles(tree),
  }));
} else {
  const sha256 = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  // Canonical JSON for these values: object keys in code-unit order, no whitespace.
  const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
    : value !== null && typeof value === 'object'
      ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
      : JSON.stringify(value);

  let children = null;
  async function walkedUnderEachSetting(t) {
    if (children !== null) return children;
    const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 't292-td81-order-')));
    const tree = join(scratch, 'tree'), empty = join(scratch, 'empty');
    await fs.mkdir(tree); await fs.mkdir(empty);
    // Created out of every order, create-only, so a name the volume folds onto
    // another fails here instead of overwriting it.
    for (const [ordinal, path] of [...TREE].reverse().entries()) {
      if (path.endsWith('/')) await fs.mkdir(join(tree, path), { recursive: true });
      else { await fs.mkdir(dirname(join(tree, path)), { recursive: true }); await fs.writeFile(join(tree, path), `${ordinal}\n`, { flag: 'wx' }); }
    }
    children = [];
    try {
      for (const [label, setting] of SETTINGS) {
        const run = spawnSync(process.execPath, ['--experimental-vm-modules', '--no-warnings', fileURLToPath(import.meta.url), tree, empty], {
          env: { PATH: '/usr/bin:/bin', TMPDIR: tmpdir(), T292_TD81_CHILD: '1', ABG_WORKSITE_BUILD_ROOT: buildRoot, ...setting },
          encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024 });
        assert.equal(run.status, 0, `${label}: ${run.stderr}`);
        children.push({ label, ...JSON.parse(run.stdout) });
      }
    } finally {
      await fs.rm(scratch, { recursive: true, force: true });
    }
    t.diagnostic(children.map(child => `${child.label}: default collation ${child.collatorLocale}`).join('; '));
    return children;
  }
  // One site's value in every child, equal across the three and to the lane's own expectation.
  function sameUnderEverySetting(values, expected, label) {
    for (const [index, value] of values.entries()) {
      assert.deepEqual(value, values[0], `${label}: ${SETTINGS[index][0]} differs from ${SETTINGS[0][0]}`);
    }
    assert.deepEqual(values[0], expected, `${label}: code-unit order`);
  }

  test('TD-81 the three settings collate the lane\'s names three ways', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    assert.match(runs[0].collatorLocale, /^sv\b/u);
    assert.match(runs[1].collatorLocale, /^tr\b/u);
    const orders = runs.map(run => JSON.stringify(run.localeOrder));
    assert.equal(new Set(orders).size, 3, 'each setting orders the names by its own collation');
    assert.ok(orders.every(order => order !== JSON.stringify([...NAMES].sort(codeUnits))), 'no collation is code-unit order');
  });

  test('TD-81 the C2 Worker digests the same rows in code-unit order under every setting', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    sameUnderEverySetting(runs.map(run => run.parentDigest), sha256(canonical(runs[0].replaceRows)), 'parent digest');
  });

  test('TD-81 the file replace records the same rows in code-unit order under every setting', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    sameUnderEverySetting(runs.map(run => run.replaceRows.map(row => row.relativePath)), WALK, 'file replace order');
    sameUnderEverySetting(runs.map(run => sha256(canonical(run.replaceRows))), sha256(canonical(runs[0].replaceRows)), 'file replace digest');
  });

  test('TD-81 the helper inventories the same rows in code-unit order under every setting', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    sameUnderEverySetting(runs.map(run => run.helperRows.map(([path]) => path)), WALK, 'helper map order');
    assert.ok(runs.every(run => run.helperRows.every(([path, row]) => row.relativePath === path)));
    sameUnderEverySetting(runs.map(run => sha256(canonical(run.helperRows.map(([, row]) => row)))),
      sha256(canonical(runs[0].helperRows.map(([, row]) => row))), 'helper rows digest');
  });

  test('TD-81 the helper records the same delta in code-unit order under every setting', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    const created = [...WALK].sort(codeUnits);
    sameUnderEverySetting(runs.map(run => run.deltaRows.map(row => [row.ordinal, row.changeKind, row.relativePath])),
      created.map((path, ordinal) => [ordinal, 'created', path]), 'delta rows');
    sameUnderEverySetting(runs.map(run => sha256(canonical(run.deltaRows))), sha256(canonical(runs[0].deltaRows)), 'delta digest');
  });

  test('TD-81 the helper walks report files in code-unit order under every setting', async (t) => {
    const runs = await walkedUnderEachSetting(t);
    sameUnderEverySetting(runs.map(run => run.reportWalk), FILES, 'report walk');
  });

  test('TD-81 the three sites give one verdict on one root in thirteen spellings', async (t) => {
    const { installedProductInventoryDigest, replace, helper } = await sites();
    const scratch = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 't292-td81-root-')));
    t.after(() => fs.rm(scratch, { recursive: true, force: true }));
    const root = join(scratch, 'small');
    await fs.mkdir(join(root, 'd'), { recursive: true });
    await fs.writeFile(join(root, 'a.txt'), 'a\n');
    await fs.writeFile(join(root, 'd', 'b.txt'), 'b\n');
    const composed = join(scratch, 'café');
    await fs.mkdir(composed);
    await fs.writeFile(join(composed, 'a.txt'), 'a\n');
    await fs.symlink(scratch, join(scratch, 'scratch-link'));
    await fs.symlink(root, join(scratch, 'small-link'));
    const [, first, ...rest] = root.split('/');
    const spellings = [
      ['stored spelling', root, 'admitted'],
      ['last component in another case', join(scratch, 'SMALL'), 'alias'],
      ['an ancestor in another case', join(dirname(scratch), basename(scratch).toUpperCase(), 'small'), 'alias'],
      ['first component in another case', ['', first.toUpperCase(), ...rest].join('/'), 'alias'],
      ['composed name, given composed', composed, 'admitted'],
      ['composed name, given decomposed', join(scratch, 'café'), 'alias'],
      ['through a symlinked ancestor', join(scratch, 'scratch-link', 'small'), 'refused'],
      ['the root is a symlink', join(scratch, 'small-link'), 'refused'],
      ['trailing separator', `${root}/`, 'refused'],
      ['a .. segment', `${root}/../small`, 'refused'],
      ['a repeated separator', `${scratch}//small`, 'refused'],
      ['a relative path', relative(process.cwd(), root), 'refused'],
      ['firmlink spelling', `/System/Volumes/Data${root}`, 'admitted'],
    ];
    const rootTexts = {
      parent: ['installed Product root must remain canonical'],
      replace: ['installed Product root must be one canonical concrete directory'],
      helper: ['declared root must be one concrete directory', 'declared root must be lexical- and physical-canonical'],
    };
    const verdict = async run => {
      try { await run(); return { admitted: true }; } catch (error) { return { admitted: false, error }; }
    };
    const notes = [];
    for (const [label, spelling, expected] of spellings) {
      if (label === 'firmlink spelling' && !existsSync(spelling)) { notes.push(`${label}: no such firmlink here`); continue; }
      // On a volume that keeps letter case and normalization form apart, an
      // alias names no directory, and every site meets ENOENT.
      const aliasReaches = expected === 'alias' && existsSync(spelling);
      if (expected === 'alias' && !aliasReaches) notes.push(`${label}: the volume distinguishes it, ENOENT`);
      const results = {
        parent: await verdict(() => installedProductInventoryDigest(spelling)),
        replace: await verdict(() => replace.installedProductInventory(spelling)),
        helper: await verdict(() => helper.filesystemInventory(spelling)),
      };
      for (const [site, result] of Object.entries(results)) {
        assert.equal(result.admitted, expected === 'admitted', `${site}, ${label}: ${result.error}`);
        if (result.admitted) continue;
        if (expected === 'alias' && !aliasReaches) assert.equal(result.error.code, 'ENOENT', `${site}, ${label}`);
        else {
          assert.ok(result.error instanceof TypeError, `${site}, ${label}: ${result.error}`);
          assert.ok(rootTexts[site].includes(result.error.message), `${site}, ${label}: ${result.error.message}`);
        }
      }
      if (expected === 'alias' && aliasReaches) {
        assert.equal(results.parent.error.message, 'installed Product root must remain canonical', `parent, ${label}`);
        assert.equal(results.helper.error.message, 'declared root must be lexical- and physical-canonical', `helper, ${label}`);
      }
    }
    // The admitted spellings of the one directory give the parent one digest.
    assert.equal(installedProductInventoryDigest(root), sha256(canonical(await replace.installedProductInventory(root))));
    if (notes.length > 0) t.diagnostic(notes.join('; '));
  });
}
