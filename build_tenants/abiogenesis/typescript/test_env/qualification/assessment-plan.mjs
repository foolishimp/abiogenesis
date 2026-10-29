// T-287 Phase D, D5-b items 2 and 4, D5-c items 1 and 2: the F11 assessment of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1 in reference form, and its projection before any dispatch.
//   resources   one qualification_resource_manifest: the inventory, the interned scope with its
//               application domains, the law, the tenant manifest, the coverage catalog, one construction
//               provenance per distinct slot subject (provenance.mjs taskProvenance: records as material
//               selections), the verification recipe and the material (law sources, the whole inventory's
//               bytes, typed manifests, records, and the observed C2's two compact entries when supplied)
//   slots       the five roles of QUALIFICATION_ROLE_POLICY, each criterion in exactly one slot
//               (sharedCoverage disjoint); the rule role per domain key (D5-b disposition G-1): the key's
//               members once per slot, the role sources and the classification, and the governing rule
//               groups' sources packed beside them under the bound, the key's pair criteria inside
//   projection  every slot's prompt rendered by the installed package's own renderer
//               (prepareQualificationAssessment) and measured against the bound; a slot over the bound is
//               re-partitioned; every slot's construction attribution checked by the installed check
//               (projectExternalConstructionAttribution) over its resolved provenance with established
//               attributions; the cost at the declared prices
// The verification-bound slots carry the compact material (RP-1 P1, design §QUAL-056 material selection): the coverage
// slot the C2 Result's execution entry, the rule slots of the group that governs REQ-P-QUAL-056 the verification
// material entry (the measured stand-in's entries before the C2 run, the C2 Result's after); never the C2's streams.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Q, RECIPE_PATH, TENANT_ROOT, constructApplicationDomains, constructApplications, sha256 } from './build-resources.mjs';
import { establishedAttributions, taskProvenance } from './provenance.mjs';

export const PROMPT_BOUND_BYTES = 1_048_576;
export const PROOF_COMPLEMENT_BOUND_BYTES = 1_300_000;
export const slotPromptBound = slot => slot.role === 'rule' && slot.key.startsWith('rule/complement/proof/')
  ? PROOF_COMPLEMENT_BOUND_BYTES : PROMPT_BOUND_BYTES;
export const PRICE = Object.freeze({ inputUsdPerMillionTokens: 5, outputUsdPerMillionTokens: 25, bytesPerToken: 4 });
export const PACKAGE_CAP_USD = 60;
/** The execution-material class bound (D5-b disposition G-3): a slot over 1,048,576 bytes only by the execution material it must carry enters the plan up to this bound; above it the slot is a Product finding. */
export const EXECUTION_CLASS_BOUND_BYTES = 3_500_000;
const PREFIX = 'qualification-surface-group://abiogenesis/typescript-tenant/';
const roleRef = name => 'qualification-role://abiogenesis/' + name + '@5';
const coord = (ref, digest) => ({ ref, digest });
const source = m => ({ ref: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount });
const material = (ref, path, bytes) => ({ ref, path, digest: sha256(bytes), byteCount: bytes.length, contentBase64: bytes.toString('base64') });
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const halves = xs => [xs.slice(0, Math.ceil(xs.length / 2)), xs.slice(Math.ceil(xs.length / 2))];

export async function materialSelection(root = TENANT_ROOT) { return readJson(join(root, Q, 'material-selection.json')); }


/** The domains, the applications and the material over one basis: the law sources (packaged bytes), the whole
 * inventory's bytes, the typed tenant manifest and coverage catalog, the construction records and, when supplied, the
 * observed C2's execution entry and verification material entry (the C2 Result's, or the measured stand-in's before
 * the C2 run). */
