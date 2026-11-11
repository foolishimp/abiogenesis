// TD-37a (T-292). One owner states "is this path inside that root?":
// `shared/path_confinement.ts` classifies `relative(root, candidate)` into
// same | outside | inside, segment-exactly, and two named predicates answer
// over the class. A relation is outside only when it is absolute, is `..`, or
// begins with `..` and the separator; a first segment that merely begins with
// two dots (`..x`, `...`) is inside (T287 W2 R3 C0: a subject is a strict
// descendant of the canonical root; `.` and `..` spellings refuse). This file
//   1. states the three classes and the two predicates over a grid;
//   2. vendors each distinct present form verbatim (the relation expression the
//      site replaced, at `52afade26`), named by its sites, and compares it with
//      the owner predicate those sites now call: equal on every cell, except
//      the prefix-form sites (`relation.startsWith("..")`) on a dotted first
//      segment, where the owner answers inside: admitted where the site demands
//      that a path be inside, flagged where it demands that a path stay out of
//      a protected root;
//   3. pins Product's relative-path normalizer to its base behaviour.
// The grid is POSIX: on POSIX `relative()` never returns an absolute path, so
// the absolute-relation cell (win32, across drive roots) is asserted
// separately on the relation string; the win32 verdicts hold by construction,
// not by run. Set ABG_WORKSITE_BUILD_ROOT to run the file against another build.
import assert from 'node:assert/strict';
import test from 'node:test';
import { isAbsolute, join, posix, relative, resolve, sep, win32 } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const owner = await load('shared/path_confinement.js');
const { normalizeWorksiteRelativePath } = await load('product/worksite_effect.js');
const posixOnly = { skip: sep !== '/' && 'the grid is written in POSIX paths' };

// Root, candidate, class, and whether the relation's first segment begins with
// two dots without being `..` (the only cells on which present forms differ).
// Candidates are written as callers pass them: unresolved, with trailing
// separators, and with `..` before resolution.
const grid = [
  ['/w/root', '/w/root', 'same', false],
  ['/w/root', '/w/root/', 'same', false],
  ['/w/root/', '/w/root', 'same', false],
  ['/w/root', '/w/root/a', 'inside', false],
  ['/w/root/', '/w/root/a/', 'inside', false],
  ['/w/root', '/w/root/a/b', 'inside', false],
  ['/w/root', '/w/root/.hidden', 'inside', false],
  ['/w/root', '/w/root/a/..x', 'inside', false],
  ['/w/root', '/w/root/a/../b', 'inside', false],
  ['/w/root', '/w/root/..x/../f', 'inside', false],
  ['/w/root', '/w/root/..x', 'inside', true],
  ['/w/root', '/w/root/..x/f', 'inside', true],
  ['/w/root', '/w/root/...', 'inside', true],
  ['/w/root', '/w/root/..\\x', 'inside', true],
  ['/w/root', '/w', 'outside', false],
  ['/w/root', '/w/root/..', 'outside', false],
  ['/w/root', '/w/x', 'outside', false],
  ['/w/root', '/elsewhere/f', 'outside', false],
  ['/w/root', '/w/root2', 'outside', false],
  ['/w/root', '/w/root2/f', 'outside', false],
  ['/p/..x/state', '/p/..x/state', 'same', false],
  ['/p/..x/state', '/p/..x/state/f', 'inside', false],
  ['/p/..x/state', '/p/..x', 'outside', false],
  ['/p', '/p/..x/state', 'inside', true],
  ['/w/site/.abg/events', '/w/site/.abg/events/..x/f', 'inside', true],
];

const predicates = {
  pathWithin: { same: true, inside: true, outside: false },
  pathStrictlyWithin: { same: false, inside: true, outside: false },
};

test('the owner classifies relation strings into three classes', () => {
  const relations = [
    ['', 'same'], ['a', 'inside'], ['a/b', 'inside'], ['.hidden', 'inside'], ['a/..x', 'inside'],
    ['..x', 'inside'], ['..x/f', 'inside'], ['...', 'inside'], ['....', 'inside'],
    ['..', 'outside'], ['../x', 'outside'], ['../../x', 'outside'], ['/abs', 'outside'],
  ];
  for (const [relation, expected] of relations) {
    assert.equal(owner.classifyPathRelation(relation), expected, JSON.stringify(relation));
  }
});

