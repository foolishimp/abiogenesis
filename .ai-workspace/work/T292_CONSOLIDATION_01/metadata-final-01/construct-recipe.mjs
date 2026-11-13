import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root = process.cwd();
const scratch = resolve(process.argv[2]); // explicit bounded scratch path
const load = p => import(pathToFileURL(join(root, p)).href);
const {Q, OUTPUTS, classification, memberPaths, commandInput} =
  await load('test_env/qualification/build-resources.mjs');
const product = await load('build/code/src/product/index.js');
const validator = await load('build/code/src/validator/index.js');
const actorProcess = await load('build/code/src/abg/actor_process.js');
const valibot = await import(pathToFileURL(createRequire(join(root, 'package.json')).resolve('valibot')).href);
const readJson = async p => JSON.parse(await readFile(join(root, p), 'utf8'));
const declaration = await classification(root);
const declared = await readJson(Q + '/recipe/declared-commands.json');
const dependencies = await readJson(Q + '/recipe/dependencies.json');
const expected = await readJson(Q + '/recipe/expected-output-inventory.json');
const inside = (p, roots) => roots.some(r => r.pathKind === 'file' ? r.relativePath === p : p.startsWith(r.relativePath + '/'));
const paths = memberPaths(declaration, root, [OUTPUTS.recipe, OUTPUTS.tenantManifest, OUTPUTS.resources]);
const sourcePaths = paths.filter(p => p !== OUTPUTS.recipe && !inside(p, expected.generatedRoots));
const unprotectable = sourcePaths.filter(p => inside(p, declared.allowedWriteTerritories));
if (unprotectable.length) throw new TypeError('protected inputs inside a write territory: ' + unprotectable.join(', '));
// Capture the true command ambient BEFORE confining the cold fixture to scratch,
// exactly as build-resources does. Retain these rows in an external receipt.
const ambient = actorProcess.selectedWorksiteCommandAmbientEnvironment();
await mkdir(scratch, {recursive: true});
process.env.TMPDIR = scratch;
const {worksiteFixture} = await load('test_env/support/t287-generic-job-worksite.mjs');
const f = await worksiteFixture(product);
await writeFile(join(f.canonicalRoot, 'probe.txt'), 'probe\n');
const subject = product.constructWorksiteSubject({...f, relativePath: 'probe.txt', subjectUri: pathToFileURL(join(f.canonicalRoot, 'probe.txt')).href});
const observation = await product.observeWorksiteSubject(f.workspaceAuthorityBasis, f.workspaceBinding, subject);
const task = product.constructObservedWorksiteCommandExecutionTask({
  workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
  capabilityGrant: f.capabilityGrant, observedFiles: [{subject, observation}],
  commands: commandInput(declared), outcomePredicates: declared.outcomePredicates,
  allowedWriteTerritories: declared.allowedWriteTerritories
}, ambient);
const recipe = {
  kind: 'qualification_verification_recipe', schemaVersion: '1',
  sourceInputs: sourcePaths.map(p => ({memberRef: declaration.memberRefPrefix + p, relativePath: p})),
  auxiliaryInputs: dependencies.dependencies.map(r => ({relativePath: r.path, digest: r.digest, byteCount: r.byteCount})),
  commandConfigurationDigest: product.sha256Canonical(task.commands),
  predicateConfigurationDigest: product.sha256Canonical(task.outcomePredicates),
  writeTerritoriesDigest: product.sha256Canonical(task.allowedWriteTerritories),
  commands: declared.commands.map(r => ({commandId: r.commandId, role: r.role})),
  lint: declared.lint, tests: declared.tests, skipPolicy: 'incomplete', reportFormat: 'node-test-events-jsonl@1'
};
valibot.parse(validator.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA, recipe);
await writeFile(join(root, OUTPUTS.recipe), JSON.stringify(recipe, null, 2) + '\n');
await writeFile(join(scratch, 'RECIPE_CONSTRUCTION.json'), JSON.stringify({
  claim: 'configuration metadata only; no command execution or qualification',
  ambient, recipe, owner: 'test_env/qualification/build-resources.mjs:237-261'
}, null, 2) + '\n');
