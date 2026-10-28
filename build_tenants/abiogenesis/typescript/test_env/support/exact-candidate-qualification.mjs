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
//   live        (D5-b) the admission check as prepare, the recipe executed once as
//               its measurement, then, before any dispatch: the construction
//               provenance over the Phase C and D chains (provenance.mjs), the
//               declared domains and applications, the assessment plan in
//               reference form with every slot's prompt rendered by the installed
//               renderer, and the projection (assessment-plan.mjs). Two gates hold
//               dispatch: a projection above the package cap, and a slot whose
//               construction attribution is invalid (a slot member no chain
//               constructed: the plan then resolves to no assessment,
//               abg/qualification_proof.ts:677-697). The dispatch of the observed C2
//               run and the slots, the owner rulings, F11 and AF22 are not authored:
//               in the D5-b run both gates held before any dispatch.
//   cold-reads  a fresh process re-derives the prepare records from the sealed
//               archive, the event log and the tenant's files, and, for a live
//               archive, the construction record set from Git.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { commandRecorder, configuration, eventResourceIdentity, exclusiveRecord, newArchive, preflight } from '../uat/runner.mjs';
import { BoundaryFailure, installedModules, populateSandbox, publicCaller, verifyArtifact } from '../uat/public-setup.mjs';
import { OUTPUTS, PROSPECTIVE_RELEASE_FIELDS, Q, RECIPE_PATH, TENANT_ROOT, classification, commandInput, constructInventory,
  constructScope, installedExports, lawAndCoverage, sha256, tenantManifest } from '../qualification/build-resources.mjs';
import { PHASE_C_CLOSE, TENANT_PATH, REPOSITORY_ROOT, chainCommits, chainCoverage, constructChains, constructProvenance } from '../qualification/provenance.mjs';
import { PACKAGE_CAP_USD, PRICE, acquireAssessmentResources, constructAssessmentMaterial, constructSlotSpecifications, materialSelection,
  projectAssessment, ruleInputFloor } from '../qualification/assessment-plan.mjs';

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

/** The observed C2 execution material's size before that run exists (D5-b item 4), estimated from this run's own
 * figures: the observed task (commands, predicates, write territories, every protected subject with its observation),
 * every command's streams as base64 (the measurement's byte counts), one worksite delta row per path the measurement
 * created in its snapshot copy (the rows the observation records, worksite_command_execution.ts:702-718), one
 * snapshot member per protected input, and a fixed allowance for the result, judgment and evidence envelopes. */
async function executionEstimate(q, c2, measurement, rows) {
  const task = Buffer.from(q.product.canonicalJson({ commands: c2.bound.commands, outcomePredicates: c2.bound.predicates,
    allowedWriteTerritories: c2.bound.allowedWriteTerritories, protectedObservations: c2.subjects.map((subject, n) => ({ subject, observation: c2.observations[n] })) }));
  const streams = measurement.results.reduce((n, r) => n + 4 * Math.ceil(r.stdout.byteLength / 3) + 4 * Math.ceil(r.stderr.byteLength / 3), 0);
  const protectedPaths = new Set(rows.map(row => row.relativePath)), digest = 'sha256:' + '0'.repeat(64);
  let deltaRows = 0, deltaBytes = 0;
  for (const entry of await readdir(measurement.sandbox, { recursive: true, withFileTypes: true })) {
    const path = relative(measurement.sandbox, join(entry.parentPath ?? entry.path, entry.name));
    if (protectedPaths.has(path)) continue;
    const after = { kind: 'worksite_path_observation', schemaVersion: '5.0.0', relativePath: path,
      nodeKind: entry.isDirectory() ? 'directory' : entry.isSymbolicLink() ? 'symlink' : 'file', digest, byteLength: entry.isFile() ? 0 : null, symlinkTarget: null };
    deltaBytes += Buffer.byteLength(JSON.stringify({ kind: 'worksite_path_delta', schemaVersion: '5.0.0', ordinal: deltaRows, changeKind: 'created',
      relativePath: path, before: null, after, matchedTerritoryRef: 'write-territory://abiogenesis/' + '0'.repeat(64) })) + 1;
    deltaRows += 1;
  }
  const snapshotBytes = rows.reduce((n, row) => n + Buffer.byteLength(JSON.stringify({ relativePath: row.relativePath, digest, byteLength: row.byteCount,
    observationRef: 'observation://abiogenesis/' + '0'.repeat(64) })) + 1, 0);
  const envelope = 65_536, estimatedBytes = task.length + streams + deltaBytes + snapshotBytes + envelope;
  return { kind: 'qualification_execution_material_estimate', estimatedBytes,
    jsonStringExpansion: Number((Buffer.byteLength(JSON.stringify(task.toString('utf8'))) / task.length).toFixed(4)),
    components: { observedTaskBytes: task.length, streamBase64Bytes: streams, worksiteDeltaRows: deltaRows, worksiteDeltaBytes: deltaBytes,
      snapshotMembers: rows.length, snapshotBytes, envelopeAllowanceBytes: envelope },
    basis: 'Estimated before the observed C2 run: this run\'s observed task, the recipe measurement\'s stream byte counts and created paths, one snapshot member per protected input; the delta and snapshot rows are modelled, not observed' };
}

