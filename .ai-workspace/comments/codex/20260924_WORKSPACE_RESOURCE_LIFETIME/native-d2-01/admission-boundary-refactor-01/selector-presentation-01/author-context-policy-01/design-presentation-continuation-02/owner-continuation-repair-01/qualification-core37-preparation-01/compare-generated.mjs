// Exact finite build comparison; no qualification judgment or report parser.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const expected = JSON.parse(fs.readFileSync('recipe/expected-output-inventory.json', 'utf8'));
const paths = [];
function walk(relative) {
  const target = path.join('verification', relative);
  if (!fs.existsSync(target)) return;
  const stat = fs.lstatSync(target);
  if (stat.isDirectory()) for (const name of fs.readdirSync(target).sort()) walk(path.posix.join(relative, name));
  else if (stat.isFile() && !stat.isSymbolicLink()) paths.push(relative);
  else throw Error('generated non-file: ' + relative);
}
for (const root of ['build', 'contracts', 'product-toolchain-manifest.json']) walk(root);
const actual = new Set(paths), wanted = new Set(expected.paths.map(row => row.path));
const missing = expected.paths.filter(row => !actual.has(row.path)).map(row => row.path);
const extra = paths.filter(p => !wanted.has(p));
const changed = [];
for (const row of expected.paths.filter(row => actual.has(row.path))) {
  const bytes = fs.readFileSync(path.join('verification', row.path));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== row.bytes || sha256 !== row.sha256) changed.push({ path: row.path, expectedSha256: row.sha256, actualSha256: sha256, expectedBytes: row.bytes, actualBytes: bytes.length });
}
const result = { kind: 'exact_generated_comparison', basisInventorySha256: expected.basisInventorySha256,
  expectedCount: expected.paths.length, actualCount: paths.length, missing, extra, changed,
  equal: missing.length === 0 && extra.length === 0 && changed.length === 0 };
fs.mkdirSync('verification/reports', { recursive: true });
fs.writeFileSync('verification/reports/generated-comparison.json', JSON.stringify(result, null, 2) + '\n');
console.log(result.equal ? 'inventory matches' : 'inventory differs');
if (!result.equal) process.exitCode = 1;
