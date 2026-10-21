import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const loadClosureOwner = path => import(pathToFileURL(path).href);

/** Read-only exact Product payload inputs; never verifies, installs or opens a store. */
export async function loadDiagnosedDeclarationInput(inputManifestPath) {
  const manifestBytes = await readFile(inputManifestPath);
  const manifest = JSON.parse(manifestBytes);
  const declarationSources = [], packageMetadataSources = [];
  for (const row of manifest.inventory) {
    const bytes = await readFile(join(manifest.installedRoot, row.path));
    assert.equal(sha256(bytes), row.sha256, row.path);
    const source = {path: row.path, bytes};
    (/\.d\.(?:c|m)?ts$/u.test(row.path) ? declarationSources : packageMetadataSources).push(source);
  }
  const pkg = JSON.parse(packageMetadataSources.find(row => row.path === 'package.json').bytes);
  return {manifestSha256: sha256(manifestBytes), request: {
    packageName: pkg.name, packageType: pkg.type === 'module' ? 'module' : 'commonjs',
    packageExports: pkg.exports, declarationSources, packageMetadataSources,
    sourceProductContentDigest: manifest.productContentDigest,
  }};
}

export function declarationFixture(files, options = {}) {
  const packageName = 'symbol-reuse-fixture', packageExports = options.exports ?? {'.': {types: './main.d.ts'}};
  const rootMetadata = {name: packageName, version: '1.0.0', type: 'module', exports: packageExports, ...options.rootMetadata};
  const metadata = {'package.json': rootMetadata, ...options.metadata};
  const encode = value => Buffer.from(value);
  return {
    packageName, packageType: rootMetadata.type === 'module' ? 'module' : 'commonjs', packageExports,
    declarationSources: Object.entries(files).map(([path, text]) => ({path, bytes: encode(text)})),
    packageMetadataSources: Object.entries(metadata).map(([path, value]) => ({path, bytes: encode(JSON.stringify(value))})),
    sourceProductContentDigest: 'sha256:' + sha256(JSON.stringify({files, metadata, packageExports})),
  };
}

