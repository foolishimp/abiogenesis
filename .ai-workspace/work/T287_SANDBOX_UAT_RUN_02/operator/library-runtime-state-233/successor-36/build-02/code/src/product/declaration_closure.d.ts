import type { ContractDeclaration, ModulePublication } from "../gtl/contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type CatalogReadinessBasis, type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog } from "./catalog.js";
/** Supplied declarations are reconstructed against facts supplied by the native
 * environment owner. This pure relation is shared by conformance and replay;
 * it neither admits installs nor confers authority on a supplied Catalog. */
export declare function reconstructHistoricalDeclarationCatalog(supplied: Readonly<{
    catalog: ReadyGraphFunctionCatalog;
    catalogView: GraphFunctionCatalogView;
}>, environment: Readonly<{
    workspaceBinding: CatalogReadinessBasis["workspaceBinding"];
    resolvedLock: CatalogReadinessBasis["resolvedLock"];
    installedProducts: CatalogReadinessBasis["installedProducts"];
}>): Readonly<{
    catalog: ReadyGraphFunctionCatalog;
    catalogView: GraphFunctionCatalogView;
}>;
/** Select one declaration and its owner inside an already resolved closure. */
export declare function selectExactClosureContract(closure: ResolvedDeclarationClosure, contractRef: string): Readonly<{
    contract: Readonly<ContractDeclaration>;
    owner: ExecutionDeclarationOwnerCoordinate;
}> | null;
export type ExecutionDeclarationKind = "closure_contract" | "contract" | "evaluator" | "graph_function" | "implementation_binding" | "rule" | "semantics";
export interface ExecutionDeclarationOwnerCoordinate {
    readonly declarationKind: ExecutionDeclarationKind;
    readonly declarationRef: string;
    readonly productId: string;
    readonly installId: string;
    readonly moduleRef: string;
    readonly publicationDigest: Sha256Digest;
}
interface ResolvedDeclarationClosureBase {
    readonly schemaVersion: "5.0.0";
    readonly closureRef: string;
    readonly closureDigest: Sha256Digest;
    readonly closureScope: "execution" | "program";
    readonly catalogBasisDigest: Sha256Digest;
    readonly catalogViewDigest: Sha256Digest;
    readonly programRef: string;
    readonly rootGraphFunctionRefs: readonly string[];
    readonly selectedGraphFunctionRef: string | null;
    readonly programPublication: Readonly<ModulePublication>;
    readonly programPublicationDigest: Sha256Digest;
    readonly publications: readonly Readonly<ModulePublication>[];
    readonly publicationDigests: readonly Sha256Digest[];
    readonly graphFunctionOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly contractOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly evaluatorOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly ruleOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly implementationBindingOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly closureContractOwners: readonly ExecutionDeclarationOwnerCoordinate[];
    readonly semanticsOwner: ExecutionDeclarationOwnerCoordinate;
}
export interface ResolvedExecutionDeclarationClosure extends ResolvedDeclarationClosureBase {
    readonly kind: "resolved_execution_declaration_closure";
    readonly closureScope: "execution";
    readonly rootGraphFunctionRefs: readonly [string];
    readonly selectedGraphFunctionRef: string;
}
export interface ResolvedProgramDeclarationClosure extends ResolvedDeclarationClosureBase {
    readonly kind: "resolved_program_declaration_closure";
    readonly closureScope: "program";
    readonly selectedGraphFunctionRef: null;
}
export type ResolvedDeclarationClosure = ResolvedExecutionDeclarationClosure | ResolvedProgramDeclarationClosure;
export interface ExecutionDeclarationClosureRefusal {
    readonly kind: "execution_declaration_closure_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "absent" | "ambiguous" | "catalog_mismatch" | "missing_dependency" | "wrong_owner";
    readonly message: string;
}
export type ExecutionDeclarationClosureResult = ResolvedExecutionDeclarationClosure | ExecutionDeclarationClosureRefusal;
export type ProgramDeclarationClosureResult = ResolvedProgramDeclarationClosure | ExecutionDeclarationClosureRefusal;
export declare function isResolvedExecutionDeclarationClosure(value: object): value is ResolvedExecutionDeclarationClosure;
export declare function isResolvedProgramDeclarationClosure(value: object): value is ResolvedProgramDeclarationClosure;
export declare function validateResolvedExecutionDeclarationClosure(value: ResolvedExecutionDeclarationClosure, catalog: ReadyGraphFunctionCatalog, catalogView: GraphFunctionCatalogView): boolean;
export declare function validateResolvedProgramDeclarationClosure(value: ResolvedProgramDeclarationClosure, catalog: ReadyGraphFunctionCatalog, catalogView: GraphFunctionCatalogView): boolean;
export declare function resolveExecutionDeclarationClosure(catalog: ReadyGraphFunctionCatalog, catalogView: GraphFunctionCatalogView, programRef: string, selectedGraphFunctionRef: string): ExecutionDeclarationClosureResult;
export declare function resolveProgramDeclarationClosure(catalog: ReadyGraphFunctionCatalog, catalogView: GraphFunctionCatalogView, programRef: string): ProgramDeclarationClosureResult;
export {};
