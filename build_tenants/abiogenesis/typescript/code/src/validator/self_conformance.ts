import * as v from "valibot";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, relative } from "node:path";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { resolveQualificationAssessments, qualificationTenantClaimsMatch, resolveQualificationExecutionMaterial } from "../abg/qualification_proof.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { isQualificationBasisReady, qualificationCoverageIsPublished } from "./qualification.js";
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
  const ruleByRef = new Map(catalog.rules.map(r => [r.ruleRef, r]));
  const inventoryRefs = new Set(input.inventory?.members.map(m => m.ref) ?? []);
  const applicationRows = new Map<string, SelfConformanceInput["applications"]>();
  for (const application of input.applications) {
    const rows = applicationRows.get(application.ruleRef) ?? [];
    rows.push(application); applicationRows.set(application.ruleRef, rows);
  }
  const typedMaterial = (ref: string, value: unknown) => {
    const bytes = Buffer.from(canonicalJson(value as JsonValue));
    return { ref, path: ref, digest: sha256Bytes(bytes), byteCount: bytes.length, contentBase64: bytes.toString("base64") };
  };
  const declarationMaterials = [
    { ref: catalog.catalogRef, path: SELF_CONFORMANCE_CATALOG_ASSET_PATH, digest: sha256Bytes(bytes), byteCount: bytes.length, contentBase64: Buffer.from(bytes).toString("base64") },
    ...(input.inventory === null ? [] : [typedMaterial(input.inventory.inventoryRef, input.inventory)]),
    ...(input.tenantManifest === null ? [] : [typedMaterial(input.tenantManifest.manifestRef, input.tenantManifest)]),
    ...(input.law === null ? [] : [typedMaterial(input.law.lawBasisRef, input.law)]),
  ];
  const executionProof = input.qualification === undefined ? null : resolveQualificationExecutionMaterial(
    input.qualification.proof, basis, owner.nativeBasis, input.qualification.verification, input.inventory);
  const executionMaterial = executionProof?.evidence ?? null, verification = executionProof?.verification ?? null;
  const coverage = input.qualification?.coverageCatalog;
  const coverageBound = coverage !== undefined && qualificationCoverageIsPublished(coverage) &&
    same(basis.coverageCatalog, { ref: coverage.catalogRef, digest: coverage.catalogDigest }) && same(basis.lawBasis, coverage.lawBasis);
  if (coverageBound) declarationMaterials.push(typedMaterial(coverage!.catalogRef, coverage));
  const resolved = input.qualification === undefined ? null : resolveQualificationAssessments(input.qualification.proof,
    input.qualification.plan, owner.nativeBasis);
  const assessment = input.qualification === undefined || !same(input.qualification.plan.subjectBasis, { ref: basis.basisRef, digest: basis.basisDigest }) ||
    !same(input.qualification.plan.lawBasis, basis.lawBasis) || !coverageBound || executionMaterial === null ? null : resolved?.filter(j =>
      same(j.task.inventory, basis.sourceInventory) && input.law !== null && same(j.task.catalog, { ref: input.law.catalog.ref, digest: input.law.catalog.digest }) &&
      j.task.subjectMembers.every(m => input.inventory?.members.some(i => same(m, { ref: i.ref, path: i.path, digest: i.digest, byteCount: i.byteCount }))) &&
      j.task.material.every(m => [...declarationMaterials, ...input.authorityMembers, ...input.qualification!.sourceMembers,
        ...(executionMaterial ?? []),
        ...(j.task.provenance.kind === "external_construction" ? j.task.provenance.records : [])].some(a => same(a, m)))) ?? null;
  type AssessmentRow = { j: NonNullable<typeof assessment>[number]; c: NonNullable<typeof assessment>[number]["raw"]["criteria"][number] };
  const assessmentIndex = new Map<string, AssessmentRow[]>();
  for (const j of assessment ?? []) for (const c of j.raw.criteria) {
    const key = [j.task.role.roleRef, c.evidenceRole, c.surfaceRef].join("\n"), rows = assessmentIndex.get(key) ?? [];
    rows.push({ j, c }); assessmentIndex.set(key, rows);
  }
  const assess = (role: string, evidenceRole: string, surfaceRef: string, ruleRef: string | null): { disposition: "passed" | "failed" | "blocked_incomplete" | "inapplicable_with_reason"; refs: string[] } | null => {
    if (assessment === null) return null;
    const matches = (assessmentIndex.get([`qualification-role://abiogenesis/${role}@5`, evidenceRole, surfaceRef].join("\n")) ?? [])
      .filter(({ j, c }) => (ruleRef === null || c.ruleRef === ruleRef) && (() => {
          const verificationRule = role === "rule" && ruleRef !== null && ruleByRef.get(ruleRef)?.governedClaim === "REQ-P-QUAL-056";
          const required = role === "catalog" ? [catalog.catalogRef, ...catalog.sources.map(s => s.ref)]
            : evidenceRole === "inventory_coverage" ? [input.inventory?.inventoryRef, ...(input.inventory?.members.map(m => m.ref) ?? [])]
            : role === "tenant" ? [input.tenantManifest?.manifestRef]
            : role === "coverage" ? [coverage?.catalogRef, ...(coverage?.claims.find(claim => claim.coverageRef === c.ruleRef)?.requirementRefs.map(ref => ref.split("#")[0]!) ?? [])]
            : role === "rule" ? [c.surfaceRef, ruleByRef.get(c.ruleRef)?.sourceRef,
              ...(verificationRule ? [verification?.recipe.ref, verification?.execution.ref] : [])]
            : [c.surfaceRef];
          return (!verificationRule || verification !== null && c.evidenceRefs.includes(verification.execution.ref)) &&
            (role !== "coverage" || c.evidenceRefs.some(ref => executionMaterial?.some(m => m.ref === ref)) &&
            c.evidenceRefs.every(ref => executionMaterial?.some(m => m.ref === ref) && j.task.material.some(m => m.ref === ref))) && required.every(ref => ref !== undefined && j.task.material.some(m => m.ref === ref)) &&
            required.filter(ref => ref !== undefined && inventoryRefs.has(ref)).every(ref => j.task.subjectMembers.some(m => m.ref === ref));
        })());
    if (matches.length === 0) return null;
    const refs = matches.flatMap(({ j }) => input.qualification!.proof.selections.filter(s =>
      s.kind === "judgment_selection" && s.slotRef === j.task.slotRef).map(s => s.kind === "judgment_selection" ? s.result.ref : s.selectionRef));
    return { disposition: matches.some(({ c }) => c.disposition === "falsified") ? "failed"
      : matches.some(({ c, j }) => c.disposition === "indeterminate" || c.applicability === "unknown" || c.residuals.length > 0 || j.raw.residuals.length > 0) ? "blocked_incomplete"
      : matches.every(({ c }) => c.applicability === "inapplicable") ? "inapplicable_with_reason" : "passed", refs };
  };
  const assessed = (diagnostic: string, detail: string, role: string, evidenceRole: string, surfaceRefs: string[], ruleRef: string | null = null, sourceRef: string | null = null) => {
    const results = surfaceRefs.map(s => assess(role, evidenceRole, s, ruleRef));
    const complete = results.length > 0 && results.every(r => r !== null);
    if (!complete) { add(diagnostic, "blocked_incomplete", detail, surfaceRefs, ruleRef, sourceRef, "J_required"); return; }
    const rows = results.map(r => r!);
    const disposition = rows.some(r => r.disposition === "failed") ? "failed" : rows.some(r => r.disposition === "blocked_incomplete") ||
      role !== "rule" && role !== "coverage" && rows.some(r => r.disposition === "inapplicable_with_reason") ? "blocked_incomplete"
      : rows.every(r => r.disposition === "inapplicable_with_reason") ? "inapplicable_with_reason" : "passed";
    findings.push({ diagnostic, disposition, detail: "Exact native scoped assessment: " + detail, surfaceRefs, ruleRef, sourceRef,
      provenance: "J", evidenceRefs: [...new Set(rows.flatMap(r => r.refs))] });
  };
  if (basis.basisDigest !== qualificationIdentityDigest(basis, "basisRef", "basisDigest")) add("subject_basis_digest_mismatch", "failed", "Qualification basis content identity differs.");
  if (basis.productContentDigest !== owner.productContentDigest || basis.productManifest.digest !== owner.manifestDigest || basis.toolchain.digest !== owner.manifestDigest)
    add("installed_candidate_basis_mismatch", "failed", "Subject does not match the actual native owner package content and manifest.");
  if (basis.productId !== owner.productId || basis.productVersion !== owner.productVersion || basis.artifact.digest !== owner.artifactDigest || basis.installedProduct?.ref !== owner.installId || basis.installedProduct.digest !== owner.installDigest || !same(basis.workspaceBinding, owner.workspaceBinding))
    add("installed_admission_basis_mismatch", "failed", "Qualification input differs from actual current admitted install, artifact, or workspace truth.");
  else add("installed_admission_basis_bound", "passed", "Exact native prefix, self-conformance CCall, publication, artifact, install and workspace are authenticated.");
  if (!isQualificationBasisReady(basis))
    add("prospective_release_identity_incomplete", "blocked_incomplete", "This development candidate is not an exact prospective RC qualification subject.");
  if (basis.coverageCatalog === null) add("coverage_catalog_missing", "blocked_incomplete", "No source-grounded behavioral coverage catalog is bound.");
  if (!coverageBound) add("coverage_catalog_mismatch", "blocked_incomplete", "Complete exact published coverage declarations are required.");
  if (executionMaterial === null) add("execution_evidence_unadmitted", "blocked_incomplete", "Execution citations lack exact native subject/producer/current proof.");
  if (verification === null) add("verification_material_missing", "blocked_incomplete", "QUAL-056 requires an exact observed-C2 recipe/source/outcome selection; prior receipts and caller summaries supply no material.");
  else add("verification_material_" + verification.disposition, verification.disposition,
    "Authenticated command outcomes and complete parsed test/lint reports; independent recipe applicability and sufficiency remain required.",
    [verification.recipe.ref, verification.execution.ref]);
  for (const claim of coverageBound ? coverage!.claims : []) for (const behavior of claim.behaviors) {
    assessed("behavioral_coverage_assessment_required", "Source-scoped applicability, actual positive/nearest-negative behavior and execution sufficiency require independent J; shared evidence does not imply coverage.",
      "coverage", "behavioral_coverage", [behavior], claim.coverageRef);
  }
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
  assessed("catalog_fidelity_assessment_required", "Derived catalog fidelity and full governing-source coverage require an admitted independent assessment.", "catalog", "catalog_fidelity", [catalog.catalogRef]);
  const inventory = input.inventory;
  if (inventory === null) add("subject_inventory_missing", "blocked_incomplete", "The subject inventory is absent.");
  else {
    if (inventory.inventoryDigest !== qualificationIdentityDigest(inventory, "inventoryRef", "inventoryDigest") || basis.sourceInventory.digest !== inventory.inventoryDigest || basis.sourceInventory.ref !== inventory.inventoryRef)
      add("subject_inventory_basis_mismatch", "failed", "Inventory and qualification subject identities differ.");
    if (!unique(inventory.members.map(x => x.ref)) || !unique(inventory.members.map(x => x.path))) add("duplicate_subject_member", "failed", "Frozen inventory has duplicate members.");
    // Completeness/classification are never inferred from paths, role labels or a caller complete_claim.
    assessed("inventory_coverage_assessment_required", "Whole candidate inventory/classification completeness requires its source-grounded assessment.", "inventory", "inventory_coverage", inventory.selectedRoots);
    for (const member of inventory.members) {
      if (member.surfaceRoles.length === 0) add("subject_member_role_missing", "blocked_incomplete", "Member surface roles are not classified.", [member.ref]);
      assessed("subject_member_classification_incomplete", "Member needs actual classification evidence.", "inventory", "inventory_classification", [member.ref]);
    }
    if (input.qualification !== undefined) {
      const actual = input.qualification.sourceMembers;
      if (!unique(actual.map(m => m.ref)) || actual.length !== inventory.members.length || actual.some(m => !inventory.members.some(i => i.ref === m.ref)))
        add("subject_material_roster_mismatch", "failed", "Supplied immutable source bytes differ from the whole frozen inventory.");
      for (const m of inventory.members) {
        const bytes = actual.find(a => a.ref === m.ref), raw = bytes === undefined ? null : Buffer.from(bytes.contentBase64, "base64");
        if (bytes === undefined || raw === null) add("subject_material_missing", "blocked_incomplete", "Frozen source bytes are absent.", [m.ref]);
        else if (bytes.path !== m.path || bytes.digest !== m.digest || bytes.byteCount !== m.byteCount || raw.length !== m.byteCount ||
          raw.toString("base64") !== bytes.contentBase64 || sha256Bytes(raw) !== m.digest)
          add("subject_material_mismatch", "failed", "Frozen source coordinate and retained bytes differ.", [m.ref]);
      }
    } else add("subject_material_missing", "blocked_incomplete", "Retained immutable candidate bytes are required for fresh assessment replay.");
  }
  if (input.tenantManifest === null || basis.tenantManifest === null) add("tenant_conformance_manifest_missing", "blocked_incomplete", "Tenant realized claims and their exact capability/public basis are absent.");
  else if (input.tenantManifest.manifestDigest !== qualificationIdentityDigest(input.tenantManifest, "manifestRef", "manifestDigest") || basis.tenantManifest.digest !== input.tenantManifest.manifestDigest || basis.tenantManifest.ref !== input.tenantManifest.manifestRef || input.tenantManifest.productId !== basis.productId)
    add("tenant_conformance_manifest_basis_mismatch", "failed", "Tenant manifest differs from this subject.");
  else {
    const manifest = input.tenantManifest;
    if (!unique(manifest.claims.map(c => c.claimRef)) || manifest.claims.length === 0 || manifest.claims.some(c => c.publicContractRefs.length === 0 ||
        c.evidenceRefs.length === 0 || !unique(c.publicContractRefs))) add("tenant_claim_roster_mismatch", "failed", "Tenant claims require unique owned capability/contract and evidence coverage.");
    if (!qualificationTenantClaimsMatch(owner.nativeBasis, input, manifest))
      add("tenant_owned_capability_contract_mismatch", "failed", "Tenant capability/Public coordinates or claim ownership differ from the exact native installed Product.");
    assessed("tenant_realization_assessment_required", "Capability/catalog presence cannot establish realized conformance.", "tenant", "tenant_realization", [manifest.manifestRef]);
  }
  if (!unique(input.applications.map(x => x.ruleRef + "\n" + x.surfaceRef))) add("duplicate_rule_application", "failed", "Rule and surface pair is duplicated.");
  for (const rule of catalog.rules) {
    const source = input.authorityMembers.find(x => x.ref === rule.sourceRef);
    if (source !== undefined) {
      const raw = Buffer.from(source.contentBase64, "base64");
      if (rule.startByte >= rule.endByte || rule.endByte > raw.length || sha256Bytes(raw.subarray(rule.startByte, rule.endByte)) !== rule.spanDigest)
        add("rule_source_span_mismatch", "failed", "Rule locator does not bind the exact original span.", [], rule.ruleRef, rule.sourceRef);
    }
    const apps = applicationRows.get(rule.ruleRef) ?? [];
    const appliedSurfaces = new Set(apps.map(a => a.surfaceRef));
    if (apps.length === 0) add("rule_application_missing", "blocked_incomplete", "Rule applicability and required surface coverage remain unresolved.", [], rule.ruleRef, rule.sourceRef, "J_required");
    for (const app of apps) {
      if (inventory === null || !inventoryRefs.has(app.surfaceRef)) add("application_surface_unbound", "failed", "Application surface is absent from the exact inventory.", [app.surfaceRef], rule.ruleRef, rule.sourceRef);
      assessed("semantic_assessment_required", "Each applicable rule/surface needs adequate native semantic assessment; no MUST waiver is synthesized.", "rule", "semantic_assessment", [app.surfaceRef], rule.ruleRef, rule.sourceRef);
    }
    if (inventory !== null) for (const member of inventory.members) if (!appliedSurfaces.has(member.ref))
      add("rule_surface_classification_missing", "blocked_incomplete", "Every frozen rule/surface pair requires explicit applicability classification.", [member.ref], rule.ruleRef, rule.sourceRef, "J_required");
  }
  if (input.applications.some(x => !ruleByRef.has(x.ruleRef))) add("unpublished_rule_application", "failed", "Rule application has no published owner row.");
  for (const evidence of input.evidenceCitations) {
    if (evidence.subjectBasisDigest !== basis.basisDigest || evidence.lawBasisDigest !== basis.lawBasis.digest)
      add("assessment_evidence_basis_mismatch", "failed", "Evidence citation belongs to another subject/law basis.", evidence.scopeRefs);
    else {
      const admitted = assessment?.some(j => input.qualification?.proof.selections.some(s => s.kind === "judgment_selection" &&
        s.slotRef === j.task.slotRef && s.result.ref === evidence.ref && s.result.digest === evidence.digest) &&
        j.source.actorRef === evidence.actorRef && j.task.role.authorityRef === evidence.authorityRef &&
        evidence.scopeRefs.every(ref => j.task.coverage.some(c => c.surfaceRef === ref || c.ruleRef === ref))) ?? false;
      add(admitted ? "assessment_evidence_admitted" : "assessment_evidence_not_admitted", admitted ? "passed" : "blocked_incomplete",
        admitted ? "Exact native producer/task/role/scope is resolved." : "Citation lacks the corresponding exact native producer/task/role/scope.", evidence.scopeRefs, null, null, admitted ? "J" : "J_required");
    }
  }
  const body = { kind: "self_conformance_result" as const, schemaVersion: "5.0.0" as const,
    subjectBasis: { ref: basis.basisRef, digest: basis.basisDigest }, lawBasis: basis.lawBasis,
    inventoryDigest: inventory?.inventoryDigest ?? null, inputDigest: sha256Canonical(input as unknown as JsonValue), owner,
    ruleApplications: input.applications, evidenceCitations: input.evidenceCitations, findings,
    disposition: findings.some(x => x.disposition === "failed") ? "failed" as const
      : findings.some(x => x.disposition === "blocked_incomplete" || x.disposition === "accepted_reentry") ? "blocked_incomplete" as const : "passed" as const,
    qualificationVerdict: false as const, verification };
  const resultDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({ ...body, resultDigest, resultRef: `self-conformance-result://abiogenesis/${resultDigest.slice(7)}` });
}
