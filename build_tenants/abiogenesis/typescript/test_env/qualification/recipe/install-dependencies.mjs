// Setup command of the qualification verification recipe. It materializes the
// locked dependency archives, each an auxiliary input pinned by sha256 and
// byte count in dependencies.json, into node_modules/<name> with no registry
// or network access, then writes the hidden lockfile npm itself keeps
// (package-lock.json without its root entry), so the manifest generator's
// `npm pack --dry-run` lists the same files as the candidate pack.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const recipeRoot = dirname(fileURLToPath(import.meta.url));
const declared = JSON.parse(readFileSync(join(recipeRoot, 'dependencies.json'), 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
if (declared.kind !== 'qualification_recipe_dependencies' || declared.schemaVersion !== '1')
  throw Error('dependencies.json is not the recipe dependency declaration');
if (existsSync('node_modules')) throw Error('node_modules exists before setup');
const { '': rootEntry, ...locked } = lock.packages;
if (rootEntry === undefined) throw Error('package-lock.json lacks its root entry');
const lockedNames = Object.keys(locked).map(key => key.slice('node_modules/'.length)).sort();
const declaredNames = declared.dependencies.map(row => row.name).sort();
if (JSON.stringify(lockedNames) !== JSON.stringify(declaredNames))
  throw Error('declared dependencies differ from the lock: ' + JSON.stringify({ lockedNames, declaredNames }));
for (const row of declared.dependencies) {
  const entry = locked['node_modules/' + row.name];
  const bytes = readFileSync(row.path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const integrity = 'sha512-' + createHash('sha512').update(bytes).digest('base64');
  if (bytes.length !== row.byteCount || 'sha256:' + sha256 !== row.digest)
    throw Error(`${row.path} differs from its declaration`);
  if (entry.version !== row.version || entry.integrity !== integrity)
    throw Error(`${row.name} differs from its locked version or integrity`);
  const target = join('node_modules', row.name);
  mkdirSync(target, { recursive: true });
  const tar = spawnSync('/usr/bin/tar', ['-xzf', row.path, '-C', target, '--strip-components=1'], { encoding: 'utf8' });
  if (tar.error || tar.status !== 0) throw Error(`${row.name} extraction failed: ${tar.error?.message ?? tar.stderr}`);
}
const { packages, ...header } = lock;
writeFileSync(join('node_modules', '.package-lock.json'), JSON.stringify({ ...header, packages: locked }, null, 2) + '\n');
process.stdout.write(JSON.stringify({ kind: 'qualification_recipe_setup', dependencies: declared.dependencies.length }) + '\n');
