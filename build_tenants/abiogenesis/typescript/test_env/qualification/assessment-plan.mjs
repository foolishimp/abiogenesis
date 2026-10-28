// T-287 Phase D, D5-b items 2 and 4: the F11 assessment of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1 in reference form, and its projection before any dispatch.
//   resources   one qualification_resource_manifest: the inventory, the interned scope with its
//               application domains, the law, the tenant manifest, the coverage catalog, the
//               construction provenance (records as material selections), the verification recipe and
//               the material (law sources, the whole inventory's bytes, typed manifests, records)
//   slots       the five roles of QUALIFICATION_ROLE_POLICY, each criterion in exactly one slot
//               (sharedCoverage disjoint), with the material material-selection.json declares
//   projection  every slot's prompt rendered by the installed package's own renderer
//               (prepareQualificationAssessment) and measured against the bound; a slot over the bound is
//               re-partitioned; the cost at the declared prices; the attribution coverage of every slot
// The execution material of the observed C2 run does not exist before that run: the slots that require it
// (coverage, and the rule groups that govern REQ-P-QUAL-056) carry its estimate, marked as such.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Q, RECIPE_PATH, TENANT_ROOT, constructApplicationDomains, constructApplications, sha256 } from './build-resources.mjs';
import { chainCoverage, selectChains } from './provenance.mjs';

export const PROMPT_BOUND_BYTES = 1_048_576;
export const PRICE = Object.freeze({ inputUsdPerMillionTokens: 5, outputUsdPerMillionTokens: 25, bytesPerToken: 4 });
export const PACKAGE_CAP_USD = 60;
const PREFIX = 'qualification-surface-group://abiogenesis/typescript-tenant/';
const roleRef = name => 'qualification-role://abiogenesis/' + name + '@5';
const coord = (ref, digest) => ({ ref, digest });
const source = m => ({ ref: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount });
const material = (ref, path, bytes) => ({ ref, path, digest: sha256(bytes), byteCount: bytes.length, contentBase64: bytes.toString('base64') });
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const halves = xs => [xs.slice(0, Math.ceil(xs.length / 2)), xs.slice(Math.ceil(xs.length / 2))];

export async function materialSelection(root = TENANT_ROOT) { return readJson(join(root, Q, 'material-selection.json')); }

/** The domains, the applications and the material over one basis: the law sources (packaged bytes), the whole
 * inventory's bytes, the typed tenant manifest and coverage catalog, and the construction records. */
export async function constructAssessmentMaterial(q, { declaration, inventory, law, tenant, basis, scope, provenance, declarationProof, sourceRoot = TENANT_ROOT }) {
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
  for (const m of [...authority, ...members, tenantMaterial, coverageMaterial, ...provenance.records]) {
    if (byRef.has(m.ref)) throw new TypeError('material ref names two entries: ' + m.ref);
    byRef.set(m.ref, m);
  }
  const declarationSelection = { catalogBasisDigest: declarationProof.catalog.basisDigest, readinessBasisDigest: declarationProof.catalog.readinessBasisDigest,
    viewDigest: declarationProof.catalogView.viewDigest, proofDigest: hash(declarationProof) };
  return { normalized, domains, applications, authority, members, byRef, tenantMaterial, coverageMaterial, recipe, declarationSelection, declarationProof,
    subjectBasis: coord(basis.basisRef, basis.basisDigest), lawBasis: law.lawBasis, inventoryCoordinate: coord(inventory.inventoryRef, inventory.inventoryDigest),
    catalogCoordinate: coord(law.catalog.catalogRef, law.catalogDigest), scope, inventory, law, tenant, provenance, declaration };
}

/** The relevant chains of a subject set: those whose postimage scope meets it; a set no chain constructed carries the
 * chain of fewest postimage members (the schema requires one chain; the attribution is invalid either way). */
export function relevantChains(provenance, subjectRefs) {
  const subjects = new Set(subjectRefs), chains = provenance.chains;
  const hit = chains.map((c, n) => c.scopeRefs.some(ref => subjects.has(ref)) ? n : -1).filter(n => n >= 0);
  if (hit.length > 0) return hit;
  return [chains.reduce((best, c, n) => c.postimageMembers.length < chains[best].postimageMembers.length ? n : best, 0)];
}

