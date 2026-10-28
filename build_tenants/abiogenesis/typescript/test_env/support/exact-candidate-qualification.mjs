// T-287 Phase D, D5: the exact qualification driver of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1. It mirrors the D2 driver
// (record directory 20261028T135232Z_D2_CONTROLLED_CORRECTION/run-specimen.mjs)
// and the installed conservation chain (installed-qualification-conservation.mjs
// `setup`) where they apply: the sandbox harness's exports for the installed
// Public path, and the installed package's exports for the qualification
// resources (test_env/qualification/build-resources.mjs).
//
// Modes:
//   prepare     the admission check, with no provider dispatch: the pack verified,
//               resolved, installed and bound through fresh installed CLI
//               processes; the qualification programs viewed and their
//               conformance evaluated; the basis, bound scope and tenant manifest
//               constructed; the recipe's protected inputs placed in the bound
//               worksite, observed by the installed owner, and the C2
//               configuration constructed over them; the budget and the J
//               material projected. With --execute-recipe, the bound commands are
//               executed once in a snapshot copy, timed, outside C2 (a
//               measurement, not an observation).
//   cold-reads  a fresh process re-derives the prepare records from the sealed
//               archive, the event log and the tenant's files.
// The live mode (assessment, ruling, F11, AF22) is not authored: D5's stop holds
// it (the observed C2 runs inside one provider Bash call whose default timeout is
// below the recipe's wall time).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { commandRecorder, configuration, eventResourceIdentity, exclusiveRecord, newArchive, preflight } from '../uat/runner.mjs';
import { BoundaryFailure, installedModules, populateSandbox, publicCaller, verifyArtifact } from '../uat/public-setup.mjs';
import { OUTPUTS, PROSPECTIVE_RELEASE_FIELDS, Q, RECIPE_PATH, TENANT_ROOT, classification, commandInput, constructInventory,
  constructScope, installedExports, lawAndCoverage, sha256, tenantManifest } from '../qualification/build-resources.mjs';

const PROMPT_BOUND_BYTES = 1_048_576;
// Claude Code 2.1.306 (the provider lane's CLI): Bash default 120000 ms, maximum 600000 ms, unless
// BASH_DEFAULT_TIMEOUT_MS is set; the C2 prompt forbids a timeout field (worksite_command_execution.ts:2344).
const PROVIDER_BASH_DEFAULT_TIMEOUT_MS = 120_000;
const QUALIFICATION_PROGRAMS = ['program://abiogenesis/qualification/assess@5', 'program://abiogenesis/qualification/self-conformance@5',
  'program://abiogenesis/qualification/exact-candidate@5', 'program://abiogenesis/worksite/command-execution@5'];
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const uptime = () => execFileSync('/usr/bin/uptime').toString('utf8').trim();

