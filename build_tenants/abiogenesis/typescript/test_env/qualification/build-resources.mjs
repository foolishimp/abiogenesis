// Generates the run-independent qualification resources of one exact candidate
// of @abiogenesis/typescript-tenant from the installed package's exports: the
// verification recipe, the tenant conformance manifest, the resource index and,
// last, the subject inventory. The candidate's canonical RC identity is derived
// (test_env/support/exact-candidate-identity.mjs) from the installed package,
// its manifest, the install record and the frozen release claim; no RC ordinal
// is fixed here. Run from the tenant root:
//   node test_env/qualification/build-resources.mjs --package <installed package root>
//     --install-record <installed/0/identity.json of a Public install of the same pack> --scratch <empty scratch directory>
// To refresh only the recipe before O2, pass --recipe-only true and omit --install-record.
// The run-specific resources (the basis, the bound scope, the resource manifest
// and the verification material) bind the install and the workspace binding of
// one run; test_env/support/exact-candidate-qualification.mjs constructs them.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RELEASE_CLAIM_PATH, claimRefPrefix, deriveCandidateIdentity, installedPackageIdentity, resourceIndexIdentity, archiveNameOf } from '../support/exact-candidate-identity.mjs';
import { nativeAuxiliaryInputs, placementCollisions } from './native-inputs.mjs';

export const TENANT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const Q = 'test_env/qualification';
export const RECIPE_PATH = Q + '/recipe/verification-recipe.json';
export const OUTPUTS = Object.freeze({ recipe: RECIPE_PATH, tenantManifest: Q + '/tenant-manifest.json',
  resources: Q + '/resources.json', inventory: Q + '/inventory.json' });
export const sha256 = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));

/** The installed package's exports, by its own export map; deep imports are named. The export guard admits the
 * declared package at any canonical positive RC version and refuses before importing anything else. */
export async function installedExports(packageRoot) {
  const root = await realpath(resolve(packageRoot)), manifest = await readJson(join(root, 'package.json'));
  installedPackageIdentity(manifest);
  const exported = sub => import(pathToFileURL(join(root, manifest.exports['./' + sub].import)).href);
  const deep = path => import(pathToFileURL(join(root, 'build/code/src', path)).href);
  const valibot = await import(pathToFileURL(createRequire(join(root, 'package.json')).resolve('valibot')).href);
  return { root, packageJson: manifest, product: await exported('product'), abg: await exported('abg'), gtl: await exported('gtl'),
    validator: await exported('validator'), preparation: await exported('qualification/m05'), valibot,
    // Not package exports (named substitutions): the ambient reader (abg/actor_process.ts:708), the C2
    // configuration constructor and budget projection (product/worksite_command_execution.ts:166, :1474),
    // the basis readiness, verification material and attribution projection (validator/qualification.ts:130, :669, :743),
    // the verification material entry (validator/qualification.ts qualificationVerificationMaterialEntry), the compact
    // execution entry (abg/qualification_proof.ts qualificationExecutionEntry), and the scope's interned form
    // (validator/qualification_resources.ts:234).
    deep: { actorProcess: await deep('abg/actor_process.js'), c2: await deep('product/worksite_command_execution.js'),
      qualification: await deep('validator/qualification.js'), qualificationProof: await deep('abg/qualification_proof.js'),
      qualificationResources: await deep('validator/qualification_resources.js') } };
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
  const members = new Map(inventory.members.map(m => [m.ref, m]));
  const surfaceGroups = [...groups.values()].map(g => ({ ...g, sourceRefs: representativeSources(declaration, g.memberRefs, members) }))
    .sort((a, b) => a.groupRef < b.groupRef ? -1 : a.groupRef > b.groupRef ? 1 : 0);
  const applicationDomains = declaration.applicationDomains === undefined ? undefined
    : constructApplicationDomains(declaration, { inventory, ruleGroups, surfaceGroups }).map(({ ruleGroupRef, surfaceGroups }) => ({ ruleGroupRef, surfaceGroups }));
  const scope = runtime.preparation.constructQualificationIdentity({ kind: 'qualification_scope', subjectBasis, lawBasis,
    catalog: { ref: catalog.catalogRef, digest: catalogDigest }, inventory, ruleGroups, surfaceGroups,
    ...(applicationDomains === undefined ? {} : { applicationDomains }) },
    'scopeRef', 'scopeDigest', 'qualification-scope://abiogenesis/');
  return { scope, errors: runtime.validator.qualificationScopeCorrespondence(scope, catalog, catalogDigest) };
}