/** D5-b items 2-4 before any dispatch: the construction provenance, the domains and applications, the plan's slots
 * rendered and projected, and the two gates that hold dispatch. */
async function preDispatch(q, { runId, record, resources, caller, c2, rows, measurement }) {
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, hash = q.product.sha256Canonical, git = args => execFileSync('git', ['-C', REPOSITORY_ROOT, ...args]).toString('utf8').trim();
  const head = git(['rev-parse', 'HEAD']), tenantStatus = git(['status', '--porcelain', '--', TENANT_PATH]);
  // Item 3: one chain per commit touching the tenant after the Phase C close, up to the head; each chain grounded
  // alone, then all chains over the members they constructed, then the whole inventory (the qualification subject).
  const started = performance.now(), commits = chainCommits(head);
  const chains = constructChains(commits, policy.authorityRef), provenance = constructProvenance(q.product, { inventory: resources.inventory, ...chains });
  const constructionMs = Math.round(performance.now() - started), memory = process.memoryUsage();
  const attribution = q.deep.qualification.projectExternalConstructionAttribution, plan = { ownerAuthorityRef: policy.authorityRef };
  const judgment = (selected, subjectMembers) => ({ task: { material: [], subjectMembers, context: { members: [] } }, raw: { attributions: selected.map(c => ({
    activationRef: c.activationRef, authorRef: c.authorRef, actorIdentityRef: c.actorIdentityRef, authorityRef: c.authorityRef, scopeRefs: c.scopeRefs,
    disposition: 'established', sourceRefs: [c.activationRef, c.preimageRef, c.deltaRef, c.closureRef], reason: 'D5-b item 3 in-process grounding' })) } });
  const source = m => ({ ref: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount });
  const perChain = provenance.chains.map((chain, n) => {
    const refs = new Set([chain.activationRef, chain.preimageRef, chain.deltaRef, chain.closureRef, ...chain.changes.flatMap(c => [c.preimageMemberRef, c.postimageMemberRef]).filter(Boolean)]);
    const records = provenance.records.filter(m => refs.has(m.ref));
    const alone = { ...provenance.embedded, records, recordSet: { ref: 'qualification-record-set://abiogenesis/construction/chain-' + n, digest: hash(records) }, chains: [chain] };
    const result = attribution(judgment([chain], chain.postimageMembers.map(source)), plan, alone);
    return { commit: chains.chains[n].commit, parent: chains.chains[n].parent, authorRef: chain.authorRef, actorIdentityRef: chain.actorIdentityRef,
      postimageMembers: chain.postimageMembers.length, deleted: chains.chains[n].deleted.length, records: records.length, status: result.status };
  });
  const members = resources.inventory.members.map(source), coverage = chainCoverage(provenance.chains, members.map(m => m.ref));
  const covered = members.filter(m => !coverage.uncovered.includes(m.ref));
  const allOverCovered = attribution(judgment(provenance.chains, covered), plan, provenance.embedded).status;
  const wholeInventory = attribution(judgment(provenance.chains, members), plan, provenance.embedded).status;
  const recordBytes = provenance.records.reduce((n, m) => n + m.byteCount, 0);
  const provenanceRecord = { kind: 'qualification_construction_provenance', runId, head, base: PHASE_C_CLOSE, baseExclusive: true, tenantPath: TENANT_PATH,
    tenantClean: tenantStatus === '', recordSet: provenance.recordSet, chains: provenance.chains.length, records: provenance.records.length, recordBytes,
    recordBase64Bytes: provenance.records.reduce((n, m) => n + m.contentBase64.length, 0), constructionMs, heapUsedBytes: memory.heapUsed, rssBytes: memory.rss,
    held: true, perChain, groundedAlone: perChain.filter(c => c.status === 'grounded').length, allChainsOverConstructedMembers: { members: covered.length, status: allOverCovered },
    wholeInventory: { members: coverage.subject, covered: coverage.covered, uncovered: coverage.uncovered.length, status: wholeInventory },
    uncoveredByRole: Object.fromEntries([...new Set(resources.inventory.members.map(m => m.surfaceRoles[0]))].sort().map(role => [role,
      resources.inventory.members.filter(m => m.surfaceRoles[0] === role && coverage.uncovered.includes(m.ref)).length])),
    identities: [...new Set(provenance.chains.map(c => c.actorIdentityRef))].sort(),
    classification: 'Records read from Git with tenant pathspecs (provenance.mjs); the attribution is the installed package\'s own projection (validator/qualification.ts:743)' };
  await record('provenance.json', provenanceRecord);

  // Item 4 (with item 2): the material, the domains and applications, the slots, the projection.
  const estimate = await executionEstimate(q, c2, measurement, rows);
  const declarationProof = { kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: caller.state.catalog, catalogView: caller.state.catalogView };
  const base = await constructAssessmentMaterial(q, { ...resources, provenance, declarationProof });
  const groupsOf = new Map(base.domains.map(d => [d.ruleGroupRef, new Set(d.surfaceGroups.map(g => g.groupRef))]));
  const appliedOf = new Map();
  for (const a of base.applications) appliedOf.set(a.ruleRef, [...(appliedOf.get(a.ruleRef) ?? []), a.surfaceRef]);
  const families = [...new Set(base.domains.map(d => d.familyId))];
  await record('applications.json', { kind: 'qualification_declared_applications', runId, scope: { ref: base.normalized.scopeRef, digest: base.normalized.scopeDigest },
    ruleGroups: base.domains.length, pairs: base.applications.length, d5GlobalPairs: 2660,
    applicable: base.applications.filter(a => a.applicability === 'applicable').length, inapplicable: base.applications.filter(a => a.applicability === 'inapplicable').length,
    unknown: base.applications.filter(a => a.applicability === 'unknown').length, applicationsDigest: hash(base.applications),
    everyDomainClassified: base.domains.every(d => { const applied = appliedOf.get(d.ruleGroupRef) ?? []; return applied.length === groupsOf.get(d.ruleGroupRef).size &&
      applied.every(ref => groupsOf.get(d.ruleGroupRef).has(ref)); }),
    scopeCorrespondenceErrors: resources.checks.scopeCorrespondenceErrors,
    families: families.map(id => { const ds = base.domains.filter(d => d.familyId === id); return { id, ruleGroups: ds.length,
      pairs: ds.reduce((n, d) => n + d.surfaceGroups.length, 0), applicable: ds.reduce((n, d) => n + d.governedRefs.length, 0) }; }) });
  const selection = await materialSelection(), specified = constructSlotSpecifications(q, base, selection, { executionEstimate: estimate });
  const built = acquireAssessmentResources(q, base, specified);
  let rendered = 0;
  const projection = projectAssessment(q, built, specified, selection, { ownerActorRef: caller.actorRef, onSlot: () => { rendered += 1; } });
  const invalid = projection.rows.filter(r => r.attribution.status === 'invalid');
  const overBound = projection.rows.filter(r => r.overBound);
  const admittedUsd = Number(projection.rows.filter(r => !r.overBound).reduce((n, r) => n + r.usd, 0).toFixed(2));
  const floor = ruleInputFloor(q, base, selection);
  const gates = { projection: { capUsd: PACKAGE_CAP_USD, projectedUsd: projection.usd, withinBoundUsd: admittedUsd, ruleInputFloorUsd: floor.usd, holds: projection.usd > PACKAGE_CAP_USD },
    attribution: { invalidSlots: invalid.length, slots: projection.rows.length, holds: invalid.length > 0 } };
  const projected = { kind: 'qualification_assessment_projection', runId, writtenBeforeDispatch: true, promptBoundBytes: 1_048_576, price: PRICE,
    method: 'Every slot rendered by the installed prepareQualificationAssessment (a one-slot plan: the prompt renders the task, never the plan); a slot over the bound re-partitioned (assessment-plan.mjs); input tokens = prompt bytes / 4; output by material-selection.json plan.outputModel; the slots that require the observed C2 execution material carry its estimate',
    resource: built.resource, provenanceSelections: built.provenanceEntries.size, executionEstimate: estimate, specifications: specified.specs.length,
    criteria: Object.fromEntries([...specified.criteria].map(([role, list]) => [role, list.length])), slots: projection.rows.length, renderedSlots: rendered,
    byRole: projection.byRole, totals: { promptBytes: projection.promptBytes, inputTokens: projection.inputTokens, outputTokens: projection.outputTokens, usd: projection.usd },
    ruleInputFloor: floor, overBound: overBound.map(r => ({ slotRef: r.slotRef, role: r.role, criteria: r.criteria, promptBytes: r.promptBytes, renderedPromptBytes: r.renderedPromptBytes,
      estimatedExecutionPromptBytes: r.estimatedExecutionPromptBytes })), gates, rows: projection.rows };
  await record('projection.json', projected);
  return { provenance: provenanceRecord, projection: projected, gates, stop: gates.projection.holds || gates.attribution.holds };
}