// Inlined verbatim from runner.mjs:109-112 and :214-218: module-private there, not exports (as D2's driver did).
function inherited(keys){return Object.fromEntries(keys.filter(key=>typeof key==='string'&&process.env[key]!==undefined).map(key=>[key,process.env[key]]));}
function setupEnvironment(config) {
  return {...inherited(config.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']),...(config.toolchainEnvironment??{})};
}
function redactedConfig(config) {
  const safe=structuredClone(config);
  for(const field of ['toolchainEnvironment'])for(const key of Object.keys(safe[field]??{}))if(/key|token|secret|password|credential/iu.test(key))safe[field][key]='[redacted]';
  return safe;
}

async function packageRoot(installedRoot) {
  return existsSync(join(installedRoot, 'package.json')) ? installedRoot : join(installedRoot, 'node_modules/@abiogenesis/typescript-tenant');
}

/** The qualification resources over one run's install and binding. */
async function constructResources(q, { install, verified, binding }) {
  const declaration = await classification();
  const inventory = await constructInventory(q, declaration);
  const committedInventory = await readJson(join(TENANT_ROOT, OUTPUTS.inventory));
  const law = await lawAndCoverage(q);
  const tenant = tenantManifest(q, install), committedTenant = await readJson(join(TENANT_ROOT, OUTPUTS.tenantManifest));
  const claim = inventory.members.find(m => m.ref === declaration.memberRefPrefix + 'release-claim.md');
  const basis = q.preparation.constructQualificationIdentity({ kind: 'exact_candidate_qualification', projection: 'basis', schemaVersion: '5.0.0',
    subjectKind: 'pre_rc_candidate', productId: install.productId, productVersion: install.packageVersion,
    sourceInventory: { ref: inventory.inventoryRef, digest: inventory.inventoryDigest },
    artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
    productManifest: { ref: 'product-manifest://abiogenesis/' + install.manifestDigest.slice(7), digest: install.manifestDigest },
    productContentDigest: install.productContentDigest,
    toolchain: { ref: 'toolchain://abiogenesis/' + install.manifestDigest.slice(7), digest: install.manifestDigest },
    installedProduct: { ref: install.installId, digest: q.product.sha256Canonical(install) }, workspaceBinding: binding,
    prospectiveRelease: { ...PROSPECTIVE_RELEASE_FIELDS, releaseClaim: { ref: claim.ref, digest: claim.digest } },
    tenantManifest: { ref: tenant.manifestRef, digest: tenant.manifestDigest }, coverageCatalog: law.coverageCatalog, lawBasis: law.lawBasis },
    'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
  const { scope, errors } = constructScope(q, declaration, { inventory, catalog: law.catalog, catalogDigest: law.catalogDigest,
    subjectBasis: { ref: basis.basisRef, digest: basis.basisDigest }, lawBasis: law.lawBasis });
  return { declaration, inventory, law, tenant, basis, scope, checks: {
    inventoryEqualsCommitted: inventory.inventoryDigest === committedInventory.inventoryDigest && inventory.inventoryRef === committedInventory.inventoryRef,
    tenantManifestEqualsCommitted: tenant.manifestDigest === committedTenant.manifestDigest,
    artifactJoinsInstall: verified.artifactDigest === install.artifactDigest && verified.manifestDigest === install.manifestDigest &&
      verified.productContentDigest === install.productContentDigest && verified.productId === install.productId,
    releaseClaim: { ref: claim.ref, digest: claim.digest, byteCount: claim.byteCount, surfaceRoles: claim.surfaceRoles },
    basisReady: q.deep.qualification.isQualificationBasisReady(basis),
    prospectiveReleaseJoinsInstall: basis.prospectiveRelease.productId === install.productId && basis.productVersion === PROSPECTIVE_RELEASE_FIELDS.version,
    scopeCorrespondenceErrors: errors } };
}

/** The recipe's protected inputs, by worksite-relative path, with the digests the material constructor will require. */
async function protectedInputs(recipeBytes, recipe, inventory) {
  const rows = recipe.sourceInputs.map(row => {
    const member = inventory.members.find(m => m.ref === row.memberRef);
    if (member === undefined) throw new TypeError('recipe source absent from the inventory: ' + row.memberRef);
    return { relativePath: row.relativePath, digest: member.digest, byteCount: member.byteCount, origin: 'tenant' };
  });
  for (const row of recipe.auxiliaryInputs) rows.push({ ...row, origin: 'auxiliary' });
  rows.push({ relativePath: RECIPE_PATH, digest: sha256(recipeBytes), byteCount: recipeBytes.length, origin: 'tenant' });
  return rows;
}

async function placeInputs(rows, targetRoot, dependencyRoot, sourceRoot = TENANT_ROOT) {
  for (const row of rows) {
    const from = row.origin === 'auxiliary' ? join(dependencyRoot, row.relativePath.split('/').at(-1)) : join(sourceRoot, row.relativePath);
    const to = join(targetRoot, row.relativePath), bytes = await readFile(from);
    if (sha256(bytes) !== row.digest || bytes.length !== row.byteCount) throw new TypeError('protected input differs from its recipe digest: ' + row.relativePath);
    await mkdir(dirname(to), { recursive: true }); await writeFile(to, bytes, { flag: 'wx' });
  }
}

/** The C2 configuration over the bound worksite: the installed owner observes every protected input. */
async function c2Configuration(q, environment, rows, declared, ambient) {
  const authority = environment.workspaceAuthorityBasis, binding = environment.workspaceBinding, mismatched = [];
  const subjects = [];
  for (const row of rows) {
    const subject = q.product.constructWorksiteSubject({ workspaceAuthorityBasis: authority, workspaceBinding: binding,
      subjectUri: pathToFileURL(resolve(authority.canonicalRoot, row.relativePath)).href, relativePath: row.relativePath });
    const observation = await q.product.observeWorksiteSubject(authority, binding, subject);
    if (observation.state !== 'file' || observation.fileDigest !== row.digest || observation.byteLength !== row.byteCount) mismatched.push(row.relativePath);
    subjects.push(subject);
  }
  const bound = q.deep.c2.constructWorksiteCommandConfiguration({ workspaceAuthorityBasis: authority, workspaceBinding: binding,
    commands: commandInput(declared), outcomePredicates: declared.outcomePredicates, protectedSubjects: subjects,
    allowedWriteTerritories: declared.allowedWriteTerritories }, ambient);
  const hash = q.product.sha256Canonical;
  return { bound, observed: rows.length, mismatched, canonicalRoot: authority.canonicalRoot,
    digests: { commandConfigurationDigest: hash(bound.commands), predicateConfigurationDigest: hash(bound.predicates),
      writeTerritoriesDigest: hash(bound.allowedWriteTerritories) } };
}

/** F11 J material against the prompt bound: members, surface groups and rule groups, as base64 bodies. */
function projectMaterial(q, { scope, inventory, law }) {
  const b64 = n => 4 * Math.ceil(n / 3), members = new Map(inventory.members.map(m => [m.ref, m]));
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY ?? q.validator.QUALIFICATION_ROLE_POLICY ?? null;
  const roleSourceRefs = policy?.authoritySourceRefs ?? ['repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md',
    'repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md'];
  const sources = new Map(law.catalog.sources.map(s => [s.ref, s]));
  const roleSourceBase64 = roleSourceRefs.reduce((s, ref) => s + b64(sources.get(ref).byteCount), 0);
  const groups = scope.surfaceGroups.map(g => { const raw = g.memberRefs.reduce((s, ref) => s + members.get(ref).byteCount, 0);
    const base64 = g.memberRefs.reduce((s, ref) => s + b64(members.get(ref).byteCount), 0);
    return { groupRef: g.groupRef, members: g.memberRefs.length, raw, slotBase64: base64 + roleSourceBase64, overBound: base64 + roleSourceBase64 > PROMPT_BOUND_BYTES }; });
  const ruleGroups = scope.ruleGroups.map(g => ({ groupRef: g.groupRef, sourceBase64: g.sourceRefs.reduce((s, ref) => s + b64(sources.get(ref).byteCount), 0) }));
  const oversized = inventory.members.filter(m => b64(m.byteCount) + roleSourceBase64 > PROMPT_BOUND_BYTES)
    .map(m => ({ ref: m.ref, byteCount: m.byteCount }));
  const inventoryBytes = inventory.members.reduce((s, m) => s + m.byteCount, 0);
  const catalogSourceBytes = law.catalog.sources.reduce((s, x) => s + x.byteCount, 0);
  // Floors, not estimates: every subject and law byte read once, at 4 bytes per token and 5 USD per
  // million input tokens; the six js-sdlc-bootstrap transports of D3 show about 7.4 USD per million
  // written input tokens. Output, re-reads, rule x surface pairs and independent peers add to it.
  const floorTokens = Math.ceil((inventoryBytes + catalogSourceBytes) / 4);
  return { promptBoundBytes: PROMPT_BOUND_BYTES, roleSourceRefs, roleSourceBase64, surfaceGroups: groups.length,
    surfaceGroupsOverBound: groups.filter(g => g.overBound).map(g => ({ groupRef: g.groupRef, slotBase64: g.slotBase64, members: g.members })),
    membersOverBound: oversized, ruleGroups: ruleGroups.length, ruleGroupsOverBound: ruleGroups.filter(g => g.sourceBase64 + roleSourceBase64 > PROMPT_BOUND_BYTES).length,
    rulePairsGlobalDomain: ruleGroups.length * groups.length, inventoryBytes, catalogSourceBytes,
    costFloor: { tokens: floorTokens, usd: Number((floorTokens * 5e-6).toFixed(2)), method: 'subject and law bytes read once; 4 bytes/token; 5 USD per million input tokens' },
    groups };
}

/** The bound commands executed once in a snapshot copy, as the helper would run them (worksite_command_helper.ts:1465-1530), outside C2. */
async function executeRecipe(root, rows, bound, declared, dependencyRoot, record) {
  const sandbox = join(root, 'recipe-execution/sandbox'), out = join(root, 'recipe-execution/out');
  await placeInputs(rows, sandbox, dependencyRoot); await mkdir(out, { recursive: true });
  const before = uptime(), results = [], started = Date.now();
  for (const command of bound.commands) {
    const id = command.commandId.split('/').at(-1), begun = Date.now();
    const r = spawnSync(command.executable, command.args, { cwd: join(sandbox, command.relativeCwd), env: Object.fromEntries(command.environment.map(row => [row.name, row.value])),
      timeout: command.timeoutMs, killSignal: 'SIGTERM', maxBuffer: 1 << 30 });
    await writeFile(join(out, id + '.stdout'), r.stdout ?? Buffer.alloc(0)); await writeFile(join(out, id + '.stderr'), r.stderr ?? Buffer.alloc(0));
    const role = declared.commands.find(c => c.commandId === command.commandId).role;
    let counts = null;
    if (role === 'test') { try { const rows = r.stdout.toString('utf8').trim().split('\n').map(line => JSON.parse(line));
      counts = rows.filter(x => x.type === 'summary' && x.file === null).at(-1)?.counts ?? null; } catch { counts = 'unparsed'; } }
    results.push({ commandId: command.commandId, role, exitStatus: r.status, signal: r.signal, elapsedMs: Date.now() - begun, timeoutMs: command.timeoutMs,
      stdout: { digest: sha256(r.stdout ?? Buffer.alloc(0)), byteLength: r.stdout?.length ?? 0 }, stderr: { digest: sha256(r.stderr ?? Buffer.alloc(0)), byteLength: r.stderr?.length ?? 0 }, counts });
  }
  const elapsedMs = Date.now() - started, after = uptime();
  const predicates = declared.outcomePredicates.map(p => { const i = bound.commands.findIndex(c => c.commandId === p.declaration.validationCommandId);
    return { predicateId: p.predicateId, matched: i >= 0 && results[i].exitStatus === 0 && p.predicateKind === 'stdout_exact' }; });
  for (const [i, p] of predicates.entries()) if (p.matched) {
    const command = bound.commands.findIndex(c => c.commandId === declared.outcomePredicates[i].declaration.validationCommandId);
    const text = await readFile(join(out, bound.commands[command].commandId.split('/').at(-1) + '.stdout'), 'utf8');
    p.matched = text === declared.outcomePredicates[i].declaration.equals;
  }
  return record('recipe-execution.json', { kind: 'qualification_recipe_execution_measurement', sandbox, uptimeBefore: before, uptimeAfter: after,
    elapsedMs, providerBashDefaultTimeoutMs: PROVIDER_BASH_DEFAULT_TIMEOUT_MS, exceedsProviderBashDefault: elapsedMs > PROVIDER_BASH_DEFAULT_TIMEOUT_MS,
    results, predicates, classification: 'Bound commands executed once outside C2 in a snapshot copy; a wall-time and outcome measurement, not an admitted observation' });
}

export async function prepare(config, { executeRecipe: execute = false, dependencies }) {
  const archive = await newArchive(join(TENANT_ROOT, 'test_env/test_runs'), 'qualification'), root = archive.path;
  const record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
  const effective = { ...config, runId: archive.runId, bootstrapRoot: join(root, 'bootstrap/node_modules/@abiogenesis/typescript-tenant'),
    worksiteRoot: join(root, 'sandbox/worksite'), setupEnvironment: setupEnvironment(config) };
  const command = commandRecorder(root, { environment: effective.setupEnvironment, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxProcessOutputBytes ?? 16 * 1024 * 1024 });
  let caller, summary = { kind: 'qualification_prepare', runId: archive.runId, archive: root, mode: 'prepare', status: 'incomplete', uptimeBefore: uptime() };
  await record('run.json', { timestamp: new Date().toISOString(), runId: archive.runId, sourceCommit: config.sourceCommit, mode: 'prepare',
    interpreter: { executable: config.nodePath, version: process.version }, configuration: redactedConfig(config), invokedCommand: process.argv,
    classification: 'Admission check of the exact qualification; no provider dispatch' });
  try {
    const row = { key: 'qualification', toolchainObligations: { requiredExecutables: ['node'] } };
    const ready = await preflight(config, [row], root); await record('preflight.json', ready);
    if (ready.disposition !== 'ready') return summary = { ...summary, status: 'blocked', reason: 'Preflight obligations incomplete', issues: ready.issues };
    await mkdir(effective.bootstrapRoot, { recursive: true });
    const unpacked = await command('acquire-bootstrap', '/usr/bin/tar', ['-xzf', config.package.archivePath, '--strip-components=1', '-C', effective.bootstrapRoot]);
    if (unpacked.exitCode !== 0) throw new BoundaryFailure('bootstrap-acquisition', unpacked);
    const runtime = await installedModules(effective.bootstrapRoot), manifest = await readJson(join(effective.bootstrapRoot, 'product-toolchain-manifest.json'));
    const native = await verifyArtifact(runtime, { artifactPath: config.package.archivePath, manifest, expectedArtifactDigest: config.package.sha256 }, record, 'abg');
    caller = publicCaller({ root, runtime, native, command, record, config: effective });
    const { installations, publications } = await populateSandbox(caller);
    // The qualification programs' view and conformance, as the conservation chain's setup (installed-qualification-conservation.mjs:224-249).
    const { product, validator } = runtime, lock = { ref: caller.state.resolvedLock.lockId, digest: caller.state.resolvedLock.lockDigest };
    const programs = publications.flatMap(p => p.programs).filter(p => QUALIFICATION_PROGRAMS.includes(p.programRef));
    if (programs.length !== QUALIFICATION_PROGRAMS.length) throw new BoundaryFailure('qualification-programs', programs.map(p => p.programRef));
    const allowlist = [...new Set(programs.flatMap(p => p.callableMembership))].sort();
    const admitted = await readJson(join(root, 'calls/catalog-admit.outcome.json'));
    await caller.invoke('catalog-view-qualification', await caller.authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: admitted.receipt.ownerOutput.value.catalog, allowlist }, { kind: 'catalog_view_resource_assertion', schemaVersion: '5.0.0', catalog: caller.state.catalog },
      { ...caller.boundSlots(), dependency_lock: lock }));
    caller.state.catalogView = product.narrowGraphFunctionCatalog(caller.state.catalog, allowlist);
    const conformance = [];
    for (const p of programs) {
      const publication = publications.find(value => value.programs.some(value => value.programRef === p.programRef));
      const conformanceLaw = { ref: 'law://abiogenesis/validator/gtl-program@5', digest: product.sha256Canonical({ ref: 'law://abiogenesis/validator/gtl-program@5' }) };
      const result = await caller.invoke('qualification-conformance-' + p.programRef.split('/').at(-1).split('@')[0],
        await caller.authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
          { program: { ref: p.programRef, digest: product.sha256Canonical(p) }, conformanceLaw,
            inventoryBasis: { kind: 'declared_inventory', inventory: caller.state.catalog.boundPublications
              .map(value => ({ ref: value.moduleRef, digest: product.sha256Canonical(value) })).sort((a, b) => a.ref.localeCompare(b.ref)) } },
          { kind: 'conformance_evaluation_resource_assertion', schemaVersion: '5.0.0',
            packet: { kind: 'conformance_evaluate_packet', schemaVersion: '5.0.0', memberKey: 'gtl_program', publication, program: p },
            conformanceLaw, declaredInventory: caller.state.catalog.boundPublications,
            declarationCatalog: { catalog: caller.state.catalog, catalogView: caller.state.catalogView } },
          { ...caller.boundSlots(), dependency_lock: lock }));
      conformance.push({ programRef: p.programRef, disposition: result.receipt.ownerOutput.value.disposition });
    }
    await record('qualification-programs.json', { allowlist, conformance, viewDigest: product.sha256Canonical(caller.state.catalogView) });
    if (conformance.some(c => c.disposition !== 'passed')) throw new BoundaryFailure('qualification-program-conformance', conformance);

    // The qualification resources over this run's install and binding.
    const q = await installedExports(await packageRoot(caller.installedRoot));
    const resources = await constructResources(q, { install: installations[0], verified: native.verified, binding: caller.state.binding });
    await record('resources/basis.json', resources.basis); await record('resources/scope.json', resources.scope);
    await record('resources/inventory.json', resources.inventory); await record('resources/tenant-manifest.json', resources.tenant);
    const recipeBytes = await readFile(join(TENANT_ROOT, RECIPE_PATH)), recipe = JSON.parse(recipeBytes.toString('utf8'));
    q.valibot.parse(q.validator.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA, recipe);
    const declared = await readJson(join(TENANT_ROOT, Q, 'recipe/declared-commands.json'));
    const rows = await protectedInputs(recipeBytes, recipe, resources.inventory);
    // Protected inputs are baseline input of the bound worksite, before any dispatch (as D2 placed its originals).
    const environment = caller.refresh();
    await placeInputs(rows, environment.workspaceAuthorityBasis.canonicalRoot, dependencies);
    const ambient = q.deep.actorProcess.selectedWorksiteCommandAmbientEnvironment();
    const c2 = await c2Configuration(q, environment, rows, declared, ambient);
    const budget = q.deep.c2.projectWorksiteCommandExecutionBudget({ commands: commandInput(declared), outcomePredicates: declared.outcomePredicates });
    const limits = { inactivityTimeoutMs: config.provider.inactivityTimeoutMs, absoluteTimeoutMs: config.provider.absoluteTimeoutMs };
    const material = projectMaterial(q, resources);
    const prepared = { kind: 'qualification_prepare_record', runId: archive.runId,
      basis: { ref: resources.basis.basisRef, digest: resources.basis.basisDigest }, scope: { ref: resources.scope.scopeRef, digest: resources.scope.scopeDigest },
      inventory: { ref: resources.inventory.inventoryRef, digest: resources.inventory.inventoryDigest, members: resources.inventory.members.length },
      tenantManifest: { ref: resources.tenant.manifestRef, digest: resources.tenant.manifestDigest }, lawBasis: resources.law.lawBasis,
      coverageCatalog: resources.law.coverageCatalog, checks: resources.checks,
      recipe: { path: RECIPE_PATH, digest: sha256(recipeBytes), byteCount: recipeBytes.length, protectedInputs: rows.length,
        observed: c2.observed, mismatched: c2.mismatched, worksite: c2.canonicalRoot, digests: c2.digests,
        digestsEqualRecipe: c2.digests.commandConfigurationDigest === recipe.commandConfigurationDigest &&
          c2.digests.predicateConfigurationDigest === recipe.predicateConfigurationDigest && c2.digests.writeTerritoriesDigest === recipe.writeTerritoriesDigest,
        ambient: ambient.map(row => row.name) },
      budget: { ...budget, limits, fitsProductLimits: q.deep.c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs, limits),
        providerBashDefaultTimeoutMs: PROVIDER_BASH_DEFAULT_TIMEOUT_MS },
      material: { ...material, groups: undefined } };
    await record('prepare.json', prepared); await record('material-projection.json', material);
    if (execute) await executeRecipe(root, rows, c2.bound, declared, dependencies, record);
    const green = Object.values(resources.checks).every(v => v === true || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v))) &&
      c2.mismatched.length === 0 && prepared.recipe.digestsEqualRecipe;
    return summary = { ...summary, status: green ? 'prepared' : 'refused', reason: green
      ? 'Clean Public install and binding; qualification programs viewed and conformant; resources constructed; no provider dispatch'
      : 'A prepared resource check failed (prepare.json)' };
  } catch (error) {
    summary = { ...summary, status: error instanceof BoundaryFailure ? 'refused' : 'failed', reason: String(error), boundary: error.stage ?? null,
      observation: error.observation ?? null };
    await record('failure.json', summary); return summary;
  } finally {
    if (caller?.state.closeHandoff) await record('final-close-handoff.json', caller.state.closeHandoff);
    summary.uptimeAfter = uptime();
    await record('summary.json', summary); await record('SEALED.json', { sealedAt: new Date().toISOString(), status: summary.status, archiveRoot: root, retained: true });
  }
}

