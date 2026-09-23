import * as v from "valibot";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { CONTEXT_DECLARATION_SCHEMA } from "../gtl/requirement_handoff.js";
import { ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA } from "../abg/terminal_result_contracts.js";
import { deepFreeze } from "../shared/immutable.js";
import { jsonValueSchema } from "../shared/public_function_contracts.js";
import { RAW_SUBJECT_KIND_VALUES } from "./raw_admission.js";

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
  subjectKind: v.picklist(["pre_rc_candidate", "installed_rc"]), basisRef: ref, basisDigest: digest,
  productId: ref, productVersion: ref, sourceInventory: QUALIFICATION_COORDINATE_SCHEMA,
  artifact: QUALIFICATION_COORDINATE_SCHEMA, productManifest: QUALIFICATION_COORDINATE_SCHEMA,
  productContentDigest: digest, toolchain: QUALIFICATION_COORDINATE_SCHEMA,
  installedProduct: v.nullable(QUALIFICATION_COORDINATE_SCHEMA), workspaceBinding: v.nullable(QUALIFICATION_COORDINATE_SCHEMA),
  prospectiveRelease: v.nullable(v.strictObject({ productId: ref, namespace: ref, profile: v.literal("one_project_unqualified"), projectSubtree: ref, versionLine: ref, ordinal: v.pipe(ordinal, v.minValue(1)), version: ref, releaseClaim: QUALIFICATION_COORDINATE_SCHEMA })),
  tenantManifest: v.nullable(QUALIFICATION_COORDINATE_SCHEMA),
  coverageCatalog: v.nullable(QUALIFICATION_COORDINATE_SCHEMA), lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
});
/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */
export const QUALIFICATION_EVIDENCE_CITATION_SCHEMA = v.strictObject({
  ...QUALIFICATION_COORDINATE_SCHEMA.entries, role: ref, subjectBasisDigest: digest, lawBasisDigest: digest,
  scopeRefs: v.array(ref), actorRef: ref, authorityRef: ref, admissionEventRef: ref,
});