/** The declared family of one rule group's source: the first entry whose refs name it, else whose prefix it starts with. */
export function domainFamily(declaration, sourceRef) {
  const family = declaration.applicationDomains.families.find(f => f.match.refs?.includes(sourceRef) || (f.match.prefix !== undefined && sourceRef.startsWith(f.match.prefix)));
  if (family === undefined) throw new TypeError('rule group source without a declared domain family: ' + sourceRef);
  return family;
}

/** Declared material selection only: complete coverage remains in memberRefs.
 * No filename, count or selected example establishes the omitted members' law. */
export function declaredEvidenceSelection(declaration, memberRefs, context = {}) {
  const sameRefs = (a, b) => a.length === b.length && a.every((ref, n) => ref === b[n]);
  const explicit = (declaration.evidenceSelections ?? []).filter(row => row.ruleSourceRefs.includes(context.ruleSourceRef) &&
    (row.groupKey !== undefined && row.groupKey === context.groupKey || row.subjectMemberRefs !== undefined && sameRefs(row.subjectMemberRefs, memberRefs)));
  if (explicit.length > 1) throw new TypeError('ambiguous declared evidence selection');
  return explicit[0];
}
export function representativeSources(declaration, memberRefs, members, context = {}) {
  const row = declaredEvidenceSelection(declaration, memberRefs, context);
  if (row !== undefined) {
    if (typeof row.argument !== 'string' || row.argument.trim().length === 0 || row.sourceRefs.length === 0 ||
      new Set(row.sourceRefs).size !== row.sourceRefs.length || row.sourceRefs.some(ref => !members.has(ref)))
      throw new TypeError('declared derivation evidence absent or unbound');
    return [...row.sourceRefs];
  }
  const selection = declaration.surfaceGroups.representativeSelection;
  if (selection === undefined) return [...declaration.surfaceGroups.sourceRefs];
  if (selection.kind !== 'first_and_last_member_within_byte_limit' || !Number.isSafeInteger(selection.maxMemberBytes) || selection.maxMemberBytes <= 0)
    throw new TypeError('unknown declared representative selection');
  if (memberRefs.length === 0 || memberRefs.some(ref => !members.has(ref))) throw new TypeError('representative member absent');
  const eligible = memberRefs.filter(ref => members.get(ref).byteCount <= selection.maxMemberBytes);
  return eligible.length === 0 ? [memberRefs[0]] : [...new Set([eligible[0], eligible.at(-1)])];
}

/** A governed global group's parts: its members in inventory order, cut before a part would exceed chunkBytes (a member
 * larger than chunkBytes is a part alone). One part keeps the group's key; several are keyed <key>/part-<n>. */
export function domainParts(declaration, group, members, context = {}) {
  const limit = declaration.applicationDomains.chunkBytes, parts = [];
  let part = [], bytes = 0;
  for (const ref of group.memberRefs) {
    const size = members.get(ref).byteCount;
    if (part.length > 0 && bytes + size > limit) { parts.push(part); part = []; bytes = 0; }
    part.push(ref); bytes += size;
  }
  if (part.length > 0) parts.push(part);
  return parts.map((memberRefs, n) => ({ ...group, memberRefs, sourceRefs: representativeSources(declaration, memberRefs, members, context), partKey: parts.length === 1 ? '' : '/part-' + n }));
}

/** Each rule group's domain (classification.json applicationDomains): the governed global groups re-keyed in byte-bounded
 * parts, and one complement group per surface role the family does not govern. */
