// TD-37a (T-292). One owner states "is this path inside that root?":
// `shared/path_confinement.ts` classifies `relative(root, candidate)` into
// same | outside | inside_dotted | inside, and four named predicates answer
// over the class. This file
//   1. states the four classes and the four predicates over a grid;
//   2. vendors each distinct present form verbatim (the relation expression the
//      site replaced, at `52afade26`), named by its sites, and compares it with
//      the owner predicate those sites now call: equal on every cell, except the
//      inside_dotted cells the Executive's rulings change, which are asserted
//      with their new verdict;
//   3. does the same for Product's relative-path normalizer, whose only
//      changed cells are locators whose first segment begins with two dots.
// The grid is POSIX: on POSIX `relative()` never returns an absolute path, so
// the absolute-relation cell (win32, across drive roots) is asserted
// separately on the relation string. Set ABG_WORKSITE_BUILD_ROOT to run the
// file against another build.
import assert from 'node:assert/strict';
import test from 'node:test';
import { isAbsolute, join, posix, relative, resolve, sep, win32 } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const owner = await load('shared/path_confinement.js');
const { normalizeWorksiteRelativePath } = await load('product/worksite_effect.js');
const posixOnly = { skip: sep !== '/' && 'the grid is written in POSIX paths' };

// Root, candidate, class. Candidates are written as callers pass them:
// unresolved, with trailing separators, and with `..` before resolution.
const grid = [
  ['/w/root', '/w/root', 'same'],
  ['/w/root', '/w/root/', 'same'],
  ['/w/root/', '/w/root', 'same'],
  ['/w/root', '/w/root/a', 'inside'],
  ['/w/root/', '/w/root/a/', 'inside'],
  ['/w/root', '/w/root/a/b', 'inside'],
  ['/w/root', '/w/root/.hidden', 'inside'],
  ['/w/root', '/w/root/a/..x', 'inside'],
  ['/w/root', '/w/root/a/../b', 'inside'],
  ['/w/root', '/w/root/..x/../f', 'inside'],
  ['/w/root', '/w/root/..x', 'inside_dotted'],
  ['/w/root', '/w/root/..x/f', 'inside_dotted'],
  ['/w/root', '/w/root/...', 'inside_dotted'],
  ['/w/root', '/w/root/..\\x', 'inside_dotted'],
  ['/w/root', '/w', 'outside'],
  ['/w/root', '/w/root/..', 'outside'],
  ['/w/root', '/w/x', 'outside'],
  ['/w/root', '/elsewhere/f', 'outside'],
  ['/w/root', '/w/root2', 'outside'],
  ['/w/root', '/w/root2/f', 'outside'],
  ['/p/..x/state', '/p/..x/state', 'same'],
  ['/p/..x/state', '/p/..x/state/f', 'inside'],
  ['/p/..x/state', '/p/..x', 'outside'],
  ['/p', '/p/..x/state', 'inside_dotted'],
  ['/w/site/.abg/events', '/w/site/.abg/events/..x/f', 'inside_dotted'],
];

const predicates = {
  pathWithin: { same: true, inside: true, inside_dotted: true, outside: false },
  pathStrictlyWithin: { same: false, inside: true, inside_dotted: true, outside: false },
  pathConfined: { same: true, inside: true, inside_dotted: false, outside: false },
  pathStrictlyConfined: { same: false, inside: true, inside_dotted: false, outside: false },
};

test('the owner classifies relation strings into four classes', () => {
  const relations = [
    ['', 'same'], ['a', 'inside'], ['a/b', 'inside'], ['.hidden', 'inside'], ['a/..x', 'inside'],
    ['..', 'outside'], ['../x', 'outside'], ['../../x', 'outside'], ['/abs', 'outside'],
    ['..x', 'inside_dotted'], ['..x/f', 'inside_dotted'], ['...', 'inside_dotted'], ['....', 'inside_dotted'],
  ];
  for (const [relation, expected] of relations) {
    assert.equal(owner.classifyPathRelation(relation), expected, JSON.stringify(relation));
  }
});

test('the owner classifies root and candidate pairs over the grid', posixOnly, () => {
  for (const [root, candidate, expected] of grid) {
    assert.equal(owner.pathRelation(root, candidate), expected, `${root} ${candidate}`);
    assert.equal(owner.pathRelation(root, candidate), owner.classifyPathRelation(relative(root, candidate)));
  }
});