/** The resource manifest over the material and every chain selection the slots name, and its acquisition. */
export function acquireAssessmentResources(q, base, specified) {
  const hash = q.product.sha256Canonical, identity = q.preparation.constructQualificationIdentity;
  const { inventory, tenant, law, normalized, recipe, byRef, subjectBasis, lawBasis, inventoryCoordinate, catalogCoordinate, declarationSelection, declarationProof } = base;
  const entries = [{ entryKind: 'inventory', coordinate: inventoryCoordinate, value: inventory },
    { entryKind: 'scope', coordinate: coord(normalized.scopeRef, normalized.scopeDigest), value: normalized },
    { entryKind: 'law', coordinate: lawBasis, value: law.law },
    { entryKind: 'tenant_manifest', coordinate: coord(tenant.manifestRef, tenant.manifestDigest), value: tenant },
    { entryKind: 'coverage_catalog', coordinate: law.coverageCatalog, value: law.coverage },
    { entryKind: 'verification_recipe', coordinate: coord(recipe.ref, recipe.digest), value: recipe }];
  const provenanceEntries = new Map();
  for (const key of [...new Set(specified.specs.map(s => s.chainKey))].sort()) {
    const selected = selectChains(q.product, base.provenance, key.split(',').map(Number)), value = selected.reference(), digest = hash(value);
    const coordinate = coord('qualification-provenance://abiogenesis/' + digest.slice(7), digest);
    provenanceEntries.set(key, { coordinate, recordSet: selected.recordSet, chains: selected.chains.length, records: selected.records.length });
    entries.push({ entryKind: 'provenance', coordinate, value });
  }
  for (const m of byRef.values()) entries.push({ entryKind: 'material', coordinate: coord(m.ref, m.digest), value: m });
  const manifest = identity({ kind: 'qualification_resource_manifest', schemaVersion: '1', subjectBasis, lawBasis, catalog: catalogCoordinate,
    inventory: inventoryCoordinate, entries, declarationSelections: [declarationSelection] }, 'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const assertion = { kind: 'qualification_resource_assertion', schemaVersion: '1', manifests: [manifest], declarationProofs: [declarationProof] };
  const acquired = q.preparation.acquireQualificationResources(assertion);
  return { ...base, assertion, acquired, resource: coord(manifest.resourceRef, manifest.resourceDigest), provenanceEntries };
}

/** Every criterion of the five roles, in a stable order, with its slot specification (before re-partition). */
export function constructSlotSpecifications(q, built, selection, { executionEstimate = null } = {}) {
  const { declaration, inventory, law, tenant, scope, domains, byRef, tenantMaterial, coverageMaterial, recipe } = built;
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
  const spec = (role, key, coverage, subjectRefs, materialRefs, execution = false) => { const subjects = [...new Set(subjectRefs)];
    specs.push({ role, key, coverage, subjectRefs: subjects, materialRefs: [...new Set([...roleSources, ...materialRefs])], execution,
      chainKey: relevantChains(built.provenance, subjects).join(',') }); };
  const pack = (rows, size, limit) => { const out = []; let cur = [], bytes = 0;
    for (const row of rows) { const n = size(row); if (cur.length > 0 && bytes + n > limit) { out.push(cur); cur = []; bytes = 0; } cur.push(row); bytes += n; }
    if (cur.length > 0) out.push(cur); return out; };
  const sourceBytes = g => g.sourceRefs.reduce((s, ref) => s + sources.get(ref).byteCount, 0);
  const carried = refs => refs.filter(ref => members.get(ref).byteCount <= plan.memberCarryBytes);

  // catalog: one criterion per rule group; the rule catalog member is the assessed subject (its rows of the
  // selected sources are rendered by the owner's selected subject); the slot carries the groups' sources.
  const catalogMember = memberRef('contracts/qualification/rule-catalog.json');
  for (const [n, groups] of pack(scope.ruleGroups, sourceBytes, plan.catalogPackSourceBytes).entries())
    spec('catalog', 'catalog/' + n, groups.map(g => criterion('catalog', g.groupRef, law.catalog.catalogRef, 'catalog_fidelity')), [catalogMember],
      groups.flatMap(g => g.sourceRefs));

  // inventory: both criteria of each global surface group; groups packed while their bytes fit the carry bound,
  // a group above it alone with its members' metadata only.
  const groupBytes = g => g.memberRefs.reduce((s, ref) => s + members.get(ref).byteCount, 0);
  const fitting = scope.surfaceGroups.filter(g => groupBytes(g) <= plan.inventoryCarryBytes), over = scope.surfaceGroups.filter(g => groupBytes(g) > plan.inventoryCarryBytes);
  const inventoryCriteria = g => ['inventory_coverage', 'inventory_classification'].map(role => criterion('inventory', inventory.inventoryRef, g.groupRef, role));
  for (const [n, groups] of pack(fitting, groupBytes, plan.inventoryCarryBytes).entries())
    spec('inventory', 'inventory/' + n, groups.flatMap(inventoryCriteria), groups.flatMap(g => g.memberRefs), [...classificationRefs, ...carried(groups.flatMap(g => g.memberRefs))]);
  for (const g of over) spec('inventory', 'inventory/' + g.groupRef.slice(PREFIX.length), inventoryCriteria(g), g.memberRefs, classificationRefs);

  // rule: for each domain group key (a governed part, or a role's complement: the same member set under every rule
  // group whose domain names the key, whatever its family), the rule groups naming it packed within what the key
  // leaves of the slot target; a pack's measure is its sources, its catalog rows and its pairs' member listings; a
  // rule group governing REQ-P-QUAL-056 alone (it carries the recipe and the execution material). A governed part
  // carries its members' bytes, a complement its members' metadata only.
  const ruleGroups = new Map(scope.ruleGroups.map(g => [g.groupRef, g])), byKey = new Map();
  const rowBytes = new Map(scope.ruleGroups.map(g => [g.groupRef, law.catalog.rules.filter(r => r.sourceRef === g.sourceRefs[0])
    .reduce((n, r) => n + Buffer.byteLength(JSON.stringify(r)), 0)]));
  for (const d of domains) for (const group of d.surfaceGroups) {
    const key = group.groupRef.slice(PREFIX.length).split('/').slice(2).join('/'), governed = d.governedRefs.includes(group.groupRef);
    const row = byKey.get(key) ?? { group, governed, pairs: [] };
    if (row.group.memberRefs.join('\n') !== group.memberRefs.join('\n') || row.governed !== governed) throw new TypeError('a domain key names two member sets: ' + key);
    row.pairs.push({ ruleGroup: ruleGroups.get(d.ruleGroupRef), group }); byKey.set(key, row);
  }
  for (const [key, { group, governed, pairs }] of byKey) {
    const carriedRefs = governed ? carried(group.memberRefs) : [], listing = plan.pairMemberListingBytes * group.memberRefs.length;
    const budget = Math.max(plan.minimumPackBytes, plan.ruleSlotTargetBytes - carriedRefs.reduce((n, ref) => n + members.get(ref).byteCount, 0) -
      plan.subjectMemberMetadataBytes * group.memberRefs.length);
    const measure = p => sourceBytes(p.ruleGroup) + rowBytes.get(p.ruleGroup.groupRef) + listing;
    const packs = [...pairs.filter(p => verificationGroups.has(p.ruleGroup.groupRef)).map(p => [p]),
      ...pack(pairs.filter(p => !verificationGroups.has(p.ruleGroup.groupRef)), measure, budget)];
    for (const [n, packPairs] of packs.entries()) {
      const execution = packPairs.some(p => verificationGroups.has(p.ruleGroup.groupRef));
      spec('rule', 'rule/' + key + '/' + n, packPairs.map(p => criterion('rule', p.ruleGroup.groupRef, p.group.groupRef, 'semantic_assessment')),
        group.memberRefs, [...classificationRefs, ...packPairs.flatMap(p => p.ruleGroup.sourceRefs), ...carriedRefs, ...(execution ? [recipe.ref] : [])], execution);
    }
  }

  // tenant: the manifest's realization; coverage: every behavior of the published coverage catalog, with the
  // requirement sources its claims cite and the execution material.
  spec('tenant', 'tenant', [criterion('tenant', tenant.manifestRef, tenant.manifestRef, 'tenant_realization')],
    [memberRef(Q + '/tenant-manifest.json')], [tenantMaterial.ref]);
  const claims = law.coverage.claims, coverageMember = memberRef('contracts/qualification/coverage.json');
  spec('coverage', 'coverage', claims.flatMap(c => c.behaviors.map(b => criterion('coverage', c.coverageRef, b, 'behavioral_coverage'))),
    [coverageMember], [coverageMaterial.ref, ...claims.flatMap(c => c.requirementRefs.map(ref => ref.split('#')[0]))], true);
  for (const s of specs) for (const ref of s.materialRefs) if (!byRef.has(ref)) throw new TypeError('slot material absent from the resource: ' + ref);
  return { specs, criteria, verificationGroups: [...verificationGroups], executionEstimate,
    ruleGroupOf: ref => ruleGroups.get(ref), memberBytes: ref => members.get(ref)?.byteCount ?? null };
}

/** One task in reference form for a slot specification. */
export function constructTask(q, built, slot, ordinal, { executionMaterialRef = null } = {}) {
  const { resource, subjectBasis, lawBasis, inventoryCoordinate, catalogCoordinate, declarationSelection, provenanceEntries, byRef, inventory } = built;
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, identity = q.preparation.constructQualificationIdentity, hash = q.product.sha256Canonical;
  const selection = (entryKind, entry) => ({ kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry });
  const role = { roleRef: roleRef(slot.role), authorityRef: policy.authorityRef,
    sourceBindings: policy.authoritySourceRefs.map(ref => source(built.law.catalog.sources.find(s => s.ref === ref))),
    actorRef: policy.actorRefs[0], workerBindingRef: policy.workerBindingRef, rendererRef: policy.rendererRef,
    materializationPlanRef: policy.materializationPlanRef, independence: 'author_distinct' };
  const taskMaterial = [...slot.materialRefs.map(ref => byRef.get(ref)), ...(executionMaterialRef === null ? [] : [executionMaterialRef])];
  const contextMembers = taskMaterial.map(m => ({ memberRef: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount }));
  const contextRef = 'context://abiogenesis/typescript-tenant/qualification/' + slot.key;
  const members = new Map(inventory.members.map(m => [m.ref, m]));
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
    coverage: slot.coverage, provenance: selection('provenance', provenanceEntries.get(slot.chainKey).coordinate), priorEvidenceRefs: [], residuals: [] },
    'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  return { task, role };
}

