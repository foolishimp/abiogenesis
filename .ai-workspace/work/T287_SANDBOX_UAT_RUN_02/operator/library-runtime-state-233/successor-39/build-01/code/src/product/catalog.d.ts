import type { GraphFunction, ModulePublication } from "../gtl/contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ResolvedProductLock, WorkspaceBindingCandidate } from "./environment.js";
import type { ProductInstallCandidate, VerifiedProductArtifact } from "./contracts.js";
export interface GraphFunctionCatalogEntry {
    readonly kind: "graph_function_catalog_entry";
    readonly handle: string;
    readonly definitionRef: string;
    readonly definitionDigest: Sha256Digest;
    readonly definition: Readonly<GraphFunction>;
    readonly owningProductId: string;
    readonly moduleRef: string;
    readonly publicationDigest: Sha256Digest;
    readonly programMembershipRefs: readonly string[];
    readonly compatibilityRefs: readonly string[];
    readonly provenanceRefs: readonly string[];
    readonly entryDigest: Sha256Digest;
}
export interface DeclarationCatalogEntry {
    readonly kind: "declaration_catalog_entry";
    readonly handle: string;
    readonly declarationKind: "node_type" | "overlay";
    readonly declarationOrContractRef: string;
    readonly owningProductId: string;
    readonly moduleRef: string;
    readonly publicationDigest: Sha256Digest;
    readonly programMembershipRefs: readonly string[];
    readonly compatibilityRefs: readonly string[];
    readonly provenanceRefs: readonly string[];
    readonly entryDigest: Sha256Digest;
}
export interface GraphFunctionCatalog {
    readonly kind: "graph_function_catalog";
    readonly schemaVersion: "5.0.0";
    readonly basisDigest: Sha256Digest;
    readonly publicationDigests: readonly Sha256Digest[];
    readonly entries: readonly GraphFunctionCatalogEntry[];
    readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
    readonly declarationEntries: readonly DeclarationCatalogEntry[];
    readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
}
export interface CatalogReadinessBasis {
    readonly workspaceBinding: WorkspaceBindingCandidate;
    readonly resolvedLock: ResolvedProductLock;
    readonly verifiedProducts: readonly VerifiedProductArtifact[];
    readonly installedProducts: readonly ProductInstallCandidate[];
    readonly publications: readonly Readonly<ModulePublication>[];
}
export interface CatalogReadinessRowDisposition {
    readonly handle: string;
    readonly owningProductId: string;
    readonly moduleRef: string;
    readonly disposition: "admitted" | "rejected" | "incompatible" | "conflicting" | "unready" | "unresolved";
    readonly readiness: "ready" | "not_ready";
    readonly reason: string | null;
    readonly readinessPrerequisiteRefs: readonly string[];
    readonly rowDigest: Sha256Digest;
}
export interface ReadyGraphFunctionCatalog extends GraphFunctionCatalog {
    readonly readinessBasisDigest: Sha256Digest;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly lockId: string;
    readonly lockDigest: Sha256Digest;
    readonly productSetId: string;
    readonly productSetDigest: Sha256Digest;
    readonly readinessBasis: CatalogReadinessBasis;
    readonly boundPublications: readonly Readonly<ModulePublication>[];
    readonly rowDispositions: readonly CatalogReadinessRowDisposition[];
}
export interface GraphFunctionCatalogView {
    readonly kind: "graph_function_catalog_view";
    readonly catalogBasisDigest: Sha256Digest;
    readonly allowlist: readonly string[];
    readonly entries: readonly GraphFunctionCatalogEntry[];
    readonly byHandle: Readonly<Record<string, GraphFunctionCatalogEntry>>;
    readonly declarationEntries: readonly DeclarationCatalogEntry[];
    readonly declarationsByHandle: Readonly<Record<string, DeclarationCatalogEntry>>;
    readonly viewDigest: Sha256Digest;
}
export interface GraphFunctionDefinitionLookupExact {
    readonly kind: "graph_function_definition_lookup_exact";
    readonly definitionRef: string;
    readonly programRef: string;
    readonly entry: GraphFunctionCatalogEntry;
}
export interface GraphFunctionDefinitionLookupAbsent {
    readonly kind: "graph_function_definition_lookup_absent";
    readonly definitionRef: string;
    readonly programRef: string;
}
export interface GraphFunctionDefinitionLookupAmbiguous {
    readonly kind: "graph_function_definition_lookup_ambiguous";
    readonly definitionRef: string;
    readonly programRef: string;
    readonly entries: readonly GraphFunctionCatalogEntry[];
}
export type GraphFunctionDefinitionLookupResult = GraphFunctionDefinitionLookupExact | GraphFunctionDefinitionLookupAbsent | GraphFunctionDefinitionLookupAmbiguous;
export interface CatalogConstructionRefusal {
    readonly kind: "catalog_construction_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "canonical_handle_collision" | "duplicate_contribution_reference" | "duplicate_allowlist_entry" | "graph_function_definition_missing" | "invalid_program_membership" | "binding_lock_mismatch" | "verified_product_mismatch" | "installed_product_mismatch" | "publication_not_bound" | "unresolved_readiness_prerequisite" | "publication_identity_collision" | "publication_owner_mismatch" | "unknown_allowlist_entry";
    readonly message: string;
}
export type GraphFunctionCatalogResult = GraphFunctionCatalog | CatalogConstructionRefusal;
export type ReadyGraphFunctionCatalogResult = ReadyGraphFunctionCatalog | CatalogConstructionRefusal;
export type GraphFunctionCatalogViewResult = GraphFunctionCatalogView | CatalogConstructionRefusal;
export interface DeclarationApplicationInput {
    readonly applicationKind: "node_type" | "overlay";
    readonly handle: string;
    readonly targetRef: string;
    readonly targetDigest: Sha256Digest;
    readonly appliedValueRef: string;
    readonly appliedValueDigest: Sha256Digest;
}
export interface DeclarationApplication {
    readonly kind: "declaration_application";
    readonly catalogBasisDigest: Sha256Digest;
    readonly viewDigest: Sha256Digest;
    readonly declaration: DeclarationCatalogEntry;
    readonly targetRef: string;
    readonly targetDigest: Sha256Digest;
    readonly appliedValueRef: string;
    readonly appliedValueDigest: Sha256Digest;
    readonly applicationRef: string;
    readonly applicationDigest: Sha256Digest;
}
export interface DeclarationApplicationRefusal {
    readonly kind: "declaration_application_refusal";
    readonly code: "kind_mismatch" | "outside_view";
    readonly message: string;
}
export type DeclarationApplicationResult = DeclarationApplication | DeclarationApplicationRefusal;
export declare function directSatisfiedDependencyRefs(lock: ResolvedProductLock, publishingProductId: string): ReadonlySet<string>;
export declare function admitGraphFunctionCatalog(basis: CatalogReadinessBasis): ReadyGraphFunctionCatalogResult;
export declare function buildGraphFunctionCatalog(exactPublications: readonly Readonly<ModulePublication>[]): GraphFunctionCatalogResult;
export declare function refreshGraphFunctionCatalog(exactPublications: readonly Readonly<ModulePublication>[]): GraphFunctionCatalogResult;
export declare function lookupGraphFunction(catalog: GraphFunctionCatalog | GraphFunctionCatalogView, handle: string): GraphFunctionCatalogEntry | null;
export declare function lookupGraphFunctionDefinition(catalog: GraphFunctionCatalog | GraphFunctionCatalogView, definitionRef: string, programRef: string): GraphFunctionDefinitionLookupResult;
export declare function narrowGraphFunctionCatalog(catalog: GraphFunctionCatalog, allowlist: readonly string[]): GraphFunctionCatalogViewResult;
export declare function applyCatalogDeclaration(view: GraphFunctionCatalogView, input: DeclarationApplicationInput): DeclarationApplicationResult;
export declare function graphFunctionCatalogCanonicalSnapshot(catalog: GraphFunctionCatalog): string;