// After the prepare process has exited: a fresh process rebuilds the caller from the sealed archive (as D2's
// cold reads did), re-reads the workspace environment from the event log, and re-derives the prepared records.
export async function coldReads(config, archivePath, outRoot) {
  const archived = path => readJson(join(archivePath, path));
  const run = await archived('run.json'), setup = await archived('setup-identity.json'), closeHandoff = await archived('final-close-handoff.json');
  const prepared = await archived('prepare.json');
  await mkdir(dirname(outRoot), { recursive: true }); await mkdir(outRoot);
  const root = outRoot, record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
  const effective = { ...config, runId: run.runId, bootstrapRoot: join(archivePath, 'bootstrap/node_modules/@abiogenesis/typescript-tenant'),
    worksiteRoot: join(archivePath, 'sandbox/worksite'), setupEnvironment: setupEnvironment(config) };
  const command = commandRecorder(root, { environment: effective.setupEnvironment, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxProcessOutputBytes ?? 16 * 1024 * 1024 });
  const runtime = await installedModules(effective.bootstrapRoot), manifest = await readJson(join(effective.bootstrapRoot, 'product-toolchain-manifest.json'));
  const native = await verifyArtifact(runtime, { artifactPath: config.package.archivePath, manifest, expectedArtifactDigest: config.package.sha256 }, record, 'abg');
  const caller = publicCaller({ root, runtime, native, command, record, config: effective });
  caller.state.binding = setup.workspaceBinding; caller.state.closeHandoff = closeHandoff; caller.installedRoot = setup.installations[0].installedRoot;
  const eventLog = fileURLToPath(closeHandoff.prefix.eventLogRef), identityBefore = await eventResourceIdentity(eventLog);
  const environment = caller.refresh();
  const q = await installedExports(await packageRoot(caller.installedRoot));
  const resources = await constructResources(q, { install: setup.installations[0], verified: native.verified, binding: setup.workspaceBinding });
  const recipeBytes = await readFile(join(TENANT_ROOT, RECIPE_PATH)), recipe = JSON.parse(recipeBytes.toString('utf8'));
  const declared = await readJson(join(TENANT_ROOT, Q, 'recipe/declared-commands.json'));
  const rows = await protectedInputs(recipeBytes, recipe, resources.inventory);
  const c2 = await c2Configuration(q, environment, rows, declared, q.deep.actorProcess.selectedWorksiteCommandAmbientEnvironment());
  const identityAfter = await eventResourceIdentity(eventLog);
  const rowsCompared = [
    ['basis', prepared.basis.digest, resources.basis.basisDigest], ['scope', prepared.scope.digest, resources.scope.scopeDigest],
    ['inventory', prepared.inventory.digest, resources.inventory.inventoryDigest], ['tenantManifest', prepared.tenantManifest.digest, resources.tenant.manifestDigest],
    ['commandConfiguration', prepared.recipe.digests.commandConfigurationDigest, c2.digests.commandConfigurationDigest],
    ['predicateConfiguration', prepared.recipe.digests.predicateConfigurationDigest, c2.digests.predicateConfigurationDigest],
    ['writeTerritories', prepared.recipe.digests.writeTerritoriesDigest, c2.digests.writeTerritoriesDigest],
  ].map(([name, archivedDigest, rederived]) => ({ name, archivedDigest, rederived, equal: archivedDigest === rederived }));
  const result = { kind: 'qualification_cold_reads', archive: archivePath, runId: run.runId, coldRoot: root,
    process: { pid: process.pid, argv: process.argv, node: process.version }, eventLog, identityBefore, identityAfter,
    identityUnchanged: JSON.stringify(identityBefore) === JSON.stringify(identityAfter), environmentKind: environment.kind,
    observedMismatches: c2.mismatched, scopeCorrespondenceErrors: resources.checks.scopeCorrespondenceErrors, basisReady: resources.checks.basisReady,
    rows: rowsCompared, allEqual: rowsCompared.every(row => row.equal) && c2.mismatched.length === 0 };
  await record('cold-reads.json', result);
  return result;
}

