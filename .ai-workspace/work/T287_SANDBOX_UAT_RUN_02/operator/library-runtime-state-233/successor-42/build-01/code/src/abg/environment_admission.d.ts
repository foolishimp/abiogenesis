import { type ProductInstall, type ProductInstallCandidate, type ProductSet, type ResolvedProductLock, type WorkspaceAuthorityBasis, type WorkspaceBinding, type WorkspaceBindingCandidate } from "../product/index.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { type ExactPrefixArtifactTruthProjection, type ExactPrefixArtifactTruthProjectionRefusal } from "./artifact_truth.js";
import { type EffectfulPublicInvocationPriorAdmission, type EffectfulPublicInvocationTruth } from "./effectful_invocation_truth.js";
import { type AbgEventStore, type DurablePrefixCoordinate, type EventStoreAppendRefusal } from "./event_store.js";
export type PublicOperationId = "abg.operation.release.snapshot" | "abg.operation.product.install" | "abg.operation.workspace.bind" | "abg.operation.catalog.admit" | "abg.operation.catalog.apply" | "abg.operation.catalog.view" | "abg.operation.interaction.respond" | "abg.operation.project.read" | "abg.operation.result.assess" | "abg.operation.run.continue" | "abg.operation.run.invoke" | "abg.operation.witness.admit";
export interface PublicOperationAdmissionBasis extends ExactOperationInvocationCoordinate {
    readonly operationId: PublicOperationId;
    readonly authorityScopeRef: string;
    readonly authorityScopeDigest: Sha256Digest;
    readonly invocationRef: string;
    readonly invocationPayloadDigest: Sha256Digest;
    readonly invocationDigest: Sha256Digest;
    readonly correlationId: string;
    readonly eventTime: string;
    readonly causationEventRefs: readonly string[];
}
export interface ArtifactAdmissionBasis extends PublicOperationAdmissionBasis {
    readonly predecessorPrefix: DurablePrefixCoordinate;
}
export interface ArtifactAdmissionMetadata {
    readonly productSemanticsBasisDigest?: Sha256Digest;
    readonly publicationDigest?: Sha256Digest;
    readonly artifact?: JsonValue;
    readonly resolvedLock?: JsonValue;
    readonly workspaceAuthorityBasis?: JsonValue;
}
interface AbgSemanticAdmissionRefusal {
    readonly kind: "abg_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "artifact_truth_conflict" | "operation_mismatch" | "scope_mismatch";
    readonly message: string;
}
export interface DuplicateArtifactInvocationRefusal {
    readonly kind: "abg_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "duplicate_invocation";
    readonly message: string;
    readonly priorAdmission: EffectfulPublicInvocationPriorAdmission;
}
export type AbgAdmissionRefusal = AbgSemanticAdmissionRefusal | DuplicateArtifactInvocationRefusal;
export type ArtifactOwnerResult<Value> = Readonly<{
    kind: "artifact_owner_result";
    schemaVersion: "5.0.0";
    disposition: "admitted" | "idempotent";
    value: Value;
    admissionEventRef: string;
    successorPrefix: DurablePrefixCoordinate;
    artifactTruth: ExactPrefixArtifactTruthProjection;
}> | Readonly<{
    kind: "artifact_owner_refusal";
    schemaVersion: "5.0.0";
    disposition: "refused";
    successorPrefix: DurablePrefixCoordinate;
    refusal: AbgAdmissionRefusal;
}> | Readonly<{
    kind: "artifact_owner_coordinate_refusal";
    schemaVersion: "5.0.0";
    disposition: "refused";
    successorPrefix: null;
    suppliedPredecessor: DurablePrefixCoordinate;
    refusal: EventStoreAppendRefusal | ExactPrefixArtifactTruthProjectionRefusal | Extract<EffectfulPublicInvocationTruth, {
        readonly disposition: "invalid_history";
    }>;
}>;
export interface RehydratedProductInstallTruth {
    readonly candidate: ProductInstallCandidate;
    readonly install: ProductInstall;
    readonly resolvedLock: ResolvedProductLock;
    readonly invocationRef: string;
}
export interface RehydratedWorkspaceBindingTruth {
    readonly candidate: WorkspaceBindingCandidate;
    readonly binding: WorkspaceBinding;
    readonly installAdmissionEventRefs: readonly string[];
    readonly invocationRef: string;
}
export declare function projectAdmittedProductInstallByInvocationRef(projection: ExactPrefixArtifactTruthProjection, invocationRef: string): RehydratedProductInstallTruth | null;
export declare function projectAdmittedProductInstallByAdmissionEventRef(projection: ExactPrefixArtifactTruthProjection, admissionEventRef: string): RehydratedProductInstallTruth | null;
export declare function projectAdmittedWorkspaceProductInstall(projection: ExactPrefixArtifactTruthProjection, workspaceBindingId: string, installId: string): RehydratedProductInstallTruth | null;
export declare function projectAdmittedWorkspaceBindingByInvocationRef(projection: ExactPrefixArtifactTruthProjection, invocationRef: string, resolvedLock: ResolvedProductLock): RehydratedWorkspaceBindingTruth | null;
export type ExactPrefixWorkspaceEnvironmentRefusalCode = "artifact_truth_invalid" | "workspace_binding_coordinate_invalid" | "workspace_binding_missing" | "workspace_binding_mismatch" | "workspace_authority_invalid" | "causal_install_missing" | "causal_lock_mismatch" | "product_set_invalid" | "workspace_binding_invalid";
export interface ExactPrefixWorkspaceEnvironment {
    readonly kind: "exact_prefix_workspace_environment";
    readonly schemaVersion: "5.0.0";
    readonly prefix: DurablePrefixCoordinate;
    readonly artifactTruth: ExactPrefixArtifactTruthProjection;
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBindingCandidate: WorkspaceBindingCandidate;
    readonly workspaceBinding: WorkspaceBinding;
    readonly productInstalls: readonly ProductInstall[];
    readonly resolvedProductLock: ResolvedProductLock;
    readonly productSet: ProductSet;
}
export interface ExactPrefixWorkspaceEnvironmentRefusal {
    readonly kind: "exact_prefix_workspace_environment_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ExactPrefixWorkspaceEnvironmentRefusalCode;
    readonly message: string;
    readonly eventRefs: readonly string[];
}
export type ExactPrefixWorkspaceEnvironmentProjectionResult = ExactPrefixWorkspaceEnvironment | ExactPrefixWorkspaceEnvironmentRefusal;
/**
 * Pure exact-prefix projection of the one admitted workspace environment.
 * Event meaning remains owned by artifact truth; Product reconstructs the
 * lock-bound ProductSet and revalidates the binding candidate.
 */