/** A proof resource is supplied immutable data; these guards grant no authority. */
export const QUALIFICATION_PREFIX_SCHEMA = v.strictObject({
  kind: v.literal("durable_prefix_coordinate"), schemaVersion: v.literal("5.0.0"), eventLogRef: ref,
  prefixLength: ordinal, prefixDigest: digest,
  storeIdentity: v.strictObject({ device: ordinal, inode: ordinal, eventContractDigest: digest }), coordinateDigest: digest,
});
export const QUALIFICATION_NATIVE_BASIS_SCHEMA = v.strictObject({ cCallRef: ref, predecessorPrefix: QUALIFICATION_PREFIX_SCHEMA });
export const QUALIFICATION_MATERIAL_SCHEMA = v.strictObject({ ...QUALIFICATION_SOURCE_SCHEMA.entries, contentBase64: v.string() });
export const QUALIFICATION_COVERAGE_SCHEMA = v.strictObject({
  criterionRef: ref, ruleRef: ref, surfaceRef: ref, evidenceRole: ref,
});
export const QUALIFICATION_ROLE_SCHEMA = v.strictObject({
  roleRef: ref, authorityRef: ref, sourceBindings: v.array(QUALIFICATION_SOURCE_SCHEMA),
  actorRef: ref, workerBindingRef: ref, rendererRef: ref, materializationPlanRef: ref,
  independence: v.picklist(["author_distinct", "author_and_peer_distinct", "not_required"]),
});
/** Immutable published role policy. Tasks select it; they cannot mint roles. */
export const QUALIFICATION_ROLE_POLICY = Object.freeze({
  roleRefs: ["qualification-role://abiogenesis/catalog@5", "qualification-role://abiogenesis/inventory@5",
    "qualification-role://abiogenesis/tenant@5", "qualification-role://abiogenesis/rule@5", "qualification-role://abiogenesis/coverage@5"],
  actorRefs: ["actor://abiogenesis/qualification/assessor-primary@5", "actor://abiogenesis/qualification/assessor-peer@5"],
  workerBindingRef: "worker-binding://abiogenesis/qualification/assessor@5",
  rendererRef: "renderer://abiogenesis/qualification/assessment@5",
  materializationPlanRef: "materialization-plan://abiogenesis/qualification/assessment@5",
  authorityRef: "actor-capability://abiogenesis/qualification/product-owner@5",
  authoritySourceRefs: ["repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md",
    "repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md"],
});
/** Same SemanticAssetSurface shape; no lifecycle/worksite declaration is invented. */
export const QUALIFICATION_ASSET_SURFACE_SCHEMA = v.strictObject({
  kind: v.literal("qualification_assessment"), requiredContexts: v.array(ref), standardsRefs: v.array(ref),
  outputContractRefs: v.array(ref), constructorRef: ref, rendererRef: ref, proofObligationRefs: v.array(ref),
  authoritySlots: v.array(v.strictObject({ authorityKindRef: ref,
    disposition: v.picklist(["normal", "bounded_fallback", "forbidden_routine"]), fallbackPreconditionRefs: v.array(ref) })),
});
export const QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA = v.variant("kind", [
  v.strictObject({ kind: v.literal("native_construction"), subjectInventory: QUALIFICATION_COORDINATE_SCHEMA,
    producers: v.pipe(v.array(v.strictObject({ cCallRef: ref, result: QUALIFICATION_COORDINATE_SCHEMA,
      actorRef: ref, workerBindingRef: ref, scopeRefs: v.array(ref) })), v.minLength(1)) }),
  v.strictObject({ kind: v.literal("external_construction"), subjectInventory: QUALIFICATION_COORDINATE_SCHEMA,
    recordSet: QUALIFICATION_COORDINATE_SCHEMA, records: v.pipe(v.array(QUALIFICATION_MATERIAL_SCHEMA), v.minLength(1)),
    chains: v.pipe(v.array(v.strictObject({ activationRef: ref, preimageRef: ref, deltaRef: ref, closureRef: ref,
      authorRef: ref, actorIdentityRef: ref, authorityRef: ref, scopeRefs: v.array(ref),
      postimageMembers: v.pipe(v.array(QUALIFICATION_SOURCE_SCHEMA), v.minLength(1)),
      changes: v.pipe(v.array(v.strictObject({ memberRef: ref, patchPath: ref,
        preimageMemberRef: v.nullable(ref), postimageMemberRef: ref })), v.minLength(1)),
      attributionSources: v.pipe(v.array(v.strictObject({ sourceRef: ref, startByte: ordinal, endByte: ordinal, spanDigest: digest })), v.minLength(1)),
    })), v.minLength(1)),
    acknowledgmentSelectionRef: v.nullable(ref) }),
]);
/** Slot keys predate the producing occurrence. CCall/result identity is never a slot. */
export const QUALIFICATION_ASSESSMENT_TASK_SCHEMA = v.strictObject({
  kind: v.literal("qualification_assessment_task"), schemaVersion: v.literal("5.0.0"),
  taskRef: ref, taskDigest: digest, slotRef: ref, taskOrdinal: ordinal,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  catalog: QUALIFICATION_COORDINATE_SCHEMA, inventory: QUALIFICATION_COORDINATE_SCHEMA,
  role: QUALIFICATION_ROLE_SCHEMA, context: CONTEXT_DECLARATION_SCHEMA,
  declarations: v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
  assetSurface: QUALIFICATION_ASSET_SURFACE_SCHEMA, material: v.array(QUALIFICATION_MATERIAL_SCHEMA),
  subjectMembers: v.pipe(v.array(QUALIFICATION_SOURCE_SCHEMA), v.minLength(1)),
  coverage: v.pipe(v.array(QUALIFICATION_COVERAGE_SCHEMA), v.minLength(1)),
  provenance: QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA, priorEvidenceRefs: v.array(ref), residuals: v.array(ref),
});
export const QUALIFICATION_ASSESSMENT_PLAN_SCHEMA = v.strictObject({
  kind: v.literal("qualification_assessment_plan"), planRef: ref, planDigest: digest,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  slots: v.pipe(v.array(v.strictObject({ slotRef: ref, task: QUALIFICATION_COORDINATE_SCHEMA, taskOrdinal: ordinal,
    graphFunctionRef: ref, programLocusRef: ref, role: QUALIFICATION_ROLE_SCHEMA,
    coverage: v.array(QUALIFICATION_COVERAGE_SCHEMA) })), v.minLength(1)),
  coverage: v.array(QUALIFICATION_COVERAGE_SCHEMA),
  sharedCoverage: v.picklist(["disjoint", "declared_independent_peers"]),
  ownerAuthorityRef: ref, ownerActorRef: ref,
});
export const QUALIFICATION_RAW_JUDGMENT_SCHEMA = v.strictObject({
  kind: v.literal("qualification_raw_judgment"), schemaVersion: v.literal("5.0.0"),
  criteria: v.pipe(v.array(v.strictObject({ ...QUALIFICATION_COVERAGE_SCHEMA.entries,
    disposition: v.picklist(["satisfied", "falsified", "indeterminate"]),
    applicability: v.picklist(["applicable", "inapplicable", "unknown"]),
    reason: ref, sourceRefs: v.pipe(v.array(ref), v.minLength(1)), evidenceRefs: v.array(ref), residuals: v.array(ref) })), v.minLength(1)),
  residuals: v.array(ref),
  attributions: v.array(v.strictObject({ activationRef: ref, authorRef: ref, actorIdentityRef: ref, authorityRef: ref,
    scopeRefs: v.array(ref), disposition: v.picklist(["established", "disputed", "insufficient"]),
    sourceRefs: v.pipe(v.array(ref), v.minLength(1)), reason: ref })),
});
export const QUALIFICATION_ASSESSMENT_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("qualification_assessment_input"), schemaVersion: v.literal("5.0.0"),
  task: QUALIFICATION_ASSESSMENT_TASK_SCHEMA, plan: QUALIFICATION_ASSESSMENT_PLAN_SCHEMA,
});
export const QUALIFICATION_JUDGMENT_SCHEMA = v.strictObject({
  kind: v.literal("qualification_judgment"), schemaVersion: v.literal("5.0.0"),
  judgmentRef: ref, judgmentDigest: digest, task: QUALIFICATION_ASSESSMENT_TASK_SCHEMA, plan: QUALIFICATION_ASSESSMENT_PLAN_SCHEMA,
  raw: QUALIFICATION_RAW_JUDGMENT_SCHEMA, nativeBasis: QUALIFICATION_NATIVE_BASIS_SCHEMA,
  source: v.strictObject({ cCallRef: ref, inputDigest: digest, actorRef: ref, workerBindingRef: ref,
    actorInvocationRef: ref, transportBindingRef: ref, transportBindingDigest: digest,
    requestDigest: digest, observationDigest: digest, promptDigest: digest, rawValueDigest: digest }),
});
export const QUALIFICATION_RULING_REQUEST_SCHEMA = v.strictObject({
  kind: v.literal("qualification_ruling_request"), schemaVersion: v.literal("5.0.0"),
  requestRef: ref, requestDigest: digest, slotRef: ref, subjectBasis: QUALIFICATION_COORDINATE_SCHEMA,
  lawBasis: QUALIFICATION_COORDINATE_SCHEMA, authorityRef: ref, actorRef: ref,
  decision: v.picklist(["external_attribution", "bounded_exclusion", "lawful_reentry"]),
  declarations: v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
  scopeRefs: v.pipe(v.array(ref), v.minLength(1)), recordSet: v.nullable(QUALIFICATION_COORDINATE_SCHEMA),
  attributedIdentities: v.array(v.strictObject({ authorRef: ref, actorIdentityRef: ref })), retainedObligationRefs: v.array(ref),
});
export const QUALIFICATION_OWNER_RULING_SCHEMA = v.strictObject({
  kind: v.literal("qualification_owner_ruling"), schemaVersion: v.literal("5.0.0"),
  request: QUALIFICATION_COORDINATE_SCHEMA, slotRef: ref, subjectBasis: QUALIFICATION_COORDINATE_SCHEMA,
  lawBasis: QUALIFICATION_COORDINATE_SCHEMA, authorityRef: ref, actorRef: ref,
  disposition: v.picklist(["acknowledged", "disputed", "insufficient", "accepted_reentry", "justified_exclusion"]),
  reason: ref, evidenceRefs: v.array(ref), retainedObligationRefs: v.array(ref),
});
export const QUALIFICATION_SELECTION_SCHEMA = v.variant("kind", [
  v.strictObject({ kind: v.literal("judgment_selection"), selectionRef: ref,
    slotRef: ref, task: QUALIFICATION_COORDINATE_SCHEMA, programRef: ref, invocationAdmissionRef: ref,
    result: QUALIFICATION_COORDINATE_SCHEMA }),
  v.strictObject({ kind: v.literal("ruling_selection"), selectionRef: ref,
    slotRef: ref, request: QUALIFICATION_COORDINATE_SCHEMA, continuationRef: ref }),
  v.strictObject({ kind: v.literal("execution_selection"), selectionRef: ref,
    slotRef: ref, programRef: ref, invocationAdmissionRef: ref,
    result: QUALIFICATION_COORDINATE_SCHEMA }),
  v.strictObject({ kind: v.literal("self_conformance_selection"), selectionRef: ref,
    slotRef: ref, programRef: ref, invocationAdmissionRef: ref,
    result: QUALIFICATION_COORDINATE_SCHEMA }),
  v.strictObject({ kind: v.literal("verdict_selection"), selectionRef: ref,
    slotRef: ref, programRef: ref, invocationAdmissionRef: ref, result: QUALIFICATION_COORDINATE_SCHEMA }),
]);
export const QUALIFICATION_PROOF_RESOURCE_SCHEMA = v.strictObject({
  kind: v.literal("qualification_proof_resource"), schemaVersion: v.literal("5.0.0"),
  prefix: QUALIFICATION_PREFIX_SCHEMA,
  declarations: v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
  selections: v.array(QUALIFICATION_SELECTION_SCHEMA),
});
/** Coverage is source-linked claim data, never an executable roster. One
 * authenticated execution may support several independently assessed claims. */
