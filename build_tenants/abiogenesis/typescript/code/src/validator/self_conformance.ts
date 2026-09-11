import * as v from "valibot";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, relative } from "node:path";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { QUALIFICATION_RULE_CATALOG_SCHEMA, qualificationIdentityDigest,
  type SelfConformanceInput, type SelfConformanceResult, type SelfConformanceOwner,
  type SelfConformanceFinding, type QualificationRuleCatalog } from "./self_conformance_contracts.js";

export const SELF_CONFORMANCE_CATALOG_ASSET_PATH = "contracts/qualification/rule-catalog.json";
export const SELF_CONFORMANCE_CATALOG_CONTRACT_ID = "abg.asset.qualification.rule-catalog";
const packageRoot = fileURLToPath(new URL("../../../../", import.meta.url));
/** Reads only this installed owner's manifest-bound declaration assets. */
export function readSelfConformanceCatalog(): { catalog: QualificationRuleCatalog; bytes: Uint8Array } {
  const bytes = readFileSync(resolve(packageRoot, SELF_CONFORMANCE_CATALOG_ASSET_PATH));
  return { catalog: v.parse(QUALIFICATION_RULE_CATALOG_SCHEMA, JSON.parse(bytes.toString("utf8"))), bytes };
}
function same(a: unknown, b: unknown): boolean { return sha256Canonical(a as JsonValue) === sha256Canonical(b as JsonValue); }
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
/** Finite native relation. Citations remain unadmitted; no caller flag can establish J/O truth. */
export function evaluateSelfConformance(input: SelfConformanceInput, owner: SelfConformanceOwner): Readonly<SelfConformanceResult> {
  const findings: SelfConformanceFinding[] = [];
  const add = (diagnostic: string, disposition: SelfConformanceFinding["disposition"], detail: string,
    surfaceRefs: string[] = [], ruleRef: string | null = null, sourceRef: string | null = null,
    provenance: SelfConformanceFinding["provenance"] = "C") =>
    findings.push({ diagnostic, disposition, detail, surfaceRefs, ruleRef, sourceRef, provenance, evidenceRefs: [] });
  const { catalog, bytes } = readSelfConformanceCatalog();
  const basis = input.basis;
  if (basis.basisDigest !== qualificationIdentityDigest(basis, "basisRef", "basisDigest")) add("subject_basis_digest_mismatch", "failed", "Qualification basis content identity differs.");
  if (basis.productContentDigest !== owner.productContentDigest || basis.productManifest.digest !== owner.manifestDigest || basis.toolchain.digest !== owner.manifestDigest)
    add("installed_candidate_basis_mismatch", "failed", "Subject does not match the actual native owner package content and manifest.");
  if (basis.productId !== owner.productId || basis.productVersion !== owner.productVersion || basis.artifact.digest !== owner.artifactDigest || basis.installedProduct?.ref !== owner.installId || basis.installedProduct.digest !== owner.installDigest || !same(basis.workspaceBinding, owner.workspaceBinding))
    add("installed_admission_basis_mismatch", "failed", "Qualification input differs from actual current admitted install, artifact, or workspace truth.");
  else add("installed_admission_basis_bound", "passed", "Exact native prefix, self-conformance CCall, publication, artifact, install and workspace are authenticated.");
  if (basis.prospectiveRelease === null || basis.prospectiveRelease.productId !== basis.productId || basis.prospectiveRelease.version !== basis.productVersion)
    add("prospective_release_identity_incomplete", "blocked_incomplete", "This development candidate is not an exact prospective RC qualification subject.");
  if (basis.owningGateInventory === null) add("owning_gate_inventory_missing", "blocked_incomplete", "No complete frozen owning-gate inventory is admitted.");
  if (sha256Bytes(bytes) !== owner.catalogDigest || catalog.catalogRef !== owner.catalogRef || catalog.catalogVersion !== owner.catalogVersion)
    add("published_catalog_digest_mismatch", "failed", "Loaded catalog asset and owner coordinate differ.");
  if (input.law === null) add("qualification_law_missing", "blocked_incomplete", "Exact law basis is required.");
  else {
    const law = input.law;
    if (law.lawBasisDigest !== qualificationIdentityDigest(law, "lawBasisRef", "lawBasisDigest") || basis.lawBasis.digest !== law.lawBasisDigest || basis.lawBasis.ref !== law.lawBasisRef)
      add("qualification_law_basis_mismatch", "failed", "Basis and law content coordinates differ.");
    if (law.releaseRef !== catalog.method.releaseRef || law.methodVersion !== catalog.method.methodVersion || law.installedManifestDigest !== catalog.method.installedManifestDigest || law.memberSetDigest !== catalog.method.memberSetDigest)
      add("published_method_basis_mismatch", "failed", "Exact selected published STDO release differs.");
    if (law.catalog.ref !== owner.catalogRef || law.catalog.digest !== owner.catalogDigest || law.catalog.version !== owner.catalogVersion || law.catalog.ownerRef !== catalog.ownerRef || law.catalog.assetPath !== owner.catalogAssetPath)
      add("published_catalog_basis_mismatch", "failed", "Law does not bind this actual native catalog publication.");
    if (!same(law.sources, catalog.sources)) add("law_source_inventory_mismatch", "failed", "Law member inventory must equal the selected published catalog source inventory.");
  }
  if (!unique(input.authorityMembers.map(x => x.ref))) add("duplicate_authority_member", "failed", "Authority members must have singular identities.");
  for (const source of catalog.sources) {
    const member = input.authorityMembers.find(x => x.ref === source.ref);
    if (member === undefined) { add("required_authority_member_missing", "blocked_incomplete", "Selected law source bytes are absent.", [source.ref], null, source.ref); continue; }
    const raw = Buffer.from(member.contentBase64, "base64");
    const coordinate = { ref: member.ref, path: member.path, digest: member.digest, byteCount: member.byteCount };
    const path = resolve(packageRoot, source.path);
    if (relative(packageRoot, path).startsWith("..")) throw new TypeError("catalog source path escapes owner asset inventory");
    const published = readFileSync(path);
    if (!same(coordinate, source) || raw.toString("base64") !== member.contentBase64 || sha256Bytes(raw) !== source.digest || raw.length !== source.byteCount || sha256Bytes(published) !== source.digest)
      add("authority_member_digest_mismatch", "failed", "Selected and packaged law member bytes do not agree.", [source.ref], null, source.ref);
    else add("authority_member_bytes_bound", "passed", "Exact selected source bytes equal the packaged law member; this is no semantic assessment.", [source.ref], null, source.ref);
  }
  if (input.authorityMembers.some(x => !catalog.sources.some(s => s.ref === x.ref))) add("undeclared_authority_member", "failed", "An extra caller member cannot extend published law authority.");
  add("catalog_fidelity_assessment_required", "blocked_incomplete", "Derived catalog fidelity and coverage have no admitted independent assessment.", [catalog.catalogRef], null, null, "J_required");
  const inventory = input.inventory;
  if (inventory === null) add("subject_inventory_missing", "blocked_incomplete", "The subject inventory is absent.");
  else {
    if (inventory.inventoryDigest !== qualificationIdentityDigest(inventory, "inventoryRef", "inventoryDigest") || basis.sourceInventory.digest !== inventory.inventoryDigest || basis.sourceInventory.ref !== inventory.inventoryRef)
      add("subject_inventory_basis_mismatch", "failed", "Inventory and qualification subject identities differ.");
    if (!unique(inventory.members.map(x => x.ref)) || !unique(inventory.members.map(x => x.path))) add("duplicate_subject_member", "failed", "Frozen inventory has duplicate members.");
    // Completeness/classification are never inferred from paths, role labels or a caller complete_claim.
    add("inventory_coverage_assessment_required", "blocked_incomplete", "Whole candidate inventory/classification completeness is not admitted.", inventory.selectedRoots, null, null, "J_required");
    for (const member of inventory.members) if (member.surfaceRoles.length === 0 || member.classificationEvidenceRefs.length === 0)
      add("subject_member_classification_incomplete", "blocked_incomplete", "Member needs actual classification evidence.", [member.ref], null, null, "J_required");
  }
  if (input.tenantManifest === null || basis.tenantManifest === null) add("tenant_conformance_manifest_missing", "blocked_incomplete", "Tenant realized claims and their exact capability/public basis are absent.");
  else if (input.tenantManifest.manifestDigest !== qualificationIdentityDigest(input.tenantManifest, "manifestRef", "manifestDigest") || basis.tenantManifest.digest !== input.tenantManifest.manifestDigest || basis.tenantManifest.ref !== input.tenantManifest.manifestRef || input.tenantManifest.productId !== basis.productId)
    add("tenant_conformance_manifest_basis_mismatch", "failed", "Tenant manifest differs from this subject.");
  else add("tenant_realization_assessment_required", "blocked_incomplete", "Capability/catalog presence cannot establish realized conformance.", [input.tenantManifest.manifestRef], null, null, "J_required");
  if (!unique(input.applications.map(x => x.ruleRef + "\n" + x.surfaceRef))) add("duplicate_rule_application", "failed", "Rule and surface pair is duplicated.");
  for (const rule of catalog.rules) {
    const source = input.authorityMembers.find(x => x.ref === rule.sourceRef);
    if (source !== undefined) {
      const raw = Buffer.from(source.contentBase64, "base64");
      if (rule.startByte >= rule.endByte || rule.endByte > raw.length || sha256Bytes(raw.subarray(rule.startByte, rule.endByte)) !== rule.spanDigest)
        add("rule_source_span_mismatch", "failed", "Rule locator does not bind the exact original span.", [], rule.ruleRef, rule.sourceRef);
    }
    const apps = input.applications.filter(x => x.ruleRef === rule.ruleRef);
    if (apps.length === 0) add("rule_application_missing", "blocked_incomplete", "Rule applicability and required surface coverage remain unresolved.", [], rule.ruleRef, rule.sourceRef, "J_required");
    for (const app of apps) {
      if (inventory === null || !inventory.members.some(x => x.ref === app.surfaceRef)) add("application_surface_unbound", "failed", "Application surface is absent from the exact inventory.", [app.surfaceRef], rule.ruleRef, rule.sourceRef);
      add("semantic_assessment_required", "blocked_incomplete", "Declared applicability/evidence citations are not admitted J/O truth; no exclusion or re-entry is synthesized.", [app.surfaceRef], rule.ruleRef, rule.sourceRef, "J_required");
    }
  }
  if (input.applications.some(x => !catalog.rules.some(r => r.ruleRef === x.ruleRef))) add("unpublished_rule_application", "failed", "Rule application has no published owner row.");
  for (const evidence of input.evidenceCitations) {
    if (evidence.subjectBasisDigest !== basis.basisDigest || evidence.lawBasisDigest !== basis.lawBasis.digest)
      add("assessment_evidence_basis_mismatch", "failed", "Evidence citation belongs to another subject/law basis.", evidence.scopeRefs);
    else add("assessment_evidence_not_admitted", "blocked_incomplete", "This first evaluator has no native admission resolver for the cited J/O relation; the citation remains non-authoritative.", evidence.scopeRefs, null, null, evidence.role === "owner_ruling" ? "O_required" : "J_required");
  }
  const body = { kind: "self_conformance_result" as const, schemaVersion: "5.0.0" as const,
    subjectBasis: { ref: basis.basisRef, digest: basis.basisDigest }, lawBasis: basis.lawBasis,
    inventoryDigest: inventory?.inventoryDigest ?? null, inputDigest: sha256Canonical(input as unknown as JsonValue), owner,
    ruleApplications: input.applications, evidenceCitations: input.evidenceCitations, findings,
    disposition: findings.some(x => x.disposition === "failed") ? "failed" as const : "blocked_incomplete" as const,
    qualificationVerdict: false as const };
  const resultDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({ ...body, resultDigest, resultRef: `self-conformance-result://abiogenesis/${resultDigest.slice(7)}` });
}
