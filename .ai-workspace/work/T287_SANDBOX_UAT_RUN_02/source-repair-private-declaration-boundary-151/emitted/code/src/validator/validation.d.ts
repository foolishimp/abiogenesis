import { type Sha256Digest } from "../shared/digests.js";
import type { CatalogContribution, ClosureContract, ContractDeclaration, EvaluatorDeclaration, GraphFunction, GtlProgram, ImplementationBinding, ModulePublication, RuleDeclaration } from "../gtl/index.js";
import { type ExecutableLeafRequirement, type InteractionLeafRequirement } from "../gtl/c_algebra.js";
import { type RawAdmittedValue } from "./raw_admission.js";
export declare const GTL_PROGRAM_DIAGNOSTIC_REGISTER: readonly [{
    readonly id: "duplicate_identity";
    readonly origin: "static";
}, {
    readonly id: "carrier_mismatch";
    readonly origin: "static";
}, {
    readonly id: "identity_mismatch";
    readonly origin: "static";
}, {
    readonly id: "invalid_application";
    readonly origin: "static";
}, {
    readonly id: "invalid_constructor";
    readonly origin: "static";
}, {
    readonly id: "invalid_contribution";
    readonly origin: "static";
}, {
    readonly id: "invalid_fibre";
    readonly origin: "static";
}, {
    readonly id: "invalid_leaf_requirement";
    readonly origin: "static";
}, {
    readonly id: "invalid_reference";
    readonly origin: "static";
}, {
    readonly id: "invalid_result_cardinality";
    readonly origin: "static";
}, {
    readonly id: "missing_binding";
    readonly origin: "static";
}, {
    readonly id: "missing_contract";
    readonly origin: "static";
}, {
    readonly id: "missing_membership";
    readonly origin: "static";
}, {
    readonly id: "raw_subject_mismatch";
    readonly origin: "static";
}, {
    readonly id: "topology_mismatch";
    readonly origin: "static";
}, {
    readonly id: "invalid_packet";
    readonly origin: "ingress";
}, {
    readonly id: "invalid_contract";
    readonly origin: "ingress";
}, {
    readonly id: "invalid_kind";
    readonly origin: "ingress";
}, {
    readonly id: "non_canonical_value";
    readonly origin: "ingress";
}];
export type GtlProgramDiagnosticId = (typeof GTL_PROGRAM_DIAGNOSTIC_REGISTER)[number]["id"];
export type StaticDiagnosticCode = Extract<(typeof GTL_PROGRAM_DIAGNOSTIC_REGISTER)[number], {
    readonly origin: "static";
}>["id"];
export declare const GTL_PROGRAM_DIAGNOSTIC_ID_VALUES: readonly ("invalid_kind" | "identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "invalid_contract" | "non_canonical_value" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch" | "invalid_packet")[];
export declare const STATIC_DIAGNOSTIC_CODE_VALUES: readonly ("identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch")[];
export declare function constructGtlProgramDiagnosticId(value: unknown): GtlProgramDiagnosticId;
export interface StaticDiagnostic {
    readonly code: StaticDiagnosticCode;
    readonly path: string;
    readonly message: string;
}
export interface StaticValidationRefusal {
    readonly kind: "static_validation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "invalid";
    readonly stage: "graph" | "implementation_resolution" | "publication" | "program";
    readonly subjectDigest: Sha256Digest;
    readonly diagnostics: readonly StaticDiagnostic[];
}
export interface ContributionValidationDisposition {
    readonly handle: string;
    readonly kind: CatalogContribution["kind"];
    readonly disposition: "valid";
    readonly contributionDigest: Sha256Digest;
}
export interface PublicationValidation {
    readonly kind: "publication_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly validationRef: string;
    readonly publicationDigest: Sha256Digest;
    readonly moduleRef: string;
    readonly rawAdmissionRef: string;
    readonly contributionDispositions: readonly ContributionValidationDisposition[];
    readonly diagnostics: readonly [];
}
export interface ProgramValidation {
    readonly kind: "program_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly validationRef: string;
    readonly sourceDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly graphFunctionDigests: readonly Sha256Digest[];
    readonly contractDigests: readonly Sha256Digest[];
    readonly implementationBindingDigests: readonly Sha256Digest[];
    readonly closureContractDigests: readonly Sha256Digest[];
    readonly executableLeafRows: readonly ValidatedExecutableLeaf[];
    readonly interactionLeafRows: readonly ValidatedInteractionLeaf[];
    readonly transitiveReachableExecutableLeafKeys: readonly string[];
    readonly transitiveReachableInteractionLeafKeys: readonly string[];
    readonly diagnostics: readonly [];
}
interface ValidatedLeafBase {
    readonly requirementKey: string;
    readonly requirementKeyDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly nodeRef: string;
    readonly programLocusRef: string;
    readonly stageRole: string;
    readonly armId: string;
    readonly compositionRef: string | null;
    readonly vectorIndex: number;
    readonly judgmentPredicateRef: string;
    readonly inputCarrierRef: string;
    readonly outputCarrierRef: string;
}
export interface ValidatedExecutableLeaf extends ValidatedLeafBase {
    readonly kind: "validated_executable_leaf";
    readonly fibre: "F_D" | "F_P";
    readonly requirement: ExecutableLeafRequirement;
}
export interface ValidatedInteractionLeaf extends ValidatedLeafBase {
    readonly kind: "validated_interaction_leaf";
    readonly fibre: "F_H";
    readonly requirement: InteractionLeafRequirement;
}
export interface ProgramValidationInput {
    readonly semanticLifecyclePublication?: RawAdmittedValue<ModulePublication>;
    readonly declarationBasisDigest: Sha256Digest;
    readonly semanticSourcePublication?: RawAdmittedValue<ModulePublication>;
    readonly programPublication: RawAdmittedValue<ModulePublication>;
    readonly program: RawAdmittedValue<GtlProgram>;
    readonly graphFunctions: readonly RawAdmittedValue<GraphFunction>[];
    readonly contracts: readonly RawAdmittedValue<ContractDeclaration>[];
    readonly evaluators: readonly Readonly<EvaluatorDeclaration>[];
    readonly rules: readonly Readonly<RuleDeclaration>[];
    readonly implementationBindings: readonly RawAdmittedValue<ImplementationBinding>[];
    readonly closureContracts: readonly RawAdmittedValue<ClosureContract>[];
}
export type PublicationValidationResult = PublicationValidation | StaticValidationRefusal;
export type ProgramValidationResult = ProgramValidation | StaticValidationRefusal;
export declare function isPublicationValidation(value: object): boolean;
export declare function isProgramValidation(value: object): boolean;
export declare function validatePublication(publication: RawAdmittedValue<ModulePublication>, contributions: readonly RawAdmittedValue<CatalogContribution>[]): PublicationValidationResult;
export declare function validateProgram(input: ProgramValidationInput): ProgramValidationResult;
export {};