export function constructApplicationDomains(declaration, { inventory, ruleGroups, surfaceGroups }) {
  const prefix = 'qualification-surface-group://abiogenesis/typescript-tenant/', members = new Map(inventory.members.map(m => [m.ref, m]));
  return ruleGroups.map(rule => {
    if (rule.sourceRefs.length !== 1) throw new TypeError('a rule group names one source: ' + rule.groupRef);
    const ordinal = rule.groupRef.split('/').at(-1), family = domainFamily(declaration, rule.sourceRefs[0]);
    const governed = surfaceGroups.filter(g => g.surfaceRoles.every(role => family.governedRoles.includes(role)));
    if (governed.length === 0) throw new TypeError('empty domain: ' + rule.groupRef);
    const rekey = ({ partKey, ...g }) => ({ ...g, groupRef: prefix + 'domain/' + ordinal + '/' + g.groupRef.slice(prefix.length) + partKey });
    const context = { ruleSourceRef: rule.sourceRefs[0] };
    const parts = governed.flatMap(g => domainParts(declaration, g, members, context));
    const inside = new Set(governed.flatMap(g => g.memberRefs)), rest = inventory.members.filter(m => !inside.has(m.ref));
    const roles = [...new Set(rest.flatMap(m => members.get(m.ref).surfaceRoles))].sort();
    const complement = roles.map(role => ({ groupRef: prefix + 'domain/' + ordinal + '/complement/' + role,
      memberRefs: rest.filter(m => members.get(m.ref).surfaceRoles[0] === role).map(m => m.ref),
      rootRefs: [...declaration.surfaceGroups.rootRefs], surfaceRoles: [role],
      ownerRefs: [...declaration.surfaceGroups.ownerRefs], sourceRefs: [...declaration.surfaceGroups.sourceRefs] }));
    if (rest.some(m => members.get(m.ref).surfaceRoles.length !== 1)) throw new TypeError('a complement member carries other than one surface role');
    return { ruleGroupRef: rule.groupRef, familyId: family.id, governedRefs: parts.map(g => rekey(g).groupRef),
      surfaceGroups: [...parts.map(rekey), ...complement.map(g => ({ ...g, sourceRefs: representativeSources(declaration, g.memberRefs, members,
        { ...context, groupKey: 'complement/' + g.surfaceRoles[0] }) }))] };
  });
}