async function main(args = process.argv.slice(2)) {
  const [mode, ...rest] = args, options = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--execute-recipe') options['execute-recipe'] = true;
    else if (['--config', '--archive', '--out', '--json', '--dependencies'].includes(rest[i])) options[rest[i].slice(2)] = rest[++i];
    else throw new TypeError('Unknown argument: ' + rest[i]);
  }
  if (!['prepare', 'cold-reads'].includes(mode) || !options.config) throw new TypeError(
    'Usage: exact-candidate-qualification.mjs prepare --config FILE --dependencies DIR [--execute-recipe] | cold-reads --config FILE --archive SEALED_ARCHIVE --out NEW_ROOT --json OUTPUT');
  const config = await configuration(options.config);
  if (mode === 'cold-reads') {
    const result = await coldReads(config, resolve(options.archive), resolve(options.out));
    await writeFile(resolve(options.json), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ allEqual: result.allEqual, identityUnchanged: result.identityUnchanged })); return result.allEqual && result.identityUnchanged ? 0 : 1;
  }
  if (!options.dependencies) throw new TypeError('prepare requires --dependencies DIR (the locked dependency archives by file name)');
  const result = await prepare(config, { executeRecipe: options['execute-recipe'] === true, dependencies: resolve(options.dependencies) });
  console.log(JSON.stringify(result)); return result.status === 'prepared' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
