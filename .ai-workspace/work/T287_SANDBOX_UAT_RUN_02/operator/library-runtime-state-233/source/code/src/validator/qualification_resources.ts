import * as v from "valibot";
import { sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { AbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import {
  QUALIFICATION_RESOURCE_ASSERTION_SCHEMA, QUALIFICATION_INTERNED_SCOPE_SCHEMA, QUALIFICATION_INVENTORY_SCHEMA,
  QUALIFICATION_MATERIAL_SCHEMA, QUALIFICATION_RESOURCE_PROVENANCE_SCHEMA, QUALIFICATION_LAW_BASIS_SCHEMA,
  TENANT_CONFORMANCE_MANIFEST_SCHEMA, QUALIFICATION_COVERAGE_CATALOG_SCHEMA, QUALIFICATION_VERIFICATION_RECIPE_SCHEMA,
  qualificationHash as hash, sameQualificationValue as same, qualificationIdentity as identity, qualificationIdentityDigest, constructQualificationIdentity,
  type QualificationResourceAssertion, type QualificationResourceManifest, type QualificationResourceSelection,
  type QualificationDeclarationSelection, type QualificationInternedScope, type QualificationReferenceSet,
  type QualificationCoordinate, type QualificationScope, type QualificationSubjectInventory, type QualificationMaterial,
  type QualificationAssessmentInput, type QualificationEmbeddedTask, type QualificationProofResource,
  type QualificationEmbeddedProofResource, type QualificationConstructionProvenance,
} from "./qualification_contracts.js";
import { SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA, type SelfConformanceInput, type SelfConformanceEmbeddedInput } from "./self_conformance_contracts.js";
const coord = (ref: string, digest: string): QualificationCoordinate => ({ ref, digest });
const unique = (xs: readonly unknown[]) => new Set(xs).size === xs.length;
export function isQualificationReferenceForm(value: unknown): value is { representation: "resource_refs_v1" } {
  return value !== null && typeof value === "object" && "representation" in value && value.representation === "resource_refs_v1";
}
function material(value: unknown): QualificationMaterial {
  if (!v.is(QUALIFICATION_MATERIAL_SCHEMA, value)) throw new TypeError("qualification_resource_material_shape");
  const bytes = Buffer.from(value.contentBase64, "base64");
  if (bytes.toString("base64") !== value.contentBase64 || bytes.length !== value.byteCount || sha256Bytes(bytes) !== value.digest)
    throw new TypeError("qualification_resource_material_bytes");
  return value;
}
/** Immutable operation dependency, acquired once at raw/cold ingress. Its maps
 * are private; neither this object nor a selected body supplies ABG authority. */
export class QualificationResources {
  readonly assertion: QualificationResourceAssertion;
  private readonly manifests = new Map<string, QualificationResourceManifest>();
  private readonly tables = new Map<string, Map<string, JsonValue>>();
  private readonly scopeViews = new Map<string, { scope: QualificationScope; normalized: QualificationInternedScope }>();
  private readonly assessmentViews = new Map<string, ResolvedQualificationAssessment>();
  private readonly provenanceViews = new Map<string, QualificationConstructionProvenance>();
  private readonly proofs: readonly AbgHistoricalDeclarationProof[];
  private readonly proofDigests = new Map<AbgHistoricalDeclarationProof, string>();
  constructor(assertion: unknown, additionalProofs: readonly AbgHistoricalDeclarationProof[] = []) {
    if (!v.is(QUALIFICATION_RESOURCE_ASSERTION_SCHEMA, assertion)) throw new TypeError("qualification_resource_assertion_shape");
    // Detach once. Subsequent handoffs borrow the resulting immutable bytes.
    this.assertion = deepFreeze(JSON.parse(JSON.stringify(assertion))) as QualificationResourceAssertion;
    this.proofs = Object.freeze([...this.assertion.declarationProofs, ...additionalProofs]);
    const proofKeys = this.proofs.map(p => [p.catalog.basisDigest, p.catalog.readinessBasisDigest, p.catalogView.viewDigest].join(":"));
    if (!unique(proofKeys)) throw new TypeError("qualification_declaration_ambiguous");
    for (const proof of this.proofs) this.proofDigests.set(proof, hash(proof));
    for (const m of this.assertion.manifests) {
      if (!identity(m, "resourceRef", "resourceDigest", "qualification-resource://abiogenesis/") || this.manifests.has(m.resourceRef))
        throw new TypeError("qualification_resource_identity_or_duplicate");
      const table = new Map<string, JsonValue>();
      for (const e of m.entries) {
        const key = e.entryKind + ":" + e.coordinate.ref;
        if (table.has(key)) throw new TypeError("qualification_resource_entry_ambiguous");
        this.validateEntry(e.entryKind, e.coordinate, e.value);
        table.set(key, e.value);
      }
      if (!unique(m.declarationSelections.map(hash))) throw new TypeError("qualification_declaration_selection_ambiguous");
      this.manifests.set(m.resourceRef, m); this.tables.set(m.resourceRef, table);
    }
    // Validate local references and inventories only after the complete finite table exists.
    for (const m of this.assertion.manifests) for (const e of m.entries) {
      if (e.entryKind === "scope") this.scope(this.selection(m, e.entryKind, e.coordinate));
      if (e.entryKind === "provenance") this.provenance(this.selection(m, e.entryKind, e.coordinate));
    }
  }
  private validateEntry(kind: QualificationResourceSelection["entryKind"], c: QualificationCoordinate, value: JsonValue): void {
    let id: QualificationCoordinate;
    switch (kind) {
      case "material": case "verification_recipe": {
        const m = material(value); id = coord(m.ref, m.digest);
        if (kind === "verification_recipe") v.parse(QUALIFICATION_VERIFICATION_RECIPE_SCHEMA, JSON.parse(Buffer.from(m.contentBase64, "base64").toString("utf8")));
        break;
      }
      case "inventory": {
        const i = v.parse(QUALIFICATION_INVENTORY_SCHEMA, value);
        if (!identity(i, "inventoryRef", "inventoryDigest", "qualification-inventory://abiogenesis/") || !unique(i.members.map(x => x.ref)) || !unique(i.members.map(x => x.path)) || !unique(i.selectedRoots) || i.selectedRoots.length === 0)
          throw new TypeError("qualification_inventory_identity_or_ambiguity");
        id = coord(i.inventoryRef, i.inventoryDigest); break;
      }
      case "scope": {
        const s = v.parse(QUALIFICATION_INTERNED_SCOPE_SCHEMA, value);
        if (!identity(s, "scopeRef", "scopeDigest", "qualification-scope://abiogenesis/")) throw new TypeError("qualification_scope_identity");
        id = coord(s.scopeRef, s.scopeDigest); break;
      }
      case "law": {
        const law = v.parse(QUALIFICATION_LAW_BASIS_SCHEMA, value);
        if (!identity(law, "lawBasisRef", "lawBasisDigest", "qualification-law://abiogenesis/")) throw new TypeError("qualification_law_identity");
        id = coord(law.lawBasisRef, law.lawBasisDigest); break;
      }
      case "tenant_manifest": {
        const t = v.parse(TENANT_CONFORMANCE_MANIFEST_SCHEMA, value);
        if (qualificationIdentityDigest(t, "manifestRef", "manifestDigest") !== t.manifestDigest) throw new TypeError("qualification_tenant_identity");
        id = coord(t.manifestRef, t.manifestDigest); break;
      }
      case "coverage_catalog": {
        const c = v.parse(QUALIFICATION_COVERAGE_CATALOG_SCHEMA, value);
        if (!identity(c, "catalogRef", "catalogDigest", "qualification-coverage://abiogenesis/")) throw new TypeError("qualification_coverage_identity");
        id = coord(c.catalogRef, c.catalogDigest); break;
      }
      case "provenance":
        v.parse(QUALIFICATION_RESOURCE_PROVENANCE_SCHEMA, value);
        id = coord("qualification-provenance://abiogenesis/" + hash(value).slice(7), hash(value)); break;
    }
    if (!same(id, c)) throw new TypeError("qualification_resource_entry_identity");
  }
  /** Complete views belong only to this explicit immutable acquisition. Raw
   * identity is rechecked by the calling owner; full dependencies are borrowed
   * across preparation/completion, never inferred from another invocation. */
  assessment(input: QualificationAssessmentInput, validate: (view: ResolvedQualificationAssessment) => void): ResolvedQualificationAssessment {
    const key = hash(input), known = this.assessmentViews.get(key);
    if (known !== undefined) return { ...known, input };
    const view = resolveQualificationAssessment(input, this);
    validate(view); deepFreeze(view.task);
    this.assessmentViews.set(key, Object.freeze(view)); return view;
  }
  selection(m: QualificationResourceManifest, entryKind: QualificationResourceSelection["entryKind"], entry: QualificationCoordinate): QualificationResourceSelection {
    return { kind: "qualification_resource_selection", schemaVersion: "1", resource: coord(m.resourceRef, m.resourceDigest), entryKind, entry };
  }
  manifest(c: QualificationCoordinate): QualificationResourceManifest {
    const m = this.manifests.get(c.ref);
    if (m === undefined || m.resourceDigest !== c.digest) throw new TypeError("qualification_resource_missing_or_crossed");
    return m;
  }
  value<T>(selection: QualificationResourceSelection, kind: QualificationResourceSelection["entryKind"]): T {
    const m = this.manifest(selection.resource);
    if (selection.entryKind !== kind) throw new TypeError("qualification_resource_wrong_kind");
    const e = m.entries.find(e => e.entryKind === kind && e.coordinate.ref === selection.entry.ref);
    if (e === undefined || e.coordinate.digest !== selection.entry.digest) throw new TypeError("qualification_resource_entry_missing_or_crossed");
    return this.tables.get(m.resourceRef)!.get(kind + ":" + selection.entry.ref) as T;
  }
  declarations(resource: QualificationCoordinate, selections: readonly QualificationDeclarationSelection[]): readonly AbgHistoricalDeclarationProof[] {
    const m = this.manifest(resource);
    if (!unique(selections.map(hash))) throw new TypeError("qualification_declaration_selection_ambiguous");
    return selections.map(s => {
      if (m.declarationSelections.filter(d => same(d, s)).length !== 1) throw new TypeError("qualification_declaration_selection_unbound");
      const matched = this.proofs.filter(p => p.catalog.basisDigest === s.catalogBasisDigest && p.catalog.readinessBasisDigest === s.readinessBasisDigest &&
        p.catalogView.viewDigest === s.viewDigest && p.catalogView.catalogBasisDigest === s.catalogBasisDigest && this.proofDigests.get(p) === s.proofDigest);
      if (matched.length !== 1) throw new TypeError("qualification_declaration_preimage_missing_or_crossed");
      return matched[0]!;
    });
  }
  scope(selection: QualificationResourceSelection): { scope: QualificationScope; normalized: QualificationInternedScope } {
    const normalized = this.value<QualificationInternedScope>(selection, "scope"), manifest = this.manifest(selection.resource);
    const key = manifest.resourceRef + ":" + selection.entry.ref, prior = this.scopeViews.get(key);
    if (prior !== undefined) return prior;
    if (!same(normalized.subjectBasis, manifest.subjectBasis) || !same(normalized.lawBasis, manifest.lawBasis) ||
        !same(normalized.catalog, manifest.catalog) || !same(normalized.inventory, manifest.inventory)) throw new TypeError("qualification_scope_resource_basis");
    const inventory = this.value<QualificationSubjectInventory>(this.selection(manifest, "inventory", normalized.inventory), "inventory");
    const sets = new Map<string, { set: QualificationReferenceSet; values: string[] }>();
    for (const set of normalized.referenceSets) {
      if (!identity(set, "setRef", "setDigest", "qualification-set://abiogenesis/") || sets.has(set.setRef) || !unique(set.values))
        throw new TypeError("qualification_scope_set_identity_or_ambiguity");
      if (set.encoding === "member_ordinals" && (!same(set.inventory, normalized.inventory) || set.values.some(n => !Number.isSafeInteger(n) || n < 0 || n >= inventory.members.length)))
        throw new TypeError("qualification_scope_set_inventory_or_ordinal");
      const values = set.encoding === "member_ordinals" ? set.values.map(n => inventory.members[n]!.ref) : set.values;
      if (set.elementKind === "surfaceRoles" && values.some(x => !["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"].includes(x)))
        throw new TypeError("qualification_scope_role_set");
      sets.set(set.setRef, { set, values });
    }
    const lookup = (c: QualificationCoordinate, kind: QualificationReferenceSet["elementKind"]) => {
      const s = sets.get(c.ref);
      if (s === undefined || s.set.setDigest !== c.digest || s.set.elementKind !== kind) throw new TypeError("qualification_scope_set_missing_or_crossed");
      return s.values;
    };
    const groups = (gs: QualificationInternedScope["surfaceGroups"]): QualificationScope["surfaceGroups"] => gs.map(g => ({ groupRef: g.groupRef,
      memberRefs: lookup(g.memberSet, "memberRefs"), rootRefs: lookup(g.rootSet, "rootRefs"),
      surfaceRoles: lookup(g.roleSet, "surfaceRoles") as QualificationScope["surfaceGroups"][number]["surfaceRoles"],
      ownerRefs: lookup(g.ownerSet, "ownerRefs"), sourceRefs: lookup(g.sourceSet, "sourceRefs") }));
    // Only small group views are allocated; repeated sets and inventory bodies are borrowed.
    const scope: QualificationScope = { kind: "qualification_scope", scopeRef: normalized.scopeRef, scopeDigest: normalized.scopeDigest,
      subjectBasis: normalized.subjectBasis, lawBasis: normalized.lawBasis, catalog: normalized.catalog, inventory,
      ruleGroups: normalized.ruleGroups, surfaceGroups: groups(normalized.surfaceGroups),
      ...(normalized.domainMode === "global" ? {} : { applicationDomains: normalized.applicationDomains.map(d => ({ ruleGroupRef: d.ruleGroupRef, surfaceGroups: groups(d.surfaceGroups) })) }) };
    const view = deepFreeze({ scope, normalized }); this.scopeViews.set(key, view); return view;
  }
  provenance(selection: QualificationResourceSelection): QualificationConstructionProvenance {
    const p = this.value<v.InferOutput<typeof QUALIFICATION_RESOURCE_PROVENANCE_SCHEMA>>(selection, "provenance");
    if (p.kind === "native_construction") return p;
    const key = selection.resource.ref + ":" + selection.entry.ref, prior = this.provenanceViews.get(key);
    if (prior !== undefined) return prior;
    const m = this.manifest(selection.resource), records = p.records.map(s => this.value<QualificationMaterial>(this.selection(m, s.entryKind, s.entry), "material"));
    if (!unique(records.map(x => x.ref)) || hash(records) !== p.recordSet.digest) throw new TypeError("qualification_provenance_record_set");
    const view = deepFreeze({ ...p, records }); this.provenanceViews.set(key, view); return view;
  }
}
export function acquireQualificationResources(assertion: unknown, additionalProofs: readonly AbgHistoricalDeclarationProof[] = []): QualificationResources {
  return new QualificationResources(assertion, additionalProofs);
}
export function resolveQualificationProof(proof: QualificationProofResource, resources?: QualificationResources): QualificationEmbeddedProofResource {
  if (!isQualificationReferenceForm(proof)) return proof;
  if (resources === undefined) throw new TypeError("qualification_resource_dependency_missing");
  const { representation: _representation, resource, executionSources: _sources, ...p } = proof;
  return { ...p, declarations: [...resources.declarations(resource, proof.declarations)],
    ...(proof.executionSources === undefined ? {} : { executionSources: proof.executionSources.map(s => ({ ...s, declarations: [...resources.declarations(resource, s.declarations)] })) }) };
}
export type ResolvedQualificationAssessment = { input: QualificationAssessmentInput; task: QualificationEmbeddedTask; normalizedScope?: QualificationInternedScope };
export function resolveQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): ResolvedQualificationAssessment {
  if (!isQualificationReferenceForm(input.task)) return { input, task: input.task };
  if (resources === undefined) throw new TypeError("qualification_resource_dependency_missing");
  const task = input.task, m = resources.manifest(task.resource);
  if (!same(m.subjectBasis, task.subjectBasis) || !same(m.lawBasis, task.lawBasis) || !same(m.catalog, task.catalog) || !same(m.inventory, task.inventory))
    throw new TypeError("qualification_task_resource_basis");
  const selections = [...task.material, task.provenance, ...(task.scope === undefined ? [] : [task.scope])];
  if (selections.some(s => !same(s.resource, task.resource))) throw new TypeError("qualification_task_resource_crossed");
  const scoped = task.scope === undefined ? undefined : resources.scope(task.scope);
  const { representation: _representation, resource: _resource, ...rest } = task;
  const resolved: QualificationEmbeddedTask = { ...rest, declarations: [...resources.declarations(task.resource, task.declarations)],
    material: task.material.map(s => resources.value<QualificationMaterial>(s, "material")), provenance: resources.provenance(task.provenance),
    ...(scoped === undefined ? {} : { scope: scoped.scope }) } as QualificationEmbeddedTask;
  return { input, task: resolved, ...(scoped === undefined ? {} : { normalizedScope: scoped.normalized }) };
}
export function resolveSelfConformanceInput(raw: SelfConformanceInput, resources?: QualificationResources): { input: SelfConformanceEmbeddedInput; normalizedScope?: QualificationInternedScope } {
  if (!isQualificationReferenceForm(raw)) return { input: raw };
  if (resources === undefined || !v.is(SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA, raw)) throw new TypeError("qualification_resource_dependency_missing");
  const m = resources.manifest(raw.resource);
  if (!same(m.subjectBasis, coord(raw.basis.basisRef, raw.basis.basisDigest)) || !same(m.lawBasis, raw.basis.lawBasis) || !same(m.inventory, raw.basis.sourceInventory))
    throw new TypeError("self_conformance_resource_basis");
  const selections = [raw.law, raw.inventory, raw.tenantManifest, raw.scope, ...raw.authorityMembers,
    ...(raw.qualification === undefined ? [] : [...raw.qualification.sourceMembers, raw.qualification.coverageCatalog, raw.qualification.verification?.recipe])].filter(s => s !== null && s !== undefined);
  if (selections.some(s => s !== null && s !== undefined && !same(s.resource, raw.resource)) || raw.qualification !== undefined && !isQualificationReferenceForm(raw.qualification.proof)) throw new TypeError("self_conformance_resource_crossed_or_mixed");
  const scope = raw.scope === undefined ? undefined : resources.scope(raw.scope), { representation: _representation, resource: _resource, ...rest } = raw;
  return { input: { ...rest, law: raw.law === null ? null : resources.value(raw.law, "law"),
    inventory: raw.inventory === null ? null : resources.value(raw.inventory, "inventory"), tenantManifest: raw.tenantManifest === null ? null : resources.value(raw.tenantManifest, "tenant_manifest"),
    authorityMembers: raw.authorityMembers.map(s => resources.value<QualificationMaterial>(s, "material")), ...(scope === undefined ? {} : { scope: scope.scope }),
    ...(raw.qualification === undefined ? {} : { qualification: { ...raw.qualification,
      sourceMembers: raw.qualification.sourceMembers.map(s => resources.value<QualificationMaterial>(s, "material")), coverageCatalog: resources.value(raw.qualification.coverageCatalog, "coverage_catalog"),
      ...(raw.qualification.verification === undefined ? {} : { verification: { ...raw.qualification.verification, recipe: resources.value(raw.qualification.verification.recipe, "verification_recipe") } }) } }) } as SelfConformanceEmbeddedInput,
    ...(scope === undefined ? {} : { normalizedScope: scope.normalized }) };
}
/** Deterministic authoring helpers; new identities cover normalized bytes. */
export function normalizeQualificationScope(scope: QualificationScope): QualificationInternedScope {
  const inventory = coord(scope.inventory.inventoryRef, scope.inventory.inventoryDigest), ordinals = new Map(scope.inventory.members.map((m, n) => [m.ref, n]));
  const sets = new Map<string, QualificationReferenceSet>();
  const set = (elementKind: QualificationReferenceSet["elementKind"], values: string[]) => {
    if (values.length === 0) throw new TypeError("qualification_scope_empty_relation");
    const body = elementKind === "memberRefs" ? { kind: "qualification_reference_set", schemaVersion: "1", elementKind, encoding: "member_ordinals", inventory,
      values: values.map(ref => { const n = ordinals.get(ref); if (n === undefined) throw new TypeError("qualification_scope_member_unbound"); return n; }) }
      : { kind: "qualification_reference_set", schemaVersion: "1", elementKind, encoding: "refs", values };
    const s = constructQualificationIdentity(body, "setRef", "setDigest", "qualification-set://abiogenesis/") as unknown as QualificationReferenceSet;
    sets.set(s.setRef, s); return coord(s.setRef, s.setDigest);
  };
  const groups = (gs: QualificationScope["surfaceGroups"]) => gs.map(g => ({ groupRef: g.groupRef, memberSet: set("memberRefs", g.memberRefs), rootSet: set("rootRefs", g.rootRefs),
    roleSet: set("surfaceRoles", g.surfaceRoles), ownerSet: set("ownerRefs", g.ownerRefs), sourceSet: set("sourceRefs", g.sourceRefs) }));
  const surfaceGroups = groups(scope.surfaceGroups), domains = scope.applicationDomains?.map(d => ({ ruleGroupRef: d.ruleGroupRef, surfaceGroups: groups(d.surfaceGroups) }));
  return constructQualificationIdentity({ kind: "qualification_scope_interned", schemaVersion: "1", subjectBasis: scope.subjectBasis, lawBasis: scope.lawBasis,
    catalog: scope.catalog, inventory, ruleGroups: scope.ruleGroups, surfaceGroups, referenceSets: [...sets.values()].sort((a, b) => a.setRef.localeCompare(b.setRef)),
    ...(domains === undefined ? { domainMode: "global" } : { domainMode: "per_rule", applicationDomains: domains }) }, "scopeRef", "scopeDigest", "qualification-scope://abiogenesis/") as unknown as QualificationInternedScope;
}
