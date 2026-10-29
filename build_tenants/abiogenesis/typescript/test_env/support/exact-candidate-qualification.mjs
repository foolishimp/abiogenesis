// T-287 Phase D, D5 (D5-b, D5-c): the exact qualification driver of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1. It mirrors the D2 driver
// (record directory 20261028T135232Z_D2_CONTROLLED_CORRECTION/run-specimen.mjs)
// and the installed conservation chain (installed-qualification-conservation.mjs) where they apply: the sandbox
// harness's exports for the installed Public path, and the installed package's exports for the qualification
// resources (test_env/qualification/build-resources.mjs).
//
// Operator launch: sh test_env/support/run-exact-candidate-qualification.sh <mode> ...
// The launcher fixes this driver process to --max-old-space-size=16384 (16 GiB).
// Modes:
//   prepare             the admission check, with no provider dispatch: the pack verified, resolved, installed and
//                       bound through fresh installed CLI processes; the qualification programs (with the owner
//                       ruling Program) viewed and their conformance evaluated; the admitted catalog retained for the
//                       later modes; the basis, bound scope and tenant manifest constructed; the recipe's protected
//                       inputs placed in the bound worksite, observed by the installed owner, and the C2
//                       configuration constructed over them; the setup environment recorded. The provider version
//                       probe runs only in live mode. With --execute-recipe, the bound commands are executed once in a
//                       snapshot copy, timed, outside C2 (a measurement, not an observation).
//   helper-realize      (D5-c item 3) over a prepared archive: the observed C2 task constructed and realized by the
//                       installed leaf (its manifests in the prepared sandbox's archive root) and the helper command
//                       recorded, for the operator to run from a shell with the recorded setup environment. No C call.
//   execution-material  (D5-c item 3; RP-1 P1) over a prepared archive whose helper ran: the helper artifact admitted,
//                       the observation and the verification material by the installed constructors, the stand-in
//                       execution entry under an observed C2 envelope of the candidate and the verification material
//                       entry (the compact entries, execution-material.mjs), and one REQ-P-QUAL-056 rule slot and the
//                       coverage slot rendered with them. A measurement, never an admitted C2.
//   dry                 (D5-c item 5) over a prepared archive: the construction provenance with the inherited-base
//                       chain, the re-packed plan over the stand-in with every slot rendered and its construction
//                       attribution checked, and every C call's input admitted in process (the observed C2 start, each
//                       assess@5 start, each owner acknowledgment request, the F11 and AF22 inputs over placeholder
//                       selections); the projection and its time; the provider environment the transport would
//                       receive (G-4). It ends undispatched: no transport call, no provider spawn, the event log and
//                       the transport archives unchanged.
//   live                (D5-c item 5, authored, not run in D5-c) over a prepared archive, the item 3 archive and an
//                       explicit --cap-usd: the plan's gates over the measured stand-in first (no provider call when one
//                       holds), then dispatch.mjs dispatchLive: the observed C2, the plan over its Result, assess@5 per slot, the
//                       owner acknowledgments the fold requires, the F11 leaf, the sole AF22 verdict; the cold reads
//                       follow in a fresh process (cold-reads over the live archive).
//   cold-reads          a fresh process re-derives the prepare records from the sealed archive, the event log and the
//                       tenant's files, and, for a dry or live archive, the construction record set from Git.
import { execFileSync, spawnSync } from 'node:child_process';
import { chmod, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { commandRecorder, configuration, eventResourceIdentity, exclusiveRecord, newArchive, preflight, workerEnvironment } from '../uat/runner.mjs';
import { BoundaryFailure, installedModules, populateSandbox, publicCaller, verifyArtifact } from '../uat/public-setup.mjs';
import { OUTPUTS, PROSPECTIVE_RELEASE_FIELDS, Q, RECIPE_PATH, TENANT_ROOT, classification, commandInput, constructInventory,
  constructScope, installedExports, lawAndCoverage, sha256, tenantManifest } from '../qualification/build-resources.mjs';
import { PHASE_C_CLOSE, TENANT_PATH, REPOSITORY_ROOT, chainCommits, constructChains, constructProvenance, establishedAttributions, memberCurrency,
  phaseCCloseRows } from '../qualification/provenance.mjs';
import { EXECUTION_CLASS_BOUND_BYTES, PRICE, PROMPT_BOUND_BYTES, acquireAssessmentResources, constructAssessmentMaterial, constructPlan,
  constructSlotSpecifications, materialSelection, packRuleRole, projectAssessment, ruleInputFloor } from '../qualification/assessment-plan.mjs';
import { PROGRAMS, RUN_ENVIRONMENT_SUPPORT, SELECTION_PREFIX, acknowledgmentRequest, admitCall, dispatchLive, observedC2Task, proofResource,
  selfConformanceInput, startCall } from '../qualification/dispatch.mjs';
import { c2Envelope, constructMeasuredObservation, executionMaterial, observationParts, realizeForMeasurement, renderedEntryBytes,
  verificationEntry, verificationMaterial } from '../qualification/execution-material.mjs';
import { d3Calls, fitLatency, projectTime } from '../qualification/time-projection.mjs';

// Claude Code 2.1.306 (the provider lane's CLI): Bash default 120000 ms, maximum 600000 ms, unless
// BASH_DEFAULT_TIMEOUT_MS is set; the C2 prompt forbids a timeout field (worksite_command_execution.ts:2344).
const PROVIDER_BASH_DEFAULT_TIMEOUT_MS = 120_000;
const QUALIFICATION_PROGRAMS = ['program://abiogenesis/qualification/assess@5', 'program://abiogenesis/qualification/self-conformance@5',
  'program://abiogenesis/qualification/exact-candidate@5', 'program://abiogenesis/worksite/command-execution@5',
  'program://abiogenesis/qualification/ruling@5'];
// The observed C2 Result of the candidate whose envelope (result, judgment and evidence rows) carries the stand-in
// execution material (D3 record: the js-sdlc-bootstrap run on the candidate pack).
const STAND_IN_ENVELOPE = Object.freeze({ run: 'js-sdlc-bootstrap/2026-10-28T15-49-00-793Z-a668d062-3e5d-407c-abd5-6b7794dd427a',
  cCallRef: 'c-call:sha256:bea21ff5def6994d6e9902d0fa7a17f6b1a25cd7b7c968a220b5a693bacbce5f' });
// G-4 (D5-b disposition): the two Bash limits the provider CLI reads and the two npm keys of the recipe's setup.
const G4_KEYS = Object.freeze({ bash: ['BASH_DEFAULT_TIMEOUT_MS', 'BASH_MAX_TIMEOUT_MS'], npm: ['npm_config_update_notifier', 'npm_config_offline'] });
const CREDENTIAL_KEYS = Object.freeze(['ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN']);
const DRY_REFUSAL = 'D5-c dry mode: no dispatch';
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
  const subjects = [], observations = [];
  for (const row of rows) {
    const subject = q.product.constructWorksiteSubject({ workspaceAuthorityBasis: authority, workspaceBinding: binding,
      subjectUri: pathToFileURL(resolve(authority.canonicalRoot, row.relativePath)).href, relativePath: row.relativePath });
    const observation = await q.product.observeWorksiteSubject(authority, binding, subject);
    if (observation.state !== 'file' || observation.fileDigest !== row.digest || observation.byteLength !== row.byteCount) mismatched.push(row.relativePath);
    subjects.push(subject); observations.push(observation);
  }
  const bound = q.deep.c2.constructWorksiteCommandConfiguration({ workspaceAuthorityBasis: authority, workspaceBinding: binding,
    commands: commandInput(declared), outcomePredicates: declared.outcomePredicates, protectedSubjects: subjects,
    allowedWriteTerritories: declared.allowedWriteTerritories }, ambient);
  const hash = q.product.sha256Canonical;
  return { bound, subjects, observations, observed: rows.length, mismatched, canonicalRoot: authority.canonicalRoot,
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
  const measured = { kind: 'qualification_recipe_execution_measurement', sandbox, uptimeBefore: before, uptimeAfter: after,
    elapsedMs, providerBashDefaultTimeoutMs: PROVIDER_BASH_DEFAULT_TIMEOUT_MS, exceedsProviderBashDefault: elapsedMs > PROVIDER_BASH_DEFAULT_TIMEOUT_MS,
    results, predicates, classification: 'Bound commands executed once outside C2 in a snapshot copy; a wall-time and outcome measurement, not an admitted observation' };
  await record('recipe-execution.json', measured);
  return measured;
}

/** The configuration without the provider version probe (preflight runs `<provider.command> --version` when the
 * provider is enabled): the prepare and reopen modes spawn no provider process. */
const withoutProviderProbe = config => ({ ...config, provider: { ...config.provider, enabled: false } });

export async function prepare(config, { executeRecipe: execute = false, dependencies }) {
  const archive = await newArchive(join(TENANT_ROOT, 'test_env/test_runs'), 'qualification'), root = archive.path;
  const record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
  const effective = { ...config, runId: archive.runId, bootstrapRoot: join(root, 'bootstrap/node_modules/@abiogenesis/typescript-tenant'),
    worksiteRoot: join(root, 'sandbox/worksite'), setupEnvironment: setupEnvironment(config) };
  const command = commandRecorder(root, { environment: effective.setupEnvironment, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxProcessOutputBytes ?? 16 * 1024 * 1024 });
  const mode = 'prepare';
  let caller, summary = { kind: 'qualification_' + mode, runId: archive.runId, archive: root, mode, status: 'incomplete', uptimeBefore: uptime() };
  await record('run.json', { timestamp: new Date().toISOString(), runId: archive.runId, sourceCommit: config.sourceCommit, mode,
    interpreter: { executable: config.nodePath, version: process.version }, configuration: redactedConfig(config), invokedCommand: process.argv,
    heapLimitBytes: (await import('node:v8')).getHeapStatistics().heap_size_limit,
    classification: 'Admission check of the exact qualification; no provider dispatch and no provider version probe' });
  try {
    const row = { key: 'qualification', toolchainObligations: { requiredExecutables: ['node'] } };
    const ready = await preflight(withoutProviderProbe(config), [row], root); await record('preflight.json', ready);
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
    // The admitted catalog (setup-identity.json records its basis digest only), for the modes that reopen this archive.
    await record('resources/catalog.json', caller.state.catalog);
    await record('setup-environment.json', { kind: 'qualification_setup_environment', runId: archive.runId, environment: effective.setupEnvironment,
      source: 'runner.mjs setupEnvironment: the configuration\'s inherited keys and its toolchainEnvironment', g4NpmKeys: Object.fromEntries(G4_KEYS.npm.map(key => [key, effective.setupEnvironment[key] ?? null])) });
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
    await record('qualification-programs.json', { allowlist, conformance, viewDigest: product.sha256Canonical(caller.state.catalogView),
      catalogDigest: product.sha256Canonical(caller.state.catalog), catalogBasisDigest: caller.state.catalog.basisDigest });
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

const shellQuote = value => "'" + String(value).replaceAll("'", "'\\''") + "'";

/** A prepared archive reopened into a new archive of its own: the caller over the sealed install, binding and close
 * handoff (as cold-reads); the retained catalog checked against its recorded digests and the qualification view narrowed
 * again from the recorded allowlist (installed-qualification-conservation.mjs restoreSetup); the resources and the C2
 * configuration re-derived from the tree and checked against the prepared records. */
async function reopenArchive(config, archivePath, mode, classification) {
  const archived = path => readJson(join(archivePath, path));
  const source = await archived('run.json'), prepared = await archived('summary.json');
  if (source.mode !== 'prepare' || prepared.status !== 'prepared') throw new TypeError('not a prepared archive: ' + archivePath);
  const setup = await archived('setup-identity.json'), closeHandoff = await archived('final-close-handoff.json');
  const programs = await archived('qualification-programs.json'), catalog = await archived('resources/catalog.json'), preparedRecord = await archived('prepare.json');
  const archive = await newArchive(join(TENANT_ROOT, 'test_env/test_runs'), 'qualification'), root = archive.path;
  const record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
  const effective = { ...config, runId: archive.runId, bootstrapRoot: join(archivePath, 'bootstrap/node_modules/@abiogenesis/typescript-tenant'),
    worksiteRoot: join(archivePath, 'sandbox/worksite'), setupEnvironment: setupEnvironment(config) };
  const command = commandRecorder(root, { environment: effective.setupEnvironment, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxProcessOutputBytes ?? 16 * 1024 * 1024 });
  await record('run.json', { timestamp: new Date().toISOString(), runId: archive.runId, sourceCommit: config.sourceCommit, mode, sourceArchive: archivePath,
    sourceRunId: source.runId, interpreter: { executable: process.execPath, version: process.version }, configuration: redactedConfig(config), invokedCommand: process.argv,
    heapLimitBytes: (await import('node:v8')).getHeapStatistics().heap_size_limit, classification });
  const runtime = await installedModules(effective.bootstrapRoot), manifest = await readJson(join(effective.bootstrapRoot, 'product-toolchain-manifest.json'));
  const native = await verifyArtifact(runtime, { artifactPath: config.package.archivePath, manifest, expectedArtifactDigest: config.package.sha256 }, record, 'abg');
  // The prepare run's actor: the workspace authority authorizes it alone (public-setup.mjs populateSandbox), and the C2
  // task's capability grant and the plan's owner actor bind it.
  const actorRef = setup.workspaceAuthority.authorizedActorRef;
  if (actorRef !== 'actor://abi5-tests/sandbox-uat/' + source.runId) throw new TypeError('the prepared workspace authority names another actor: ' + actorRef);
  const caller = publicCaller({ root, runtime, native, command, record, config: effective, actorRef }), hash = runtime.product.sha256Canonical;
  caller.state.binding = setup.workspaceBinding; caller.state.closeHandoff = closeHandoff; caller.state.resolvedLock = setup.resolvedLock;
  caller.installedRoot = setup.installations[0].installedRoot;
  const eventLog = fileURLToPath(closeHandoff.prefix.eventLogRef), identityBefore = await eventResourceIdentity(eventLog);
  const environment = caller.refresh();
  if (hash(catalog) !== programs.catalogDigest || catalog.basisDigest !== setup.catalog.basisDigest) throw new TypeError('the retained catalog differs from its recorded digests');
  caller.state.catalog = catalog; caller.state.catalogView = runtime.product.narrowGraphFunctionCatalog(catalog, programs.allowlist);
  if (hash(caller.state.catalogView) !== programs.viewDigest) throw new TypeError('the qualification view differs from the prepared view');
  const q = await installedExports(await packageRoot(caller.installedRoot));
  const resources = await constructResources(q, { install: setup.installations[0], verified: native.verified, binding: setup.workspaceBinding });
  const checks = { basis: preparedRecord.basis.digest === resources.basis.basisDigest, scope: preparedRecord.scope.digest === resources.scope.scopeDigest,
    inventory: preparedRecord.inventory.digest === resources.inventory.inventoryDigest, tenantManifest: preparedRecord.tenantManifest.digest === resources.tenant.manifestDigest };
  if (!Object.values(checks).every(Boolean)) throw new TypeError('the tree differs from the prepared resources: ' + JSON.stringify(checks));
  const recipeBytes = await readFile(join(TENANT_ROOT, RECIPE_PATH)), recipe = JSON.parse(recipeBytes.toString('utf8'));
  const declared = await readJson(join(TENANT_ROOT, Q, 'recipe/declared-commands.json'));
  const rows = await protectedInputs(recipeBytes, recipe, resources.inventory);
  const ambient = q.deep.actorProcess.selectedWorksiteCommandAmbientEnvironment();
  const c2 = await c2Configuration(q, environment, rows, declared, ambient);
  if (c2.mismatched.length > 0 || hash(c2.digests) !== hash(preparedRecord.recipe.digests)) throw new TypeError('the bound worksite differs from the prepared C2 configuration');
  await record('reopen.json', { kind: 'qualification_archive_reopen', sourceArchive: archivePath, sourceRunId: source.runId, eventLog, identityBefore,
    catalogDigest: programs.catalogDigest, viewDigest: programs.viewDigest, allowlist: programs.allowlist.length, checks, protectedInputs: rows.length,
    c2Digests: c2.digests, ambient: ambient.map(row => row.name) });
  return { archive, root, record, caller, q, setup, effective, eventLog, identityBefore, resources, recipe, declared, rows, ambient, c2, archivePath, native };
}

/** One reopen mode's body, sealed with its summary, the event log identity after it, and SEALED.json. */
async function sealed(r, mode, body) {
  let summary = { kind: 'qualification_' + mode, runId: r.archive.runId, archive: r.root, sourceArchive: r.archivePath, mode, status: 'incomplete', uptimeBefore: uptime() };
  try { summary = { ...summary, ...(await body()) }; }
  catch (error) { summary = { ...summary, status: 'failed', reason: String(error), stack: String(error?.stack ?? '').slice(0, 4000) }; await r.record('failure.json', summary); }
  finally {
    summary.uptimeAfter = uptime(); summary.identityAfter = await eventResourceIdentity(r.eventLog);
    summary.eventLogUnchanged = JSON.stringify(summary.identityAfter) === JSON.stringify(r.identityBefore);
    await r.record('summary.json', summary); await r.record('SEALED.json', { sealedAt: new Date().toISOString(), status: summary.status, archiveRoot: r.root, retained: true });
  }
  return summary;
}

/** G-4: the setup environment and the provider environment the in-process transport would receive in live mode
 * (runner.mjs workerEnvironment applied to process.env, then the installed transport contract's sanitization,
 * abg/transport_contracts.ts:367-384). The credential keys are left out of this computation by construction: their
 * names are recorded, their values never read. */
function providerEnvironmentEvidence(q, config, setup) {
  const keys = [...G4_KEYS.bash, ...G4_KEYS.npm], declared = config.provider.inheritEnvironment ?? [];
  const worker = workerEnvironment({ ...config, provider: { ...config.provider, inheritEnvironment: declared.filter(key => !CREDENTIAL_KEYS.includes(key)) } });
  const contract = q.abg.constructKnownWorkerTransportContract('claude', { command: config.provider.command });
  const handed = q.abg.sanitizeWorkerTransportEnvironment(contract, worker) ?? {};
  const row = env => Object.fromEntries(keys.map(key => [key, env[key] ?? null]));
  return { kind: 'qualification_provider_environment_evidence', setupEnvironment: { keys: Object.keys(setup).sort(), g4: row(setup) },
    providerEnvironment: { keys: Object.keys(handed).sort(), g4: row(handed), actorLimits: { ABG_TS_FP_TIMEOUT_MS: handed.ABG_TS_FP_TIMEOUT_MS ?? null,
      ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: handed.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS ?? null }, appendArgs: handed.ABG_TS_CLAUDE_APPEND_ARGS ?? null,
      command: handed.ABG_TS_CLAUDE_COMMAND ?? null, sanitizedPrefixes: contract.sanitizedEnvironmentPrefixes },
    credentialKeys: { declared: declared.filter(key => CREDENTIAL_KEYS.includes(key)), valuesRead: false },
    present: { bashLimitsInProviderEnvironment: G4_KEYS.bash.every(key => handed[key] !== undefined),
      npmKeysInSetupEnvironment: G4_KEYS.npm.every(key => setup[key] !== undefined), npmKeysInProviderEnvironment: G4_KEYS.npm.every(key => handed[key] !== undefined) },
    source: 'Bash limits: provider.inheritEnvironment, inherited from the driver process; npm keys: toolchainEnvironment through the setup environment' };
}

/** D5-c item 1: the chains (the inherited base, then one per commit after the Phase C close up to the head) grounded
 * by the installed attribution check: the inherited base alone, every chain alone over the members it constructed,
 * then all chains over the whole inventory (the qualification subject); the set's size and the process heap. */
function groundProvenance(q, resources, runId) {
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, hash = q.product.sha256Canonical;
  const git = args => execFileSync('git', ['-C', REPOSITORY_ROOT, ...args]).toString('utf8').trim();
  const head = git(['rev-parse', 'HEAD']), tenantStatus = git(['status', '--porcelain', '--', TENANT_PATH]);
  const started = performance.now(), commits = chainCommits(head);
  const constructed = constructChains(commits, policy.authorityRef), provenance = constructProvenance(q.product, { inventory: resources.inventory, ...constructed });
  const constructionMs = Math.round(performance.now() - started);
  const attribution = q.deep.qualification.projectExternalConstructionAttribution, plan = { ownerAuthorityRef: policy.authorityRef };
  const source = m => ({ ref: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount });
  const check = (selected, subjectMembers, form) => { const t = performance.now();
    const status = attribution({ task: { material: [], subjectMembers, context: { members: [] } }, raw: { attributions: establishedAttributions(selected, 'D5-c item 1 grounding') } },
      plan, form).status;
    return { status, ms: Math.round(performance.now() - t) }; };
  const perChain = provenance.chains.map((chain, n) => {
    const refs = new Set([chain.activationRef, chain.preimageRef, chain.deltaRef, chain.closureRef, ...chain.changes.flatMap(c => [c.preimageMemberRef, c.postimageMemberRef]).filter(Boolean)]);
    const records = provenance.records.filter(m => refs.has(m.ref)), s = constructed.chains[n];
    const alone = { ...provenance.embedded, records, recordSet: { ref: 'qualification-record-set://abiogenesis/construction/chain-' + n, digest: hash(records) }, chains: [chain] };
    return { index: n, kind: n === 0 ? 'inherited_base' : 'commit', commit: s.commit, parent: s.parent, authorRef: chain.authorRef, actorIdentityRef: chain.actorIdentityRef,
      postimageMembers: chain.postimageMembers.length, deleted: s.deleted.length, records: records.length, recordBytes: records.reduce((t, m) => t + m.byteCount, 0),
      ...check([chain], chain.postimageMembers.map(source), alone) };
  });
  const members = resources.inventory.members.map(source), currency = memberCurrency(provenance, members);
  const whole = check(provenance.chains, members, provenance.embedded), memory = process.memoryUsage();
  const records = provenance.records, inherited = perChain[0], activation = records.find(m => m.ref === provenance.chains[0].activationRef);
  const notCurrent = currency.filter(c => !c.current), byChain = {};
  for (const c of currency) byChain[c.chain ?? 'none'] = (byChain[c.chain ?? 'none'] ?? 0) + 1;
  const value = { kind: 'qualification_construction_provenance', runId, head, base: PHASE_C_CLOSE, tenantPath: TENANT_PATH, tenantClean: tenantStatus === '',
    tenantStatus: tenantStatus === '' ? [] : tenantStatus.split('\n'), recordSet: provenance.recordSet, chains: provenance.chains.length, commitChains: commits.length,
    records: records.length, recordBytes: records.reduce((t, m) => t + m.byteCount, 0), recordBase64Bytes: records.reduce((t, m) => t + m.contentBase64.length, 0),
    constructionMs, heapUsedBytes: memory.heapUsed, rssBytes: memory.rss, heapLimitBytes: null, held: true,
    inheritedBase: { ...inherited, authorRef: provenance.chains[0].authorRef, actorIdentityRef: provenance.chains[0].actorIdentityRef, authorityRef: provenance.chains[0].authorityRef,
      activation: { ref: activation.ref, digest: activation.digest, byteCount: activation.byteCount, ticketRows: phaseCCloseRows().map(row => row.line) },
      deltaBytes: records.find(m => m.ref === provenance.chains[0].deltaRef).byteCount, closureBytes: records.find(m => m.ref === provenance.chains[0].closureRef).byteCount },
    groundedAlone: perChain.filter(c => c.status === 'grounded').length, perChain,
    wholeInventory: { members: members.length, ...whole, current: currency.length - notCurrent.length, notCurrent: notCurrent.map(c => ({ ref: c.ref, chain: c.chain })),
      membersByConstructingChain: byChain },
    identities: [...new Set(provenance.chains.map(c => c.actorIdentityRef))].sort(),
    classification: 'Records read from Git with tenant pathspecs and the ticket rows by grep -n and sed -n (provenance.mjs); the attribution is the installed package\'s own check (validator/qualification.ts:743-805) with established attributions' };
  return { provenance, value };
}

/** The plan over the re-packed slots (assessment-plan.mjs) over the C2's two entries (execution: the execution entry the
 * coverage slot carries; verification: the verification material entry the REQ-P-QUAL-056 rule slots carry): the
 * material, the slot specifications, the resource manifest, the rule role packed per surface part, every slot rendered
 * and its construction attribution checked, then the plan over the admitted slots in their order. */
async function planOver(q, caller, resources, provenance, { execution, verification }, { onSlot } = {}) {
  const declarationProof = { kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: caller.state.catalog, catalogView: caller.state.catalogView };
  const base = await constructAssessmentMaterial(q, { ...resources, provenance, declarationProof, executionMaterial: execution, verificationMaterial: verification });
  const selection = await materialSelection(), specified = constructSlotSpecifications(q, base, selection);
  const built = acquireAssessmentResources(q, base, specified);
  const calibration = packRuleRole(q, built, specified, selection, { ownerActorRef: caller.actorRef });
  const projection = projectAssessment(q, built, specified, selection, { ownerActorRef: caller.actorRef, onSlot });
  const { plan, inputs } = constructPlan(q, built, projection.admitted.map(a => a.slot), caller.actorRef);
  return { base, selection, specified, built, calibration, projection, plan, inputs };
}

/** D5-c item 3, first half: the observed C2 task realized by the installed leaf over the prepared sandbox (its task and
 * launch manifests under the binding's archive root) and its helper command recorded with the setup environment. */
export async function helperRealize(config, archivePath) {
  const r = await reopenArchive(config, archivePath, 'helper-realize', 'D5-c item 3: the observed C2 task realized by the installed leaf in the prepared sandbox; the helper command recorded for the operator; no C call, no provider');
  return sealed(r, 'helper-realize', async () => {
    const { q, caller, record } = r, setup = r.effective.setupEnvironment;
    const { task, observed } = await observedC2Task(caller, q, r.c2, r.declared, r.ambient);
    const limits = { inactivityTimeoutMs: config.provider.inactivityTimeoutMs, absoluteTimeoutMs: config.provider.absoluteTimeoutMs };
    const realized = await realizeForMeasurement(q, task, { ...limits, id: r.archive.runId }), plan = realized.helperPlan;
    await record('c2-task.json', task);
    await record('helper-plan.json', { kind: 'qualification_helper_measurement_plan', runId: r.archive.runId, sourceArchive: archivePath,
      task: { ref: task.taskRef, digest: task.taskDigest }, observedTask: observed, limits, helperPlan: plan, launchPath: realized.launchPath,
      prompt: { byteCount: Buffer.byteLength(realized.prompt, 'utf8'), digest: sha256(Buffer.from(realized.prompt, 'utf8')) }, setupEnvironment: setup,
      operatorCommand: ['env', '-i', ...Object.entries(setup).map(([key, value]) => shellQuote(key + '=' + value)), '/bin/sh', '-c', shellQuote(plan.toolCommand)].join(' '),
      classification: 'A measurement: the helper command the C2 prompt hands its Worker, run once by the operator from a shell with the setup environment; never an admitted C2' });
    return { status: 'realized', task: { ref: task.taskRef, digest: task.taskDigest }, toolCommand: plan.toolCommand, artifactPath: plan.artifactPath };
  });
}

/** D5-c item 3, second half: the helper's artifact admitted by the installed owner, the observation and the verification
 * material by the installed constructors, the stand-in execution material (the observation under the envelope of an
 * observed C2 Result of the candidate), and one REQ-P-QUAL-056 rule slot and the coverage slot rendered with them. */
export async function executionMaterialMode(config, archivePath, { helperArchive, helperElapsedMs = null }) {
  const r = await reopenArchive(config, archivePath, 'execution-material', 'D5-c item 3, RP-1 P1: the helper artifact, the observation, the verification material, the stand-in execution entry and the verification material entry, and the two verification-bound slot classes rendered with them; a measurement, never an admitted C2');
  return sealed(r, 'execution-material', async () => {
    const { q, caller, record } = r, hash = q.product.sha256Canonical, json = value => Buffer.byteLength(q.product.canonicalJson(value));
    const helper = await readJson(join(helperArchive, 'helper-plan.json'));
    const { task } = await observedC2Task(caller, q, r.c2, r.declared, r.ambient);
    if (task.taskDigest !== helper.task.digest) throw new TypeError('the C2 task differs from the realized task');
    const helperPlan = q.product.worksiteCommandExecutionHelperPlan(task, helper.helperPlan.attemptRef);
    if (hash(helperPlan) !== hash(helper.helperPlan)) throw new TypeError('the helper plan differs from the realized plan');
    const measured = await constructMeasuredObservation(q, task, helperPlan);
    const envelope = await c2Envelope(join(config.archiveRoot, STAND_IN_ENVELOPE.run, 'resources/events/runtime.events.jsonl'), STAND_IN_ENVELOPE.cCallRef);
    const stand = executionMaterial(q, envelope, measured.observation, null);
    const recipeMember = r.resources.inventory.members.find(m => m.ref === r.resources.declaration.memberRefPrefix + RECIPE_PATH);
    const recipeBytes = await readFile(join(TENANT_ROOT, RECIPE_PATH));
    const recipe = { ref: recipeMember.ref, path: recipeMember.path, digest: recipeMember.digest, byteCount: recipeMember.byteCount, contentBase64: recipeBytes.toString('base64') };
    const executionSelectionRef = SELECTION_PREFIX + 'execution/c2', cCallRef = 'c-call://abiogenesis/t287/d5c/helper-measurement/' + r.archive.runId;
    const verification = verificationMaterial(q, { basis: r.resources.basis, inventory: r.resources.inventory, recipe,
      execution: { ref: stand.material.ref, digest: stand.parts.stateDigest }, cCall: { ref: cCallRef, digest: hash({ cCallRef }) }, observation: measured.observation, executionSelectionRef });
    const entry = verificationEntry(q, verification);
    await record('stand-in-material.json', stand.material); await record('verification-material.json', verification);
    // The two verification-bound slot classes, rendered by the installed renderer over the stand-in's entries.
    const policy = q.preparation.QUALIFICATION_ROLE_POLICY;
    const constructed = constructChains(chainCommits(execFileSync('git', ['-C', REPOSITORY_ROOT, 'rev-parse', 'HEAD']).toString('utf8').trim()), policy.authorityRef);
    const provenance = constructProvenance(q.product, { inventory: r.resources.inventory, ...constructed });
    const declarationProof = { kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: caller.state.catalog, catalogView: caller.state.catalogView };
    const base = await constructAssessmentMaterial(q, { ...r.resources, provenance, declarationProof, executionMaterial: stand.material, verificationMaterial: entry });
    const selection = await materialSelection(), specified = constructSlotSpecifications(q, base, selection), built = acquireAssessmentResources(q, base, specified);
    packRuleRole(q, built, specified, selection, { ownerActorRef: caller.actorRef });
    const render = spec => { const { inputs } = constructPlan(q, built, [spec], caller.actorRef);
      const prompt = Buffer.from(q.preparation.prepareQualificationAssessment(inputs[0], built.acquired).request.prompt, 'utf8');
      const carried = spec.role === 'rule' ? entry : stand.material;
      return { slotRef: inputs[0].task.slotRef, key: spec.key, criteria: spec.coverage.length, subjectMembers: spec.subjectRefs.length, materialMembers: spec.materialRefs.length,
        carriedEntry: carried === null ? null : { ref: carried.ref, digest: carried.digest, byteCount: carried.byteCount, renderedSourceDataBytes: renderedEntryBytes(carried) },
        promptBytes: prompt.length, promptDigest: sha256(prompt), overPromptBound: prompt.length > PROMPT_BOUND_BYTES, overExecutionClassBound: prompt.length > EXECUTION_CLASS_BOUND_BYTES,
        withoutExecutionMaterialBytes: prompt.length - (carried === null ? 0 : renderedEntryBytes(carried)) }; };
    const rule056 = specified.specs.find(s => s.role === 'rule' && s.execution), coverage = specified.specs.find(s => s.role === 'coverage');
    const slots = { rule056: render(rule056), coverage: render(coverage), rule056Slots: specified.specs.filter(s => s.role === 'rule' && s.execution).length };
    const findings = [slots.rule056, slots.coverage].filter(s => s.overExecutionClassBound).map(s => ({ slotRef: s.slotRef, promptBytes: s.promptBytes,
      finding: 'Product finding (owner question): the slot carries a C2 entry and exceeds the execution-material class bound of ' + EXECUTION_CLASS_BOUND_BYTES + ' bytes; recorded, not repaired' }));
    const value = { kind: 'qualification_execution_material_measurement', runId: r.archive.runId, sourceArchive: archivePath, helperArchive,
      task: { ref: task.taskRef, digest: task.taskDigest }, helperPlan: { attemptRef: helperPlan.attemptRef, toolCommand: helperPlan.toolCommand, artifactPath: helperPlan.artifactPath },
      helperElapsedMs, artifact: { ref: measured.artifact.artifactRef, digest: measured.artifact.artifactDigest, byteCount: measured.artifactBytes },
      observation: { ref: measured.observation.observationRef, digest: measured.observation.observationDigest, ...observationParts(q, measured.observation) },
      envelope: { run: STAND_IN_ENVELOPE.run, cCallRef: STAND_IN_ENVELOPE.cCallRef, observedValueBytes: envelope.observedValueBytes, evidenceRows: envelope.evidence.length },
      standIn: { ref: stand.material.ref, digest: stand.material.digest, byteCount: stand.material.byteCount, parts: stand.parts },
      verificationMaterial: verification === null ? null : { digest: hash(verification), byteCount: json(verification), keys: Object.keys(verification).sort() },
      verificationEntry: entry === null ? null : { ref: entry.ref, digest: entry.digest, byteCount: entry.byteCount, renderedSourceDataBytes: renderedEntryBytes(entry) },
      verificationExecutionRef: { resolvesTo: 'the execution selection\'s Result coordinate (selection.result.ref); its entry is the compact rendering of the C2 Result state (abg/qualification_proof.ts qualificationExecutionEntry: the Result coordinate, contract ref and result class, the judgment, the evidence by class and refs, and the observation\'s command outcomes by stream digest and length, parsed test summaries and product delta in place of the value); here the stand-in ref ' + stand.material.ref,
        materialBytes: stand.material.byteCount, wholeStateBytes: stand.parts.wholeStateBytes, valueBytes: stand.parts.valueBytes },
      bounds: { promptBoundBytes: PROMPT_BOUND_BYTES, executionClassBoundBytes: EXECUTION_CLASS_BOUND_BYTES }, slots, findings,
      classification: 'A measurement: the helper run by the operator from a shell, the observation constructed over a synthetic actor observation; never an admitted C2 (no C call, Result or event exists for it)' };
    await record('execution-material.json', value);
    return { status: 'measured', standInBytes: stand.material.byteCount, observationBytes: value.observation.totalBytes, rule056PromptBytes: slots.rule056.promptBytes,
      coveragePromptBytes: slots.coverage.promptBytes, findings: findings.length };
  });
}

/** The projection rows of the plan's slots from their final renders (the plan's own task ordinals), and the totals. */
function finalProjection(planned, finals) {
  const tokens = bytes => Math.ceil(bytes / PRICE.bytesPerToken), sum = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
  const rows = finals.map((final, n) => { const row = planned.projection.rows[n], inputTokens = tokens(final.promptBytes);
    if (row.slotRef !== final.slotRef) throw new TypeError('projection row order differs from the plan');
    return { ...row, onePlanPromptBytes: row.promptBytes, promptBytes: final.promptBytes, promptDigest: final.promptDigest, taskDigest: final.taskDigest, inputDigest: final.inputDigest,
      inputTokens, usd: Number((inputTokens * PRICE.inputUsdPerMillionTokens / 1e6 + row.outputTokens * PRICE.outputUsdPerMillionTokens / 1e6).toFixed(4)) }; });
  const byRole = Object.fromEntries(['catalog', 'inventory', 'rule', 'tenant', 'coverage'].map(role => { const xs = rows.filter(r => r.role === role);
    return [role, { slots: xs.length, criteria: sum(xs, r => r.criteria), promptBytes: sum(xs, r => r.promptBytes), inputTokens: sum(xs, r => r.inputTokens),
      outputTokens: sum(xs, r => r.outputTokens), usd: Number(sum(xs, r => r.usd).toFixed(2)), executionClassSlots: xs.filter(r => r.executionClass).length,
      maxPromptBytes: xs.length === 0 ? 0 : Math.max(...xs.map(r => r.promptBytes)), attributionNotGrounded: xs.filter(r => r.attribution.status !== 'grounded').length }]; }));
  return { rows, byRole, slots: rows.length, criteria: sum(rows, r => r.criteria), promptBytes: sum(rows, r => r.promptBytes), inputTokens: sum(rows, r => r.inputTokens),
    outputTokens: sum(rows, r => r.outputTokens), usd: Number(sum(rows, r => r.usd).toFixed(2)) };
}

/** D5-c item 5, the dry mode: every input of the dispatch path rendered and admitted in process, ending undispatched. */
export async function dryRun(config, archivePath, { executionArchive }) {
  const r = await reopenArchive(config, archivePath, 'dry', 'D5-c item 5 dry mode: provenance, the re-packed plan over the stand-in, every C call input admitted in process; ends undispatched before any provider spawn');
  return sealed(r, 'dry', async () => {
    const { q, caller, record, root } = r, hash = q.product.sha256Canonical, product = caller.runtime.product;
    // The no-spawn guards: a provider sentinel that marks any execution, and refusing transports.
    const sentinelRoot = join(root, 'sentinel'), sentinel = join(sentinelRoot, 'provider-sentinel.sh'), marker = join(sentinelRoot, 'executed');
    await mkdir(sentinelRoot, { recursive: true });
    await writeFile(sentinel, '#!/bin/sh\n: > ' + shellQuote(marker) + '\nexit 97\n', { flag: 'wx' }); await chmod(sentinel, 0o700);
    process.env.ABG_TS_CLAUDE_COMMAND = sentinel;
    const transports = { inProcess: 0, cli: 0 };
    caller.runtime = { ...caller.runtime, api: { ...caller.runtime.api, runInstalledDefinitionCallTransport: async () => { transports.inProcess += 1; throw new TypeError(DRY_REFUSAL); } } };
    caller.invoke = async () => { transports.cli += 1; throw new TypeError(DRY_REFUSAL); };
    const archivesRoot = join(archivePath, 'resources/archives');
    // Not transport archives: the helper's realized task (item 3) and the run environment's temporary root, which the
    // C2 start's preparation observes (dispatch.mjs runEnvironmentResources).
    const transportArchives = async () => (await readdir(archivesRoot)).filter(name => name !== 'worksite-command-execution' && name !== RUN_ENVIRONMENT_SUPPORT).sort();
    const transportBefore = await transportArchives();
    const g4 = providerEnvironmentEvidence(q, config, r.effective.setupEnvironment);
    await record('provider-environment.json', g4);
    // Item 1.
    const grounded = groundProvenance(q, r.resources, r.archive.runId);
    grounded.value.heapLimitBytes = (await import('node:v8')).getHeapStatistics().heap_size_limit;
    await record('provenance.json', grounded.value);
    // Item 3's stand-in and verification material.
    const executed = await readJson(join(executionArchive, 'execution-material.json'));
    const stand = await readJson(join(executionArchive, 'stand-in-material.json')), verification = await readJson(join(executionArchive, 'verification-material.json'));
    if (sha256(Buffer.from(stand.contentBase64, 'base64')) !== stand.digest || stand.digest !== executed.standIn.digest) throw new TypeError('the stand-in differs from its record');
    const entry = verificationEntry(q, verification);
    if (entry?.digest !== executed.verificationEntry?.digest) throw new TypeError('the verification material entry differs from its record');
    const admitted = [], cache = new Map();
    const admit = async (label, program, input, options = {}) => {
      const t = performance.now(), start = await startCall(caller, program, input, { ...options, label, cache });
      const owner = start.call === null ? null : await admitCall(caller, start.call);
      const row = { label, programRef: program.programRef, inputDigest: hash(input), inputAdmitted: start.inputAdmitted, startAdmitted: owner?.admitted ?? false,
        ownerKind: owner?.kind ?? null, ownerCode: owner?.code ?? null, ownerIssuePaths: owner?.issuePaths ?? null,
        invocation: start.call === null ? null : { ref: start.call.invocation.invocationRef, digest: start.call.invocation.invocationDigest }, ms: Math.round(performance.now() - t) };
      admitted.push(row);
      if (!label.startsWith('assess-') || admitted.filter(x => x.label.startsWith('assess-')).length <= 3 || admitted.length % 25 === 0)
        process.stderr.write(JSON.stringify({ admitted: admitted.length, label, ms: row.ms, inputAdmitted: row.inputAdmitted, startAdmitted: row.startAdmitted,
          code: row.ownerCode, issuePaths: row.ownerIssuePaths, heapUsed: process.memoryUsage().heapUsed }) + '\n');
      return { row, owner };
    };
    // The observed C2 start over the prepared worksite.
    const c2Task = await observedC2Task(caller, q, r.c2, r.declared, r.ambient);
    await admit('c2', PROGRAMS.c2, c2Task.task);
    // The plan over the stand-in; every slot rendered and its attribution checked.
    let rendered = 0;
    const planned = await planOver(q, caller, r.resources, grounded.provenance, { execution: stand, verification: entry }, { onSlot: () => { rendered += 1; } });
    const invoking = { ...planned.built.assertion, declarationProofs: [] };
    const finals = [];
    // Every program kind before the long assess@5 loop. The owner's acknowledgment request of every slot's provenance view (the ruling the fold requires when J's
    // attribution of that view is insufficient, abg/qualification_proof.ts:661-671).
    // One request per acknowledgment selection: F11 selects exactly one ruling_selection per provenance view.
    const views = new Map([...planned.built.provenanceEntries.values()].map(e => [e.coordinate.ref, e])), requested = new Set();
    for (const input of planned.inputs) {
      const entry = views.get(input.task.provenance.entry.ref);
      if (requested.has(entry.acknowledgmentSelectionRef)) continue;
      requested.add(entry.acknowledgmentSelectionRef);
      const request = acknowledgmentRequest(q, planned.plan, input.task.slotRef, entry.view);
      const { row } = await admit('ruling-' + String(requested.size - 1).padStart(4, '0'), PROGRAMS.ruling, request);
      Object.assign(row, { slotRef: input.task.slotRef, acknowledgmentSelectionRef: entry.acknowledgmentSelectionRef, request: { ref: request.requestRef, digest: request.requestDigest } });
    }
    // F11 and AF22 over placeholder selections (the judgments, the C2 Result and the F11 Result exist only after dispatch).
    const placeholder = label => ({ ref: 'result://abiogenesis/t287/d5c/placeholder/' + label, digest: hash({ placeholder: label }) });
    const judgmentSelections = planned.plan.slots.map((slot, n) => ({ kind: 'judgment_selection', selectionRef: SELECTION_PREFIX + 'judgment/' + n, slotRef: slot.slotRef,
      task: slot.task, programRef: PROGRAMS.assess.programRef, invocationAdmissionRef: 'invocation-admission://abiogenesis/t287/d5c/placeholder/judgment/' + n, result: placeholder('judgment/' + n) }));
    const executionSelection = { kind: 'execution_selection', selectionRef: SELECTION_PREFIX + 'execution/c2', slotRef: product.WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
      programRef: PROGRAMS.c2.programRef, invocationAdmissionRef: 'invocation-admission://abiogenesis/t287/d5c/placeholder/c2', result: { ref: stand.ref, digest: placeholder('c2').digest } };
    const prefix = caller.state.closeHandoff.prefix;
    const selfInput = selfConformanceInput(q, planned.built, { plan: planned.plan, proof: proofResource(planned.built, prefix, [...judgmentSelections, executionSelection]),
      executionSelectionRef: executionSelection.selectionRef });
    await admit('f11', PROGRAMS.selfConformance, selfInput, { qualificationResources: invoking });
    const selfSelection = { kind: 'self_conformance_selection', selectionRef: SELECTION_PREFIX + 'self-conformance', slotRef: 'node://abiogenesis/qualification/self-conformance@5',
      programRef: PROGRAMS.selfConformance.programRef, invocationAdmissionRef: 'invocation-admission://abiogenesis/t287/d5c/placeholder/f11', result: placeholder('f11') };
    const verdictInput = { kind: 'qualification_verdict_input', schemaVersion: '5.0.0', slotRef: 'node://abiogenesis/qualification/exact-candidate@5', basis: planned.built.basisValue,
      coverage: planned.built.law.coverage, selectionRef: selfSelection.selectionRef, proof: proofResource(planned.built, prefix, [selfSelection]),
      selfConformance: { subjectBasis: planned.built.subjectBasis, lawBasis: planned.built.lawBasis, assessment: selfSelection.result, disposition: 'blocked', bypassRefs: [], verification } };
    await admit('af22', PROGRAMS.verdict, verdictInput, { qualificationResources: invoking });
    // Every assess@5 start in plan order, its prompt rendered from the plan's own input and again from the owner's resources.
    for (const [n, input] of planned.inputs.entries()) {
      const prompt = Buffer.from(q.preparation.prepareQualificationAssessment(input, planned.built.acquired).request.prompt, 'utf8');
      const { row, owner } = await admit('assess-' + String(n).padStart(4, '0'), PROGRAMS.assess, input, { qualificationResources: invoking });
      const ownerPrompt = owner?.admitted ? Buffer.from(q.preparation.prepareQualificationAssessment(input, owner.owner.qualificationResources).request.prompt, 'utf8') : null;
      Object.assign(row, { slotRef: input.task.slotRef, taskDigest: input.task.taskDigest, promptBytes: prompt.length, promptDigest: sha256(prompt),
        ownerPromptEqual: ownerPrompt !== null && ownerPrompt.equals(prompt) });
      finals.push({ slotRef: input.task.slotRef, taskDigest: input.task.taskDigest, inputDigest: row.inputDigest, promptBytes: prompt.length, promptDigest: row.promptDigest });
    }
    // The projection over the final renders, and its time over the D3 natives' observed latency.
    const projection = finalProjection(planned, finals);
    const model = fitLatency(await d3Calls(config.archiveRoot));
    // The C2: the measured helper run (item 3) and the relay's provider share, modelled as one structured response over
    // the C2 prompt with 1,000 output tokens (an approximation; the C2 Worker's relay turns are not two-turn calls).
    const c2Prompt = executed.helperPlan === undefined ? null : await readJson(join(executed.helperArchive, 'helper-plan.json'));
    const c2ProviderMs = c2Prompt === null ? 0 : Math.max(0, model.interceptMs + model.perPromptByteMs * c2Prompt.prompt.byteCount + model.perOutputTokenMs * 1000);
    // The preparation each start pays in process before its provider spawn, as measured here (startCall and
    // ProductRunInvocationPort.prepare per assess@5 input): the mean measured start enters the projection.
    const starts = admitted.filter(row => row.label.startsWith('assess-')).map(row => row.ms);
    const time = projectTime(projection.rows, model, { c2Ms: executed.helperElapsedMs === null ? null : Math.round(executed.helperElapsedMs + c2ProviderMs),
      startMs: starts.length === 0 ? null : starts.reduce((n, ms) => n + ms, 0) / starts.length });
    time.c2 = { helperElapsedMs: executed.helperElapsedMs, providerShareMs: Math.round(c2ProviderMs), promptBytes: c2Prompt?.prompt.byteCount ?? null,
      basis: 'the measured helper wall time plus the latency model over the C2 prompt with 1,000 output tokens' };
    const irreducible = planned.projection.irreducible.map(({ slot, total, executionClass }) => ({ slotRef: 'slot://abiogenesis/typescript-tenant/qualification/' + slot.key, role: slot.role,
      criteria: slot.coverage.length, promptBytes: total, executionClass, finding: executionClass ? 'Product finding (owner question): over the execution-material class bound' : 'over the prompt bound with no lawful partition' }));
    await record('projection.json', { kind: 'qualification_assessment_projection', runId: r.archive.runId, writtenBeforeDispatch: true, price: PRICE,
      bounds: { promptBoundBytes: PROMPT_BOUND_BYTES, executionClassBoundBytes: EXECUTION_CLASS_BOUND_BYTES },
      method: 'Every slot of the plan rendered by the installed prepareQualificationAssessment from the plan\'s own input; the rule role packed per surface part (G-1; assessment-plan.mjs packRuleRole); a slot over the bound re-partitioned; input tokens = prompt bytes / 4; output by material-selection.json plan.outputModel; the verification-bound slots carry the item 3 stand-in\'s compact entries',
      resource: planned.built.resource, plan: { ref: planned.plan.planRef, digest: planned.plan.planDigest }, provenanceSelections: planned.built.provenanceEntries.size,
      standIn: { ref: stand.ref, digest: stand.digest, byteCount: stand.byteCount }, verificationEntry: entry === null ? null : { ref: entry.ref, digest: entry.digest, byteCount: entry.byteCount },
      specifications: planned.specified.specs.length, renderedDuringPartition: rendered,
      calibration: { keys: planned.calibration.length, minRoomBytes: Math.min(...planned.calibration.map(c => c.roomBytes)), negativeRoom: planned.calibration.filter(c => c.roomBytes <= 0).map(c => c.key) },
      slots: projection.slots, criteria: projection.criteria, byRole: projection.byRole,
      totals: { promptBytes: projection.promptBytes, inputTokens: projection.inputTokens, outputTokens: projection.outputTokens, usd: projection.usd },
      time: { ...time, model: { ...model, basis: 'least squares of the D3 two-turn provider calls\' wall duration on prompt bytes and output tokens (time-projection.mjs fitLatency); applied to a slot it is an extrapolation by time.extrapolation.ratio' } },
      tokenSensitivity: { assumedPromptBytesPerToken: PRICE.bytesPerToken, observedPromptBytesPerInputToken: model.observedPromptBytesPerInputToken.mean,
        usdAtObservedRatio: Number((projection.rows.reduce((s, row) => s + Math.ceil(row.promptBytes / model.observedPromptBytesPerInputToken.mean) * PRICE.inputUsdPerMillionTokens / 1e6
          + row.outputTokens * PRICE.outputUsdPerMillionTokens / 1e6, 0)).toFixed(2)),
        note: 'The activation prices input at 4 bytes per token; the D3 C-call prompts carried fewer bytes per input token' },
      ruleInputFloor: ruleInputFloor(q, planned.base, planned.selection), irreducible,
      attribution: Object.fromEntries(['grounded', 'insufficient', 'invalid'].map(s => [s, projection.rows.filter(row => row.attribution.status === s).length])), rows: projection.rows });
    // The undispatched proof.
    const transportAfter = await transportArchives(), identityAfter = await eventResourceIdentity(r.eventLog);
    const proof = { transports, sentinel: { path: sentinel, executed: existsSync(marker) },
      transportArchives: { before: transportBefore.length, after: transportAfter.length, unchanged: JSON.stringify(transportBefore) === JSON.stringify(transportAfter) },
      eventLog: { path: r.eventLog, before: r.identityBefore, after: identityAfter, unchanged: JSON.stringify(r.identityBefore) === JSON.stringify(identityAfter) } };
    proof.undispatched = proof.transports.inProcess === 0 && proof.transports.cli === 0 && !proof.sentinel.executed && proof.transportArchives.unchanged && proof.eventLog.unchanged;
    const refusedByContract = admitted.filter(row => !row.inputAdmitted), refusedStart = admitted.filter(row => row.inputAdmitted && !row.startAdmitted);
    // A refused C2, assess@5 or ruling start is not dispatch-ready; only the F11 and AF22 starts carry placeholders.
    const placeholderLabels = new Set(['f11', 'af22']), blockingStart = refusedStart.filter(row => !placeholderLabels.has(row.label));
    const assessMs = admitted.filter(row => row.programRef === PROGRAMS.assess.programRef).map(row => row.ms);
    const byProgram = Object.fromEntries(Object.values(PROGRAMS).map(p => { const xs = admitted.filter(row => row.programRef === p.programRef);
      return [p.programRef, { inputs: xs.length, inputAdmitted: xs.filter(row => row.inputAdmitted).length, startAdmitted: xs.filter(row => row.startAdmitted).length,
        ms: xs.reduce((n, row) => n + row.ms, 0), refusals: [...new Set(xs.filter(row => !row.startAdmitted).map(row => row.ownerKind + ':' + row.ownerCode))] }]; }));
    // Dispatch-ready is the live mode's own gate (liveRun: planOver stops on an irreducible slot): every input admitted
    // and every slot in the plan. The status is the dry mode's proof alone: it ended before any dispatch.
    const invalidAttributions = projection.rows.filter(row => row.attribution.status === 'invalid').map(row => row.slotRef);
    const dispatchReady = proof.undispatched && refusedByContract.length === 0 && blockingStart.length === 0 && irreducible.length === 0 && invalidAttributions.length === 0;
    const status = !proof.undispatched ? 'failed' : 'undispatched';
    const notReady = [...(refusedByContract.length > 0 ? ['inputs refused by their declared contract: ' + refusedByContract.map(row => row.label).join(', ')] : []),
      ...(blockingStart.length > 0 ? ['starts refused: ' + blockingStart.map(row => row.label + ' ' + row.ownerCode).join(', ')] : []),
      ...(irreducible.length > 0 ? [irreducible.length + ' slots outside the plan (' + irreducible.filter(x => x.executionClass).length +
        ' execution-class slots over ' + EXECUTION_CLASS_BOUND_BYTES + ' bytes: a Product finding, owner question); the live mode stops at its plan gate'] : []),
      ...(invalidAttributions.length > 0 ? [invalidAttributions.length + ' slots with an invalid construction attribution (a member no chain covers); the live mode stops at its gate'] : []),
      ...(proof.undispatched ? [] : ['the undispatched proof failed'])];
    await record('dry-run.json', { kind: 'qualification_dry_run', runId: r.archive.runId, status, sourceArchive: archivePath, executionArchive,
      plan: { ref: planned.plan.planRef, digest: planned.plan.planDigest, slots: planned.plan.slots.length }, resource: planned.built.resource,
      placeholders: 'The judgment selections, the C2 Result coordinate (named by the stand-in ref), the F11 Result and the AF22 summary disposition are placeholders: they exist only after dispatch',
      dispatchReady, notReady, byProgram, refusedByContract: refusedByContract.map(row => row.label),
      refusedStart: refusedStart.map(row => ({ label: row.label, kind: row.ownerKind, code: row.ownerCode, issuePaths: row.ownerIssuePaths, placeholderInput: placeholderLabels.has(row.label) })),
      assessPreparationMs: { calls: assessMs.length, total: assessMs.reduce((n, ms) => n + ms, 0), max: Math.max(0, ...assessMs),
        note: 'ProductRunInvocationPort.prepare per assess@5 start (the live mode pays it per call before the provider spawn)' },
      ownerPromptEqual: admitted.filter(row => row.ownerPromptEqual === true).length, inputsDigest: hash(admitted.map(row => row.inputDigest)),
      admitted, proof, g4: g4.present });
    await record('cost.json', { kind: 'qualification_run_cost', runId: r.archive.runId, providerCalls: 0, turns: 0, usd: 0, source: 'Dry mode: no transport call and no provider spawn (dry-run.json proof)' });
    return { status, dispatchReady, notReady,
      placeholderStartRefusals: refusedStart.filter(row => placeholderLabels.has(row.label)).map(row => row.label + ' ' + row.ownerCode),
      slots: projection.slots, usd: projection.usd, sequentialHours: time.sequentialHours, sequentialWithPreparationHours: time.sequentialWithPreparationHours, irreducible: irreducible.length, proof: { undispatched: proof.undispatched } };
  });
}

/** D5-c item 5, the live mode (authored; not run in D5-c): the provider version probe, the provenance, then
 * dispatch.mjs dispatchLive under the owner's explicit cap. */
export async function liveRun(config, archivePath, { capUsd, executionArchive }) {
  if (!(Number.isFinite(capUsd) && capUsd > 0)) throw new TypeError('live requires an explicit --cap-usd granted by the owner');
  if (!executionArchive) throw new TypeError('live requires --execution, the item 3 archive whose stand-in gates the plan before the C2 dispatch');
  const r = await reopenArchive(config, archivePath, 'live', 'D5-c item 5 live mode: the observed C2, the plan over its Result, assess@5 per slot, the owner acknowledgments, F11 and the sole AF22 verdict');
  return sealed(r, 'live', async () => {
    const { q, caller, record } = r;
    const ready = await preflight(config, [{ key: 'qualification', toolchainObligations: { requiredExecutables: ['node'] } }], r.root);
    await record('preflight.json', ready);
    if (ready.disposition !== 'ready') return { status: 'blocked', reason: 'Preflight obligations incomplete', issues: ready.issues };
    // G-4: both Bash limits reach the provider and each exceeds the C2 helper's closed execution budget.
    const budget = q.deep.c2.projectWorksiteCommandExecutionBudget({ commands: commandInput(r.declared), outcomePredicates: r.declared.outcomePredicates });
    const g4 = providerEnvironmentEvidence(q, config, r.effective.setupEnvironment);
    await record('provider-environment.json', g4);
    const short = G4_KEYS.bash.filter(key => !(Number(g4.providerEnvironment.g4[key]) > budget.requiredExecutionBudgetMs));
    if (short.length > 0 || !g4.present.npmKeysInProviderEnvironment) return { status: 'blocked', reason: 'G-4: ' + (short.length > 0 ? short.join(', ') +
      ' absent or not above the helper budget of ' + budget.requiredExecutionBudgetMs + ' ms' : 'the npm keys do not reach the provider environment') };
    const grounded = groundProvenance(q, r.resources, r.archive.runId);
    await record('provenance.json', grounded.value);
    const gatesOf = planned => { const invalid = planned.projection.rows.filter(row => row.attribution.status === 'invalid').length, irreducible = planned.projection.irreducible.length;
      const gates = { capUsd, projectedUsd: planned.projection.usd, invalidAttributions: invalid, irreducibleSlots: irreducible };
      return { gates, stop: planned.projection.usd > capUsd || invalid > 0 || irreducible > 0 }; };
    // The plan's gates over the measured stand-in, before the C2 dispatch spends a provider call.
    const stand = await readJson(join(executionArchive, 'stand-in-material.json'));
    const standEntry = verificationEntry(q, await readJson(join(executionArchive, 'verification-material.json')));
    const pre = await planOver(q, caller, r.resources, grounded.provenance, { execution: stand, verification: standEntry }), preGates = gatesOf(pre);
    await record('pre-dispatch-projection.json', { kind: 'qualification_assessment_projection', runId: r.archive.runId, standIn: { ref: stand.ref, digest: stand.digest, byteCount: stand.byteCount },
      plan: { ref: pre.plan.planRef, digest: pre.plan.planDigest }, byRole: pre.projection.byRole, usd: pre.projection.usd, gates: preGates.gates });
    if (preGates.stop) return { status: 'blocked', reason: 'a gate held the run before the C2 dispatch: ' + JSON.stringify(preGates.gates), dispatched: 0 };
    const c2Task = await observedC2Task(caller, q, r.c2, r.declared, r.ambient);
    let dispatched = 0;
    const ctx = { caller, q, config, record, c2Task: c2Task.task,
      applyProviderEnvironment: () => { Object.assign(process.env, workerEnvironment(config)); },
      // The C2 Result's two entries as F11's native join constructs them (abg/qualification_proof.ts
      // resolveQualificationExecutionMaterial): the execution entry, and the verification material over its observation.
      executionMaterialOf: async (c2Result, executionSelectionRef) => { const envelope = await c2Envelope(r.eventLog, c2Result.producer.cCallRef);
        const value = envelope.result.payload.value, member = r.resources.inventory.members.find(m => m.ref === r.resources.declaration.memberRefPrefix + RECIPE_PATH);
        const recipe = { ref: member.ref, path: member.path, digest: member.digest, byteCount: member.byteCount, contentBase64: (await readFile(join(TENANT_ROOT, RECIPE_PATH))).toString('base64') };
        const cCallRef = c2Result.producer.cCallRef, verification = verificationMaterial(q, { basis: r.resources.basis, inventory: r.resources.inventory, recipe,
          execution: c2Result.result, cCall: { ref: cCallRef, digest: cCallRef.slice('c-call:'.length) }, observation: value, executionSelectionRef });
        return { execution: executionMaterial(q, envelope, value, c2Result.result.ref).material, verification: verificationEntry(q, verification) }; },
      planOver: async entries => {
        const planned = await planOver(q, caller, r.resources, grounded.provenance, entries), { gates, stop } = gatesOf(planned);
        await record('projection.json', { kind: 'qualification_assessment_projection', runId: r.archive.runId, plan: { ref: planned.plan.planRef, digest: planned.plan.planDigest },
          resource: planned.built.resource, byRole: planned.projection.byRole, usd: planned.projection.usd, gates, rows: planned.projection.rows });
        return { ...planned, stop, gates, reason: stop ? 'a gate held the assessments: ' + JSON.stringify(gates) : null }; },
      guard: label => { dispatched += 1; if (dispatched > 1 + 4 * 2048) throw new TypeError('dispatch count exceeds the plan bound at ' + label); } };
    const result = await dispatchLive(ctx);
    await record('live.json', { kind: 'qualification_live_result', ...result, dispatched });
    return { status: result.status, reason: result.reason ?? null, dispatched };
  });
}

/** Cold reads of a dry or live archive: a fresh process reopens its prepared archive (reopen.json: the prepared records
 * re-derived), re-derives the construction record set from Git at the archived head and, for a dry archive, the plan
 * over the recorded stand-in, and compares them with the archive's records. */
async function coldReadsOfRun(config, runArchive) {
  const run = await readJson(join(runArchive, 'run.json'));
  const r = await reopenArchive(config, run.sourceArchive, 'cold-reads', 'Cold reads of the ' + run.mode + ' archive ' + runArchive + ' in a fresh process');
  return sealed(r, 'cold-reads', async () => {
    const { q, caller, record } = r, policy = q.preparation.QUALIFICATION_ROLE_POLICY;
    const archivedProvenance = await readJson(join(runArchive, 'provenance.json'));
    const constructed = constructChains(chainCommits(archivedProvenance.head), policy.authorityRef);
    const provenance = constructProvenance(q.product, { inventory: r.resources.inventory, ...constructed });
    const rows = [['constructionRecordSet', archivedProvenance.recordSet.digest, provenance.recordSet.digest],
      ['constructionChains', String(archivedProvenance.chains), String(provenance.chains.length)]];
    if (run.mode === 'dry') {
      const dry = await readJson(join(runArchive, 'dry-run.json')), stand = await readJson(join(dry.executionArchive, 'stand-in-material.json'));
      const entry = verificationEntry(q, await readJson(join(dry.executionArchive, 'verification-material.json')));
      const planned = await planOver(q, caller, r.resources, provenance, { execution: stand, verification: entry });
      rows.push(['resource', dry.resource.digest, planned.built.resource.digest], ['plan', dry.plan.digest, planned.plan.planDigest]);
    }
    const compared = rows.map(([name, archivedDigest, rederived]) => ({ name, archivedDigest, rederived, equal: archivedDigest === rederived }));
    const identityAfter = await eventResourceIdentity(r.eventLog), allEqual = compared.every(row => row.equal);
    await record('cold-reads.json', { kind: 'qualification_cold_reads', runArchive, mode: run.mode, sourceArchive: run.sourceArchive,
      process: { pid: process.pid, argv: process.argv, node: process.version }, reopenChecks: 'reopen.json: basis, scope, inventory, tenant manifest and the C2 configuration re-derived equal to prepare.json',
      rows: compared, eventLog: r.eventLog, identityBefore: r.identityBefore, identityAfter, identityUnchanged: JSON.stringify(r.identityBefore) === JSON.stringify(identityAfter), allEqual });
    return { status: allEqual ? 'equal' : 'differs', allEqual };
  });
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
  ];
  const comparedRows = rowsCompared.map(([name, archivedDigest, rederived]) => ({ name, archivedDigest, rederived, equal: archivedDigest === rederived }));
  const result = { kind: 'qualification_cold_reads', archive: archivePath, runId: run.runId, coldRoot: root,
    process: { pid: process.pid, argv: process.argv, node: process.version }, eventLog, identityBefore, identityAfter,
    identityUnchanged: JSON.stringify(identityBefore) === JSON.stringify(identityAfter), environmentKind: environment.kind,
    observedMismatches: c2.mismatched, scopeCorrespondenceErrors: resources.checks.scopeCorrespondenceErrors, basisReady: resources.checks.basisReady,
    rows: comparedRows, allEqual: comparedRows.every(row => row.equal) && c2.mismatched.length === 0 };
  await record('cold-reads.json', result);
  return result;
}

async function main(args = process.argv.slice(2)) {
  const [mode, ...rest] = args, options = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--execute-recipe' || rest[i] === '--dry') options[rest[i].slice(2)] = true;
    else if (['--config', '--archive', '--out', '--json', '--dependencies', '--helper', '--helper-elapsed-ms', '--execution', '--cap-usd'].includes(rest[i])) options[rest[i].slice(2)] = rest[++i];
    else throw new TypeError('Unknown argument: ' + rest[i]);
  }
  const usage = 'Usage: exact-candidate-qualification.mjs prepare --config FILE --dependencies DIR [--execute-recipe]\n' +
    '  | helper-realize --config FILE --archive PREPARED\n  | execution-material --config FILE --archive PREPARED --helper HELPER_ARCHIVE [--helper-elapsed-ms N]\n' +
    '  | live --dry --config FILE --archive PREPARED --execution EXECUTION_ARCHIVE\n  | live --config FILE --archive PREPARED --execution EXECUTION_ARCHIVE --cap-usd N\n' +
    '  | cold-reads --config FILE --archive ARCHIVE [--out NEW_ROOT --json OUTPUT (a prepared archive)]';
  if (!['prepare', 'helper-realize', 'execution-material', 'live', 'cold-reads'].includes(mode) || !options.config) throw new TypeError(usage);
  const config = await configuration(options.config), print = value => console.log(JSON.stringify(value));
  if (mode === 'prepare') {
    if (!options.dependencies) throw new TypeError('prepare requires --dependencies DIR (the locked dependency archives by file name)');
    const result = await prepare(config, { executeRecipe: options['execute-recipe'] === true, dependencies: resolve(options.dependencies) });
    print(result); return result.status === 'prepared' ? 0 : 1;
  }
  if (!options.archive) throw new TypeError(usage);
  const archive = resolve(options.archive);
  if (mode === 'cold-reads') {
    const run = await readJson(join(archive, 'run.json'));
    if (run.mode !== 'prepare') { const result = await coldReadsOfRun(config, archive); print(result); return result.allEqual ? 0 : 1; }
    const result = await coldReads(config, archive, resolve(options.out));
    await writeFile(resolve(options.json), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    print({ allEqual: result.allEqual, identityUnchanged: result.identityUnchanged }); return result.allEqual && result.identityUnchanged ? 0 : 1;
  }
  if (mode === 'helper-realize') { const result = await helperRealize(config, archive); print(result); return result.status === 'realized' ? 0 : 1; }
  if (mode === 'execution-material') {
    if (!options.helper) throw new TypeError(usage);
    const result = await executionMaterialMode(config, archive, { helperArchive: resolve(options.helper),
      helperElapsedMs: options['helper-elapsed-ms'] === undefined ? null : Number(options['helper-elapsed-ms']) });
    print(result); return result.status === 'measured' ? 0 : 1;
  }
  if (options.dry === true) {
    if (!options.execution) throw new TypeError(usage);
    const result = await dryRun(config, archive, { executionArchive: resolve(options.execution) });
    print(result); return result.status === 'undispatched' ? 0 : 1;
  }
  const result = await liveRun(config, archive, { capUsd: Number(options['cap-usd']), executionArchive: options.execution === undefined ? null : resolve(options.execution) });
  print(result); return result.status === 'qualified' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