/** The plan over the admitted slots, and each slot's assessment input. */
export function constructPlan(q, built, slots, ownerActorRef, options = {}) {
  const policy = q.preparation.QUALIFICATION_ROLE_POLICY, identity = q.preparation.constructQualificationIdentity;
  const tasks = slots.map((slot, n) => ({ slot, ...constructTask(q, built, slot, n, options) }));
  const plan = identity({ kind: 'qualification_assessment_plan', subjectBasis: built.subjectBasis, lawBasis: built.lawBasis,
    slots: tasks.map(({ slot, task, role }, n) => ({ slotRef: task.slotRef, task: coord(task.taskRef, task.taskDigest), taskOrdinal: n,
      graphFunctionRef: 'graph-function://abiogenesis/qualification/assess@5', programLocusRef: 'node://abiogenesis/qualification/assess@5', role, coverage: slot.coverage })),
    coverage: tasks.flatMap(({ slot }) => slot.coverage), sharedCoverage: 'disjoint', ownerAuthorityRef: policy.authorityRef, ownerActorRef },
    'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  return { plan, inputs: tasks.map(({ task }) => ({ kind: 'qualification_assessment_input', schemaVersion: '5.0.0', task, plan })) };
}

/** The declared output model: each criterion and each chain attribution as canonical JSON with the declared reason length. */
function outputModel(q, built, slot, selection) {
  const model = selection.plan.outputModel, reason = 'r'.repeat(model.reasonBytes);
  const rows = slot.coverage.map(c => ({ ...c, disposition: 'indeterminate', applicability: 'unknown', grouping: 'unknown', reason, sourceRefs: slot.materialRefs.slice(0, model.sourceRefsPerCriterion), evidenceRefs: [], residuals: [] }));
  const attributions = slot.chainKey.split(',').map(n => built.provenance.chains[Number(n)]).map(c => ({ activationRef: c.activationRef, authorRef: c.authorRef, actorIdentityRef: c.actorIdentityRef,
    authorityRef: c.authorityRef, scopeRefs: c.scopeRefs, disposition: 'established', sourceRefs: [c.activationRef, c.preimageRef, c.deltaRef, c.closureRef], reason }));
  const bytes = Buffer.byteLength(q.product.canonicalJson({ kind: 'qualification_raw_judgment', schemaVersion: '5.0.0', criteria: rows, residuals: [], attributions }));
  return { bytes, attributionBytes: Buffer.byteLength(q.product.canonicalJson(attributions)) };
}

/** Render each slot with the installed renderer (a one-slot plan: the prompt renders the task, never the plan),
 * re-partition a slot over the bound, and project the cost. */
export function projectAssessment(q, built, specified, selection, { ownerActorRef, onSlot = () => {} }) {
  const bound = PROMPT_BOUND_BYTES, exec = specified.executionEstimate;
  // The estimated execution material's prompt share: its SOURCE DATA line (JSON string of its canonical JSON text), its
  // context member and its provided-body coordinate; the share is added to the rendered bytes of the slots that require it.
  const execPrompt = exec === null ? 0 : Math.ceil(exec.estimatedBytes * exec.jsonStringExpansion) + 1_024;
  const admitted = [], irreducible = [];
  const render = slot => {
    const { inputs } = constructPlan(q, built, [slot], ownerActorRef);
    const prepared = q.preparation.prepareQualificationAssessment(inputs[0], built.acquired);
    const rendered = Buffer.byteLength(prepared.request.prompt, 'utf8');
    return { rendered, promptDigest: sha256(Buffer.from(prepared.request.prompt, 'utf8')), total: rendered + (slot.execution ? execPrompt : 0) };
  };
  // Re-partition: a rule slot by halves of its rule groups, a catalog slot by halves of its criteria (each half keeps
  // the sources of its own groups and the role sources), a coverage slot by halves of its behaviors. An inventory
  // slot, or a slot of one rule group and one domain group, has no lawful smaller partition.
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
    const slot = queue.shift(), measured = render(slot);
    if (measured.total <= bound) { admitted.push({ slot, ...measured }); onSlot(admitted.length, slot, measured); continue; }
    const parts = split(slot);
    if (parts === null) { irreducible.push({ slot, ...measured }); onSlot(-1, slot, measured); } else queue.unshift(...parts);
  }
  const all = [...admitted, ...irreducible];
  const price = PRICE, tokens = bytes => Math.ceil(bytes / price.bytesPerToken);
  const rows = all.map(({ slot, rendered, total, promptDigest }) => {
    const output = outputModel(q, built, slot, selection), cover = chainCoverage(built.provenance.chains, slot.subjectRefs);
    const inputTokens = tokens(total), outputTokens = tokens(output.bytes);
    const providedMembers = slot.materialRefs.filter(ref => slot.subjectRefs.includes(ref)), sourceRefs = new Set(built.law.catalog.sources.map(x => x.ref));
    const bytesOf = refs => refs.reduce((n, ref) => n + built.byRef.get(ref).byteCount, 0);
    return { slotRef: 'slot://abiogenesis/typescript-tenant/qualification/' + slot.key, role: slot.role, criteria: slot.coverage.length,
      ruleGroups: [...new Set(slot.coverage.map(c => c.ruleRef))].length, subjectMembers: slot.subjectRefs.length,
      providedMembers: providedMembers.length, unprovidedMembers: slot.subjectRefs.length - providedMembers.length,
      materialMembers: slot.materialRefs.length + (slot.execution ? 1 : 0), providedMemberBytes: bytesOf(providedMembers),
      lawSourceBytes: bytesOf(slot.materialRefs.filter(ref => sourceRefs.has(ref))), chains: slot.chainKey.split(',').length, renderedPromptBytes: rendered,
      estimatedExecutionPromptBytes: slot.execution ? execPrompt : 0, promptBytes: total, overBound: total > bound, promptDigest,
      inputTokens, outputBytes: output.bytes, outputAttributionBytes: output.attributionBytes, outputTokens,
      usd: Number((inputTokens * price.inputUsdPerMillionTokens / 1e6 + outputTokens * price.outputUsdPerMillionTokens / 1e6).toFixed(4)),
      attribution: { subjectMembers: cover.subject, covered: cover.covered, uncovered: cover.uncovered.length, status: cover.uncovered.length === 0 ? 'coverable' : 'invalid' } };
  });
  const sum = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
  const byRole = Object.fromEntries(['catalog', 'inventory', 'rule', 'tenant', 'coverage'].map(role => { const xs = rows.filter(r => r.role === role);
    return [role, { slots: xs.length, criteria: sum(xs, r => r.criteria), promptBytes: sum(xs, r => r.promptBytes), inputTokens: sum(xs, r => r.inputTokens),
      outputTokens: sum(xs, r => r.outputTokens), usd: Number(sum(xs, r => r.usd).toFixed(2)), attributionInvalidSlots: xs.filter(r => r.attribution.status === 'invalid').length }]; }));
  const usd = Number(sum(rows, r => r.usd).toFixed(2));
  return { admitted, irreducible, rows, byRole, usd, inputTokens: sum(rows, r => r.inputTokens), outputTokens: sum(rows, r => r.outputTokens),
    promptBytes: sum(rows, r => r.promptBytes), executionPromptShare: execPrompt };
}

