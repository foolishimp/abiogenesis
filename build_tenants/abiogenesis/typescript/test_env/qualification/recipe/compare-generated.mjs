// Compare command of the qualification verification recipe. After setup and
// build, every file of the candidate pack must exist in the worksite with the
// pack's exact bytes (expected-output-inventory.json, derived once from the
// extracted pack whose archive digest it names), and each generated root must
// hold no file the pack lacks. It prints one fixed line on success, which the
// recipe's stdout_exact predicate compares; any difference is printed and exits 1.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const recipeRoot = dirname(fileURLToPath(import.meta.url));
const expected = JSON.parse(readFileSync(join(recipeRoot, 'expected-output-inventory.json'), 'utf8'));
if (expected.kind !== 'qualification_expected_output_inventory' || expected.schemaVersion !== '1')
  throw Error('expected-output-inventory.json is not the expected output inventory');
const differences = [];
const byPath = new Map(expected.files.map(row => [row.path, row]));
for (const row of expected.files) {
  if (!existsSync(row.path)) { differences.push({ path: row.path, difference: 'missing' }); continue; }
  const bytes = readFileSync(row.path);
  const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  if (digest !== row.digest || bytes.length !== row.byteCount) differences.push({ path: row.path, difference: 'bytes', digest, byteCount: bytes.length });
}
const walk = root => readdirSync(root, { withFileTypes: true }).flatMap(entry => {
  const path = join(root, entry.name);
  return entry.isDirectory() ? walk(path) : [relative('.', path).split('\\').join('/')];
});
for (const root of expected.generatedRoots) {
  if (root.pathKind === 'file') continue;
  if (!existsSync(root.relativePath) || !statSync(root.relativePath).isDirectory()) { differences.push({ path: root.relativePath, difference: 'root_missing' }); continue; }
  for (const path of walk(root.relativePath)) if (!byPath.has(path)) differences.push({ path, difference: 'unexpected' });
}
if (differences.length > 0) {
  process.stdout.write(JSON.stringify({ kind: 'qualification_output_differences', differences: differences.slice(0, 200), count: differences.length }) + '\n');
  process.exitCode = 1;
} else process.stdout.write(`candidate pack reproduced: ${expected.files.length} files\n`);