/** The self-conformance applications: every (rule group, domain group) pair, governed applicable and complement inapplicable. */
export function constructApplications(declaration, domains) {
  const evidence = declaration.memberRefPrefix + Q + '/classification.json#domain/';
  return domains.flatMap(d => d.surfaceGroups.map(g => ({ ruleRef: d.ruleGroupRef, surfaceRef: g.groupRef,
    applicability: d.governedRefs.includes(g.groupRef) ? 'applicable' : 'inapplicable', premiseEvidenceRefs: [evidence + d.familyId],
    evaluationEvidenceRefs: [], rulingEvidenceRefs: [] })));
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

/** The tenant conformance manifest of one install; its claim refs belong to the derived candidate identity. */
export function tenantManifest(runtime, install, identity) {
  if (identity?.productId !== install.productId || identity.version !== install.packageVersion)
    throw new TypeError('tenant manifest requires the candidate identity of this install');
  const claims = install.capabilityDefinitionGraph.rows.flatMap(row => {
    const publicContractRefs = install.publicContracts.filter(c => c.owningProduct === install.productId &&
      c.capabilityIdentities.includes(row.capabilityId)).map(c => c.contractId);
    if (publicContractRefs.length > 0 && row.boundedProofRefs.length === 0) throw new TypeError('capability without proof refs: ' + row.capabilityId);
    return publicContractRefs.length === 0 ? [] : [{ claimRef: claimRefPrefix(identity) + row.capabilityId,
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
    if (!['--package', '--install-record', '--scratch', '--recipe-only'].includes(argv[i]) || argv[i + 1] === undefined) throw new TypeError('Unknown argument: ' + argv[i]);
    options[argv[i].slice(2)] = argv[i + 1];
  }
  if (!options.package || (!options['install-record'] && options['recipe-only'] !== 'true') || !options.scratch) throw new TypeError('Usage: build-resources.mjs --package DIR --install-record FILE --scratch DIR');
  const runtime = await installedExports(options.package), { product, valibot, validator, deep } = runtime;
  const ambient = deep.actorProcess.selectedWorksiteCommandAmbientEnvironment();
  const declaration = await classification();
  const declared = await readJson(join(TENANT_ROOT, Q, 'recipe/declared-commands.json'));
  const dependencies = await readJson(join(TENANT_ROOT, Q, 'recipe/dependencies.json'));
  const expected = await readJson(join(TENANT_ROOT, Q, 'recipe/expected-output-inventory.json'));
  const territories = declared.allowedWriteTerritories, generated = expected.generatedRoots;
  const inside = (path, roots) => roots.some(row => row.pathKind === 'file' ? row.relativePath === path : path.startsWith(row.relativePath + '/'));
  const hash = product.sha256Canonical;

  // 0. The candidate identity, before any output is written: the installed package and its manifest, the install
  // record of the candidate pack named by the expected output inventory, and the frozen release-claim bytes.
  let identity = null, install = null;
  if (options['recipe-only'] !== 'true') {
    install = (await readJson(resolve(options['install-record']))).install;
    const pack = await readJson(join(runtime.root, 'product-toolchain-manifest.json'));
    identity = deriveCandidateIdentity({ packageJson: runtime.packageJson, sourcePackageJson: await readJson(join(TENANT_ROOT, 'package.json')),
      manifest: pack, manifestDigest: hash(pack), verified: null, install,
      releaseClaim: { ref: declaration.memberRefPrefix + RELEASE_CLAIM_PATH, bytes: await readFile(join(TENANT_ROOT, RELEASE_CLAIM_PATH)) } });
    if (install.artifactDigest !== expected.source.archiveDigest || expected.source.archive !== archiveNameOf(identity))
      throw new TypeError('install record is not an install of the candidate pack named by the expected output inventory');
  }

  // 1. The verification recipe. Its three configuration digests are binding- and root-independent;
  // they bind the ambient HOME, TMPDIR, LANG and LC_ALL rows of this process (the harness worker inherits them).
  const paths = memberPaths(declaration, TENANT_ROOT, [OUTPUTS.recipe, OUTPUTS.tenantManifest, OUTPUTS.resources]);
  const sourcePaths = paths.filter(path => path !== OUTPUTS.recipe && !inside(path, generated));
  // Auxiliary inputs: the npm-only dependency archives, then the declared native build inputs at their exact
  // protected placement (native-inputs.mjs). Every protected input has one collision-free path outside every
  // write territory and generated root.
  const auxiliaryInputs = [...dependencies.dependencies.map(row => ({ relativePath: row.path, digest: row.digest, byteCount: row.byteCount })),
    ...(await nativeAuxiliaryInputs(TENANT_ROOT))];
  const collisions = placementCollisions([...sourcePaths, ...auxiliaryInputs.map(row => row.relativePath), OUTPUTS.recipe]);
  if (collisions.length > 0) throw new TypeError('protected input placement collides: ' + collisions.join('; '));
  const unprotectable = sourcePaths.filter(path => inside(path, territories));
  if (unprotectable.length > 0) throw new TypeError('protected inputs inside a write territory: ' + unprotectable.join(', '));
  const misplaced = auxiliaryInputs.filter(row => inside(row.relativePath, territories) || inside(row.relativePath, generated));
  if (misplaced.length > 0) throw new TypeError('auxiliary inputs inside a write territory or generated root: ' + misplaced.map(row => row.relativePath).join(', '));
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
  const recipe = { kind: 'qualification_verification_recipe', schemaVersion: '1',
    sourceInputs: sourcePaths.map(path => ({ memberRef: declaration.memberRefPrefix + path, relativePath: path })),
    auxiliaryInputs,
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

  // Recipe construction is independent of a new candidate install. This bounded mode
  // refreshes only that generated carrier; O2 still owns candidate resource regeneration.
  if (options['recipe-only'] === 'true') {
    process.stdout.write(JSON.stringify({ kind: 'qualification_recipe_generated', qualification: false,
      digest: sha256(recipeBytes), byteCount: recipeBytes.length, sourceInputs: recipe.sourceInputs.length,
      auxiliaryInputs: recipe.auxiliaryInputs.length, commandConfigurationDigest: recipe.commandConfigurationDigest, budget }) + '\n');
    return 0;
  }

  // 2. Law basis, rule catalog and coverage catalog by coordinate; the tenant manifest from the pack's install record.
  const law = await lawAndCoverage(runtime);
  const tenant = tenantManifest(runtime, install, identity);
  const tenantBytes = Buffer.from(JSON.stringify(tenant, null, 2) + '\n');
  await writeFile(join(TENANT_ROOT, OUTPUTS.tenantManifest), tenantBytes);

  // 3. The resource index. It binds no inventory digest, so it is an inventory member.
  const indexed = resourceIndexIdentity(identity, { candidateCommit: expected.source.sourceCommit,
    archive: { name: expected.source.archive, digest: expected.source.archiveDigest }, claimPath: declaration.memberPathPrefix + RELEASE_CLAIM_PATH });
  const resources = { kind: 'qualification_resource_index', schemaVersion: '1',
    subject: indexed.subject, prospectiveRelease: indexed.prospectiveRelease,
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
    generator: { path: Q + '/build-resources.mjs', package: indexed.generatorPackage } };
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
  process.stdout.write(JSON.stringify({ kind: 'qualification_resources_generated',
    identity: { productId: identity.productId, version: identity.version, ordinal: identity.ordinal, releaseClaim: identity.releaseClaim }, inventory: { ref: inventory.inventoryRef,
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