export function focusedDeclarationCases() {
  const cycles = declarationFixture({'main.d.ts': `import type { Remote } from "outside";
export interface A { b: B; remote: Remote; }
export interface B { a: A; }
export type Alias = A;
export type Also = B;
`});
  const diamond = declarationFixture({'main.d.ts': `import type { West } from "left-ext";
import type { East } from "right-ext";
interface Common { west: West; }
interface Left { common: Common; }
interface Right { common: Common; east: East; }
export interface Top extends Left, Right {}
export { Top as Alias };
export interface Merged { one: Top; }
export interface Merged { two: East; }
export type Other = Merged;
`});
  const roots = declarationFixture({
    'one.d.ts': 'import type { Common } from "./common.js"; export interface One { common: Common; }\n',
    'two.d.ts': 'import type { Other } from "second-external"; export interface Two { other: Other; }\n',
    'common.d.ts': 'import type { Remote } from "first-external"; export interface Common { remote: Remote; }\n',
    'unreachable.d.ts': 'import type { Unused } from "unused-external"; export interface Unreachable { unused: Unused; }\n',
  }, {exports: {'./one': {types: './one.d.ts'}, './two': {types: './two.d.ts'}}});
  const ownedFiles = {'main.d.ts': 'import type { Local } from "inside"; import type { Remote } from "outside"; export interface Value { local: Local; remote: Remote; }\n',
    'node_modules/inside/index.d.ts': 'export interface Local { value: string; }\n'};
  const ownedOptions = {rootMetadata: {dependencies: {inside: '1.0.0'}, bundleDependencies: ['inside']},
    metadata: {'node_modules/inside/package.json': {name: 'inside', version: '1.0.0', type: 'module', exports: {'.': {types: './index.d.ts'}}}}};
  const owned = declarationFixture(ownedFiles, ownedOptions);
  const changed = declarationFixture({'main.d.ts': 'import type { Fresh } from "changed-external"; export interface Changed { fresh: Fresh; }\n'});
  const mergedRoots = declarationFixture({
    'one.d.ts': 'import type { First } from "first-external"; declare global { interface Shared { first: First; } } export interface One { shared: Shared; }\n',
    'two.d.ts': 'import type { Second } from "second-external"; declare global { interface Shared { second: Second; } } export interface Two { shared: Shared; }\n',
  }, {exports: {'./one': {types: './one.d.ts'}, './two': {types: './two.d.ts'}}});
  return [
    {name: 'cycle retains complete refs from either entry and aliases', request: cycles, check(rows) {
      const refs = rows[0].exportedSymbolPhysicalRelationRefs; assert.ok(refs.A.length > 0);
      for (const name of ['B', 'Alias', 'Also']) assert.deepEqual(refs[name], refs.A);
    }},
    {name: 'diamond aliases and merged declarations retain both branches', request: diamond, check(rows) {
      const row = rows[0], refs = row.exportedSymbolPhysicalRelationRefs; assert.ok(refs.Top.length >= 2);
      for (const name of ['Alias', 'Merged', 'Other']) assert.deepEqual(refs[name], refs.Top);
      assert.deepEqual([...new Set(row.physicalRelations.map(r => r.moduleSpecifier))].sort(), ['left-ext', 'right-ext']);
    }},
    {name: 'root and reachable relation bases do not leak', request: roots, check(rows) {
      assert.deepEqual(rows.map(r => r.packageExportPath), ['./one', './two']);
      assert.deepEqual(rows[0].declarationInventory.map(r => r.declarationPath), ['common.d.ts', 'one.d.ts']);
      assert.deepEqual(rows[1].declarationInventory.map(r => r.declarationPath), ['two.d.ts']);
      assert.deepEqual(rows[0].physicalRelations.map(r => r.moduleSpecifier), ['first-external']);
      assert.deepEqual(rows[1].physicalRelations.map(r => r.moduleSpecifier), ['second-external']);
    }},
    {name: 'metadata-proven bundled declaration remains local', request: owned, check(rows) {
      assert.ok(rows[0].declarationInventory.some(r => r.declarationPath === 'node_modules/inside/index.d.ts'));
      assert.deepEqual(rows[0].physicalRelations.map(r => r.moduleSpecifier), ['outside']);
    }},
    {name: 'node_modules presence without declared bundle remains external', request: declarationFixture(ownedFiles, {metadata: ownedOptions.metadata}), check(rows) {
      assert.deepEqual(rows[0].declarationInventory.map(r => r.declarationPath), ['main.d.ts']);
      assert.deepEqual(rows[0].physicalRelations.map(r => r.moduleSpecifier).sort(), ['inside', 'outside']);
    }},
    {name: 'new request with same path has no prior symbol analysis', request: changed, check(rows) {
      assert.deepEqual(rows[0].exportedSymbols, ['Changed']); assert.deepEqual(rows[0].physicalRelations.map(r => r.moduleSpecifier), ['changed-external']);
    }},
    {name: 'one checker merged symbol is analyzed on each exact root basis', request: mergedRoots, check(rows) {
      assert.deepEqual(rows.map(r => r.packageExportPath), ['./one', './two']);
      for (const [index, name, specifier] of [[0, 'One', 'first-external'], [1, 'Two', 'second-external']]) {
        const row = rows[index];
        assert.deepEqual(row.declarationInventory.map(r => r.declarationPath), [index === 0 ? 'one.d.ts' : 'two.d.ts']);
        assert.deepEqual(row.physicalRelations.map(r => r.moduleSpecifier), [specifier]);
        assert.deepEqual(row.exportedSymbolPhysicalRelationRefs[name], row.physicalRelations.map(r => r.physicalRelationRef));
      }
    }},
    {name: 'missing claimed bundled declaration refuses', request: declarationFixture({'main.d.ts': ownedFiles['main.d.ts']}, ownedOptions), refusal: true},
    {name: 'missing claimed bundle metadata refuses', request: declarationFixture(ownedFiles, {rootMetadata: ownedOptions.rootMetadata}), refusal: true},
    {name: 'substituted claimed package identity refuses', request: declarationFixture(ownedFiles, {...ownedOptions, metadata: {'node_modules/inside/package.json': {...ownedOptions.metadata['node_modules/inside/package.json'], name: 'different'}}}), refusal: true},
    {name: 'relative escape cannot become ambient resolution', request: declarationFixture({'main.d.ts': 'export type { Escape } from "../escape.js";\n'}), refusal: true},
  ];
}
