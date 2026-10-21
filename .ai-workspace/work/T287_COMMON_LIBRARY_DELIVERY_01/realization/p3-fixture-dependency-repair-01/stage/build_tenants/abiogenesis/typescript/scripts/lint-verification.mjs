// Exact finite syntax/data lint. No test execution, formatting or TS build credit.
import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
const recipe = JSON.parse(await readFile(process.argv[2], 'utf8'));
const root = await realpath(process.cwd());
const files = recipe.lint?.files;
if (!Array.isArray(files) || files.length === 0 || new Set(files.map(x => x.path)).size !== files.length)
  throw Error('lint requires a nonempty unique recipe file selection');
const results = [];
for (const item of files) {
  let diagnostic = null;
  try {
    if (!['mjs', 'json'].includes(item.kind) || typeof item.path !== 'string' ||
        isAbsolute(item.path) || item.path.split(/[\\/]/).some(x => x === '..' || x === '.'))
      throw Error('invalid lint path/kind');
    const path = await realpath(resolve(root, item.path));
    if (relative(root, path).startsWith('..') || isAbsolute(relative(root, path))) throw Error('lint input escapes selected root');
    if (!path.endsWith('.' + item.kind)) throw Error('lint extension differs from selected kind');
    if (item.kind === 'json') JSON.parse(await readFile(path, 'utf8'));
    else {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8', timeout: 30_000 });
      if (result.error || result.signal || result.status !== 0) throw Error(result.error?.message ?? result.stderr ?? 'syntax check failed');
    }
  } catch (error) { diagnostic = String(error); }
  results.push({ path: item.path, kind: item.kind, disposition: diagnostic === null ? 'passed' : 'failed', diagnostic });
}
const passed = results.every(x => x.disposition === 'passed');
process.stdout.write(JSON.stringify({ kind: 'qualification_syntax_lint', schemaVersion: '1', files: results, passed }) + '\n');
process.exitCode = passed ? 0 : 1;