/** A floor of the rule role's input that no partition lowers, under this material selection (a governed pair carries
 * its members' bytes up to memberCarryBytes, every slot the role sources and the classification). For a surface role r
 * with carried bytes G(r) and governing rule sources S(r), every (member byte, source byte) pair must share a slot; a
 * slot carrying c member bytes and s source bytes within the room B left by the fixed material holds at most c*s
 * <= (c + s) * B / 4 such pairs, so the slots' input is at least the sum over r of max(4 * G(r) * S(r) / B, G(r)).
 * Catalog rows, criteria, metadata, attribution context, JSON escaping, output and the other roles add to it. */
export function ruleInputFloor(q, base, selection) {
  const sources = new Map(base.law.catalog.sources.map(s => [s.ref, s.byteCount])), groups = new Map(base.scope.ruleGroups.map(g => [g.groupRef, g]));
  const fixed = [...q.preparation.QUALIFICATION_ROLE_POLICY.authoritySourceRefs.map(ref => sources.get(ref)),
    ...base.declaration.surfaceGroups.sourceRefs.map(ref => base.inventory.members.find(m => m.ref === ref).byteCount)].reduce((a, b) => a + b, 0);
  const room = PROMPT_BOUND_BYTES - fixed, roles = new Map();
  for (const d of base.domains) {
    const sourceBytes = groups.get(d.ruleGroupRef).sourceRefs.reduce((n, ref) => n + sources.get(ref), 0);
    const governedRoles = new Set(d.surfaceGroups.filter(g => d.governedRefs.includes(g.groupRef)).flatMap(g => g.surfaceRoles));
    for (const role of governedRoles) roles.set(role, (roles.get(role) ?? 0) + sourceBytes);
  }
  const rows = [...roles].map(([role, sourceBytes]) => {
    const carriedBytes = base.inventory.members.filter(m => m.surfaceRoles.includes(role) && m.byteCount <= selection.plan.memberCarryBytes).reduce((n, m) => n + m.byteCount, 0);
    return { role, governingSourceBytes: sourceBytes, carriedBytes, pairBound: Math.ceil(4 * carriedBytes * sourceBytes / room) };
  });
  const floorBytes = rows.reduce((n, r) => n + Math.max(r.pairBound, r.carriedBytes), 0), tokens = Math.ceil(floorBytes / PRICE.bytesPerToken);
  return { roomBytes: room, floorBytes, inputTokens: tokens, usd: Number((tokens * PRICE.inputUsdPerMillionTokens / 1e6).toFixed(2)), roles: rows };
}