export async function constructAssessmentMaterial(q, { declaration, inventory, law, tenant, basis, scope, provenance, declarationProof, executionMaterial = null,
  verificationMaterial = null, sourceRoot = TENANT_ROOT }) {
  const hash = q.product.sha256Canonical;
  const typed = (ref, value) => material(ref, ref, Buffer.from(q.product.canonicalJson(value)));
  const normalized = q.deep.qualificationResources.normalizeQualificationScope(scope);
  const domains = constructApplicationDomains(declaration, { inventory, ruleGroups: scope.ruleGroups, surfaceGroups: scope.surfaceGroups });
  const applications = constructApplications(declaration, domains);
  const authority = [];
  for (const row of law.catalog.sources) {
    const bytes = await readFile(join(q.root, row.path));
    if (sha256(bytes) !== row.digest || bytes.length !== row.byteCount) throw new TypeError('packaged law source differs from the catalog: ' + row.ref);
    authority.push({ ...source(row), contentBase64: bytes.toString('base64') });
  }
  const members = [];
  for (const m of inventory.members) {
    const bytes = await readFile(join(sourceRoot, m.path.slice(declaration.memberPathPrefix.length)));
    if (sha256(bytes) !== m.digest || bytes.length !== m.byteCount) throw new TypeError('inventory member differs from its bytes: ' + m.ref);
    members.push({ ...source(m), contentBase64: bytes.toString('base64') });
  }
  const tenantMaterial = typed(tenant.manifestRef, tenant), coverageMaterial = typed(law.coverage.catalogRef, law.coverage);
  const recipe = members.find(m => m.ref === declaration.memberRefPrefix + RECIPE_PATH);
  const byRef = new Map();
  for (const m of [...authority, ...members, tenantMaterial, coverageMaterial, ...provenance.records, ...(executionMaterial === null ? [] : [executionMaterial]),
    ...(verificationMaterial === null ? [] : [verificationMaterial])]) {
    if (byRef.has(m.ref)) throw new TypeError('material ref names two entries: ' + m.ref);
    byRef.set(m.ref, m);
  }
  const declarationSelection = { catalogBasisDigest: declarationProof.catalog.basisDigest, readinessBasisDigest: declarationProof.catalog.readinessBasisDigest,
    viewDigest: declarationProof.catalogView.viewDigest, proofDigest: hash(declarationProof) };
  return { normalized, domains, applications, authority, members, byRef, tenantMaterial, coverageMaterial, recipe, executionMaterial, verificationMaterial, declarationSelection, declarationProof,
    basisValue: basis, subjectBasis: coord(basis.basisRef, basis.basisDigest), lawBasis: law.lawBasis, inventoryCoordinate: coord(inventory.inventoryRef, inventory.inventoryDigest),
    catalogCoordinate: coord(law.catalog.catalogRef, law.catalogDigest), scope, inventory, law, tenant, provenance, declaration };
}

/** The owner acknowledgment selection of one provenance view (a ruling_selection ref the live run selects only when J
 * returns an insufficient attribution and the owner acknowledges it). */
export const ACKNOWLEDGMENT_PREFIX = 'selection://abiogenesis/t287/qualification/acknowledgment/';

/** A slot subject set's key: its member refs in order. */
export const subjectKey = refs => sha256(Buffer.from(refs.join('\n')));

/** The resource manifest over the material and one construction provenance per distinct slot subject set (the subject of
 * every non-rule specification and the members of every rule domain key), and its acquisition. */
