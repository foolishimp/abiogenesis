import type { ComputeRegime, ModulePublication } from "../gtl/contracts.js";
import { type GraphValidation } from "../validator/graph.js";
import { type ProgramValidation } from "../validator/validation.js";
import { type GraphFunctionCatalogView } from "./catalog.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ProductInstall } from "./environment.js";
import { type InstalledProductModulePreparation } from "./installed_module.js";
import { type ResolvedExecutionDeclarationClosure } from "./declaration_closure.js";
export interface PackagedLeafImplementationDescriptor {
    readonly kind: "packaged_leaf_implementation_descriptor";
    readonly schemaVersion: "5.0.0";
    readonly descriptorDigest: Sha256Digest;
    readonly implementationRef: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly modulePath: string;
    readonly namedSymbol: string;
    readonly computeRegime: Exclude<ComputeRegime, "F_H">;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
}
export interface ImplementationResolutionCandidate {
    readonly kind: "implementation_resolution_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "candidate";
    readonly resolutionCandidateRef: string;
    readonly resolutionCandidateDigest: Sha256Digest;
    readonly catalogBasisDigest: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly graphValidationRef: string;
    readonly graphValidationDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly graphFunctionOwnerProductId: string;
    readonly graphFunctionPublicationDigest: Sha256Digest;
    readonly nodeRef: string;
    readonly implementationBindingRef: string;
    readonly implementationRef: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly modulePath: string;
    readonly namedSymbol: string;
    readonly computeRegime: "F_D" | "F_P";
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
    readonly implementationBindingDigest: Sha256Digest;
    readonly implementationDescriptorDigest: Sha256Digest;
    readonly implementationOwnerProductId: string;
    readonly implementationPublicationDigest: Sha256Digest;
}
export interface ImplementationResolutionRefusal {
    readonly kind: "implementation_resolution_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "ambiguous_implementation" | "contract_mismatch" | "implementation_absent" | "invalid_program_validation" | "selection_mismatch";
    readonly message: string;
}
export interface LeafImplementationResolutionCandidate {
    readonly kind: "leaf_implementation_resolution_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "candidate";
    readonly leafResolutionCandidateRef: string;
    readonly leafResolutionCandidateDigest: Sha256Digest;
    readonly requirementKey: string;
    readonly requirementKeyDigest: Sha256Digest;
    readonly catalogBasisDigest: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly graphFunctionOwnerProductId: string;
    readonly graphFunctionPublicationDigest: Sha256Digest;
    readonly nodeRef: string;
    readonly programLocusRef: string;
    readonly implementationBindingRef: string;
    readonly implementationRef: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly modulePath: string;
    readonly namedSymbol: string;
    readonly computeRegime: "F_D" | "F_P";
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
    readonly implementationBindingDigest: Sha256Digest;
    readonly implementationDescriptorDigest: Sha256Digest;
    readonly implementationOwnerProductId: string;
    readonly implementationPublicationDigest: Sha256Digest;
}
export interface ImplementationResolutionSetCandidate {
    readonly kind: "implementation_resolution_set_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "candidate";
    readonly setCandidateRef: string;
    readonly setCandidateDigest: Sha256Digest;
    readonly catalogBasisDigest: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly executableLeafKeys: readonly string[];
    readonly rows: readonly LeafImplementationResolutionCandidate[];
}
export interface ImplementationResolutionSetRefusal {
    readonly kind: "implementation_resolution_set_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ImplementationResolutionRefusal["code"] | "set_mismatch";
    readonly requirementKey: string | null;
    readonly message: string;
}
export type ImplementationResolutionSetResult = ImplementationResolutionSetCandidate | ImplementationResolutionSetRefusal;
export type ImplementationResolutionResult = ImplementationResolutionCandidate | ImplementationResolutionRefusal;
export declare function loadInstalledImplementationDescriptors(install: ProductInstall, publication: Readonly<ModulePublication>): Promise<readonly Readonly<PackagedLeafImplementationDescriptor>[] | ImplementationResolutionSetRefusal>;
/** Internal composition consumes the physical result of this resolution. */
export declare function implementationDescriptorsFromProduct(install: ProductInstall, publication: Readonly<ModulePublication>, prepared: InstalledProductModulePreparation): Promise<readonly Readonly<PackagedLeafImplementationDescriptor>[] | ImplementationResolutionSetRefusal>;
export declare function isPackagedLeafImplementationDescriptor(value: unknown): value is Readonly<PackagedLeafImplementationDescriptor>;
export declare function isImplementationResolutionCandidate(value: object): boolean;
export declare function isImplementationResolutionSetCandidate(value: object): boolean;
export declare function isLeafImplementationResolutionCandidate(value: object): boolean;
export declare function resolveImplementationSet(catalogView: GraphFunctionCatalogView, declarationClosure: ResolvedExecutionDeclarationClosure, programValidation: ProgramValidation, packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[]): ImplementationResolutionSetResult;
export declare function resolveImplementation(catalogView: GraphFunctionCatalogView, declarationClosure: ResolvedExecutionDeclarationClosure, programValidation: ProgramValidation, graphValidation: GraphValidation, graphFunctionRef: string, nodeRef: string, packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[]): ImplementationResolutionResult;
