// Generates the run-independent qualification resources of the pre-RC candidate
// of @abiogenesis/typescript-tenant 5.0.0-rc.1 from the installed package's
// exports: the verification recipe, the tenant conformance manifest, the
// resource index and, last, the subject inventory. Run from the tenant root:
//   node test_env/qualification/build-resources.mjs --package <installed package root>
//     --install-record <installed/0/identity.json of a Public install of the same pack> --scratch <empty scratch directory>
// The run-specific resources (the basis, the bound scope, the resource manifest
// and the verification material) bind the install and the workspace binding of
// one run; test_env/support/exact-candidate-qualification.mjs constructs them.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const TENANT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const Q = 'test_env/qualification';
export const RECIPE_PATH = Q + '/recipe/verification-recipe.json';
export const OUTPUTS = Object.freeze({ recipe: RECIPE_PATH, tenantManifest: Q + '/tenant-manifest.json',
  resources: Q + '/resources.json', inventory: Q + '/inventory.json' });
export const PROSPECTIVE_RELEASE_FIELDS = Object.freeze({ productId: 'product://abiogenesis/typescript-tenant@5.0.0-rc.1',
  namespace: 'abiogenesis', profile: 'one_project_unqualified', projectSubtree: '.', versionLine: '5.0.0', ordinal: 1, version: '5.0.0-rc.1' });
export const sha256 = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));

/** The installed package's exports, by its own export map; deep imports are named. */
export async function installedExports(packageRoot) {
  const root = await realpath(resolve(packageRoot)), manifest = await readJson(join(root, 'package.json'));
  if (manifest.name !== '@abiogenesis/typescript-tenant' || manifest.version !== PROSPECTIVE_RELEASE_FIELDS.version)
    throw new TypeError('installed package is not @abiogenesis/typescript-tenant ' + PROSPECTIVE_RELEASE_FIELDS.version);
  const exported = sub => import(pathToFileURL(join(root, manifest.exports['./' + sub].import)).href);
  const deep = path => import(pathToFileURL(join(root, 'build/code/src', path)).href);
  const valibot = await import(pathToFileURL(createRequire(join(root, 'package.json')).resolve('valibot')).href);
  return { root, product: await exported('product'), abg: await exported('abg'), gtl: await exported('gtl'),
    validator: await exported('validator'), preparation: await exported('qualification/m05'), valibot,
    // Not package exports (named substitutions): the ambient reader (abg/actor_process.ts:708), the C2
    // configuration constructor and budget projection (product/worksite_command_execution.ts:166, :1474),
    // and the basis readiness and verification material (validator/qualification.ts:130, :669).
    deep: { actorProcess: await deep('abg/actor_process.js'), c2: await deep('product/worksite_command_execution.js'),
      qualification: await deep('validator/qualification.js') } };
}

export async function classification(root = TENANT_ROOT) { return readJson(join(root, Q, 'classification.json')); }

export function classify(declaration, path) {
  for (const entry of declaration.roles) {
    const m = entry.match;
    if (m.file === path || m.files?.includes(path) || (m.prefix !== undefined && path.startsWith(m.prefix))) return entry;
  }
  throw new TypeError('unclassified inventory member: ' + path);
}

/** Tenant-relative member paths: tracked or trackable files, minus the declared exclusions. */
export function memberPaths(declaration, root = TENANT_ROOT, alsoWritten = []) {
  const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root })
    .toString('utf8').split('\0').filter(Boolean);
  const excluded = new Set(declaration.memberSet.exclusions.map(row => row.path));
  return [...new Set([...listed, ...alsoWritten])].filter(path => !excluded.has(path)).sort();
}