test('the owner classifies root and candidate pairs over the grid', posixOnly, () => {
  for (const [root, candidate, expected, dotted] of grid) {
    assert.equal(owner.pathRelation(root, candidate), expected, `${root} ${candidate}`);
    assert.equal(owner.pathRelation(root, candidate), owner.classifyPathRelation(relative(root, candidate)));
    const relation = relative(root, candidate);
    assert.equal(dotted, relation.startsWith('..') && relation !== '..' && !relation.startsWith('../'), `${root} ${candidate} dotted`);
  }
});

test('each predicate states its truth table over the three classes, and the owner exports only these', () => {
  for (const [name, table] of Object.entries(predicates)) {
    for (const [relation, expected] of Object.entries(table)) {
      assert.equal(owner[name](relation), expected, `${name}(${relation})`);
    }
  }
  assert.deepEqual(Object.keys(owner).sort(), ['classifyPathRelation', 'pathRelation', 'pathStrictlyWithin', 'pathWithin']);
});

// Present forms, verbatim at 52afade26. Each returns whether the candidate
// passes the site's relation test (inside for confinement, inside the
// protected root for exclusion).
const vendored = {
  // implementation/worksite_command_execution.ts:320-323 `containsPath`.
  parentContainsPath(root, candidate) {
    const relation = relative(root, candidate);
    return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
  },
  // implementation/worksite_command_execution.ts:475 (lexical relation).
  parentLexicalRelation(root, candidate) {
    const lexicalRelation = relative(root, candidate);
    return !(lexicalRelation === "" || lexicalRelation.startsWith("..") || isAbsolute(lexicalRelation));
  },
  // implementation/leaf_invocation_port.ts:1099; abg/worksite_construction_recovery.ts:153;
  // abg/semantic_stage.ts:294, :381; abg/semantic_job.ts:403.
  strictPrefixLength(root, candidate) {
    const rel = relative(root, candidate);
    return !(rel.length === 0 || rel.startsWith("..") || isAbsolute(rel));
  },
  // abg/semantic_revision.ts:965; abg/worksite_revision.ts:794, :822.
  strictPrefixFalsy(root, candidate) {
    const rel = relative(root, candidate);
    return !(!rel || rel.startsWith("..") || isAbsolute(rel));
  },
  // abg/transport_contracts.ts:577-578 `isAdmittedActorArchiveFile`.
  transportArchiveFile(archiveRoot, path) {
    return !(relative(archiveRoot, path).startsWith("..") || isAbsolute(relative(archiveRoot, path)));
  },
  // validator/self_conformance.ts:185.
  selfConformance(packageRoot, path) {
    return !relative(packageRoot, path).startsWith("..");
  },
  // implementation/worksite_command_helper.ts:254 `contained` (the relation
  // expression; the resolve round trip beside it is unchanged).
  helperContained(root, absolute) {
    const fromRoot = relative(root, absolute);
    return !(fromRoot === ".." || fromRoot.startsWith(`..${sep}`));
  },
  // implementation/worksite_command_helper.ts:307 `canonicalExistingPathWithinRoot`.
  helperLaunchPath(declaredRootValue, candidateValue) {
    const fromRoot = relative(declaredRootValue, candidateValue);
    return !(fromRoot === "" || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot));
  },
  // implementation/worksite_command_helper.ts:349-353 `containsAbsolutePath`.
  helperContainsAbsolutePath(root, candidate) {
    const relation = relative(root, candidate);
    return relation === "" || (!relation.startsWith(`..${sep}`) &&
      relation !== ".." && !isAbsolute(relation));
  },
  // product/worksite_effect.ts:449-453 `containsPath`; product/worksite_operations.ts:139-143
  // `confined`; product/worksite_command_execution.ts:1302-1305;
  // product/release_snapshot_definition_bindings.ts:36 `within`.
  segmentExactSlash(root, candidate) {
    const relation = relative(resolve(root), resolve(candidate));
    return relation === "" ||
      (!isAbsolute(relation) && relation !== ".." && !relation.startsWith("../"));
  },
  // product/installed_module.ts:54-58.
  installedModule(installedRoot, exactPath) {
    const relation = relative(installedRoot, exactPath);
    return !(relation.length === 0 || relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation));
  },
  // product/install_product.ts:235-237.
  installProduct(targetRoot, candidate) {
    const relation = relative(resolve(targetRoot), candidate);
    return !isAbsolute(relation) && relation !== ".." && !relation.startsWith(`..${sep}`);
  },
  // product/declaration_application.ts:106-107.
  declarationApplication(installedRoot, path) {
    const within = relative(installedRoot, path);
    return !(isAbsolute(within) || within === ".." || within.startsWith("../"));
  },
  // implementation/release_publication.ts:37 `inside`.
  releaseInside(root, path) {
    const rel = relative(root, path);
    return rel !== "" && !isAbsolute(rel) && rel !== ".." && !rel.startsWith("../");
  },
};

