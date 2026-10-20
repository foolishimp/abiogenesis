import { type Sha256Digest } from "../shared/digests.js";
import type { ProductDeclaredDependency, ProductNativeDeclarationInventoryRow, ProductPublicContract } from "./contracts.js";
export interface DeclarationSource {
    readonly path: string;
    readonly bytes: Uint8Array;
}
export interface NativeDeclarationRoot {
    readonly packageExportPath: string;
    readonly declarationPath: string;
}
export type NativePackageType = "commonjs" | "module";
export type ExternalRelationOrigin = Readonly<{
    readonly kind: "import_declaration";
    readonly clause: "side_effect" | "default" | "named" | "namespace";
    readonly declarationTypeOnly: boolean;
    readonly specifierTypeOnly: boolean;
}> | Readonly<{
    readonly kind: "export_declaration";
    readonly clause: "named" | "star" | "namespace";
    readonly declarationTypeOnly: boolean;
    readonly specifierTypeOnly: boolean;
}> | Readonly<{
    readonly kind: "import_type_expression";
    readonly operator: "type" | "typeof";
}> | Readonly<{
    readonly kind: "import_equals_declaration";
}> | Readonly<{
    readonly kind: "type_reference_directive";
}> | Readonly<{
    readonly kind: "module_augmentation";
}>;
export type ExternalSelection = Readonly<{
    readonly kind: "module";
}> | Readonly<{
    readonly kind: "name";
    readonly targetName: string;
    readonly exposedName: string;
}> | Readonly<{
    readonly kind: "namespace";
    readonly exposedName: string;
}> | Readonly<{
    readonly kind: "all";
}>;
export interface PhysicalDeclarationRelation {
    readonly physicalRelationRef: string;
    readonly physicalRelationDigest: Sha256Digest;
    readonly sourceProductContentDigest: Sha256Digest;
    readonly declarationPath: string;
    readonly declarationDigest: Sha256Digest;
    readonly sourceStart: number;
    readonly sourceEnd: number;
    readonly moduleSpecifier: string;
    readonly origin: ExternalRelationOrigin;
    readonly selection: ExternalSelection;
}
export interface ContractIndexedPendingExternalSelector {
    readonly selectorRef: Sha256Digest;
    readonly sourceProductContentDigest: Sha256Digest;
    readonly sourceContractRef: string;
    readonly sourceContractDigest: Sha256Digest;
    readonly sourcePackageExportPath: string;
    readonly sourceNamedSymbol: string;
    readonly physicalRelationRef: string;
    readonly externalPackageName: string;
    readonly externalModuleSpecifier: string;
    readonly origin: ExternalRelationOrigin;
    readonly selection: ExternalSelection;
    readonly localAccessPath: readonly string[];
}
export interface NativeModuleAugmentation {
    readonly packageExportPath: string;
    readonly declarationPath: string;
    readonly sourceOffset: number;
    readonly sourceEnd: number;
    readonly moduleSpecifier: string;
}
export interface NativeDeclarationClosure {
    readonly packageExportPath: string;
    readonly declarationPath: string;
    readonly exportedSymbols: readonly string[];
    readonly exportedSymbolPhysicalRelationRefs: Readonly<Record<string, readonly string[]>>;
    readonly declarationInventory: readonly ProductNativeDeclarationInventoryRow[];
    readonly physicalRelations: readonly PhysicalDeclarationRelation[];
    readonly moduleAugmentations: readonly NativeModuleAugmentation[];
    readonly contributesGlobals: boolean;
}
export interface NativeDeclarationClosureRequest {
    readonly packageName: string;
    readonly packageType: NativePackageType;
    readonly packageExports: Readonly<Record<string, unknown>>;
    readonly declarationSources: readonly DeclarationSource[];
    /** Exact package.json payload members; absence proves no bundled ownership. */
    readonly packageMetadataSources?: readonly DeclarationSource[];
    readonly sourceProductContentDigest: Sha256Digest;
}
export interface NativeDeclarationEvidenceSource {
    readonly declarationPath: string;
    readonly declarationDigest: Sha256Digest;
    readonly sourceText: string;
}
export interface NativeContractEvidence {
    readonly contractId: string;
    readonly contractDigest: Sha256Digest;
    readonly packageExportPath: string;
    readonly namedSymbol: string;
    readonly localDisposition: "local" | "pending_external";
    readonly pendingSelectors: readonly ContractIndexedPendingExternalSelector[];
}
export interface NativeProductDeclarationEvidence {
    readonly productId: string;
    readonly productContentDigest: Sha256Digest;
    readonly packageName: string;
    readonly packageType: NativePackageType;
    readonly sources: readonly NativeDeclarationEvidenceSource[];
    readonly packageMetadata?: readonly NativeDeclarationEvidenceSource[];
    readonly closures: readonly NativeDeclarationClosure[];
    readonly contracts: readonly NativeContractEvidence[];
}
export interface NativeLinkProduct {
    readonly productId: string;
    readonly productContentDigest: Sha256Digest;
    readonly packageName: string;
    readonly declaredDependencies: readonly ProductDeclaredDependency[];
    readonly publicContracts: readonly ProductPublicContract[];
    readonly evidence: NativeProductDeclarationEvidence;
}
export interface CanonicalSourceWitness {
    readonly witnessDigest: Sha256Digest;
    readonly selectorRef: string;
    readonly physicalRelationRef: string;
    readonly declarationPath: string;
    readonly declarationDigest: Sha256Digest;
    readonly sourceStart: number;
    readonly sourceEnd: number;
    readonly origin: ExternalRelationOrigin;
    readonly selection: ExternalSelection;
}
export interface ResolvedSemanticSelection {
    readonly derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
    readonly targetExportedSymbol: string;
    readonly exposedMemberPath: readonly string[];
    readonly semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
    readonly requiredSymbolSpace: "type" | "value" | "namespace";
}
export interface CanonicalCheckerTargetIdentity {
    readonly targetProductContentDigest: Sha256Digest;
    readonly targetPackageName: string;
    readonly targetPackageExportPath: string;
    readonly targetExportedSymbol: string;
    readonly requiredSymbolSpace: "type" | "value" | "namespace";
    readonly boundaryDeclarationWitnesses: readonly Readonly<{
        readonly declarationPath: string;
        readonly declarationDigest: Sha256Digest;
        readonly declarationKind: string;
        readonly exportedName: string;
    }>[];
    readonly targetIdentityDigest: Sha256Digest;
}
export interface ContractExternalOccurrence {
    readonly occurrenceRef: string;
    readonly sourceProductContentDigest: Sha256Digest;
    readonly sourceContractRef: string;
    readonly sourceContractDigest: Sha256Digest;
    readonly sourcePackageExportPath: string;
    readonly sourceNamedSymbol: string;
    readonly sourceWitnesses: readonly CanonicalSourceWitness[];
    readonly semanticSelection: ResolvedSemanticSelection;
    readonly checkerTarget: CanonicalCheckerTargetIdentity;
}
export type PendingSelectorDisposition = Readonly<{
    readonly kind: "semantic_occurrences";
    readonly selectorRef: string;
    readonly occurrenceRefs: readonly string[];
}> | Readonly<{
    readonly kind: "no_external_contribution";
    readonly selectorRef: string;
    readonly reason: "locally_shadowed" | "not_in_source_contract_meaning";
    readonly checkerWitnessDigest: Sha256Digest;
}>;
export interface NativeContractBinding {
    readonly kind: "external_binding";
    readonly sourceOccurrenceRef: string;
    readonly directDependencyEdge: ProductDeclaredDependency;
    readonly targetProductContentDigest: Sha256Digest;
    readonly targetContractRef: string;
    readonly targetContractDigest: Sha256Digest;
    readonly targetPackageExportPath: string;
    readonly targetNamedSymbol: string;
    readonly checkerTarget: CanonicalCheckerTargetIdentity;
}
export interface NativeContractSymbolAdmission {
    readonly kind: "symbol_admission";
    readonly productContentDigest: Sha256Digest;
    readonly contractRef: string;
    readonly contractDigest: Sha256Digest;
    readonly packageExportPath: string;
    readonly namedSymbol: string;
}
export type NativeContractClosureRow = NativeContractBinding | NativeContractSymbolAdmission;
export type NativeContractLinkResult = Readonly<{
    kind: "linked";
    bindings: readonly NativeContractClosureRow[];
    selectorDispositions: readonly PendingSelectorDisposition[];
    occurrences: readonly ContractExternalOccurrence[];
    nativeContractClosureDigest: Sha256Digest;
}> | Readonly<{
    kind: "refused";
    code: "ambiguous_dependency" | "incompatible_dependency" | "unresolved_dependency";
    message: string;
}>;
export declare function nativeDeclarationRoots(packageExports: Readonly<Record<string, unknown>>): readonly NativeDeclarationRoot[] | null;
export declare function packageImportCoordinate(specifier: string): Readonly<{
    packageName: string;
    packageExportPath: string;
}> | null;
export declare function resolveNativeDeclarationClosures(request: NativeDeclarationClosureRequest): Promise<readonly NativeDeclarationClosure[] | null>;
export declare function contractIndexedPendingSelectors(productContentDigest: Sha256Digest, contract: ProductPublicContract, closure: NativeDeclarationClosure): readonly ContractIndexedPendingExternalSelector[] | null;
export declare function linkNativeContractSet(products: readonly NativeLinkProduct[], toolchainProductContentDigest: Sha256Digest): NativeContractLinkResult;
export declare function declarationExportSymbols(rootPath: string, declarationSources: readonly DeclarationSource[], sourceProductContentDigest: Sha256Digest): Promise<ReadonlySet<string> | null>;