export async function constructInventory(runtime, declaration, root = TENANT_ROOT) {
  const members = [];
  for (const path of memberPaths(declaration, root)) {
    const bytes = await readFile(join(root, path)), entry = classify(declaration, path);
    members.push({ ref: declaration.memberRefPrefix + path, path: declaration.memberPathPrefix + path, digest: sha256(bytes),
      byteCount: bytes.length, surfaceRoles: [...entry.surfaceRoles],
      classificationEvidenceRefs: [declaration.memberRefPrefix + Q + '/classification.json#' + entry.id] });
  }
  return runtime.preparation.constructQualificationIdentity({ kind: 'qualification_subject_inventory',
    selectedRoots: [...declaration.selectedRoots], coverage: declaration.coverage, members },
    'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
}

/** The bound scope over one basis: the declared surface and rule partitions of classification.json. */
export function constructScope(runtime, declaration, { inventory, catalog, catalogDigest, subjectBasis, lawBasis }) {
  const groups = new Map();
  for (const member of inventory.members) {
    const path = member.path.slice(declaration.memberPathPrefix.length), entry = classify(declaration, path);
    const segments = path.split('/'), key = entry.id + '/' + (segments.length > 2 ? segments.slice(0, 2).join('/') : segments.length === 2 ? segments[0] : path);
    const group = groups.get(key) ?? { groupRef: 'qualification-surface-group://abiogenesis/typescript-tenant/' + key, memberRefs: [],
      rootRefs: [...declaration.surfaceGroups.rootRefs], surfaceRoles: [...entry.surfaceRoles],
      ownerRefs: [...declaration.surfaceGroups.ownerRefs], sourceRefs: [...declaration.surfaceGroups.sourceRefs] };
    group.memberRefs.push(member.ref); groups.set(key, group);
  }
  const ruleGroups = catalog.sources.map((source, ordinal) => ({ groupRef: 'qualification-rule-group://abiogenesis/typescript-tenant/' + ordinal,
    ruleRefs: catalog.rules.filter(rule => rule.sourceRef === source.ref).map(rule => rule.ruleRef), sourceRefs: [source.ref] }))
    .filter(group => group.ruleRefs.length > 0);
  const scope = runtime.preparation.constructQualificationIdentity({ kind: 'qualification_scope', subjectBasis, lawBasis,
    catalog: { ref: catalog.catalogRef, digest: catalogDigest }, inventory, ruleGroups,
    surfaceGroups: [...groups.values()].sort((a, b) => a.groupRef < b.groupRef ? -1 : a.groupRef > b.groupRef ? 1 : 0) },
    'scopeRef', 'scopeDigest', 'qualification-scope://abiogenesis/');
  return { scope, errors: runtime.validator.qualificationScopeCorrespondence(scope, catalog, catalogDigest) };
}

/** The published law, rule catalog and coverage catalog, checked against the executing package. */
export async function lawAndCoverage(runtime, root = TENANT_ROOT) {
  const read = async path => { const bytes = await readFile(join(root, path)), installed = await readFile(join(runtime.root, path));
    if (!bytes.equals(installed)) throw new TypeError(path + ' differs from the installed package'); return bytes; };
  const catalogBytes = await read('contracts/qualification/rule-catalog.json');
  const law = JSON.parse(await read('contracts/qualification/law-basis.json'));
  const coverage = JSON.parse(await read('contracts/qualification/coverage.json'));
  const catalog = JSON.parse(catalogBytes.toString('utf8')), catalogDigest = sha256(catalogBytes);
  if (law.catalog.digest !== catalogDigest || law.catalog.ref !== catalog.catalogRef || coverage.lawBasis.digest !== law.lawBasisDigest ||
      coverage.lawBasis.ref !== law.lawBasisRef || !runtime.validator.qualificationCoverageIsPublished(coverage))
    throw new TypeError('law basis, rule catalog and coverage catalog do not join as published');
  return { catalog, catalogDigest, law, coverage, lawBasis: { ref: law.lawBasisRef, digest: law.lawBasisDigest },
    coverageCatalog: { ref: coverage.catalogRef, digest: coverage.catalogDigest } };
}

export function tenantManifest(runtime, install) {
  const claims = install.capabilityDefinitionGraph.rows.flatMap(row => {
    const publicContractRefs = install.publicContracts.filter(c => c.owningProduct === install.productId &&
      c.capabilityIdentities.includes(row.capabilityId)).map(c => c.contractId);
    if (publicContractRefs.length > 0 && row.boundedProofRefs.length === 0) throw new TypeError('capability without proof refs: ' + row.capabilityId);
    return publicContractRefs.length === 0 ? [] : [{ claimRef: 'claim://abiogenesis/typescript-tenant@5.0.0-rc.1/' + row.capabilityId,
      capabilityRef: row.capabilityId, publicContractRefs, evidenceRefs: [...row.boundedProofRefs] }];
  });
  return runtime.preparation.constructQualificationIdentity({ kind: 'tenant_conformance_manifest', schemaVersion: '5.0.0',
    productId: install.productId,
    capabilityDefinitionGraph: { ref: install.capabilityDefinitionGraph.graphId, digest: install.capabilityDefinitionGraph.graphDigest },
    publicContractCatalog: { ref: install.catalogId, digest: install.catalogDigest }, claims },
    'manifestRef', 'manifestDigest', 'tenant-conformance-manifest://abiogenesis/');
}

/** Command input of the declared commands (the role is recipe data, not C2 input). */
export const commandInput = declared => declared.commands.map(({ role: _role, ...command }) => command);

async function main(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--package', '--install-record', '--scratch'].includes(argv[i]) || argv[i + 1] === undefined) throw new TypeError('Unknown argument: ' + argv[i]);
    options[argv[i].slice(2)] = argv[i + 1];
  }
  if (!options.package || !options['install-record'] || !options.scratch) throw new TypeError('Usage: build-resources.mjs --package DIR --install-record FILE --scratch DIR');
  const runtime = await installedExports(options.package), { product, valibot, validator, deep } = runtime;
  const ambient = deep.actorProcess.selectedWorksiteCommandAmbientEnvironment();
  const declaration = await classification();
  const declared = await readJson(join(TENANT_ROOT, Q, 'recipe/declared-commands.json'));
  const dependencies = await readJson(join(TENANT_ROOT, Q, 'recipe/dependencies.json'));
  const expected = await readJson(join(TENANT_ROOT, Q, 'recipe/expected-output-inventory.json'));
  const territories = declared.allowedWriteTerritories, generated = expected.generatedRoots;
  const inside = (path, roots) => roots.some(row => row.pathKind === 'file' ? row.relativePath === path : path.startsWith(row.relativePath + '/'));

  // 1. The verification recipe. Its three configuration digests are binding- and root-independent;
  // they bind the ambient HOME, TMPDIR, LANG and LC_ALL rows of this process (the harness worker inherits them).
  const paths = memberPaths(declaration, TENANT_ROOT, [OUTPUTS.recipe, OUTPUTS.tenantManifest, OUTPUTS.resources]);
  const sourcePaths = paths.filter(path => path !== OUTPUTS.recipe && !inside(path, generated));
  const unprotectable = sourcePaths.filter(path => inside(path, territories));
  if (unprotectable.length > 0) throw new TypeError('protected inputs inside a write territory: ' + unprotectable.join(', '));
  const scratch = resolve(options.scratch); await mkdir(scratch, { recursive: true });
  process.env.TMPDIR = scratch; // the fixture's temporary worksite, after the ambient rows were read
  const { worksiteFixture } = await import(pathToFileURL(join(TENANT_ROOT, 'test_env/support/t287-generic-job-worksite.mjs')).href);
  const f = await worksiteFixture(product);
  await writeFile(join(f.canonicalRoot, 'probe.txt'), 'probe\n');
  const subject = product.constructWorksiteSubject({ ...f, relativePath: 'probe.txt', subjectUri: pathToFileURL(join(f.canonicalRoot, 'probe.txt')).href });
  const observation = await product.observeWorksiteSubject(f.workspaceAuthorityBasis, f.workspaceBinding, subject);
  const task = product.constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, capabilityGrant: f.capabilityGrant, observedFiles: [{ subject, observation }],
    commands: commandInput(declared), outcomePredicates: declared.outcomePredicates, allowedWriteTerritories: territories }, ambient);
  const hash = product.sha256Canonical;
  const recipe = { kind: 'qualification_verification_recipe', schemaVersion: '1',
    sourceInputs: sourcePaths.map(path => ({ memberRef: declaration.memberRefPrefix + path, relativePath: path })),
    auxiliaryInputs: dependencies.dependencies.map(row => ({ relativePath: row.path, digest: row.digest, byteCount: row.byteCount })),
    commandConfigurationDigest: hash(task.commands), predicateConfigurationDigest: hash(task.outcomePredicates),
    writeTerritoriesDigest: hash(task.allowedWriteTerritories),
    commands: declared.commands.map(row => ({ commandId: row.commandId, role: row.role })),
    lint: declared.lint, tests: declared.tests, skipPolicy: 'incomplete', reportFormat: 'node-test-events-jsonl@1' };
  valibot.parse(validator.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA, recipe);
  const recipeBytes = Buffer.from(JSON.stringify(recipe, null, 2) + '\n');
  await writeFile(join(TENANT_ROOT, OUTPUTS.recipe), recipeBytes);
  const budget = deep.c2.projectWorksiteCommandExecutionBudget({ commands: commandInput(declared), outcomePredicates: declared.outcomePredicates });
  // The C2 prompt renders refs and the helper's tool command, never the protected observations; its size
  // is independent of the protected set and differs between bindings only by the root path lengths.
  const helperPlan = product.worksiteCommandExecutionHelperPlan(task, 'attempt://abiogenesis/qualification/prompt-measure');
  const prompt = Buffer.from(product.renderWorksiteCommandExecutionPrompt(task, helperPlan), 'utf8');

  // 2. Law basis, rule catalog and coverage catalog by coordinate; the tenant manifest from the pack's install record.
  const law = await lawAndCoverage(runtime);
  const install = (await readJson(resolve(options['install-record']))).install;
  const pack = await readJson(join(runtime.root, 'product-toolchain-manifest.json'));
  if (install.artifactDigest !== expected.source.archiveDigest || install.manifestDigest !== hash(pack) ||
      install.productId !== PROSPECTIVE_RELEASE_FIELDS.productId || install.packageVersion !== PROSPECTIVE_RELEASE_FIELDS.version)
    throw new TypeError('install record is not an install of the candidate pack');
  const tenant = tenantManifest(runtime, install);
  const tenantBytes = Buffer.from(JSON.stringify(tenant, null, 2) + '\n');
  await writeFile(join(TENANT_ROOT, OUTPUTS.tenantManifest), tenantBytes);

  // 3. The resource index. It binds no inventory digest, so it is an inventory member.
  const releaseClaim = await readFile(join(TENANT_ROOT, 'release-claim.md'));
  const resources = { kind: 'qualification_resource_index', schemaVersion: '1',
    subject: { productId: PROSPECTIVE_RELEASE_FIELDS.productId, packageVersion: PROSPECTIVE_RELEASE_FIELDS.version,
      candidateCommit: expected.source.sourceCommit, archive: { name: expected.source.archive, digest: expected.source.archiveDigest } },
    prospectiveRelease: { ...PROSPECTIVE_RELEASE_FIELDS, releaseClaim: { ref: declaration.memberRefPrefix + 'release-claim.md',
      path: declaration.memberPathPrefix + 'release-claim.md', digest: sha256(releaseClaim), byteCount: releaseClaim.length } },
    runIndependent: {
      classification: { path: Q + '/classification.json', role: 'inventory member set, surface roles, surface and rule partitions' },
      materialSelection: { path: Q + '/material-selection.json', role: 'per-role J material selection and its bound' },
      lawBasis: law.lawBasis, ruleCatalog: { ref: law.catalog.catalogRef, digest: law.catalogDigest, path: 'contracts/qualification/rule-catalog.json' },
      coverageCatalog: law.coverageCatalog, tenantManifest: { ref: tenant.manifestRef, digest: tenant.manifestDigest, path: OUTPUTS.tenantManifest },
      verificationRecipe: { path: OUTPUTS.recipe, recipePath: OUTPUTS.recipe, digest: sha256(recipeBytes), byteCount: recipeBytes.length,
        sourceInputs: recipe.sourceInputs.length, auxiliaryInputs: recipe.auxiliaryInputs.length,
        commandConfigurationDigest: recipe.commandConfigurationDigest, predicateConfigurationDigest: recipe.predicateConfigurationDigest,
        writeTerritoriesDigest: recipe.writeTerritoriesDigest, ambientRows: ambient.map(row => row.name),
        requiredExecutionBudgetMs: budget.requiredExecutionBudgetMs },
      inventory: { path: OUTPUTS.inventory, coordinate: 'carried by the file itself; no other member binds it' } },
    runSpecific: ['basis (installedProduct and workspaceBinding of the run)', 'bound scope (subjectBasis)', 'resource manifest',
      'verification material (observed C2)', 'assessment plan and tasks'],
    generator: { path: Q + '/build-resources.mjs', package: { name: '@abiogenesis/typescript-tenant', version: PROSPECTIVE_RELEASE_FIELDS.version } } };
  await writeFile(join(TENANT_ROOT, OUTPUTS.resources), JSON.stringify(resources, null, 2) + '\n');

  // 4. The inventory, last; then the declared scope partitions against a provisional basis coordinate.
  const inventory = await constructInventory(runtime, declaration);
  const recipeMember = inventory.members.filter(m => m.ref === declaration.memberRefPrefix + RECIPE_PATH && m.digest === sha256(recipeBytes));
  if (recipeMember.length !== 1) throw new TypeError('the recipe is not exactly one inventory member');
  const missing = recipe.sourceInputs.filter(row => !inventory.members.some(m => m.ref === row.memberRef));
  if (missing.length > 0) throw new TypeError('recipe sources absent from the inventory: ' + missing.length);
  await writeFile(join(TENANT_ROOT, OUTPUTS.inventory), JSON.stringify(inventory) + '\n');
  const provisional = { ref: 'qualification-basis://abiogenesis/provisional', digest: sha256(Buffer.from('provisional')) };
  const { scope, errors } = constructScope(runtime, declaration, { inventory, catalog: law.catalog, catalogDigest: law.catalogDigest,
    subjectBasis: provisional, lawBasis: law.lawBasis });
  const roles = {};
  for (const m of inventory.members) for (const role of m.surfaceRoles) roles[role] = (roles[role] ?? 0) + 1;
  process.stdout.write(JSON.stringify({ kind: 'qualification_resources_generated', inventory: { ref: inventory.inventoryRef,
    digest: inventory.inventoryDigest, members: inventory.members.length, bytes: inventory.members.reduce((s, m) => s + m.byteCount, 0), roles },
    recipe: { digest: sha256(recipeBytes), byteCount: recipeBytes.length, sourceInputs: recipe.sourceInputs.length,
      auxiliaryInputs: recipe.auxiliaryInputs.length, commandConfigurationDigest: recipe.commandConfigurationDigest,
      predicateConfigurationDigest: recipe.predicateConfigurationDigest, writeTerritoriesDigest: recipe.writeTerritoriesDigest,
      ambient: ambient.map(row => row.name), budget, c2Prompt: { byteCount: prompt.length, digest: sha256(prompt),
        fixtureToolchainRoot: f.workspaceBinding.roots.toolchainRoot, fixtureArchiveRoot: f.workspaceBinding.roots.archiveRoot } },
    tenantManifest: { ref: tenant.manifestRef, digest: tenant.manifestDigest, claims: tenant.claims.length },
    lawBasis: law.lawBasis, coverageCatalog: law.coverageCatalog, scope: { surfaceGroups: scope.surfaceGroups.length,
      ruleGroups: scope.ruleGroups.length, correspondenceErrors: errors } }) + '\n');
  return errors.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
