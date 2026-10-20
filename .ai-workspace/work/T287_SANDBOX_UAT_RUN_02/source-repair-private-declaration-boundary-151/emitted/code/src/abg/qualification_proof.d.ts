import { type QualificationResources } from "../validator/qualification_resources.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type RuntimeEvent } from "./event_store.js";
import { type QualificationNativeBasis, type QualificationProofResource, type QualificationAssessmentPlan, type QualificationEvidenceSelection, type QualificationJudgment, type QualificationOwnerRuling, type QualificationSelfConformanceSummary, type QualificationMaterial, type QualificationVerdictInput, type TenantConformanceManifest, type MalformedGtlAssessment, type NativeRuntimeAssessment, type ExactCandidateQualification, type QualificationCoordinate, type QualificationVerificationSelection, type QualificationVerificationMaterial, type QualificationSubjectInventory } from "../validator/qualification_contracts.js";
import { type SelfConformanceOwner } from "../validator/self_conformance_contracts.js";
export declare const QUALIFICATION_IMPLEMENTATION_REFS: readonly string[];
export declare function projectQualificationConsumer(basis: QualificationNativeBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): {
    events: readonly RuntimeEvent[];
    prefix: import("./event_prefix.js").ValidatedRuntimeEventPrefix;
    opened: RuntimeEvent;
    execution: import("./execution_basis.js").ExecutionBasis;
    root: import("./execution_basis.js").ExecutionBasis;
    invocation: import("./invocation_admission.js").InvocationAdmission;
    environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
    closure: import("../product/declaration_closure.js").ResolvedExecutionDeclarationClosure;
    publication: Readonly<import("../index.js").ModulePublication>;
    graph: Readonly<import("../index.js").GtlGraph>;
    call: import("./c_call.js").CCall;
    resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow | null;
    input: Readonly<Record<string, JsonValue>>;
    proof: Readonly<{
        catalog: import("../index.js").ReadyGraphFunctionCatalog;
        catalogView: import("../index.js").GraphFunctionCatalogView;
        kind: "abg_historical_declaration_proof";
        schemaVersion: "5.0.0";
    }>;
} | null;
/** Reuse the native producer relation; the cited assessment is its exact typed
 * value, not a caller-authored assertion or an invented runtime Result ref. */
export declare function malformedGtlAssessmentHasNativeOwner(proof: QualificationProofResource, assessment: MalformedGtlAssessment, resources?: QualificationResources): boolean;
export declare function projectNativeRuntimeAssessment(basis: QualificationNativeBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): Readonly<NativeRuntimeAssessment> | null;
export declare function nativeRuntimeAssessmentHasNativeOwner(proof: QualificationProofResource, assessment: NativeRuntimeAssessment, resources?: QualificationResources): boolean;
export declare function projectQualificationRulingForConsumer(basis: QualificationNativeBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): Readonly<QualificationOwnerRuling> | null;
/** A selection cannot manufacture slots by assigning result IDs. */
export declare function projectQualificationJudgment(proof: QualificationProofResource, plan: QualificationAssessmentPlan, selection: Extract<QualificationEvidenceSelection, {
    kind: "judgment_selection";
}>, resources?: QualificationResources): Readonly<QualificationJudgment> | null;
export declare function projectQualificationOwnerRuling(proof: QualificationProofResource, plan: QualificationAssessmentPlan, selection: Extract<QualificationEvidenceSelection, {
    kind: "ruling_selection";
}>, resources?: QualificationResources): Readonly<QualificationOwnerRuling> | null;
/** Missing or conflicting attribution is blocked. This validates a concrete
 * record chain under the declared trusted-desktop authority; labels alone fail. */
export declare function projectQualificationConstructionAuthors(proof: QualificationProofResource, plan: QualificationAssessmentPlan, judgment: QualificationJudgment, resources?: QualificationResources): readonly string[] | null;
export declare function resolveQualificationAssessments(proof: QualificationProofResource, plan: QualificationAssessmentPlan, consumer: QualificationNativeBasis, resources?: QualificationResources): readonly Readonly<QualificationJudgment>[] | null;
/** Exact finite tenant/public/capability ownership is native install data;
 * realization and evidence adequacy remain the declared assessment's task. */
export declare function qualificationTenantClaimsMatch(basis: QualificationNativeBasis, input: unknown, manifest: TenantConformanceManifest, resources?: QualificationResources): boolean;
/** Existing native Result/C/J ownership is shared evidence, not a new gate.
 * Material includes actual disposition and evidence; F11 independently judges
 * its applicability and sufficiency for each source-grounded coverage claim. */
export declare function resolveQualificationExecutionEvidence(proof: QualificationProofResource, basis: ExactCandidateQualification<"basis">, consumer: QualificationNativeBasis): readonly QualificationMaterial[] | null;
/** The existing join resolves each producer once for both general assessment
 * material and the selected QUAL-056 projection. This is no new proof carrier. */
export declare function resolveQualificationExecutionMaterial(proof: QualificationProofResource, basis: ExactCandidateQualification<"basis">, consumer: QualificationNativeBasis, verificationSelection?: QualificationVerificationSelection, inventory?: QualificationSubjectInventory | null, resources?: QualificationResources): {
    evidence: readonly QualificationMaterial[];
    verification: QualificationVerificationMaterial | null;
} | null;
/** One whole F11 result replaces the per-behavior owning-result adapters.
 * Current competing producers still refuse; wrapper aliases are resolved by
 * the existing sub-traversal relation, never treated as independent evidence. */
export declare function projectQualificationSelfConformance(proof: QualificationProofResource, selection: Extract<QualificationEvidenceSelection, {
    kind: "self_conformance_selection";
}>, basis: ExactCandidateQualification<"basis">, resources?: QualificationResources): Readonly<QualificationSelfConformanceSummary> | null;
export declare function qualificationHasNativeSelfConformance(input: QualificationVerdictInput, consumer: QualificationNativeBasis, resources?: QualificationResources): boolean;
/** AF22 construction belongs to its authenticated immutable preparation cut.
 * The retained input is the admitted owner's value, never a caller-editable
 * wrapper. A new cut or changed input must establish the relation anew. */
export declare function projectExactCandidateQualification(basis: QualificationNativeBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): Readonly<ExactCandidateQualification<"verdict">> | null;
/** D6 consumes the sole AF22 verdict; it never reinterprets F11 findings. */
export declare function projectQualificationVerdict(input: Readonly<{
    proof: QualificationProofResource;
    selection: Extract<QualificationEvidenceSelection, {
        kind: "verdict_selection";
    }>;
    subjectBasis: QualificationCoordinate;
    lawBasis: QualificationCoordinate;
}>, resources?: QualificationResources): Readonly<ExactCandidateQualification<"verdict">> | null;
/** Exact current conformance owner, including child use. Catalog bytes remain
 * the immutable installed asset; assessment resources never replace it. */
export declare function resolveQualificationSelfConformanceOwner(basis: QualificationNativeBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): SelfConformanceOwner | null;