// Site, use, vendored form, the owner predicate it now calls, and whether its
// present form is the prefix form (its dotted cells change).
const sites = [
  ['W1 parent :337 subject in worksite root', 'confinement', 'parentContainsPath', 'pathWithin', true],
  ['W2 parent :342 subject in a binding root', 'exclusion', 'parentContainsPath', 'pathWithin', true],
  ['W3 parent :449 archive overlap', 'exclusion', 'parentContainsPath', 'pathWithin', true],
  ['W4 parent :459 mutable root in Product root', 'exclusion', 'parentContainsPath', 'pathWithin', true],
  ['W5 parent :475 lexical attempt path', 'confinement', 'parentLexicalRelation', 'pathStrictlyWithin', true],
  ['W6 parent :476 canonical attempt path', 'confinement', 'parentContainsPath', 'pathWithin', true],
  ['W7/W8 helper subject source and snapshot target', 'confinement', 'helperContained', 'pathWithin', false],
  ['W9-W17 helper command locators', 'confinement', 'helperContained', 'pathWithin', false],
  ['W18 helper launch paths', 'confinement', 'helperLaunchPath', 'pathStrictlyWithin', false],
  ['W19 helper archive overlap', 'exclusion', 'helperContainsAbsolutePath', 'pathWithin', false],
  ['W20 leaf module in install', 'confinement', 'strictPrefixLength', 'pathStrictlyWithin', true],
  ['W21/W22 Product protected roots', 'exclusion', 'segmentExactSlash', 'pathWithin', false],
  ['W24/W26/W29/W31 operations paths in worksite root', 'confinement', 'segmentExactSlash', 'pathWithin', false],
  ['W25/W27/W30/W32 operations protected roots', 'exclusion', 'segmentExactSlash', 'pathWithin', false],
  ['W28 operations :624 subject in its territory', 'confinement', 'segmentExactSlash', 'pathWithin', false],
  ['W33 command paths in binding roots', 'exclusion', 'segmentExactSlash', 'pathWithin', false],
  ['W34/W38/W39/W40 ABG targets and snapshots', 'confinement', 'strictPrefixLength', 'pathStrictlyWithin', true],
  ['W35/W36/W37 ABG revision snapshots and targets', 'confinement', 'strictPrefixFalsy', 'pathStrictlyWithin', true],
  ['W41 actor archive file', 'confinement', 'transportArchiveFile', 'pathWithin', true],
  ['O1 release inside', 'confinement', 'releaseInside', 'pathStrictlyWithin', false],
  ['O2 self-conformance catalog source', 'confinement', 'selfConformance', 'pathWithin', true],
  ['O3 installed module', 'confinement', 'installedModule', 'pathStrictlyWithin', false],
  ['O4 install package directory', 'confinement', 'installProduct', 'pathWithin', false],
  ['O5 declaration contract asset', 'confinement', 'declarationApplication', 'pathWithin', false],
  ['O6 release snapshot within', 'exclusion', 'segmentExactSlash', 'pathWithin', false],
];