export const QUALIFICATION_COVERAGE_CATALOG_SCHEMA = v.strictObject({
  kind: v.literal("qualification_coverage_catalog"), catalogRef: ref, catalogDigest: digest,
  lawBasis: QUALIFICATION_COORDINATE_SCHEMA, authoritySources: v.array(QUALIFICATION_SOURCE_SCHEMA),
  claims: v.pipe(v.array(v.strictObject({ coverageRef: ref,
    requirementRefs: v.pipe(v.array(ref), v.minLength(1)),
    behaviors: v.pipe(v.array(ref), v.minLength(1)),
    evidenceRoles: v.pipe(v.array(ref), v.minLength(1)),
  })), v.minLength(1)),
});
const malformedOutcome = v.strictObject({
  boundary: v.picklist(["raw_admission", "program_validation"]),
  disposition: v.picklist(["accepted", "refused"]),
  diagnostics: v.array(v.strictObject({ code: ref, path: ref })),
});
/** Declared finite cases are gate data, not a built-in pass oracle. */
export const MALFORMED_GTL_CASE_SCHEMA = v.variant("operation", [
  v.strictObject({ caseRef: ref, operation: v.literal("raw"), subjectKind: v.picklist(RAW_SUBJECT_KIND_VALUES),
    contractRef: ref, value: jsonValueSchema, expected: malformedOutcome }),
  v.strictObject({ caseRef: ref, operation: v.literal("program"), publication: jsonValueSchema,
    program: jsonValueSchema, expected: malformedOutcome }),
]);
export const MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("malformed_gtl_assessment_input"), schemaVersion: v.literal("5.0.0"),
  basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, coverage: QUALIFICATION_COVERAGE_CATALOG_SCHEMA,
  declarations: v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
  cases: v.pipe(v.array(MALFORMED_GTL_CASE_SCHEMA), v.minLength(1)),
});
export const MALFORMED_GTL_ASSESSMENT_SCHEMA = v.strictObject({
  kind: v.literal("malformed_gtl_assessment"), schemaVersion: v.literal("5.0.0"),
  assessmentRef: ref, assessmentDigest: digest, input: MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA,
  nativeBasis: QUALIFICATION_NATIVE_BASIS_SCHEMA,
  cases: v.array(v.strictObject({ caseRef: ref, actual: malformedOutcome, matched: v.boolean() })),
  disposition: v.picklist(["green", "red"]),
});
export type MalformedGtlAssessmentInput = v.InferOutput<typeof MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA>;
export type MalformedGtlAssessment = v.InferOutput<typeof MALFORMED_GTL_ASSESSMENT_SCHEMA>;
/** Finite native cases, not a user-programmable assertion language. */
const nativeRuntimeStep = v.strictObject({ slotRef: ref, implementationRef: ref, inputDigest: digest,
  result: QUALIFICATION_COORDINATE_SCHEMA, expectedValueDigest: digest,
  // The nearest identity mutation holds the selected Result ref fixed.
  substituteResultDigest: digest });
