// This declared command only materializes the selected inputs inside the C2 snapshot.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('recipe/input-manifest.json', 'utf8'));
if (fs.existsSync('verification')) throw Error('verification must be absent at recipe entry');
for (const row of manifest.sourceFiles) {
  const bytes = fs.readFileSync(row.target);
  if (bytes.length !== row.bytes || createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw Error('changed selected source: ' + row.target);
  const destination = path.join('verification', row.path);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
}
fs.mkdirSync('verification/.recipe', { recursive: true });
for (const name of ['verification-recipe.json', 'test-environment.mjs']) fs.copyFileSync(path.join('recipe', name), path.join('verification/.recipe', name), fs.constants.COPYFILE_EXCL);
for (const name of ['reports', '.npm-cache', '.home', '.tmp']) fs.mkdirSync(path.join('verification', name), { recursive: true });
for (const name of ['.user.npmrc', '.global.npmrc']) fs.writeFileSync(path.join('verification', name), '', { flag: 'wx' });
console.log(JSON.stringify({ kind: 'selected_build_copy', files: manifest.sourceFiles.length, bytes: manifest.sourceBytes, dependencyInstall: 'not_yet_run' }));