export async function prepare(config, { executeRecipe: execute = false, dependencies, live = false }) {
  const archive = await newArchive(join(TENANT_ROOT, 'test_env/test_runs'), 'qualification'), root = archive.path;
  const record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
  const effective = { ...config, runId: archive.runId, bootstrapRoot: join(root, 'bootstrap/node_modules/@abiogenesis/typescript-tenant'),
    worksiteRoot: join(root, 'sandbox/worksite'), setupEnvironment: setupEnvironment(config) };
  const command = commandRecorder(root, { environment: effective.setupEnvironment, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxProcessOutputBytes ?? 16 * 1024 * 1024 });
  const mode = live ? 'live' : 'prepare';
  let caller, summary = { kind: 'qualification_' + mode, runId: archive.runId, archive: root, mode, status: 'incomplete', uptimeBefore: uptime() };
  await record('run.json', { timestamp: new Date().toISOString(), runId: archive.runId, sourceCommit: config.sourceCommit, mode,
    interpreter: { executable: config.nodePath, version: process.version }, configuration: redactedConfig(config), invokedCommand: process.argv,
    heapLimitBytes: (await import('node:v8')).getHeapStatistics().heap_size_limit,
    classification: live ? 'The native qualification run (D5-b): admission, the recipe measurement, provenance, applications, plan and projection before any dispatch'
      : 'Admission check of the exact qualification; no provider dispatch' });
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
    const measurement = execute || live ? await executeRecipe(root, rows, c2.bound, declared, dependencies, record) : null;
    const green = Object.values(resources.checks).every(v => v === true || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v))) &&
      c2.mismatched.length === 0 && prepared.recipe.digestsEqualRecipe;
    if (!live || !green) return summary = { ...summary, status: green ? 'prepared' : 'refused', reason: green
      ? 'Clean Public install and binding; qualification programs viewed and conformant; resources constructed; no provider dispatch'
      : 'A prepared resource check failed (prepare.json)' };
    const held = await preDispatch(q, { runId: archive.runId, record, resources, caller, c2, rows, measurement });
    await record('cost.json', { kind: 'qualification_run_cost', runId: archive.runId, providerCalls: 0, turns: 0, usd: 0,
      source: 'No provider archive: no dispatch occurred (the gates held before the observed C2 run and every slot)' });
    if (!held.stop) return summary = { ...summary, status: 'undispatched', reason: 'The gates passed; the dispatch path is not authored in this driver' };
    return summary = { ...summary, status: 'stopped', reason: 'A gate held dispatch: ' + [held.gates.projection.holds ? 'projection ' + held.gates.projection.projectedUsd +
      ' USD above the ' + PACKAGE_CAP_USD + ' USD cap' : null, held.gates.attribution.holds ? held.gates.attribution.invalidSlots + ' of ' + held.gates.attribution.slots +
      ' slots with an invalid construction attribution' : null].filter(Boolean).join('; '), gates: held.gates,
      recipeMeasurement: { elapsedMs: measurement.elapsedMs, exitStatuses: measurement.results.map(r => r.exitStatus), predicates: measurement.predicates } };
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
  ];
  if (run.mode === 'live') {
    // The construction record set from Git at the archived head, and the declared applications over the re-derived scope.
    const archivedProvenance = await archived('provenance.json'), archivedApplications = await archived('applications.json');
    const chains = constructChains(chainCommits(archivedProvenance.head), q.preparation.QUALIFICATION_ROLE_POLICY.authorityRef);
    const provenance = constructProvenance(q.product, { inventory: resources.inventory, ...chains });
    const { constructApplicationDomains, constructApplications } = await import('../qualification/build-resources.mjs');
    const applications = constructApplications(resources.declaration, constructApplicationDomains(resources.declaration,
      { inventory: resources.inventory, ruleGroups: resources.scope.ruleGroups, surfaceGroups: resources.scope.surfaceGroups }));
    rowsCompared.push(['constructionRecordSet', archivedProvenance.recordSet.digest, provenance.recordSet.digest],
      ['constructionChains', String(archivedProvenance.chains), String(provenance.chains.length)],
      ['applications', archivedApplications.applicationsDigest, q.product.sha256Canonical(applications)]);
  }
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
    if (rest[i] === '--execute-recipe') options['execute-recipe'] = true;
    else if (['--config', '--archive', '--out', '--json', '--dependencies'].includes(rest[i])) options[rest[i].slice(2)] = rest[++i];
    else throw new TypeError('Unknown argument: ' + rest[i]);
  }
  if (!['prepare', 'live', 'cold-reads'].includes(mode) || !options.config) throw new TypeError(
    'Usage: exact-candidate-qualification.mjs prepare|live --config FILE --dependencies DIR [--execute-recipe] | cold-reads --config FILE --archive SEALED_ARCHIVE --out NEW_ROOT --json OUTPUT');
  const config = await configuration(options.config);
  if (mode === 'cold-reads') {
    const result = await coldReads(config, resolve(options.archive), resolve(options.out));
    await writeFile(resolve(options.json), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ allEqual: result.allEqual, identityUnchanged: result.identityUnchanged })); return result.allEqual && result.identityUnchanged ? 0 : 1;
  }
  if (!options.dependencies) throw new TypeError(mode + ' requires --dependencies DIR (the locked dependency archives by file name)');
  const result = await prepare(config, { executeRecipe: options['execute-recipe'] === true, dependencies: resolve(options.dependencies), live: mode === 'live' });
  console.log(JSON.stringify(result)); return result.status === 'prepared' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
