// Ordinary caller construction only. No Public call, actor, command loop or admission.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const directory = dirname(fileURLToPath(import.meta.url));
const read = async name => JSON.parse(await fs.readFile(join(directory, name), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const recipeMembers = ['input-manifest.json', 'expected-output-inventory.json', 'recipe-stage.mjs', 'compare-generated.mjs', 'config.json', 'toolchain.json', 'npm-toolchain-inventory.json', 'test-environment.mjs', 'verification-recipe.json'];
export async function selectedFiles() {
  const manifest = await read('input-manifest.json');
  return [...manifest.sourceFiles, ...manifest.dependencies,
    ...await Promise.all(recipeMembers.map(async name => {
      const origin = join(directory, name), bytes = await fs.readFile(origin);
      return { origin, target: 'recipe/' + name, bytes: bytes.length, sha256: hash(bytes), classification: 'declared_recipe' };
    }))];
}
export async function stageSelectedInputs(worksiteRoot) {
  const root = resolve(worksiteRoot), files = await selectedFiles();
  const bytes = [];
  for (const row of files) {
    const content = await fs.readFile(row.origin);
    if (content.length !== row.bytes || hash(content) !== row.sha256) throw Error('changed selected input: ' + row.origin);
    bytes.push(content);
  }
  await fs.mkdir(root); // explicit new disposable destination; never merge with an old worksite
  for (let i = 0; i < files.length; i += 1) {
    const target = join(root, files[i].target);
    await fs.mkdir(dirname(target), { recursive: true });
    await fs.writeFile(target, bytes[i], { flag: 'wx' });
  }
  return { kind: 'recipe_input_staging', root, files: files.length, bytes: files.reduce((n, row) => n + row.bytes, 0), runtimeClaim: 'none' };
}
export async function constructObservedProducerTask({ product, workspaceAuthorityBasis, workspaceBinding, capabilityGrant }) {
  const files = await selectedFiles(), observedFiles = [];
  for (const row of files) {
    const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, relativePath: row.target,
      subjectUri: pathToFileURL(join(workspaceAuthorityBasis.canonicalRoot, row.target)).href });
    const observation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    if (observation.state !== 'file' || observation.byteLength !== row.bytes || observation.fileDigest !== 'sha256:' + row.sha256) throw Error('current selected input mismatch: ' + row.target);
    observedFiles.push({ subject, observation });
  }
  const config = await read('config.json');
  return product.constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    observedFiles, commands: config.commands, outcomePredicates: config.outcomePredicates, allowedWriteTerritories: config.allowedWriteTerritories });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] !== 'stage' || process.argv.length !== 4) throw Error('usage: node recipe.mjs stage /absolute/new/disposable/worksite');
  console.log(JSON.stringify(await stageSelectedInputs(process.argv[3]), null, 2));
}