const nativeRuntimeCase = { caseRef: ref, programRef: ref, invocationAdmissionRef: ref,
  graphFunction: QUALIFICATION_COORDINATE_SCHEMA };
const nativeRuntimeObservedStep = v.strictObject({ cCallRef: ref, result: QUALIFICATION_COORDINATE_SCHEMA,
  evidence: v.pipe(v.array(QUALIFICATION_COORDINATE_SCHEMA), v.minLength(1)),
  actualValueDigest: digest, matched: v.boolean(), substituteRefused: v.boolean() });
export const NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("native_runtime_assessment_input"), schemaVersion: v.literal("5.0.0"),
  basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, coverage: QUALIFICATION_COVERAGE_CATALOG_SCHEMA,
  proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA, predecessorWitness: QUALIFICATION_MATERIAL_SCHEMA,
  applicability: v.literal("retained_5_0"), applicabilitySourceRefs: v.pipe(v.array(ref), v.minLength(1)),
  cases: v.pipe(v.array(v.union([
    v.strictObject({ ...nativeRuntimeCase, ...nativeRuntimeStep.entries }),
    v.strictObject({ ...nativeRuntimeCase,
      structure: v.strictObject({ kind: v.picklist(["atomic_call", "flat_composition", "edge_program"]), nodeRef: ref, termDigest: digest }),
      steps: v.pipe(v.array(nativeRuntimeStep), v.minLength(1)) }),
  ])), v.minLength(1)),
});
export const NATIVE_RUNTIME_ASSESSMENT_SCHEMA = v.strictObject({
  kind: v.literal("native_runtime_assessment"), schemaVersion: v.literal("5.0.0"), assessmentRef: ref, assessmentDigest: digest,
  input: NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA, nativeBasis: QUALIFICATION_NATIVE_BASIS_SCHEMA,
  cases: v.array(v.strictObject({ caseRef: ref, ...nativeRuntimeObservedStep.entries,
    terminal: QUALIFICATION_COORDINATE_SCHEMA, replay: QUALIFICATION_COORDINATE_SCHEMA,
    steps: v.optional(v.pipe(v.array(nativeRuntimeObservedStep), v.minLength(1))) })),
  disposition: v.picklist(["green", "red"]),
});
export type NativeRuntimeAssessmentInput = v.InferOutput<typeof NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA>;
export type NativeRuntimeAssessment = v.InferOutput<typeof NATIVE_RUNTIME_ASSESSMENT_SCHEMA>;
/** Mechanical projection of one complete native F11 result. Its underlying
 * judgments/evidence may be shared; this summary itself supplies no authority. */