test('each predicate states its truth table over the four classes', () => {
  for (const [name, table] of Object.entries(predicates)) {
    for (const [relation, expected] of Object.entries(table)) {
      assert.equal(owner[name](relation), expected, `${name}(${relation})`);
    }
  }
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

// Site, vendored form, the owner predicate it now calls, and the rulings'
// change: none; `refuse` (confinement tightened: inside_dotted stops passing);
// `flag` (exclusion repaired: inside_dotted now counts as inside).
const sites = [
  ['W1 parent :337 subject in worksite root', 'parentContainsPath', 'pathConfined', 'none'],
  ['W2 parent :342 subject in a binding root', 'parentContainsPath', 'pathWithin', 'flag'],
  ['W3 parent :449 archive overlap', 'parentContainsPath', 'pathWithin', 'flag'],
  ['W4 parent :459 mutable root in Product root', 'parentContainsPath', 'pathWithin', 'flag'],
  ['W5 parent :475 lexical attempt path', 'parentLexicalRelation', 'pathStrictlyConfined', 'none'],
  ['W6 parent :476 canonical attempt path', 'parentContainsPath', 'pathConfined', 'none'],
  ['W7/W8 helper subject source and snapshot target', 'helperContained', 'pathConfined', 'refuse'],
  ['W9-W17 helper command locators', 'helperContained', 'pathWithin', 'none'],
  ['W18 helper launch paths', 'helperLaunchPath', 'pathStrictlyConfined', 'refuse'],
  ['W19 helper archive overlap', 'helperContainsAbsolutePath', 'pathWithin', 'none'],
  ['W20 leaf module in install', 'strictPrefixLength', 'pathStrictlyConfined', 'none'],
  ['W21/W22 Product protected roots', 'segmentExactSlash', 'pathWithin', 'none'],
  ['W24 operations :226 subject in worksite root', 'segmentExactSlash', 'pathConfined', 'refuse'],
  ['W25/W27/W30/W32 operations protected roots', 'segmentExactSlash', 'pathWithin', 'none'],
  ['W26 operations :622 territory in worksite root', 'segmentExactSlash', 'pathConfined', 'refuse'],
  ['W28 operations :624 subject in its territory', 'segmentExactSlash', 'pathWithin', 'none'],
  ['W29 operations :967 path in worksite root', 'segmentExactSlash', 'pathConfined', 'refuse'],
  ['W31 operations :1012 planned write root', 'segmentExactSlash', 'pathConfined', 'refuse'],
  ['W33 command paths in binding roots', 'segmentExactSlash', 'pathWithin', 'none'],
  ['W34/W38/W39/W40 ABG targets and snapshots', 'strictPrefixLength', 'pathStrictlyConfined', 'none'],
  ['W35/W36/W37 ABG revision snapshots and targets', 'strictPrefixFalsy', 'pathStrictlyConfined', 'none'],
  ['W41 actor archive file', 'transportArchiveFile', 'pathConfined', 'none'],
  ['O1 release inside', 'releaseInside', 'pathStrictlyWithin', 'none'],
  ['O2 self-conformance (prefix form kept)', 'selfConformance', 'pathConfined', 'none'],
  ['O3 installed module', 'installedModule', 'pathStrictlyWithin', 'none'],
  ['O4 install package directory', 'installProduct', 'pathWithin', 'none'],
  ['O5 declaration contract asset', 'declarationApplication', 'pathWithin', 'none'],
  ['O6 release snapshot within', 'segmentExactSlash', 'pathWithin', 'none'],
];

test('each site\'s owner predicate equals its present form except the cells the rulings change', posixOnly, () => {
  const changed = [];
  for (const [site, form, predicate, change] of sites) {
    for (const [root, candidate, relation] of grid) {
      const before = vendored[form](root, candidate);
      const after = owner[predicate](owner.pathRelation(root, candidate));
      const cell = `${site}: ${root} ${candidate}`;
      if (change !== 'none' && relation === 'inside_dotted') {
        assert.equal(before, change === 'flag' ? false : true, `${cell} (before)`);
        assert.equal(after, change === 'flag', `${cell} (after)`);
        changed.push(cell);
      } else {
        assert.equal(after, before, cell);
      }
    }
  }
  // Nine changed site rows (three flag, six refuse), six inside_dotted grid rows each.
  assert.equal(sites.filter(row => row[3] !== 'none').length, 9);
  assert.equal(grid.filter(row => row[2] === 'inside_dotted').length, 6);
  assert.equal(changed.length, 9 * 6);
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

test('Product\'s relative-path normalizer changes only for a dotted first segment', () => {
  const locators = ['', '.', './a', 'a', 'a/', 'a//b', 'a/b', '.hidden', '.hidden/f', 'a/..x', 'a/...', 'a/..x/f',
    '..', '../x', 'a/../b', 'a/..', '..x', '..x/f', '...', '...x/y', '..\\x', 'a\\b', '/abs', 'C:\\x', 'C:x', 'a\0b', ' a'];
  const dotted = new Set(['..x', '..x/f', '...', '...x/y']);
  for (const allowRoot of [false, true]) {
    for (const locator of locators) {
      const before = presentNormalizer(locator, allowRoot), after = normalizeWorksiteRelativePath(locator, allowRoot);
      if (dotted.has(locator)) {
        assert.equal(before, locator, `${JSON.stringify(locator)} passed before`);
        assert.equal(after, null, `${JSON.stringify(locator)} is refused now`);
      } else {
        assert.equal(after, before, `${JSON.stringify(locator)} allowRoot=${allowRoot}`);
      }
    }
  }
});