test('each site\'s owner predicate equals its present form except the prefix-form sites on a dotted first segment', posixOnly, () => {
  const changed = { confinement: [], exclusion: [] };
  for (const [site, use, form, predicate, prefixForm] of sites) {
    for (const [root, candidate, , dotted] of grid) {
      const before = vendored[form](root, candidate);
      const after = owner[predicate](owner.pathRelation(root, candidate));
      const cell = `${site}: ${root} ${candidate}`;
      if (prefixForm && dotted) {
        // Confinement: refused before, admitted now. Exclusion: missed before, flagged now.
        const [was, is] = use === 'confinement' ? ['refused', 'admitted'] : ['missed', 'flagged'];
        assert.equal(before, false, `${cell} was ${was}`);
        assert.equal(after, true, `${cell} is ${is}`);
        changed[use].push(cell);
      } else {
        assert.equal(after, before, cell);
      }
    }
  }
  const dottedRows = grid.filter(row => row[3]).length;
  assert.equal(dottedRows, 6);
  // Eight confinement rows (W1, W5, W6, W20, W34/38/39/40, W35/36/37, W41, O2)
  // and three exclusion rows (W2, W3, W4) have the prefix form.
  assert.equal(sites.filter(row => row[4] && row[1] === 'confinement').length, 8);
  assert.equal(sites.filter(row => row[4] && row[1] === 'exclusion').length, 3);
  assert.equal(changed.confinement.length, 8 * dottedRows);
  assert.equal(changed.exclusion.length, 3 * dottedRows);
});

test('the absolute relation (win32 across drive roots only) is outside for every site', () => {
  // relative() returns an absolute path only on win32, between drive roots.
  // Two present forms test no isAbsolute and passed it; the owner refuses it.
  const relation = win32.relative('C:\\w\\root', 'D:\\x');
  assert.equal(win32.isAbsolute(relation), true);
  assert.equal(owner.classifyPathRelation('/abs'), 'outside');
  assert.equal(!'/abs'.startsWith('..'), true, 'O2 self-conformance passed an absolute relation');
  assert.equal(!('/abs' === '..' || '/abs'.startsWith(`..${sep}`)), true, 'helper contained passed it (its resolve round trip passes too)');
  for (const name of Object.keys(predicates)) assert.equal(owner[name]('outside'), false);
});

// product/worksite_effect.ts:603-626 at 52afade26, verbatim.
function presentNormalizer(value, allowRoot) {
  if (
    typeof value !== "string" ||
    value.includes("\0") ||
    posix.isAbsolute(value) ||
    win32.isAbsolute(value)
  ) return null;

  const slashPath = value.replaceAll("\\", "/");
  const segments = slashPath.split("/");
  if (segments.includes("..")) return null;
  const normalized = posix.normalize(slashPath);
  if (
    slashPath !== value ||
    normalized !== slashPath ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized.endsWith("/..") ||
    (!allowRoot && (normalized === "." || normalized.length === 0))
  ) return null;
  return normalized.length === 0 ? "." : normalized;
}

test('Product\'s relative-path normalizer keeps its base behaviour: a dotted first segment is admitted, `.` and `..` segments refuse', () => {
  const locators = ['', '.', './a', 'a', 'a/', 'a//b', 'a/b', '.hidden', '.hidden/f', 'a/..x', 'a/...', 'a/..x/f',
    '..', '../x', 'a/../b', 'a/..', '..x', '..x/f', '...', '...x/y', '..\\x', 'a\\b', '/abs', 'C:\\x', 'C:x', 'a\0b', ' a'];
  for (const allowRoot of [false, true]) {
    for (const locator of locators) {
      assert.equal(normalizeWorksiteRelativePath(locator, allowRoot), presentNormalizer(locator, allowRoot),
        `${JSON.stringify(locator)} allowRoot=${allowRoot}`);
    }
  }
  for (const locator of ['..x', '..x/f', '...', '...x/y']) assert.equal(normalizeWorksiteRelativePath(locator, false), locator);
  for (const locator of ['..', '../x', 'a/../b', './a']) assert.equal(normalizeWorksiteRelativePath(locator, true), null);
});
