import { type CapabilityDefinitionGraph } from "../shared/capability_contracts.js";
import type { ProductContributionManifest, ProductDeclaredDependency, ProductInstallCandidate, ProductPublicContract, VerifiedProductArtifact } from "./contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type NativeContractLinkResult } from "./declaration_exports.js";
export interface ProductInstall extends Omit<ProductInstallCandidate, "kind" | "disposition"> {
    readonly kind: "product_install";
    readonly disposition: "admitted";
    readonly admissionEventRef: string;
}
export interface ResolvedProductLockRow {
    readonly productId: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly artifactDigest: Sha256Digest;
    readonly productContentDigest: Sha256Digest;
    readonly manifestDigest: Sha256Digest;
    readonly descriptorRef: string;
    readonly publisherNamespace: string;
    readonly catalogId: string;
    readonly catalogDigest: Sha256Digest;
    readonly capabilityDefinitionGraph: CapabilityDefinitionGraph;
    readonly capabilityDefinitionGraphAsset: import("./contracts.js").ProductAssetLocator;
    readonly contributionManifestRef: string;
    readonly contributionManifestDigest: Sha256Digest;
    readonly contributionManifest: ProductContributionManifest;
    readonly compatibilityRefs: readonly string[];
    readonly declaredDependencies: readonly ProductDeclaredDependency[];
    readonly provenanceRef: string;
    readonly declaredCapabilityRefs: readonly string[];
    readonly publicContracts: readonly ProductPublicContract[];
    readonly publicContractRefs: readonly string[];
    readonly publicCapabilityRefs: readonly string[];
}
export interface ProductDependencyEdge {
    readonly kind: "requires";
    readonly fromProductId: string;
    readonly toProductId: string;
    readonly packageVersion: string;
    readonly compatibilityRef: string;
    readonly compatibilityDisposition: "compatible";
    readonly requiredContractRefs: readonly string[];
    readonly requiredCapabilityRefs: readonly string[];
}
export interface ResolvedProductLock {
    readonly kind: "resolved_product_lock";
    readonly schemaVersion: "5.0.0";
    readonly lockId: string;
    readonly lockDigest: Sha256Digest;
    readonly nativeContractClosureDigest: Sha256Digest;
    readonly rows: readonly ResolvedProductLockRow[];
    readonly dependencyEdges: readonly ProductDependencyEdge[];
}
export interface ProductSet {
    readonly kind: "product_set";
    readonly schemaVersion: "5.0.0";
    readonly productSetId: string;
    readonly productSetDigest: Sha256Digest;
    readonly orderedInstallRefs: readonly string[];
    readonly lockId: string;
    readonly lockDigest: Sha256Digest;
}
export interface WorkspaceAuthorityBasisInput {
    readonly workspaceId: string;
    readonly canonicalRoot: string;
    readonly authorityMode: "trusted_developer";
    readonly authorizedActorRef: string;
    readonly authorityManifestRef: string;
    readonly authorityManifestDigest: Sha256Digest;
}
export interface WorkspaceAuthorityBasis extends WorkspaceAuthorityBasisInput {
    readonly kind: "workspace_authority_basis";
    readonly schemaVersion: "5.0.0";
    readonly authorityBasisId: string;
    readonly authorityBasisDigest: Sha256Digest;
}
export interface WorkspaceDeclaredRoots {
    readonly toolchainRoot: string;
    readonly productRoot: string;
    readonly eventLogRoot: string;
    readonly runtimeStateRoot: string;
    readonly projectionRoot: string;
    readonly archiveRoot: string;
}
export interface WorkspaceBindingCandidate {
    readonly kind: "workspace_binding_candidate";
    readonly schemaVersion: "5.0.0";
    readonly bindingId: string;
    readonly bindingDigest: Sha256Digest;
    readonly workspaceId: string;
    readonly authorityBasisId: string;
    readonly authorityBasisDigest: Sha256Digest;
    readonly authorizedActorRef: string;
    readonly productSetId: string;
    readonly productSetDigest: Sha256Digest;
    readonly lockId: string;
    readonly lockDigest: Sha256Digest;
    readonly roots: WorkspaceDeclaredRoots;
}
export interface WorkspaceBinding extends Omit<WorkspaceBindingCandidate, "kind"> {
    readonly kind: "workspace_binding";
    readonly admissionEventRef: string;
}
export declare const ENVIRONMENT_REFUSAL_CODES: readonly ["empty_product_set", "invalid_dependency", "unresolved_dependency", "incompatible_dependency", "ambiguous_dependency", "cyclic_dependency", "duplicate_install", "lock_mismatch", "invalid_workspace_authority", "invalid_declared_root"];
export type EnvironmentRefusalCode = (typeof ENVIRONMENT_REFUSAL_CODES)[number];
export interface EnvironmentRefusal {
    readonly kind: "environment_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: EnvironmentRefusalCode;
    readonly message: string;
}
export interface ResolvedProductEnvironment {
    readonly kind: "resolved_product_environment";
    readonly lock: ResolvedProductLock;
    readonly linked: Extract<NativeContractLinkResult, {
        readonly kind: "linked";
    }>;
}
/** Internal owner result: preserve the link already established for this lock.
 * It is not a new serialized lock or runtime admission. */
export declare function resolveProductArtifacts(artifacts: readonly VerifiedProductArtifact[]): EnvironmentRefusal | ResolvedProductEnvironment;
export declare function constructResolvedProductLock(artifacts: readonly VerifiedProductArtifact[]): EnvironmentRefusal | ResolvedProductLock;
export declare function isResolvedProductLock(value: unknown): value is ResolvedProductLock;
export declare function verifiedArtifactMatchesResolvedLock(artifact: VerifiedProductArtifact, lock: ResolvedProductLock): boolean;
export declare function isProductInstallCandidate(value: unknown, lock: ResolvedProductLock): value is ProductInstallCandidate;
/** Structural carrier guard only; ABG admission/currentness is not inferred. */
export declare function isProductInstall(value: unknown, lock: ResolvedProductLock): value is ProductInstall;
export declare function productInstallCoordinate(install: ProductInstall): ReferenceDigest<"InstalledProduct">;
export declare function constructProductSet(installs: readonly ProductInstall[], lock: ResolvedProductLock): EnvironmentRefusal | ProductSet;
export declare function isProductSet(value: unknown, lock: ResolvedProductLock): value is ProductSet;
export declare function constructWorkspaceAuthorityBasis(input: WorkspaceAuthorityBasisInput): EnvironmentRefusal | WorkspaceAuthorityBasis;
export declare function isWorkspaceAuthorityBasis(value: unknown): value is WorkspaceAuthorityBasis;
export declare function constructWorkspaceBinding(authority: WorkspaceAuthorityBasis, productSet: ProductSet, lock: ResolvedProductLock, roots: WorkspaceDeclaredRoots): EnvironmentRefusal | WorkspaceBindingCandidate;
export declare function isWorkspaceBindingCandidate(value: unknown, lock: ResolvedProductLock, productSet?: ProductSet, authority?: WorkspaceAuthorityBasis): value is WorkspaceBindingCandidate;