export declare function projectExactPrefixWorkspaceEnvironment(prefix: DurablePrefixCoordinate, workspaceBindingCoordinate: ReferenceDigest<WorkspaceBinding>): ExactPrefixWorkspaceEnvironmentProjectionResult;
/** Pure environment relation over the already authenticated owner projection. */
export declare function projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth: ExactPrefixArtifactTruthProjection, workspaceBindingCoordinate: ReferenceDigest<WorkspaceBinding>): ExactPrefixWorkspaceEnvironmentProjectionResult;
export declare function hasAdmittedProductInstall(projection: ExactPrefixArtifactTruthProjection, install: ProductInstall): boolean;
export declare function projectAdmittedProductInstall(projection: ExactPrefixArtifactTruthProjection, candidate: ProductInstallCandidate, invocationRef?: string): ProductInstall | null;
export declare function projectAdmittedWorkspaceBinding(projection: ExactPrefixArtifactTruthProjection, candidate: WorkspaceBindingCandidate, invocationRef?: string): WorkspaceBinding | null;
export declare function validatePublicOperationBasis(basis: PublicOperationAdmissionBasis, expectedOperation: PublicOperationId, expectedMemberKey: string): AbgAdmissionRefusal | null;
type ArtifactOperationId = "abg.operation.release.snapshot" | "abg.operation.product.install" | "abg.operation.workspace.bind";
type ArtifactAdmissionResult = Readonly<{
    disposition: "admitted" | "idempotent";
    admissionEventRef: string;
    successorPrefix: DurablePrefixCoordinate;
    artifactTruth: ExactPrefixArtifactTruthProjection;
}> | Readonly<{
    disposition: "refused";
    successorPrefix: DurablePrefixCoordinate;
    refusal: AbgAdmissionRefusal;
}> | Readonly<{
    disposition: "coordinate_refused";
    successorPrefix: null;
    refusal: EventStoreAppendRefusal | ExactPrefixArtifactTruthProjectionRefusal | Extract<EffectfulPublicInvocationTruth, {
        readonly disposition: "invalid_history";
    }>;
}>;
export declare function admitArtifact(store: AbgEventStore, basis: ArtifactAdmissionBasis, expectedOperation: ArtifactOperationId, artifactRef: string, artifactDigest: Sha256Digest, metadata?: ArtifactAdmissionMetadata): ArtifactAdmissionResult;
export declare function hasAdmittedWorkspaceBinding(projection: ExactPrefixArtifactTruthProjection, binding: WorkspaceBinding): boolean;
export declare function admitProductInstall(store: AbgEventStore, candidate: ProductInstallCandidate, basis: ArtifactAdmissionBasis, resolvedLock: ResolvedProductLock): ArtifactOwnerResult<ProductInstall>;
export declare function admitWorkspaceBinding(store: AbgEventStore, candidate: WorkspaceBindingCandidate, basis: ArtifactAdmissionBasis, authority: WorkspaceAuthorityBasis): ArtifactOwnerResult<WorkspaceBinding>;
export {};