/** Subordinate QUAL-056 data. The recipe is a frozen subject member; selected
 * native evidence and F11 judgment, never this structure, supply authority. */
export const QUALIFICATION_VERIFICATION_RECIPE_SCHEMA = v.strictObject({
  kind: v.literal("qualification_verification_recipe"), schemaVersion: v.literal("1"),
  sourceInputs: v.pipe(v.array(v.strictObject({ memberRef: ref, relativePath: ref })), v.minLength(1)),
  auxiliaryInputs: v.array(v.strictObject({ relativePath: ref, digest, byteCount: ordinal })),
  commandConfigurationDigest: digest, predicateConfigurationDigest: digest, writeTerritoriesDigest: digest,
  commands: v.pipe(v.array(v.strictObject({ commandId: ref, role: v.picklist(["setup", "build", "lint", "test", "compare"]) })), v.minLength(1)),
  lint: v.strictObject({ commandId: ref, files: v.pipe(v.array(v.strictObject({ path: ref, kind: v.picklist(["mjs", "json"]) })), v.minLength(1)) }),
  tests: v.pipe(v.array(v.strictObject({ commandId: ref, files: v.pipe(v.array(ref), v.minLength(1)) })), v.minLength(1)),
  skipPolicy: v.literal("incomplete"), reportFormat: v.literal("node-test-events-jsonl@1"),
});
export const QUALIFICATION_VERIFICATION_SELECTION_SCHEMA = v.strictObject({
  executionSelectionRef: ref, recipe: QUALIFICATION_MATERIAL_SCHEMA, recipePath: ref,
});
const verificationCommand = v.strictObject({
  commandId: ref, role: v.picklist(["setup", "build", "lint", "test", "compare"]),
  observation: QUALIFICATION_COORDINATE_SCHEMA, executable: ref, args: v.array(v.string()), relativeCwd: ref,
  environment: jsonValueSchema, timeoutMs: ordinal, terminationGraceMs: ordinal,
  exitStatus: v.pipe(v.number(), v.integer()), timedOut: v.boolean(), processSignal: v.nullable(ref),
  signalSequence: v.array(ref), terminationConfirmed: v.boolean(),
  stdout: v.strictObject({ digest, byteLength: ordinal }), stderr: v.strictObject({ digest, byteLength: ordinal }),
  reports: jsonValueSchema,
});
const qualificationTestSummarySchema = v.strictObject({
  commandId: ref, streamDigest: digest, format: v.literal("node-test-events-jsonl@1"),
  disposition: v.picklist(["passed", "failed", "blocked_incomplete"]), diagnostics: v.array(ref),
  tests: ordinal, passed: ordinal, failed: ordinal, cancelled: ordinal, skipped: ordinal, todo: ordinal, suites: ordinal,
  files: v.array(ref), cases: v.array(jsonValueSchema), summaries: v.array(jsonValueSchema), complete: v.boolean(),
});
export type QualificationTestSummary = v.InferOutput<typeof qualificationTestSummarySchema>;
export const QUALIFICATION_TEST_SUMMARY_SCHEMA: v.GenericSchema<QualificationTestSummary> = qualificationTestSummarySchema;
const qualificationVerificationMaterialSchema = v.strictObject({
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  recipe: QUALIFICATION_COORDINATE_SCHEMA, executionSelectionRef: ref, execution: QUALIFICATION_COORDINATE_SCHEMA,
  cCall: QUALIFICATION_COORDINATE_SCHEMA, observation: QUALIFICATION_COORDINATE_SCHEMA,
  commandOutcomes: v.array(verificationCommand), lintOutcome: jsonValueSchema,
  predicateOutcomes: v.array(v.strictObject({ declaration: jsonValueSchema, observation: jsonValueSchema,
    disposition: v.picklist(["passed", "failed", "blocked_incomplete"]), diagnostics: v.array(ref) })),
  testSummaries: v.array(QUALIFICATION_TEST_SUMMARY_SCHEMA),
  disposition: v.picklist(["passed", "failed", "blocked_incomplete"]), diagnostics: v.array(ref),
});
export type QualificationVerificationRecipe = v.InferOutput<typeof QUALIFICATION_VERIFICATION_RECIPE_SCHEMA>;
export type QualificationVerificationSelection = v.InferOutput<typeof QUALIFICATION_VERIFICATION_SELECTION_SCHEMA>;
export type QualificationVerificationMaterial = v.InferOutput<typeof qualificationVerificationMaterialSchema>;
// Preserve one inferred data contract while keeping enclosing published native
// declarations finite; repeating the full parser tree exceeds TS instantiation.
export const QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA: v.GenericSchema<QualificationVerificationMaterial> = qualificationVerificationMaterialSchema;
export const QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA = v.strictObject({
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  assessment: QUALIFICATION_COORDINATE_SCHEMA,
  disposition: v.picklist(["green", "red", "blocked"]), bypassRefs: v.array(ref),
  verification: v.optional(v.nullable(QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA)),
});
export const QUALIFICATION_VERDICT_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("qualification_verdict_input"), schemaVersion: v.literal("5.0.0"),
  slotRef: ref, basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
  coverage: QUALIFICATION_COVERAGE_CATALOG_SCHEMA,
  selectionRef: ref, selfConformance: QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA,
  proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA,
});
export const EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA = v.strictObject({
  kind: v.literal("exact_candidate_qualification"), projection: v.literal("verdict"), schemaVersion: v.literal("5.0.0"),
  subjectKind: v.picklist(["pre_rc_candidate", "installed_rc"]), verdictRef: ref, verdictDigest: digest,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  coverageCatalog: QUALIFICATION_COORDINATE_SCHEMA, selfConformance: QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA,
  disposition: v.picklist(["green", "red", "blocked"]), bypassRefs: v.array(ref),
  slotRef: ref, nativeBasis: QUALIFICATION_NATIVE_BASIS_SCHEMA,
});
export const EXACT_CANDIDATE_QUALIFICATION_SCHEMA = v.variant("projection", [
  EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA,
]);
// Private inference anchor: data types remain derived from the runtime schemas
// while stripInternal keeps parser exports out of the native declaration ABI.
const qualificationDataSchemas = {
  coordinate: QUALIFICATION_COORDINATE_SCHEMA,
  lawBasis: QUALIFICATION_LAW_BASIS_SCHEMA,
  ruleCatalog: QUALIFICATION_RULE_CATALOG_SCHEMA,
  inventory: QUALIFICATION_INVENTORY_SCHEMA,
  tenantManifest: TENANT_CONFORMANCE_MANIFEST_SCHEMA,
  basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
} as const;
export type QualificationMaterial = v.InferOutput<typeof QUALIFICATION_MATERIAL_SCHEMA>;
export type QualificationCoordinate = v.InferOutput<typeof qualificationDataSchemas.coordinate>;
export type QualificationLawBasis = v.InferOutput<typeof qualificationDataSchemas.lawBasis>;
export type QualificationRuleCatalog = v.InferOutput<typeof qualificationDataSchemas.ruleCatalog>;
export type QualificationSubjectInventory = v.InferOutput<typeof qualificationDataSchemas.inventory>;
export type TenantConformanceManifest = v.InferOutput<typeof qualificationDataSchemas.tenantManifest>;
export type QualificationAssessmentTask = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_TASK_SCHEMA>;
export type QualificationAssessmentInput = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_INPUT_SCHEMA>;
export type QualificationAssessmentPlan = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_PLAN_SCHEMA>;
export type QualificationJudgment = v.InferOutput<typeof QUALIFICATION_JUDGMENT_SCHEMA>;
export type QualificationRawJudgment = v.InferOutput<typeof QUALIFICATION_RAW_JUDGMENT_SCHEMA>;
export type QualificationOwnerRuling = v.InferOutput<typeof QUALIFICATION_OWNER_RULING_SCHEMA>;
export type QualificationRulingRequest = v.InferOutput<typeof QUALIFICATION_RULING_REQUEST_SCHEMA>;
export type QualificationConstructionProvenance = v.InferOutput<typeof QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA>;
export type QualificationEvidenceSelection = v.InferOutput<typeof QUALIFICATION_SELECTION_SCHEMA>;
export type QualificationProofResource = v.InferOutput<typeof QUALIFICATION_PROOF_RESOURCE_SCHEMA>;
export type QualificationCoverageCatalog = v.InferOutput<typeof QUALIFICATION_COVERAGE_CATALOG_SCHEMA>;
export type QualificationSelfConformanceSummary = v.InferOutput<typeof QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA>;
export type QualificationVerdictInput = v.InferOutput<typeof QUALIFICATION_VERDICT_INPUT_SCHEMA>;
export type ExactCandidateQualification<K extends "basis" | "verdict"> = K extends "basis"
  ? v.InferOutput<typeof qualificationDataSchemas.basis> : v.InferOutput<typeof EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA>;
