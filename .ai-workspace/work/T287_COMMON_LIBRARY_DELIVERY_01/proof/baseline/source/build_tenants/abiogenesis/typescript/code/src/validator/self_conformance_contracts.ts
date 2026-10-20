import * as v from "valibot";
import { EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, QUALIFICATION_LAW_BASIS_SCHEMA, QUALIFICATION_INVENTORY_SCHEMA,
  TENANT_CONFORMANCE_MANIFEST_SCHEMA, QUALIFICATION_SOURCE_SCHEMA, QUALIFICATION_EVIDENCE_CITATION_SCHEMA,
  QUALIFICATION_COORDINATE_SCHEMA, QUALIFICATION_ASSESSMENT_PLAN_SCHEMA, QUALIFICATION_PROOF_RESOURCE_SCHEMA,
  QUALIFICATION_COVERAGE_CATALOG_SCHEMA, QUALIFICATION_MATERIAL_SCHEMA, QUALIFICATION_NATIVE_BASIS_SCHEMA,
  QUALIFICATION_VERIFICATION_SELECTION_SCHEMA, QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA, QUALIFICATION_SCOPE_SCHEMA, qualificationIdentityDigest, QUALIFICATION_RESOURCE_SELECTION_SCHEMA, QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA } from "./qualification_contracts.js";
export * from "./qualification_contracts.js";
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const ordinal = v.pipe(v.number(), v.integer(), v.minValue(0));
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("self_conformance_input"), schemaVersion: v.literal("5.0.0"),
  basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, law: v.nullable(QUALIFICATION_LAW_BASIS_SCHEMA),
  inventory: v.nullable(QUALIFICATION_INVENTORY_SCHEMA), tenantManifest: v.nullable(TENANT_CONFORMANCE_MANIFEST_SCHEMA),
  scope: v.optional(QUALIFICATION_SCOPE_SCHEMA),
  authorityMembers: v.array(v.strictObject({ ...QUALIFICATION_SOURCE_SCHEMA.entries, contentBase64: v.string() })),
  applications: v.array(v.strictObject({ ruleRef: ref, surfaceRef: ref,
    applicability: v.picklist(["applicable", "inapplicable", "unknown"]), premiseEvidenceRefs: v.array(ref),
    evaluationEvidenceRefs: v.array(ref), rulingEvidenceRefs: v.array(ref) })),
  evidenceCitations: v.array(QUALIFICATION_EVIDENCE_CITATION_SCHEMA),
  qualification: v.optional(v.strictObject({ plan: QUALIFICATION_ASSESSMENT_PLAN_SCHEMA, proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA,
    sourceMembers: v.array(QUALIFICATION_MATERIAL_SCHEMA), coverageCatalog: QUALIFICATION_COVERAGE_CATALOG_SCHEMA,
    verification: v.optional(QUALIFICATION_VERIFICATION_SELECTION_SCHEMA) })),
});
const selection = <K extends string>(kind: K) => v.strictObject({ ...QUALIFICATION_RESOURCE_SELECTION_SCHEMA.entries, entryKind: v.literal(kind) });
export const SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA = v.strictObject({ ...SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), resource: QUALIFICATION_COORDINATE_SCHEMA,
  law: v.nullable(selection("law")), inventory: v.nullable(selection("inventory")), tenantManifest: v.nullable(selection("tenant_manifest")),
  scope: v.optional(selection("scope")), authorityMembers: v.array(selection("material")),
  qualification: v.optional(v.strictObject({ plan: QUALIFICATION_ASSESSMENT_PLAN_SCHEMA, proof: QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA,
    sourceMembers: v.array(selection("material")), coverageCatalog: selection("coverage_catalog"),
    verification: v.optional(v.strictObject({ ...QUALIFICATION_VERIFICATION_SELECTION_SCHEMA.entries, recipe: selection("verification_recipe") })) })) });
export const SELF_CONFORMANCE_INPUT_SCHEMA = v.union([SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA, SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA]);
const selfConformanceEmbeddedDataSchema = SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA;
export type SelfConformanceEmbeddedInput = v.InferOutput<typeof selfConformanceEmbeddedDataSchema>;
export type SelfConformanceReferenceInput = v.InferOutput<typeof SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA>;
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_OWNER_BASIS_SCHEMA = QUALIFICATION_NATIVE_BASIS_SCHEMA;
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
  provenance: v.picklist(["C", "J", "O", "J_required", "O_required"]), evidenceRefs: v.array(ref), detail: ref,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA = v.strictObject({
  kind: v.literal("self_conformance_result"), schemaVersion: v.literal("5.0.0"), resultRef: ref, resultDigest: digest,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  inventoryDigest: v.nullable(digest), inputDigest: digest, owner: SELF_CONFORMANCE_OWNER_SCHEMA,
  ruleApplications: SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA.entries.applications,
  scope: v.optional(QUALIFICATION_SCOPE_SCHEMA),
  evidenceCitations: SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA.entries.evidenceCitations,
  findings: v.array(SELF_CONFORMANCE_FINDING_SCHEMA), disposition: v.picklist(["passed", "failed", "blocked_incomplete"]),
  qualificationVerdict: v.literal(false),
  verification: v.optional(v.nullable(QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA)),
});

export const SELF_CONFORMANCE_REFERENCE_RESULT_SCHEMA = v.strictObject({ ...SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), scope: v.optional(selection("scope")) });
export const SELF_CONFORMANCE_RESULT_SCHEMA = v.union([SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA, SELF_CONFORMANCE_REFERENCE_RESULT_SCHEMA]);
// Keep data inference portable without exposing the internal parser exports.
const selfConformanceDataSchemas = {
  input: SELF_CONFORMANCE_INPUT_SCHEMA,
  result: SELF_CONFORMANCE_RESULT_SCHEMA,
  owner: SELF_CONFORMANCE_OWNER_SCHEMA,
  finding: SELF_CONFORMANCE_FINDING_SCHEMA,
} as const;
export type SelfConformanceInput = v.InferOutput<typeof selfConformanceDataSchemas.input>;
export type SelfConformanceResult = v.InferOutput<typeof selfConformanceDataSchemas.result>;
export type SelfConformanceOwner = v.InferOutput<typeof selfConformanceDataSchemas.owner>;
export type SelfConformanceFinding = v.InferOutput<typeof selfConformanceDataSchemas.finding>;
export function isSelfConformanceInput(value: unknown): value is SelfConformanceInput { return v.is(SELF_CONFORMANCE_INPUT_SCHEMA, value); }
export function isSelfConformanceResult(value: unknown): value is SelfConformanceResult {
  return v.is(SELF_CONFORMANCE_RESULT_SCHEMA, value) &&
    qualificationIdentityDigest(value, "resultRef", "resultDigest") === value.resultDigest &&
    value.resultRef === `self-conformance-result://abiogenesis/${value.resultDigest.slice(7)}`;
}