export function acquireAssessmentResources(q, base, specified) {
  const hash = q.product.sha256Canonical, identity = q.preparation.constructQualificationIdentity;
  const { inventory, tenant, law, normalized, recipe, byRef, subjectBasis, lawBasis, inventoryCoordinate, catalogCoordinate, declarationSelection, declarationProof } = base;
  const entries = [{ entryKind: 'inventory', coordinate: inventoryCoordinate, value: inventory },
    { entryKind: 'scope', coordinate: coord(normalized.scopeRef, normalized.scopeDigest), value: normalized },
    { entryKind: 'law', coordinate: lawBasis, value: law.law },
    { entryKind: 'tenant_manifest', coordinate: coord(tenant.manifestRef, tenant.manifestDigest), value: tenant },
    { entryKind: 'coverage_catalog', coordinate: law.coverageCatalog, value: law.coverage },
    { entryKind: 'verification_recipe', coordinate: coord(recipe.ref, recipe.digest), value: recipe }];
  const provenanceEntries = new Map(), sets = new Map();
  for (const refs of [...specified.specs.map(s => s.subjectRefs), ...specified.ruleKeys.map(k => k.memberRefs)]) sets.set(subjectKey(refs), refs);
  for (const [key, refs] of [...sets].sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) {
    const view = taskProvenance(q.product, base.provenance, refs, { acknowledgmentSelectionRef: ACKNOWLEDGMENT_PREFIX + key.slice(7) }), value = view.reference(), digest = hash(value);
    const coordinate = coord('qualification-provenance://abiogenesis/' + digest.slice(7), digest);
    provenanceEntries.set(key, { coordinate, view, acknowledgmentSelectionRef: view.embedded.acknowledgmentSelectionRef, recordSet: view.recordSet, chains: view.chains.length, records: view.records.length,
      spans: view.chains.reduce((n, c) => n + c.attributionSources.length, 0), subjectMembers: refs.length, unconstructed: view.unconstructed.length });
    entries.push({ entryKind: 'provenance', coordinate, value });
  }
  for (const m of byRef.values()) entries.push({ entryKind: 'material', coordinate: coord(m.ref, m.digest), value: m });
  const manifest = identity({ kind: 'qualification_resource_manifest', schemaVersion: '1', subjectBasis, lawBasis, catalog: catalogCoordinate,
    inventory: inventoryCoordinate, entries, declarationSelections: [declarationSelection] }, 'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const assertion = { kind: 'qualification_resource_assertion', schemaVersion: '1', manifests: [manifest], declarationProofs: [declarationProof] };
  const acquired = q.preparation.acquireQualificationResources(assertion);
  return { ...base, assertion, acquired, resource: coord(manifest.resourceRef, manifest.resourceDigest), provenanceEntries };
}

/** The non-rule roles' slot specifications and the rule role's domain keys (packed by packRuleRole once the resources are
 * acquired: its pack estimate calibrates against the installed renderer). */
export function constructSlotSpecifications(q, base, selection) {
  const { declaration, inventory, law, tenant, scope, domains, byRef, tenantMaterial, coverageMaterial } = base;
  const plan = selection.plan, members = new Map(inventory.members.map(m => [m.ref, m]));
  const sources = new Map(law.catalog.sources.map(s => [s.ref, s]));
  const roleSources = q.preparation.QUALIFICATION_ROLE_POLICY.authoritySourceRefs;
  const classificationRefs = declaration.surfaceGroups.sourceRefs;
  const memberRef = path => declaration.memberRefPrefix + path;
  const criteria = new Map(), criterion = (role, ruleRef, surfaceRef, evidenceRole) => {
    const list = criteria.get(role) ?? []; criteria.set(role, list);
    const row = { criterionRef: 'criterion://abiogenesis/typescript-tenant/qualification/' + role + '/' + list.length, ruleRef, surfaceRef, evidenceRole };
    list.push(row); return row;
  };
  const verificationGroups = new Set(scope.ruleGroups.filter(g => g.ruleRefs.some(ref => law.catalog.rules.find(r => r.ruleRef === ref)?.governedClaim === 'REQ-P-QUAL-056'))
    .map(g => g.groupRef));
  const specs = [];
  // A verification-bound slot's entry: the rule role's the verification material entry, the coverage role's the execution entry.
  const carried = role => role === 'rule' ? base.verificationMaterial : base.executionMaterial;
  const spec = (role, key, coverage, subjectRefs, materialRefs, execution = false) => { const subjects = [...new Set(subjectRefs)], entry = execution ? carried(role) : null;
    const s = { role, key, coverage, subjectRefs: subjects, execution, executionMissing: execution && entry === null, subjectKey: subjectKey(subjects),
      materialRefs: [...new Set([...roleSources, ...materialRefs, ...(entry === null ? [] : [entry.ref])])] };
    specs.push(s); return s; };
  const pack = (rows, size, limit) => { const out = []; let cur = [], bytes = 0;
    for (const row of rows) { const n = size(row); if (cur.length > 0 && bytes + n > limit) { out.push(cur); cur = []; bytes = 0; } cur.push(row); bytes += n; }
    if (cur.length > 0) out.push(cur); return out; };
  const sourceBytes = g => g.sourceRefs.reduce((s, ref) => s + sources.get(ref).byteCount, 0);

  // catalog: one criterion per rule group; the rule catalog member is the assessed subject (its rows of the
  // selected sources are rendered by the owner's selected subject); the slot carries the groups' sources.
  const catalogMember = memberRef('contracts/qualification/rule-catalog.json');
  for (const [n, groups] of pack(scope.ruleGroups, sourceBytes, plan.catalogPackSourceBytes).entries())
    spec('catalog', 'catalog/' + n, groups.map(g => criterion('catalog', g.groupRef, law.catalog.catalogRef, 'catalog_fidelity')), [catalogMember],
      groups.flatMap(g => g.sourceRefs));

  // inventory: both criteria of each global surface group, with complete member
  // metadata and declared representative bodies; packing retains the existing group bound.
  const groupBytes = g => g.memberRefs.reduce((s, ref) => s + members.get(ref).byteCount, 0);
  const fitting = scope.surfaceGroups.filter(g => groupBytes(g) <= plan.inventoryCarryBytes), over = scope.surfaceGroups.filter(g => groupBytes(g) > plan.inventoryCarryBytes);
  const inventoryCriteria = g => ['inventory_coverage', 'inventory_classification'].map(role => criterion('inventory', inventory.inventoryRef, g.groupRef, role));
  for (const [n, groups] of pack(fitting, groupBytes, plan.inventoryCarryBytes).entries())
    spec('inventory', 'inventory/' + n, groups.flatMap(inventoryCriteria), groups.flatMap(g => g.memberRefs), [...classificationRefs, ...groups.flatMap(g => g.sourceRefs)]);
  for (const g of over) spec('inventory', 'inventory/' + g.groupRef.slice(PREFIX.length), inventoryCriteria(g), g.memberRefs, [...classificationRefs, ...g.sourceRefs]);

  // rule: the domain keys. A key (a governed part, or a role's complement) names the same member set under every rule
  // group whose domain has it; its pairs are packed by packRuleRole.
  const ruleGroups = new Map(scope.ruleGroups.map(g => [g.groupRef, g])), byKey = new Map();
  for (const d of domains) for (const group of d.surfaceGroups) {
    const key = group.groupRef.slice(PREFIX.length).split('/').slice(2).join('/'), governed = d.governedRefs.includes(group.groupRef);
    const row = byKey.get(key) ?? { key, governed, memberRefs: group.memberRefs, carriedRefs: group.sourceRefs, pairs: [] };
    if (row.memberRefs.join('\n') !== group.memberRefs.join('\n') || row.governed !== governed || row.carriedRefs.join('\n') !== group.sourceRefs.join('\n')) throw new TypeError('a domain key names two member sets: ' + key);
    row.pairs.push({ ruleGroup: ruleGroups.get(d.ruleGroupRef), group }); byKey.set(key, row);
  }

  // tenant: the manifest's realization; coverage: every behavior of the published coverage catalog, with the
  // requirement sources its claims cite and the C2 Result's execution entry.
  spec('tenant', 'tenant', [criterion('tenant', tenant.manifestRef, tenant.manifestRef, 'tenant_realization')],
    [memberRef(Q + '/tenant-manifest.json')], [tenantMaterial.ref]);
  const claims = law.coverage.claims, coverageMember = memberRef('contracts/qualification/coverage.json');
  spec('coverage', 'coverage', claims.flatMap(c => c.behaviors.map(b => criterion('coverage', c.coverageRef, b, 'behavioral_coverage'))),
    [coverageMember], [coverageMaterial.ref, ...claims.flatMap(c => c.requirementRefs.map(ref => ref.split('#')[0]))], true);
  for (const s of specs) for (const ref of s.materialRefs) if (!byRef.has(ref)) throw new TypeError('slot material absent from the resource: ' + ref);
  return { specs, criteria, criterion, spec, ruleKeys: [...byKey.values()], verificationGroups: [...verificationGroups], classificationRefs,
    ruleGroupOf: ref => ruleGroups.get(ref), memberBytes: ref => members.get(ref)?.byteCount ?? null };
}

/** The rule role per domain key (D5-b disposition G-1, RP-2 Q20 selection). Each slot carries complete
 * member metadata and its declared representative bodies, the role sources and the classification,
 * and the governing rule groups packed beside them in catalog order while the estimated prompt stays under the bound
 * less plan.rulePackMarginBytes; the key's pair criteria inside. The rule group governing REQ-P-QUAL-056 is packed
 * alone per key, with the verification recipe and the verification material entry. The estimate is the key's base (the key
 * rendered once by the installed renderer with its first rule group, less that group's share) plus each group's
 * share: its source as rendered SOURCE DATA with its two coordinates, its catalog rows, its rule group, its criterion
 * and the key's domain group as the criterion's listing. projectAssessment renders every slot and halves a pack over the bound. */
export function packRuleRole(q, built, specified, selection, { ownerActorRef }) {
  const { law, scope, byRef, recipe } = built, product = q.product, plan = selection.plan;
  const roleSources = new Set(q.preparation.QUALIFICATION_ROLE_POLICY.authoritySourceRefs);
  const rows = new Map(scope.ruleGroups.map(g => { const refs = new Set(g.ruleRefs); return [g.groupRef, law.catalog.rules.filter(r => refs.has(r.ruleRef))]; }));
  const json = value => Buffer.byteLength(product.canonicalJson(value));
  const sourceShare = new Map();
  const share = p => { const g = p.ruleGroup; let n = 0;
    for (const ref of g.sourceRefs) if (!roleSources.has(ref)) {
      if (!sourceShare.has(ref)) { const m = byRef.get(ref);
        sourceShare.set(ref, Buffer.byteLength(JSON.stringify(Buffer.from(m.contentBase64, 'base64').toString('utf8'))) + 2 * json(source(m)) + ref.length + m.digest.length + 16); }
      n += sourceShare.get(ref); }
    return n + json(rows.get(g.groupRef)) + json(g) + json({ ruleGroupRef: g.groupRef, ...p.group }) + 320; };
  const verification = new Set(specified.verificationGroups), margin = plan.rulePackMarginBytes;
  const render = slot => { const { inputs } = constructPlan(q, built, [slot], ownerActorRef);
    return Buffer.byteLength(q.preparation.prepareQualificationAssessment(inputs[0], built.acquired).request.prompt, 'utf8'); };
  const calibration = [];
  for (const k of specified.ruleKeys) {
    const material = p => [...specified.classificationRefs, ...p.flatMap(x => x.ruleGroup.sourceRefs), ...k.carriedRefs];
    const ordinary = k.pairs.filter(p => !verification.has(p.ruleGroup.groupRef)), checks = k.pairs.filter(p => verification.has(p.ruleGroup.groupRef));
    const emit = (pairs, n, execution) => specified.spec('rule', 'rule/' + k.key + '/' + n,
      pairs.map(p => specified.criterion('rule', p.ruleGroup.groupRef, p.group.groupRef, 'semantic_assessment')), k.memberRefs,
      [...material(pairs), ...(execution ? [recipe.ref] : [])], execution);
    let n = 0;
    if (ordinary.length > 0) {
      const first = ordinary[0], probe = { role: 'rule', key: 'rule/' + k.key + '/calibration', subjectRefs: k.memberRefs, subjectKey: subjectKey(k.memberRefs),
        coverage: [{ criterionRef: 'criterion://abiogenesis/typescript-tenant/qualification/rule/calibration', ruleRef: first.ruleGroup.groupRef, surfaceRef: first.group.groupRef, evidenceRole: 'semantic_assessment' }],
        materialRefs: [...new Set([...roleSources, ...material([first])])] };
      const rendered = render(probe), base = rendered - share(first), room = PROMPT_BOUND_BYTES - margin - base;
      calibration.push({ key: k.key, governed: k.governed, members: k.memberRefs.length, carriedMembers: k.carriedRefs.length, probeBytes: rendered, baseBytes: base, roomBytes: room });
      let cur = [], bytes = 0;
      for (const p of ordinary) { const s = share(p);
        if (cur.length > 0 && bytes + s > room) { emit(cur, n++, false); cur = []; bytes = 0; }
        cur.push(p); bytes += s; }
      if (cur.length > 0) emit(cur, n++, false);
    }
    if (checks.length > 0) emit(checks, n++, true);
  }
  for (const s of specified.specs) for (const ref of s.materialRefs) if (!byRef.has(ref)) throw new TypeError('slot material absent from the resource: ' + ref);
  return calibration;
}

/** One task in reference form for a slot specification. */
export function constructTask(q, built, slot, ordinal) {
  const { resource, subjectBasis, lawBasis, inventoryCoordinate, catalogCoordinate, declarationSelection, provenanceEntries, byRef, inventory } = built;
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, identity = q.preparation.constructQualificationIdentity, hash = q.product.sha256Canonical;
  const selection = (entryKind, entry) => ({ kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry });
  const role = { roleRef: roleRef(slot.role), authorityRef: policy.authorityRef,
    sourceBindings: policy.authoritySourceRefs.map(ref => source(built.law.catalog.sources.find(s => s.ref === ref))),
    actorRef: policy.actorRefs[0], workerBindingRef: policy.workerBindingRef, rendererRef: policy.rendererRef,
    materializationPlanRef: policy.materializationPlanRef, independence: 'author_distinct' };
  const taskMaterial = slot.materialRefs.map(ref => byRef.get(ref));
  const contextMembers = taskMaterial.map(m => ({ memberRef: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount }));
  const contextRef = 'context://abiogenesis/typescript-tenant/qualification/' + slot.key;
  const members = new Map(inventory.members.map(m => [m.ref, m]));
  const provenance = provenanceEntries.get(slot.subjectKey);
  if (provenance === undefined) throw new TypeError('slot subject without a provenance entry: ' + slot.key);
  const task = identity({ kind: 'qualification_assessment_task', schemaVersion: '5.0.0', representation: 'resource_refs_v1', resource,
    slotRef: 'slot://abiogenesis/typescript-tenant/qualification/' + slot.key, taskOrdinal: ordinal, subjectBasis, lawBasis,
    catalog: catalogCoordinate, inventory: inventoryCoordinate, scope: selection('scope', coord(built.normalized.scopeRef, built.normalized.scopeDigest)), role,
    context: { contextRef, sourceLocator: 'material://abiogenesis/typescript-tenant/qualification', inventoryDigest: hash(contextMembers), members: contextMembers },
    declarations: [declarationSelection], assetSurface: { kind: 'qualification_assessment', requiredContexts: [contextRef],
      standardsRefs: [...policy.authoritySourceRefs], outputContractRefs: ['contract://abiogenesis/qualification/assessment-raw@5'],
      constructorRef: 'constructor://abiogenesis/typescript-tenant/qualification/assessment-plan', rendererRef: policy.rendererRef,
      proofObligationRefs: ['proof://abiogenesis/typescript-tenant/qualification/' + slot.role],
      authoritySlots: [{ authorityKindRef: policy.authorityRef, disposition: 'normal', fallbackPreconditionRefs: [] }] },
    material: taskMaterial.map(m => selection('material', coord(m.ref, m.digest))), subjectMembers: slot.subjectRefs.map(ref => source(members.get(ref))),
    coverage: slot.coverage, provenance: selection('provenance', provenance.coordinate), priorEvidenceRefs: [], residuals: [] },
    'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  return { task, role };
}

/** The plan over the admitted slots, and each slot's assessment input. */
export function constructPlan(q, built, slots, ownerActorRef) {
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, identity = q.preparation.constructQualificationIdentity;
  const tasks = slots.map((slot, n) => ({ slot, ...constructTask(q, built, slot, n) }));
  const plan = identity({ kind: 'qualification_assessment_plan', subjectBasis: built.subjectBasis, lawBasis: built.lawBasis,
    slots: tasks.map(({ slot, task, role }, n) => ({ slotRef: task.slotRef, task: coord(task.taskRef, task.taskDigest), taskOrdinal: n,
      graphFunctionRef: 'graph-function://abiogenesis/qualification/assess@5', programLocusRef: 'node://abiogenesis/qualification/assess@5', role, coverage: slot.coverage })),
    coverage: tasks.flatMap(({ slot }) => slot.coverage), sharedCoverage: 'disjoint', ownerAuthorityRef: policy.authorityRef, ownerActorRef },
    'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  return { plan, inputs: tasks.map(({ task }) => ({ kind: 'qualification_assessment_input', schemaVersion: '5.0.0', task, plan })) };
}

/** The installed attribution check over one slot's resolved provenance (the F11 path, abg/qualification_proof.ts:629-658),
 * with J's attributions established for every chain the task carries. */
export function slotAttribution(q, built, input) {
  const provenance = q.deep.qualificationResources.resolveQualificationAssessment(input, built.acquired).task.provenance;
  const judgment = { task: input.task, raw: { attributions: establishedAttributions(provenance.chains, 'established') } };
  const result = q.deep.qualification.projectExternalConstructionAttribution(judgment, input.plan, provenance);
  return { status: result.status, chains: provenance.chains.length, authors: result.authors, records: provenance.records.length,
    spans: provenance.chains.reduce((n, c) => n + c.attributionSources.length, 0), provenanceChains: provenance.chains };
}

/** The declared output model: each criterion and each chain attribution as canonical JSON with the declared reason length. */
function outputModel(q, slot, chains, selection) {
  const model = selection.plan.outputModel, reason = 'r'.repeat(model.reasonBytes);
  const rows = slot.coverage.map(c => ({ ...c, disposition: 'indeterminate', applicability: 'unknown', grouping: 'unknown', reason, sourceRefs: slot.materialRefs.slice(0, model.sourceRefsPerCriterion), evidenceRefs: [], residuals: [] }));
  const attributions = establishedAttributions(chains, reason);
  const bytes = Buffer.byteLength(q.product.canonicalJson({ kind: 'qualification_raw_judgment', schemaVersion: '5.0.0', criteria: rows, residuals: [], attributions }));
  return { bytes, attributionBytes: Buffer.byteLength(q.product.canonicalJson(attributions)) };
}

/** Render each slot with the installed renderer (a one-slot plan: the prompt renders the task, never the plan), check its
 * construction attribution with the installed check, re-partition a slot over the bound, and project the cost. A slot
 * that carries a C2 entry and stays over the bound after its partitions enters the plan up to
 * EXECUTION_CLASS_BOUND_BYTES (the execution-material class); above it, it is reported over its bound. */
export function projectAssessment(q, built, specified, selection, { ownerActorRef, onSlot = () => {} }) {
  const bound = PROMPT_BOUND_BYTES, admitted = [], irreducible = [];
  const render = slot => {
    const { inputs } = constructPlan(q, built, [slot], ownerActorRef);
    const prepared = q.preparation.prepareQualificationAssessment(inputs[0], built.acquired);
    const rendered = Buffer.byteLength(prepared.request.prompt, 'utf8');
    return { rendered, total: rendered, promptDigest: sha256(Buffer.from(prepared.request.prompt, 'utf8')), input: inputs[0] };
  };
  // Re-partition: a rule slot by halves of its rule groups, a catalog slot by halves of its criteria (each half keeps
  // the sources of its own groups and the role sources), a coverage slot by halves of its behaviors. An inventory
  // slot, or a slot of one rule group and one domain key, has no lawful smaller partition.
  const roleSources = q.preparation.QUALIFICATION_ROLE_POLICY.authoritySourceRefs;
  const keepSources = (slot, rules) => { const keep = new Set([...roleSources, ...rules.flatMap(ref => specified.ruleGroupOf(ref).sourceRefs)]);
    const all = new Set(slot.coverage.flatMap(c => specified.ruleGroupOf(c.ruleRef)?.sourceRefs ?? []));
    return slot.materialRefs.filter(ref => keep.has(ref) || !all.has(ref)); };
  const split = slot => {
    const rules = [...new Set(slot.coverage.map(c => c.ruleRef))];
    if ((slot.role === 'rule' || slot.role === 'catalog') && rules.length > 1)
      return halves(rules).map((set, n) => ({ ...slot, key: slot.key + '/' + 'ab'[n], coverage: slot.coverage.filter(c => set.includes(c.ruleRef)),
        materialRefs: keepSources(slot, set) }));
    // Every coverage part carries the same material: when one behavior alone is over the bound, no part fits.
    if (slot.role === 'coverage' && slot.coverage.length > 1 && render({ ...slot, coverage: slot.coverage.slice(0, 1) }).total <= bound)
      return halves(slot.coverage).map((coverage, n) => ({ ...slot, key: slot.key + '/' + 'ab'[n], coverage }));
    return null;
  };
  const queue = [...specified.specs];
  while (queue.length > 0) {
    const slot = queue.shift(), measured = render(slot), slotBound = slotPromptBound(slot);
    if (measured.total <= slotBound) { admitted.push({ slot, ...measured, executionClass: false }); onSlot(admitted.length, slot, measured); continue; }
    const parts = split(slot);
    if (parts !== null) { queue.unshift(...parts); continue; }
    if (slot.execution && !slot.executionMissing && measured.total <= EXECUTION_CLASS_BOUND_BYTES) { admitted.push({ slot, ...measured, executionClass: true }); onSlot(admitted.length, slot, measured); }
    else { irreducible.push({ slot, ...measured, executionClass: slot.execution }); onSlot(-1, slot, measured); }
  }
  const all = [...admitted, ...irreducible];
  const price = PRICE, tokens = bytes => Math.ceil(bytes / price.bytesPerToken);
  const rows = all.map(({ slot, rendered, total, promptDigest, input, executionClass }) => {
    const attribution = slotAttribution(q, built, input), output = outputModel(q, slot, attribution.provenanceChains, selection);
    const inputTokens = tokens(total), outputTokens = tokens(output.bytes);
    const providedMembers = slot.materialRefs.filter(ref => slot.subjectRefs.includes(ref)), sourceRefs = new Set(built.law.catalog.sources.map(x => x.ref));
    const bytesOf = refs => refs.reduce((n, ref) => n + built.byRef.get(ref).byteCount, 0);
    const limit = executionClass ? EXECUTION_CLASS_BOUND_BYTES : slotPromptBound(slot);
    return { slotRef: 'slot://abiogenesis/typescript-tenant/qualification/' + slot.key, role: slot.role, criteria: slot.coverage.length,
      ruleGroups: [...new Set(slot.coverage.map(c => c.ruleRef))].length, subjectMembers: slot.subjectRefs.length,
      providedMembers: providedMembers.length, unprovidedMembers: slot.subjectRefs.length - providedMembers.length,
      materialMembers: slot.materialRefs.length, providedMemberBytes: bytesOf(providedMembers),
      lawSourceBytes: bytesOf(slot.materialRefs.filter(ref => sourceRefs.has(ref))), execution: slot.execution, executionMissing: slot.executionMissing === true,
      executionMaterialBytes: slot.execution ? (slot.role === 'rule' ? built.verificationMaterial : built.executionMaterial)?.byteCount ?? 0 : 0,
      renderedPromptBytes: rendered, promptBytes: total, promptBoundBytes: limit, executionClass, overBound: total > limit, promptDigest,
      taskDigest: input.task.taskDigest, inputDigest: q.product.sha256Canonical(input),
      inputTokens, outputBytes: output.bytes, outputAttributionBytes: output.attributionBytes, outputTokens,
      usd: Number((inputTokens * price.inputUsdPerMillionTokens / 1e6 + outputTokens * price.outputUsdPerMillionTokens / 1e6).toFixed(4)),
      attribution: { status: attribution.status, chains: attribution.chains, records: attribution.records, spans: attribution.spans, authors: attribution.authors } };
  });
  const sum = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
  const byRole = Object.fromEntries(['catalog', 'inventory', 'rule', 'tenant', 'coverage'].map(role => { const xs = rows.filter(r => r.role === role);
    return [role, { slots: xs.length, criteria: sum(xs, r => r.criteria), promptBytes: sum(xs, r => r.promptBytes), inputTokens: sum(xs, r => r.inputTokens),
      outputTokens: sum(xs, r => r.outputTokens), usd: Number(sum(xs, r => r.usd).toFixed(2)), executionClassSlots: xs.filter(r => r.executionClass).length,
      overBoundSlots: xs.filter(r => r.overBound).length, attributionNotGrounded: xs.filter(r => r.attribution.status !== 'grounded').length }]; }));
  const usd = Number(sum(rows, r => r.usd).toFixed(2));
  return { admitted, irreducible, rows, byRole, usd, inputTokens: sum(rows, r => r.inputTokens), outputTokens: sum(rows, r => r.outputTokens),
    promptBytes: sum(rows, r => r.promptBytes) };
}

/** Conservative input floor for the declared representative selection: for each
 * indivisible domain key, its selected member bodies and every governing source
 * must occur at least once. Count their union once per key, not the omitted
 * bodies. Metadata, attribution, JSON framing and repeated sources add to it. */
export function ruleInputFloor(q, base) {
  const groups = new Map(base.scope.ruleGroups.map(g => [g.groupRef, g]));
  const fixed = [...q.preparation.QUALIFICATION_ROLE_POLICY.authoritySourceRefs, ...base.declaration.surfaceGroups.sourceRefs];
  const keys = new Map();
  for (const domain of base.domains) for (const group of domain.surfaceGroups) {
    const key = group.groupRef.slice(PREFIX.length).split('/').slice(2).join('/');
    const refs = keys.get(key) ?? new Set(fixed);
    for (const ref of [...group.sourceRefs, ...groups.get(domain.ruleGroupRef).sourceRefs]) refs.add(ref);
    keys.set(key, refs);
  }
  const rows = [...keys].map(([key, refs]) => ({ key, materialRefs: [...refs],
    bytes: [...refs].reduce((n, ref) => n + base.byRef.get(ref).byteCount, 0) }));
  const floorBytes = rows.reduce((n, row) => n + row.bytes, 0), inputTokens = Math.ceil(floorBytes / PRICE.bytesPerToken);
  return { kind: 'declared_material_union_floor', floorBytes, inputTokens,
    usd: Number((inputTokens * PRICE.inputUsdPerMillionTokens / 1e6).toFixed(2)), keys: rows };
}
