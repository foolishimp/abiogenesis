import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import { type ImplementationResolutionCandidate, type ImplementationResolutionSetCandidate, type PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { GraphFunctionCatalogView } from "../product/catalog.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ResolvedExecutionDeclarationClosure } from "../product/declaration_closure.js";
import { type GraphValidation } from "./graph.js";
import { type ProgramValidation, type StaticValidationRefusal } from "./validation.js";
export interface ImplementationResolutionValidation {
    readonly kind: "implementation_resolution_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly validationRef: string;
    readonly validationDigest: Sha256Digest;
    readonly resolutionCandidateRef: string;
    readonly resolutionCandidateDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly graphValidationRef: string;
    readonly graphFunctionRef: string;
    readonly implementationBindingRef: string;
    readonly implementationRef: string;
    readonly diagnostics: readonly [];
}
export type ImplementationResolutionValidationResult = ImplementationResolutionValidation | StaticValidationRefusal;
export interface ImplementationResolutionSetValidation {
    readonly kind: "implementation_resolution_set_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly validationRef: string;
    readonly validationDigest: Sha256Digest;
    readonly setCandidateRef: string;
    readonly setCandidateDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly executableLeafKeys: readonly string[];
    readonly leafResolutionCandidateDigests: readonly Sha256Digest[];
    readonly diagnostics: readonly [];
}
export type ImplementationResolutionSetValidationResult = ImplementationResolutionSetValidation | StaticValidationRefusal;
export declare function isImplementationResolutionValidation(value: object): boolean;
export declare function isImplementationResolutionSetValidation(value: object): boolean;
export declare function validateImplementationResolution(candidate: ImplementationResolutionCandidate, publication: Readonly<ModulePublication>, programValidation: ProgramValidation, graphValidation: GraphValidation, graphFunction: Readonly<GraphFunction>, descriptor: Readonly<PackagedLeafImplementationDescriptor>): ImplementationResolutionValidationResult;
export declare function validateImplementationResolutionSet(candidate: ImplementationResolutionSetCandidate, catalogView: GraphFunctionCatalogView, declarationClosure: ResolvedExecutionDeclarationClosure, programValidation: ProgramValidation, descriptors: readonly Readonly<PackagedLeafImplementationDescriptor>[]): ImplementationResolutionSetValidationResult;