export type QualificationNativeBasis = v.InferOutput<typeof QUALIFICATION_NATIVE_BASIS_SCHEMA>;
export function qualificationIdentityDigest(value: object, refKey: string, digestKey: string): Sha256Digest {
  return sha256Canonical(Object.fromEntries(Object.entries(value).filter(([key]) => key !== refKey && key !== digestKey)) as JsonValue);
}
export const qualificationHash = (value: unknown): Sha256Digest => sha256Canonical(value as JsonValue);
export const sameQualificationValue = (a: unknown, b: unknown): boolean => qualificationHash(a) === qualificationHash(b);
export const uniqueQualificationRefs = (refs: readonly string[]): boolean => new Set(refs).size === refs.length;
export function qualificationIdentity(value: object, refKey: string, digestKey: string, prefix: string): boolean {
  const row = value as Record<string, unknown>, d = qualificationIdentityDigest(value, refKey, digestKey);
  return row[digestKey] === d && row[refKey] === prefix + d.slice(7);
}
export function constructQualificationIdentity<T extends object>(body: T, refKey: string, digestKey: string, prefix: string): T & Record<string, string> {
  const d = qualificationIdentityDigest(body, refKey, digestKey);
  return deepFreeze({ ...body, [refKey]: prefix + d.slice(7), [digestKey]: d }) as T & Record<string, string>;
}
export function isQualificationAssessmentTask(value: unknown): value is QualificationAssessmentTask {
  return v.is(QUALIFICATION_ASSESSMENT_TASK_SCHEMA, value) &&
    qualificationIdentity(value, "taskRef", "taskDigest", "qualification-task://abiogenesis/") &&
    uniqueQualificationRefs(value.coverage.map(qualificationHash)) && uniqueQualificationRefs(value.context.members.map(x => x.memberRef));
}
export function isQualificationJudgment(value: unknown): value is QualificationJudgment {
  return v.is(QUALIFICATION_JUDGMENT_SCHEMA, value) && isQualificationAssessmentTask(value.task) &&
    qualificationIdentity(value, "judgmentRef", "judgmentDigest", "qualification-judgment://abiogenesis/") &&
    value.source.cCallRef === value.nativeBasis.cCallRef && value.source.inputDigest === qualificationHash({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task: value.task, plan: value.plan }) &&
    value.source.rawValueDigest === qualificationHash(value.raw);
}
export function isQualificationVerdict(value: unknown): value is ExactCandidateQualification<"verdict"> {
  return v.is(EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA, value) &&
    qualificationIdentity(value, "verdictRef", "verdictDigest", "qualification-verdict://abiogenesis/");
}
export const isQualificationProofResource = (value: unknown): value is QualificationProofResource => v.is(QUALIFICATION_PROOF_RESOURCE_SCHEMA, value);
