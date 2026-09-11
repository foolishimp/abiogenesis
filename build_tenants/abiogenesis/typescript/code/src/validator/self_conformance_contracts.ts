import * as v from "valibot";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";

const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const ordinal = v.pipe(v.number(), v.integer(), v.minValue(0));
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_COORDINATE_SCHEMA = v.strictObject({ ref, digest });
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_SOURCE_SCHEMA = v.strictObject({ ref, path: ref, digest, byteCount: ordinal });
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_RULE_SCHEMA = v.strictObject({
  ruleRef: ref, version: ref, sourceRef: ref, sourceDigest: digest,
  startByte: ordinal, endByte: ordinal, spanDigest: digest, governedClaim: ref,
  applicability: v.literal("requires_admitted_judgment"), requiredEvidenceRoles: v.array(ref),
  computableRelation: v.literal("source_span_integrity"), diagnostic: v.literal("semantic_assessment_required"),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_RULE_CATALOG_SCHEMA = v.strictObject({
  kind: v.literal("qualification_rule_catalog"), schemaVersion: v.literal("5.0.0"),
  catalogRef: ref, catalogVersion: ref, ownerRef: ref,
  method: v.strictObject({ releaseRef: ref, methodVersion: ref, installedManifestDigest: digest, memberSetDigest: digest }),
  sources: v.array(QUALIFICATION_SOURCE_SCHEMA), rules: v.array(QUALIFICATION_RULE_SCHEMA),
  coverageClaim: v.literal("finite_candidate_unassessed"), requiredCatalogEvidenceRoles: v.array(ref),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_LAW_BASIS_SCHEMA = v.strictObject({
  kind: v.literal("qualification_law_basis"), lawBasisRef: ref, lawBasisDigest: digest,
  releaseRef: ref, methodVersion: ref, installedManifestDigest: digest, memberSetDigest: digest,
  catalog: v.strictObject({ ...QUALIFICATION_COORDINATE_SCHEMA.entries, ownerRef: ref, version: ref, assetPath: ref }),
  sources: v.array(QUALIFICATION_SOURCE_SCHEMA),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_SURFACE_ROLES = ["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"] as const;
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_INVENTORY_SCHEMA = v.strictObject({
  kind: v.literal("qualification_subject_inventory"), inventoryRef: ref, inventoryDigest: digest,
  selectedRoots: v.array(ref), coverage: v.picklist(["complete_claim", "incomplete"]),
  members: v.array(v.strictObject({ ...QUALIFICATION_SOURCE_SCHEMA.entries,
    surfaceRoles: v.array(v.picklist(QUALIFICATION_SURFACE_ROLES)), classificationEvidenceRefs: v.array(ref) })),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const TENANT_CONFORMANCE_MANIFEST_SCHEMA = v.strictObject({
  kind: v.literal("tenant_conformance_manifest"), schemaVersion: v.literal("5.0.0"), manifestRef: ref, manifestDigest: digest,
  productId: ref, capabilityDefinitionGraph: QUALIFICATION_COORDINATE_SCHEMA,
  publicContractCatalog: QUALIFICATION_COORDINATE_SCHEMA,
  claims: v.array(v.strictObject({ claimRef: ref, capabilityRef: ref, publicContractRefs: v.array(ref), evidenceRefs: v.array(ref) })),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA = v.strictObject({
  kind: v.literal("exact_candidate_qualification"), projection: v.literal("basis"), schemaVersion: v.literal("5.0.0"),
  subjectKind: v.picklist(["pre_rc_candidate", "installed_rc", "final_tap_candidate"]), basisRef: ref, basisDigest: digest,
  productId: ref, productVersion: ref, sourceInventory: QUALIFICATION_COORDINATE_SCHEMA,
  artifact: QUALIFICATION_COORDINATE_SCHEMA, productManifest: QUALIFICATION_COORDINATE_SCHEMA,
  productContentDigest: digest, toolchain: QUALIFICATION_COORDINATE_SCHEMA,
  installedProduct: v.nullable(QUALIFICATION_COORDINATE_SCHEMA), workspaceBinding: v.nullable(QUALIFICATION_COORDINATE_SCHEMA),
  prospectiveRelease: v.nullable(v.strictObject({ productId: ref, version: ref })),
  tenantManifest: v.nullable(QUALIFICATION_COORDINATE_SCHEMA),
  owningGateInventory: v.nullable(QUALIFICATION_COORDINATE_SCHEMA), lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_EVIDENCE_CITATION_SCHEMA = v.strictObject({
  ...QUALIFICATION_COORDINATE_SCHEMA.entries, role: ref, subjectBasisDigest: digest, lawBasisDigest: digest,
  scopeRefs: v.array(ref), actorRef: ref, authorityRef: ref, admissionEventRef: ref,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("self_conformance_input"), schemaVersion: v.literal("5.0.0"),
  basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, law: v.nullable(QUALIFICATION_LAW_BASIS_SCHEMA),
  inventory: v.nullable(QUALIFICATION_INVENTORY_SCHEMA), tenantManifest: v.nullable(TENANT_CONFORMANCE_MANIFEST_SCHEMA),
  authorityMembers: v.array(v.strictObject({ ...QUALIFICATION_SOURCE_SCHEMA.entries, contentBase64: v.string() })),
  applications: v.array(v.strictObject({ ruleRef: ref, surfaceRef: ref,
    applicability: v.picklist(["applicable", "inapplicable", "unknown"]), premiseEvidenceRefs: v.array(ref),
    evaluationEvidenceRefs: v.array(ref), rulingEvidenceRefs: v.array(ref) })),
  evidenceCitations: v.array(QUALIFICATION_EVIDENCE_CITATION_SCHEMA),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_OWNER_BASIS_SCHEMA = v.strictObject({
  cCallRef: ref, predecessorPrefix: v.strictObject({ kind: v.literal("durable_prefix_coordinate"), schemaVersion: v.literal("5.0.0"),
    eventLogRef: ref, prefixLength: ordinal, prefixDigest: digest,
    storeIdentity: v.strictObject({ device: ordinal, inode: ordinal, eventContractDigest: digest }), coordinateDigest: digest }),
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_OWNER_SCHEMA = v.strictObject({
  installId: ref, installDigest: digest, artifactDigest: digest, productId: ref, productVersion: ref,
  productContentDigest: digest, manifestDigest: digest, publicationDigest: digest,
  workspaceBinding: QUALIFICATION_COORDINATE_SCHEMA, executionBasis: QUALIFICATION_COORDINATE_SCHEMA,
  cCallDigest: digest, nativeBasis: QUALIFICATION_OWNER_BASIS_SCHEMA,
  catalogDigest: digest, catalogRef: ref, catalogVersion: ref, catalogAssetPath: ref,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_FINDING_SCHEMA = v.strictObject({
  diagnostic: ref, ruleRef: v.nullable(ref), sourceRef: v.nullable(ref), surfaceRefs: v.array(ref),
  disposition: v.picklist(["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"]),
  provenance: v.picklist(["C", "J_required", "O_required"]), evidenceRefs: v.array(ref), detail: ref,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_RESULT_SCHEMA = v.strictObject({
  kind: v.literal("self_conformance_result"), schemaVersion: v.literal("5.0.0"), resultRef: ref, resultDigest: digest,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  inventoryDigest: v.nullable(digest), inputDigest: digest, owner: SELF_CONFORMANCE_OWNER_SCHEMA,
  ruleApplications: SELF_CONFORMANCE_INPUT_SCHEMA.entries.applications,
  evidenceCitations: SELF_CONFORMANCE_INPUT_SCHEMA.entries.evidenceCitations,
  findings: v.array(SELF_CONFORMANCE_FINDING_SCHEMA), disposition: v.picklist(["passed", "failed", "blocked_incomplete"]),
  qualificationVerdict: v.literal(false),
});
export type QualificationLawBasis = { kind: "qualification_law_basis"; lawBasisRef: string; lawBasisDigest: string; releaseRef: string; methodVersion: string; installedManifestDigest: string; memberSetDigest: string; catalog: { ownerRef: string; version: string; assetPath: string; ref: string; digest: string; }; sources: { ref: string; path: string; digest: string; byteCount: number; }[]; };
export type QualificationRuleCatalog = { kind: "qualification_rule_catalog"; schemaVersion: "5.0.0"; catalogRef: string; catalogVersion: string; ownerRef: string; method: { releaseRef: string; methodVersion: string; installedManifestDigest: string; memberSetDigest: string; }; sources: { ref: string; path: string; digest: string; byteCount: number; }[]; rules: { ruleRef: string; version: string; sourceRef: string; sourceDigest: string; startByte: number; endByte: number; spanDigest: string; governedClaim: string; applicability: "requires_admitted_judgment"; requiredEvidenceRoles: string[]; computableRelation: "source_span_integrity"; diagnostic: "semantic_assessment_required"; }[]; coverageClaim: "finite_candidate_unassessed"; requiredCatalogEvidenceRoles: string[]; };
export type QualificationSubjectInventory = { kind: "qualification_subject_inventory"; inventoryRef: string; inventoryDigest: string; selectedRoots: string[]; coverage: "complete_claim" | "incomplete"; members: { surfaceRoles: ("constitutional" | "design" | "code" | "proof" | "execution_contract" | "public_contract" | "manifest" | "qualification" | "release_claim")[]; classificationEvidenceRefs: string[]; ref: string; path: string; digest: string; byteCount: number; }[]; };
export type TenantConformanceManifest = { kind: "tenant_conformance_manifest"; schemaVersion: "5.0.0"; manifestRef: string; manifestDigest: string; productId: string; capabilityDefinitionGraph: { ref: string; digest: string; }; publicContractCatalog: { ref: string; digest: string; }; claims: { claimRef: string; capabilityRef: string; publicContractRefs: string[]; evidenceRefs: string[]; }[]; };
export type ExactCandidateQualification<K extends "basis"> = { kind: "exact_candidate_qualification"; projection: "basis"; schemaVersion: "5.0.0"; subjectKind: "pre_rc_candidate" | "installed_rc" | "final_tap_candidate"; basisRef: string; basisDigest: string; productId: string; productVersion: string; sourceInventory: { ref: string; digest: string; }; artifact: { ref: string; digest: string; }; productManifest: { ref: string; digest: string; }; productContentDigest: string; toolchain: { ref: string; digest: string; }; installedProduct: { ref: string; digest: string; } | null; workspaceBinding: { ref: string; digest: string; } | null; prospectiveRelease: { productId: string; version: string; } | null; tenantManifest: { ref: string; digest: string; } | null; owningGateInventory: { ref: string; digest: string; } | null; lawBasis: { ref: string; digest: string; }; };
export type SelfConformanceInput = { kind: "self_conformance_input"; schemaVersion: "5.0.0"; basis: { kind: "exact_candidate_qualification"; projection: "basis"; schemaVersion: "5.0.0"; subjectKind: "pre_rc_candidate" | "installed_rc" | "final_tap_candidate"; basisRef: string; basisDigest: string; productId: string; productVersion: string; sourceInventory: { ref: string; digest: string; }; artifact: { ref: string; digest: string; }; productManifest: { ref: string; digest: string; }; productContentDigest: string; toolchain: { ref: string; digest: string; }; installedProduct: { ref: string; digest: string; } | null; workspaceBinding: { ref: string; digest: string; } | null; prospectiveRelease: { productId: string; version: string; } | null; tenantManifest: { ref: string; digest: string; } | null; owningGateInventory: { ref: string; digest: string; } | null; lawBasis: { ref: string; digest: string; }; }; law: { kind: "qualification_law_basis"; lawBasisRef: string; lawBasisDigest: string; releaseRef: string; methodVersion: string; installedManifestDigest: string; memberSetDigest: string; catalog: { ownerRef: string; version: string; assetPath: string; ref: string; digest: string; }; sources: { ref: string; path: string; digest: string; byteCount: number; }[]; } | null; inventory: { kind: "qualification_subject_inventory"; inventoryRef: string; inventoryDigest: string; selectedRoots: string[]; coverage: "complete_claim" | "incomplete"; members: { surfaceRoles: ("constitutional" | "design" | "code" | "proof" | "execution_contract" | "public_contract" | "manifest" | "qualification" | "release_claim")[]; classificationEvidenceRefs: string[]; ref: string; path: string; digest: string; byteCount: number; }[]; } | null; tenantManifest: { kind: "tenant_conformance_manifest"; schemaVersion: "5.0.0"; manifestRef: string; manifestDigest: string; productId: string; capabilityDefinitionGraph: { ref: string; digest: string; }; publicContractCatalog: { ref: string; digest: string; }; claims: { claimRef: string; capabilityRef: string; publicContractRefs: string[]; evidenceRefs: string[]; }[]; } | null; authorityMembers: { contentBase64: string; ref: string; path: string; digest: string; byteCount: number; }[]; applications: { ruleRef: string; surfaceRef: string; applicability: "applicable" | "inapplicable" | "unknown"; premiseEvidenceRefs: string[]; evaluationEvidenceRefs: string[]; rulingEvidenceRefs: string[]; }[]; evidenceCitations: { role: string; subjectBasisDigest: string; lawBasisDigest: string; scopeRefs: string[]; actorRef: string; authorityRef: string; admissionEventRef: string; ref: string; digest: string; }[]; };
export type SelfConformanceResult = { kind: "self_conformance_result"; schemaVersion: "5.0.0"; resultRef: string; resultDigest: string; subjectBasis: { ref: string; digest: string; }; lawBasis: { ref: string; digest: string; }; inventoryDigest: string | null; inputDigest: string; owner: { installId: string; installDigest: string; artifactDigest: string; productId: string; productVersion: string; productContentDigest: string; manifestDigest: string; publicationDigest: string; workspaceBinding: { ref: string; digest: string; }; executionBasis: { ref: string; digest: string; }; cCallDigest: string; nativeBasis: { cCallRef: string; predecessorPrefix: { kind: "durable_prefix_coordinate"; schemaVersion: "5.0.0"; eventLogRef: string; prefixLength: number; prefixDigest: string; storeIdentity: { device: number; inode: number; eventContractDigest: string; }; coordinateDigest: string; }; }; catalogDigest: string; catalogRef: string; catalogVersion: string; catalogAssetPath: string; }; ruleApplications: { ruleRef: string; surfaceRef: string; applicability: "applicable" | "inapplicable" | "unknown"; premiseEvidenceRefs: string[]; evaluationEvidenceRefs: string[]; rulingEvidenceRefs: string[]; }[]; evidenceCitations: { role: string; subjectBasisDigest: string; lawBasisDigest: string; scopeRefs: string[]; actorRef: string; authorityRef: string; admissionEventRef: string; ref: string; digest: string; }[]; findings: { diagnostic: string; ruleRef: string | null; sourceRef: string | null; surfaceRefs: string[]; disposition: "passed" | "failed" | "inapplicable_with_reason" | "blocked_incomplete" | "accepted_reentry"; provenance: "C" | "J_required" | "O_required"; evidenceRefs: string[]; detail: string; }[]; disposition: "passed" | "failed" | "blocked_incomplete"; qualificationVerdict: false; };
export type SelfConformanceOwner = { installId: string; installDigest: string; artifactDigest: string; productId: string; productVersion: string; productContentDigest: string; manifestDigest: string; publicationDigest: string; workspaceBinding: { ref: string; digest: string; }; executionBasis: { ref: string; digest: string; }; cCallDigest: string; nativeBasis: { cCallRef: string; predecessorPrefix: { kind: "durable_prefix_coordinate"; schemaVersion: "5.0.0"; eventLogRef: string; prefixLength: number; prefixDigest: string; storeIdentity: { device: number; inode: number; eventContractDigest: string; }; coordinateDigest: string; }; }; catalogDigest: string; catalogRef: string; catalogVersion: string; catalogAssetPath: string; };
export type SelfConformanceFinding = { diagnostic: string; ruleRef: string | null; sourceRef: string | null; surfaceRefs: string[]; disposition: "passed" | "failed" | "inapplicable_with_reason" | "blocked_incomplete" | "accepted_reentry"; provenance: "C" | "J_required" | "O_required"; evidenceRefs: string[]; detail: string; };
export function qualificationIdentityDigest(value: object, refKey: string, digestKey: string): Sha256Digest {
  const body = Object.fromEntries(Object.entries(value).filter(([key]) => key !== refKey && key !== digestKey));
  return sha256Canonical(body as JsonValue);
}
export function isSelfConformanceInput(value: unknown): value is SelfConformanceInput { return v.is(SELF_CONFORMANCE_INPUT_SCHEMA, value); }
export function isSelfConformanceResult(value: unknown): value is SelfConformanceResult {
  return v.is(SELF_CONFORMANCE_RESULT_SCHEMA, value) &&
    qualificationIdentityDigest(value, "resultRef", "resultDigest") === value.resultDigest &&
    value.resultRef === `self-conformance-result://abiogenesis/${value.resultDigest.slice(7)}`;
}
