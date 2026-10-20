import type { ClosureContract, ContractDeclaration, GraphFunction, GtlProgram, ModulePublication } from "../gtl/contracts.js";
import { type ProgramStartRequest, type ResolvedProgramStart } from "../gtl/public_start.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type ImplementationResolutionSetValidation, type ProgramValidation } from "../validator/index.js";
import { type GraphFunctionCatalogEntry, type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog } from "./catalog.js";
import { type ExecutionDeclarationOwnerCoordinate, type ResolvedExecutionDeclarationClosure, type ResolvedProgramDeclarationClosure } from "./declaration_closure.js";
import type { ProductInstall } from "./environment.js";
import { type ImplementationResolutionSetCandidate, type PackagedLeafImplementationDescriptor } from "./implementation_resolution.js";
import { type ProductSemanticsProvider } from "./semantics.js";
export type ProductExecutionResolutionRefusalCode = "absent" | "ambiguous" | "missing_dependency" | "incompatible_or_unproven" | "wrong_owner";
export interface ProductExecutionResolutionRefusal {
    readonly kind: "product_execution_resolution_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ProductExecutionResolutionRefusalCode;
    readonly stage: "catalog" | "declaration_closure" | "dependency" | "implementation" | "semantics";
    readonly message: string;
}
export interface ProductExecutionOwnerCoordinate {
    readonly productId: string;
    readonly installId: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly moduleRef: string;
    readonly publicationDigest: Sha256Digest;
}
export interface ProgramGraphFunctionMembership {
    readonly programRef: string;
    readonly graphFunctionRef: string;
}
export interface ProductExecutionResolution {
    readonly registeredSelectionDefinitionDigests?: Readonly<Record<string, Sha256Digest>>;
    readonly kind: "product_execution_resolution";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "resolved";
    readonly resolutionRef: string;
    readonly resolutionDigest: Sha256Digest;
    readonly catalogBasisDigest: Sha256Digest;
    readonly catalogViewDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly programOwner: ProductExecutionOwnerCoordinate;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly graphFunctionOwner: ProductExecutionOwnerCoordinate;
    readonly programGraphFunctionMembership: ReferenceDigest<ProgramGraphFunctionMembership>;
    readonly inputContract: Readonly<ContractDeclaration>;
    readonly inputContractDigest: Sha256Digest;
    readonly inputContractOwner: ExecutionDeclarationOwnerCoordinate;
    readonly outputContract: Readonly<ContractDeclaration>;
    readonly outputContractDigest: Sha256Digest;
    readonly outputContractOwner: ExecutionDeclarationOwnerCoordinate;
    readonly declarationClosureRef: string;
    readonly declarationClosureDigest: Sha256Digest;
    readonly declarationOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly programValidationRef: string;
    readonly programValidationDigest: Sha256Digest;
    readonly implementationSetCandidateRef: string;
    readonly implementationSetCandidateDigest: Sha256Digest;
    readonly implementationSetValidationRef: string;
    readonly implementationSetValidationDigest: Sha256Digest;
    readonly closureContractRef: string;
    readonly closureContractDigest: Sha256Digest;
}
export interface LoadedProductExecutionResolution {
    readonly kind: "loaded_product_execution_resolution";
    readonly schemaVersion: "5.0.0";
    readonly resolution: ProductExecutionResolution;
    readonly declarationClosure: ResolvedExecutionDeclarationClosure;
    readonly programDeclarationClosure: ResolvedProgramDeclarationClosure;
    readonly programValidation: ProgramValidation;
    readonly implementationSetCandidate: ImplementationResolutionSetCandidate;
    readonly implementationSetValidation: ImplementationResolutionSetValidation;
    readonly closureContract: Readonly<ClosureContract>;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly selectedCatalogEntry: GraphFunctionCatalogEntry;
    readonly resolvedProgramStart: ResolvedProgramStart | null;
    readonly programInstall: ProductInstall;
    readonly programPublication: Readonly<ModulePublication>;
    readonly declarationPublications: readonly Readonly<ModulePublication>[];
    readonly ownerInstalls: readonly ProductInstall[];
    readonly packagedImplementations: readonly Readonly<PackagedLeafImplementationDescriptor>[];
    readonly productSemantics: ProductSemanticsProvider;
}
export type ProductExecutionResolutionResult = LoadedProductExecutionResolution | ProductExecutionResolutionRefusal;
export declare function isProductExecutionResolution(value: object): value is ProductExecutionResolution;
export interface ProductExecutionResolutionInput {
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
    readonly admittedInstalls: readonly ProductInstall[];
    readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
    readonly programRef: string;
    readonly selection: ProductExecutionSelection;
}
export interface ProductExecutionDirectSelection {
    readonly kind: "direct";
    readonly catalogHandle: string;
}
export interface ProductExecutionProgramStartSelection extends ProgramStartRequest {
    readonly kind: "start";
}
export interface ProductExecutionGraphFunctionStartSelection {
    readonly kind: "start";
    readonly scope: "program";
    readonly target: "graph_function";
    readonly graphFunctionHandle: string;
    readonly until: "converged";
    readonly rootMode: "direct" | "supervised";
}
export type ProductExecutionStartSelection = ProductExecutionProgramStartSelection | ProductExecutionGraphFunctionStartSelection;
export interface ProductExecutionAdmittedSelection {
    readonly kind: "admitted";
    readonly graphFunctionRef: string;
}
export type ProductExecutionSelection = ProductExecutionDirectSelection | ProductExecutionStartSelection | ProductExecutionAdmittedSelection;
/** Same declared provider selection at installed retention admission and leaf
 * execution. The caller supplies its existing exact owner projection; this
 * relation adds no publication registry or authentication pass. */
export declare function graphFunctionSemanticsOwner(closure: ResolvedExecutionDeclarationClosure | ResolvedProgramDeclarationClosure, graphFunctionRef: string, ownerBinding: (coordinate: ExecutionDeclarationOwnerCoordinate) => Readonly<{
    publication: Readonly<ModulePublication>;
    install: Pick<ProductInstall, "packageName" | "packageVersion">;
}> | null, selectedRootGraphFunctionRef?: string | null): ExecutionDeclarationOwnerCoordinate | null;
declare function resolveProductExecution(input: ProductExecutionResolutionInput): Promise<ProductExecutionResolutionResult>;
export declare const ProductExecutionResolutionPort: Readonly<{
    resolve: typeof resolveProductExecution;
}>;
export {};
