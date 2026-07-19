// Implements: REQ-P-CATALOG
// Implements: REQ-P-INSTALL
// Implements: REQ-P-POLICY
// Implements: REQ-P-PUBLIC-CONTRACTS

import type { LiveCapabilityBinding } from "../live_capability.js";
import type {
  FhInteractionProjection,
  RuntimeEventSink
} from "../../../abg/m03/index.js";
import type { IJsonValue } from "./canonical.js";

/** @pattern ^sha256:[0-9a-f]{64}$ */
export type Sha256Digest = `sha256:${string}`;
export type PublicOperationId = keyof Ds1PublicOperationContractMap;
export type PublicCatalogKind = "graph_function" | "node_type" | "overlay";
export type WorkspaceAuthorityMode =
  | "clean_no_project_authority"
  | "imported";

export interface NativeContractLocator {
  readonly kind: "native";
  readonly packageName: string;
  readonly packageExport: string;
  readonly symbols: readonly string[];
}

export interface CanonicalAssetLocator {
  readonly kind: "asset";
  readonly relativePath: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly mediaType: string;
  readonly digest: Sha256Digest;
}

export type PublicContractKind =
  | "native_contract"
  | "schema_asset"
  | "vocabulary_asset"
  | "corpus_asset"
  | "operation"
  | "capability";

export type PublicOperationDefaultDerivation =
  | "full_workspace_catalog"
  | "toolchain_resolution_precedence"
  | "workspace_mutable_roots"
  | "canonical_handle";

export type PublicOperationDefault =
  | {
      readonly fieldPath: string;
      readonly kind: "literal";
      readonly value: IJsonValue;
    }
  | {
      readonly fieldPath: string;
      readonly kind: "copy_field";
      readonly sourceFieldPath: string;
    }
  | {
      readonly fieldPath: string;
      readonly kind: "derived";
      readonly derivation: PublicOperationDefaultDerivation;
    };

export type PublicOperationValueDomainKind =
  | "absolute_path"
  | "positive_integer"
  | "bounded_integer"
  | "enum"
  | "non_empty_string"
  | "sha256_digest"
  | "semver"
  | "semver_range"
  | "i_json"
  | "closed_carrier"
  | "unique_string_array"
  | "non_empty_unique_array"
  | "exclusive_field_union";

export interface PublicOperationValueDomain {
  readonly fieldPath: string;
  readonly kind: PublicOperationValueDomainKind;
  readonly required: boolean;
  readonly nullable: boolean;
  readonly values: readonly IJsonValue[];
  readonly minimum: number | null;
  readonly maximum: number | null;
}

export type PublicOperationAuthorityClass =
  | "pure"
  | "read"
  | "write"
  | "attestation";

export type PublicOperationEffectClass =
  | "none"
  | "workspace_manifest_write"
  | "product_resolution"
  | "temporary_artifact_read"
  | "immutable_product_install"
  | "workspace_binding_write"
  | "runtime_catalog_admission"
  | "runtime_catalog_projection"
  | "runtime_session_projection"
  | "runtime_graph_function_invoke"
  | "runtime_fh_response_admission"
  | "runtime_resume_admission"
  | "runtime_result_projection"
  | "runtime_replay_projection";

export type PublicOperationEventAdmission =
  | "none"
  | "catalog_admission_events"
  | "runtime_execution_events"
  | "runtime_interaction_events";

export interface PublicOperationAdapterExitMap {
  readonly acceptedTerminal: 0;
  readonly refused: 1;
  readonly invalidInvocation: 2;
  readonly acceptedNonTerminal: 3 | null;
  readonly adapterFailure: 70;
}

export interface LegacyPublicOperationContractMetadata {
  readonly kind?: undefined;
  readonly operationId: PublicOperationId;
  readonly operationVersion: "1.0.0";
  readonly operationDigest: Sha256Digest;
  readonly requestSchemaId: string;
  readonly requestSchemaVersion: "1.0.0";
  readonly requestSchemaDigest: Sha256Digest;
  readonly requestSchemaPath: string;
  readonly resultSchemaId: string;
  readonly resultSchemaVersion: "1.0.0";
  readonly resultSchemaDigest: Sha256Digest;
  readonly resultSchemaPath: string;
  readonly refusalSchemaId: string;
  readonly refusalSchemaVersion: "1.0.0";
  readonly refusalSchemaDigest: Sha256Digest;
  readonly refusalSchemaPath: string;
  readonly invocationSchemaId: string;
  readonly invocationSchemaVersion: "1.0.0";
  readonly invocationSchemaDigest: Sha256Digest;
  readonly invocationSchemaPath: string;
  readonly defaults: readonly PublicOperationDefault[];
  readonly closedDomains: readonly PublicOperationValueDomain[];
  readonly actorPolicy: "required" | "forbidden";
  readonly authorityClass: PublicOperationAuthorityClass;
  readonly effectClass: PublicOperationEffectClass;
  readonly eventAdmission: PublicOperationEventAdmission;
  readonly terminalDispositions: readonly string[];
  readonly nonTerminalDispositions: readonly string[];
  readonly adapterExitMap: PublicOperationAdapterExitMap;
}

export type PublishedPublicOperationDefinitionKey =
  | Readonly<{
      operationId: string;
      memberKind: "variant";
      variant: string;
    }>
  | Readonly<{
      operationId: "abg.operation.project.read";
      memberKind: "project_read_case";
      caseKey: string;
    }>;

export interface PublishedPublicOperationSchemaCoordinate {
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly contractDigest: Sha256Digest;
  readonly schemaId: string;
  readonly schemaVersion: "5.0.0";
  readonly schemaDigest: Sha256Digest;
  readonly assetLocator: CanonicalAssetLocator;
}

export type PublishedPublicOperationAuthorityPresence =
  | "forbidden"
  | "exactly_one";

export type PublishedPublicOperationCatalogScopeRequirement =
  | Readonly<{
      kind: "fixed";
      requirement: PublishedPublicOperationAuthorityPresence;
    }>
  | Readonly<{
      kind: "by_visibility_basis";
      workspace_catalog: "forbidden";
      session_view: "exactly_one_matching_selector";
    }>;

export interface PublishedPublicOperationAuthorityRequirements {
  readonly actor: "forbidden" | "required";
  readonly workspace: PublishedPublicOperationAuthorityPresence;
  readonly productSet: PublishedPublicOperationAuthorityPresence;
  readonly dependencyLock: PublishedPublicOperationAuthorityPresence;
  readonly catalogScope: PublishedPublicOperationCatalogScopeRequirement;
  readonly executionProgram: PublishedPublicOperationAuthorityPresence;
  readonly invocationPolicy: PublishedPublicOperationAuthorityPresence;
  readonly transportSteering: PublishedPublicOperationAuthorityPresence;
}

export interface PublishedPublicOperationDefault {
  readonly field: string;
  readonly policy: Readonly<{
    kind: "literal";
    value: string;
  }>;
}

export type PublishedPublicOperationEffectClass =
  | "workspace_filesystem"
  | "workspace_read_admission"
  | "pure_projection"
  | "deterministic_evaluation"
  | "immutable_install_filesystem"
  | "workspace_binding_persistence"
  | "catalog_event_admission"
  | "deterministic_narrowing"
  | "declaration_application_admission"
  | "abg_traversal"
  | "abg_continuation"
  | "fh_response_admission"
  | "result_assessment_admission"
  | "witnessed_act_admission"
  | "tuning_lifecycle_admission"
  | "conformance_evaluation_admission"
  | "product_filesystem"
  | "immutable_release_publication";

export type PublishedPublicOperationEventAdmission =
  | "none"
  | "owning_semantic_authority"
  | "immutable_artifact_boundary";

export interface PublishedPublicOperationDefinitionMember {
  readonly definitionKey: PublishedPublicOperationDefinitionKey;
  readonly definitionDigest: Sha256Digest;
  readonly version: "5.0.0";
  readonly semanticAuthorityRef: string;
  readonly semanticAuthorityDigest: Sha256Digest;
  readonly authorityClass: "pure" | "read" | "write" | "attestation";
  readonly effectClass: PublishedPublicOperationEffectClass;
  readonly eventAdmission: PublishedPublicOperationEventAdmission;
  readonly authoritySlotRequirements: PublishedPublicOperationAuthorityRequirements;
  readonly capabilityRefs: readonly string[];
  readonly workspaceBindingRequirement: PublishedPublicOperationAuthorityPresence;
  readonly defaults: readonly PublishedPublicOperationDefault[];
  readonly schemaCoordinates: Readonly<{
    request: PublishedPublicOperationSchemaCoordinate;
    result: PublishedPublicOperationSchemaCoordinate;
    refusal: PublishedPublicOperationSchemaCoordinate;
    nonterminal: PublishedPublicOperationSchemaCoordinate | null;
  }>;
  readonly sdkCoordinate: string;
  readonly cliCoordinate: string;
  readonly adapterExitMap: PublicOperationAdapterExitMap;
}

export interface PublishedPublicOperationContractMetadata {
  readonly kind: "abg_public_operation_definition_family";
  readonly operationId: string;
  readonly operationVersion: "5.0.0";
  readonly operationDigest: Sha256Digest;
  readonly familyDigest: Sha256Digest;
  readonly definitions: readonly [
    PublishedPublicOperationDefinitionMember,
    ...PublishedPublicOperationDefinitionMember[]
  ];
}

export type PublicOperationContractMetadata =
  | LegacyPublicOperationContractMetadata
  | PublishedPublicOperationContractMetadata;

export interface PublicContractRow {
  readonly contractId: string;
  readonly contractKind: PublicContractKind;
  readonly owningProductId: string;
  readonly version: string;
  readonly digest: Sha256Digest;
  readonly authorityRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly nativeLocator: NativeContractLocator | null;
  readonly assetLocator: CanonicalAssetLocator | null;
  readonly operationContract: PublicOperationContractMetadata | null;
}

export type LegacyPublicContractRow = Omit<
  PublicContractRow,
  "operationContract"
> & Readonly<{
  operationContract: LegacyPublicOperationContractMetadata;
}>;

export interface PublicContractCatalog {
  readonly kind: "abg_public_contract_catalog";
  readonly schemaVersion: 1;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: Sha256Digest;
  readonly catalogSchemaPath: string;
  readonly catalogSchemaDigest: Sha256Digest;
  readonly profile: "abg-5-ds1" | "abg-5-release" | "catalog-product-v1";
  readonly rows: readonly PublicContractRow[];
}

export interface AbgRuntimeIdentity {
  readonly workerId: string;
  readonly backendId: string;
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
}

export interface AbgResolvedPolicyIdentity {
  readonly resolvedPolicyBundleRef: string;
  readonly defaultRegime: "F_D" | "F_P" | "F_H";
  readonly dispatchRef: string | null;
  readonly approvalSubjectRef: string | null;
}

export interface AbgRuntimeSystemProfile {
  readonly kind: "abg_runtime_system_profile";
  readonly runtimeIdentity: AbgRuntimeIdentity;
  readonly resolvedPolicy: AbgResolvedPolicyIdentity;
  readonly standardPluginRefs: readonly string[];
  readonly profileDigest: Sha256Digest;
}

export interface ProductToolchainManifest {
  readonly kind: "abg_product_toolchain_manifest";
  readonly schemaVersion: 1;
  readonly publisher: string;
  readonly productId: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly productContentDigest: Sha256Digest;
  readonly publicContractCatalogPath: string;
  readonly publicContractCatalogDigest: Sha256Digest;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly runtimeSystemProfile: AbgRuntimeSystemProfile | null;
  readonly productRelativeLocators: readonly string[];
}

export interface WorkspaceManifest {
  readonly kind: "abg_workspace_manifest";
  readonly schemaVersion: 1;
  readonly workspaceId: string;
  readonly root: string;
  readonly authorityMode: WorkspaceAuthorityMode;
  readonly scaffoldState: "none";
  readonly bindingRef: string | null;
  readonly configurationRefs: readonly string[];
  readonly createdAt: string;
  readonly actorRef: string;
  readonly provenanceRefs: readonly string[];
}

export interface ProductRequirement {
  readonly productId: string;
  readonly versionConstraint: string;
  readonly requiredContractRefs: readonly string[];
  readonly requiredCapabilityRefs: readonly string[];
}

export interface CatalogProductDescriptor {
  readonly kind: "catalog_product_descriptor";
  readonly schemaVersion: 1;
  readonly descriptorId: string;
  readonly descriptorDigest: Sha256Digest;
  readonly publisher: string;
  readonly productId: string;
  readonly packageName: string;
  readonly version: string;
  readonly distributionArtifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly contributionManifestId: string;
  readonly contributionManifestDigest: Sha256Digest;
  readonly dependencies: readonly ProductRequirement[];
  readonly abgCompatibility: string;
  readonly contractRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface ModuleDeclarationLocator {
  readonly kind: "module_declaration";
  readonly modulePath: string;
  readonly moduleDigest: Sha256Digest;
  readonly declarationRef: string;
}

export interface OpaqueOverlayAssetLocator {
  readonly kind: "opaque_overlay_asset";
  readonly assetPath: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: Sha256Digest;
  readonly assetDigest: Sha256Digest;
}

export type CatalogDeclarationLocator =
  | ModuleDeclarationLocator
  | OpaqueOverlayAssetLocator;

export interface CatalogCompatibilityRequirement {
  readonly abgVersionRange: string;
  readonly requiredProductRefs: readonly string[];
  readonly requiredContractRefs: readonly string[];
  readonly requiredCapabilityRefs: readonly string[];
}

export interface CatalogContributionRow {
  readonly canonicalHandle: string;
  readonly publicKind: PublicCatalogKind;
  readonly ownerProductId: string;
  readonly ownerVersion: string;
  readonly declarationRef: string;
  readonly contractRef: string;
  readonly interfaceRef: string | null;
  readonly locator: CatalogDeclarationLocator;
  readonly compatibility: CatalogCompatibilityRequirement;
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly refinementOfHandle: string | null;
  readonly overrideOfHandle: string | null;
}

export interface CatalogContributionManifest {
  readonly kind: "catalog_contribution_manifest";
  readonly schemaVersion: 1;
  readonly contributionId: string;
  readonly contributionDigest: Sha256Digest;
  readonly descriptorId: string;
  readonly descriptorDigest: Sha256Digest;
  readonly productId: string;
  readonly productVersion: string;
  readonly artifactDigest: Sha256Digest;
  readonly rows: readonly CatalogContributionRow[];
}

export interface ResolvedDependencyEdge {
  readonly sourceProductId: string;
  readonly targetProductId: string;
  readonly requirement: ProductRequirement;
}

export interface ProductCompatibilityResult {
  readonly productId: string;
  readonly compatible: boolean;
  readonly reason: string | null;
}

export interface ResolvedProductSelection {
  readonly publisher: string;
  readonly productId: string;
  readonly version: string;
  readonly descriptorId: string;
  readonly descriptorDigest: Sha256Digest;
  readonly contributionId: string;
  readonly contributionDigest: Sha256Digest;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
}

export interface ResolvedProductLock {
  readonly kind: "resolved_product_lock";
  readonly schemaVersion: 1;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly requirements: readonly ProductRequirement[];
  readonly products: readonly ResolvedProductSelection[];
  readonly dependencyEdges: readonly ResolvedDependencyEdge[];
  readonly compatibility: readonly ProductCompatibilityResult[];
}

export type SuppliedProductArtifactFormat =
  | "abg_product_tar_v1"
  | "npm_package_tgz";

export interface SuppliedProductArtifact {
  readonly format: SuppliedProductArtifactFormat;
  readonly artifactPath: string;
  readonly expectedArtifactDigest: Sha256Digest;
  readonly expectedProductContentDigest: Sha256Digest;
}

export interface SuppliedProductArtifactEntry {
  readonly relativePath: string;
  readonly bytes: Uint8Array;
}

export interface ProductVerificationCheck {
  readonly field: string;
  readonly accepted: boolean;
  readonly expected: string;
  readonly actual: string;
}

export interface ProductContentInventoryRow {
  readonly relativePath: string;
  readonly digest: Sha256Digest;
}

export interface VerifiedProductArtifact {
  readonly kind: "verified_product_artifact";
  readonly artifact: SuppliedProductArtifact;
  readonly descriptor: CatalogProductDescriptor;
  readonly contributionManifest: CatalogContributionManifest;
  readonly productManifest: ProductToolchainManifest;
  readonly resolvedLock: ResolvedProductLock;
  readonly productContentInventory: readonly ProductContentInventoryRow[];
  readonly verificationChecks: readonly ProductVerificationCheck[];
  readonly verifiedAt: string;
}

export interface InstalledProductRecord {
  readonly kind: "installed_product_record";
  readonly schemaVersion: 1;
  readonly installedProductId: string;
  readonly publisher: string;
  readonly productId: string;
  readonly packageName: string;
  readonly version: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly installedRoot: string;
  readonly productRoot: string;
  readonly packageRoot: string;
  readonly manifestPath: string;
  readonly manifestDigest: Sha256Digest;
  readonly descriptorId: string;
  readonly descriptorDigest: Sha256Digest;
  readonly contributionId: string;
  readonly contributionDigest: Sha256Digest;
  readonly compatibilityRange: string;
  readonly compatibility: ProductCompatibilityResult;
  readonly commandRefs: readonly string[];
  readonly publicContractCatalogId: string;
  readonly publicContractCatalogVersion: string;
  readonly publicContractCatalogDigest: Sha256Digest;
  readonly descriptorRecordPath: string;
  readonly contributionRecordPath: string;
  readonly lockRecordPath: string;
  readonly provenanceRefs: readonly string[];
}

export interface ProductVerificationRecord {
  readonly kind: "product_verification_record";
  readonly schemaVersion: 1;
  readonly disposition: "verified";
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly installedProductRecord: InstalledProductRecord;
}

export interface ToolchainMutableStateRootsV3 {
  readonly observedWorkspaceRoot: string;
  readonly observerStateRoot: string;
  readonly executorStateRoot: string;
  readonly eventRoot: string;
  readonly eventLogPath: string;
  readonly runtimeRoot: string;
  readonly projectionRoot: string;
  readonly archiveRoot: string;
}

export interface ToolchainProductBindingV3 {
  readonly installedProductId: string;
  readonly publisher: string;
  readonly productId: string;
  readonly packageName: string;
  readonly version: string;
  readonly productContentDigest: Sha256Digest;
  readonly descriptorId: string;
  readonly descriptorDigest: Sha256Digest;
  readonly contributionId: string;
  readonly contributionDigest: Sha256Digest;
  readonly artifactDigest: Sha256Digest;
  readonly installedRoot: string;
  readonly productRoot: string;
  readonly packageRoot: string;
  readonly manifestPath: string;
  readonly manifestDigest: Sha256Digest;
  readonly compatibilityRange: string;
  readonly compatibility: ProductCompatibilityResult;
  readonly commandRefs: readonly string[];
  readonly publicContractCatalogId: string;
  readonly publicContractCatalogVersion: string;
  readonly publicContractCatalogDigest: Sha256Digest;
}

export interface ToolchainWorkspaceBindingV3 {
  readonly kind: "abg_toolchain_workspace_binding";
  readonly schemaVersion: "3";
  readonly bindingId: string;
  readonly bindingDigest: Sha256Digest;
  readonly workspaceId: string;
  readonly workspaceManifestDigest: Sha256Digest;
  readonly targetRoot: string;
  readonly toolchainRoot: string;
  readonly resolvedLockId: string;
  readonly resolvedLockDigest: Sha256Digest;
  readonly productSetDigest: Sha256Digest;
  readonly productBindingRefs: readonly string[];
  readonly products: readonly ToolchainProductBindingV3[];
  readonly mutableStateRoots: ToolchainMutableStateRootsV3;
  readonly provenanceRefs: readonly string[];
}

export interface PublicCatalogRow {
  readonly canonicalHandle: string;
  readonly runtimeEntryRef: string;
  readonly kind: PublicCatalogKind;
  readonly ownerProductId: string;
  readonly ownerVersion: string;
  readonly descriptorId: string;
  readonly contributionId: string;
  readonly artifactDigest: Sha256Digest;
  readonly resolvedLockId: string;
  readonly compatible: boolean;
  readonly ready: boolean;
  readonly readinessBlockers: readonly string[];
  readonly eligible: boolean;
  readonly callable: boolean;
  readonly sessionVisible: boolean;
  readonly contractRef: string;
  readonly schemaRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface PublicCatalogDescription extends PublicCatalogRow {
  readonly declarationRef: string;
  readonly interfaceRef: string | null;
  readonly dependencyRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly proofRefs: readonly string[];
}

export interface PublicSessionCatalogView {
  readonly kind: "public_session_catalog_view";
  readonly workspaceId: string;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: Sha256Digest;
  readonly runtimeCatalogProjectionRef: string;
  readonly effectiveSessionViewId: string;
  readonly allowedHandles: readonly string[];
  readonly allowedEntryRefs: readonly string[];
  readonly rows: readonly PublicCatalogRow[];
}

export interface PublicCatalogAdmissionRow {
  readonly canonicalHandle: string;
  readonly disposition: "admitted" | "rejected" | "incompatible" | "conflicting" | "unready" | "unresolved";
  readonly reason: string | null;
  readonly eventRefs: readonly string[];
}

export interface PublicCatalogAdmission {
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: Sha256Digest;
  readonly rows: readonly PublicCatalogAdmissionRow[];
}

export interface PublicResultProjection {
  readonly resultId: string;
  readonly graphCallId: string;
  readonly disposition: "converged" | "stopped" | "yielded" | "blocked" | "human_gate_required";
  readonly result: IJsonValue;
  readonly interaction: FhInteractionProjection | null;
  readonly evidenceRefs: readonly string[];
  readonly replayRefs: readonly string[];
}

export type PublicFhInteractionProjection = FhInteractionProjection;

export interface PublicReplayProjection {
  readonly subject: ReplaySubject;
  readonly fromOrdinal: number;
  readonly returnedThroughOrdinal: number | null;
  readonly nextOrdinal: number | null;
  readonly events: readonly IJsonValue[];
}

export interface AdmittedWorkspaceState {
  readonly manifest: WorkspaceManifest;
  readonly disposition: "ready" | "unbound";
  readonly bindingRef: string | null;
  readonly configurationRefs: readonly string[];
}

export interface AdapterIdentity {
  readonly kind: "native_sdk" | "abg_cli" | "host_adapter";
  readonly ref: string;
}

export interface TransportSteering {
  readonly agent: "claude" | "codex" | "gemini" | "generic";
  readonly model: string | null;
  readonly profile: "local-spawn" | "pty-terminal";
  readonly timeoutMs: number;
}

export interface WorkspaceCreateRequest {
  readonly targetRoot: string;
  readonly authorityMode: WorkspaceAuthorityMode;
}

export interface WorkspaceOpenRequest {
  readonly targetRoot: string;
  readonly expectedWorkspaceSchemaVersion: number;
}

export interface CatalogResolveRequest {
  readonly requirements: readonly ProductRequirement[];
  readonly candidateDescriptors: readonly CatalogProductDescriptor[];
}

export interface CatalogVerifyRequest {
  readonly artifact: SuppliedProductArtifact;
  readonly descriptor: CatalogProductDescriptor;
  readonly contributionManifest: CatalogContributionManifest;
  readonly resolvedLock: ResolvedProductLock;
}

export interface InstallProductRequest {
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly toolchainRoot: string | null;
  readonly workspaceBindingRef: string | null;
}

export interface CatalogBindRequest {
  readonly workspaceId: string;
  readonly workspaceManifestDigest: Sha256Digest;
  readonly resolvedLock: ResolvedProductLock;
  readonly installedProductRecords: readonly InstalledProductRecord[];
  readonly mutableStateRoots: ToolchainMutableStateRootsV3 | null;
}

export interface CatalogAdmitRequest {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly resolvedLockId: string;
  readonly productSetDigest: Sha256Digest;
}

export interface SessionSelectionInput {
  readonly allowedHandles: readonly string[] | null;
  readonly sessionView: PublicSessionCatalogView | null;
}

export interface CatalogListRequest extends SessionSelectionInput {
  readonly workspaceId: string;
  readonly catalogId: string;
  readonly kinds: readonly PublicCatalogKind[];
}

export interface CatalogDescribeRequest extends SessionSelectionInput {
  readonly workspaceId: string;
  readonly catalogId: string;
  readonly handle: string;
}

export interface CatalogAllowRequest {
  readonly workspaceId: string;
  readonly catalogId: string;
  readonly handles: readonly string[];
}

export type InvocationInput =
  | {
      readonly input: IJsonValue;
      readonly inputRef?: never;
    }
  | {
      readonly input?: never;
      readonly inputRef: string;
    };

export interface CatalogInvokeRequestBase extends SessionSelectionInput {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly resolvedLockId: string;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: Sha256Digest;
  readonly graphFunctionHandle: string;
  readonly interfaceRef: string;
  readonly inputId: string;
  readonly inputSchemaId: string;
  readonly inputSchemaVersion: string;
  readonly inputSchemaDigest: Sha256Digest;
  readonly requiredCapabilityRefs: readonly string[];
  readonly actorRef: string;
  readonly transportSteering: TransportSteering | null;
}

export type CatalogInvokeRequest = CatalogInvokeRequestBase & InvocationInput;

export type ReadResultRequest = {
  readonly workspaceId: string;
} & (
  | { readonly resultId: string; readonly graphCallId?: never }
  | { readonly resultId?: never; readonly graphCallId: string }
);

export type ReplaySubject =
  | { readonly kind: "workspace"; readonly workspaceId: string }
  | { readonly kind: "run"; readonly runId: string }
  | { readonly kind: "graph_call"; readonly graphCallId: string }
  | { readonly kind: "subordinate"; readonly subjectId: string };

export interface ReadReplayRequest {
  readonly workspaceId: string;
  readonly subject: ReplaySubject;
  readonly fromOrdinal: number;
  readonly limit: number;
}

export interface FhInteractionResponseRequest {
  readonly workspaceId: string;
  readonly interactionRef: string;
  readonly interactionBasisDigest: Sha256Digest;
  readonly responseContractRef: string;
  readonly choiceRef: string | null;
  readonly value: IJsonValue;
  readonly evidenceRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
}

export type FhSelectRequest = FhInteractionResponseRequest;
export type FhApproveRequest = FhInteractionResponseRequest;
export type FhRejectRequest = FhInteractionResponseRequest;
export type FhAssessRequest = FhInteractionResponseRequest;
export type FhAnswerEscalationRequest = FhInteractionResponseRequest;

export interface RunResumeRequest {
  readonly workspaceId: string;
  readonly interactionRef: string;
  readonly interactionBasisDigest: Sha256Digest;
  readonly responseRef: string;
  readonly continuationRef: string;
}

export type AdapterExitClassification =
  | "accepted_terminal"
  | "accepted_non_terminal"
  | "refused"
  | "invalid_invocation"
  | "adapter_failure";

export interface PublicOperationAccepted<
  K extends string,
  D extends string,
  V,
  E extends "accepted_terminal" | "accepted_non_terminal" = "accepted_terminal"
> {
  readonly kind: "accepted";
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs: readonly string[];
  readonly exitClassification: E;
}

export interface PublicOperationRefused<K extends string, C extends string> {
  readonly kind: "refused";
  readonly operationId: K;
  readonly code: C;
  readonly message: string;
  readonly residualRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly exitClassification: "refused";
}

export type WorkspaceCreateResult = PublicOperationAccepted<
  "abg.operation.workspace.create",
  "created",
  WorkspaceManifest
>;
export type WorkspaceCreateRefusal = PublicOperationRefused<
  "abg.operation.workspace.create",
  "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "filesystem_failure"
>;

export type WorkspaceOpenResult = PublicOperationAccepted<
  "abg.operation.workspace.open",
  "ready" | "unbound",
  AdmittedWorkspaceState
>;
export type WorkspaceOpenRefusal = PublicOperationRefused<
  "abg.operation.workspace.open",
  "missing" | "malformed" | "stale" | "incompatible"
>;

export type CatalogResolveResult = PublicOperationAccepted<
  "abg.operation.catalog.resolve",
  "resolved",
  ResolvedProductLock
>;
export type CatalogResolveRefusal = PublicOperationRefused<
  "abg.operation.catalog.resolve",
  "unresolved" | "incompatible" | "ambiguous" | "dependency_cycle" | "malformed_candidate"
>;

export type CatalogVerifyResult = PublicOperationAccepted<
  "abg.operation.catalog.verify",
  "verified",
  VerifiedProductArtifact
>;
export type CatalogVerifyRefusal = PublicOperationRefused<
  "abg.operation.catalog.verify",
  "content_mismatch" | "identity_mismatch" | "descriptor_mismatch" | "contribution_mismatch" | "lock_mismatch" | "incompatible" | "unsupported_contract" | "unsafe_archive"
>;

export type InstallProductResult = PublicOperationAccepted<
  "abg.operation.install.install",
  "installed" | "already_installed_exact",
  InstalledProductRecord
>;
export type InstallProductRefusal = PublicOperationRefused<
  "abg.operation.install.install",
  "unverified" | "toolchain_unresolved" | "installed_identity_conflict" | "materialization_failure"
>;

export type CatalogBindResult = PublicOperationAccepted<
  "abg.operation.catalog.bind",
  "bound" | "already_bound_exact",
  ToolchainWorkspaceBindingV3
>;
export type CatalogBindRefusal = PublicOperationRefused<
  "abg.operation.catalog.bind",
  "workspace_not_ready" | "product_not_installed" | "lock_mismatch" | "binding_conflict" | "incompatible"
>;

export type CatalogAdmitResult = PublicOperationAccepted<
  "abg.operation.catalog.admit",
  "admitted",
  PublicCatalogAdmission
>;
export type CatalogAdmitRefusal = PublicOperationRefused<
  "abg.operation.catalog.admit",
  "unbound" | "binding_mismatch" | "lock_mismatch" | "malformed_declaration" | "product_conflict" | "required_row_rejected"
>;

export type CatalogListResult = PublicOperationAccepted<
  "abg.operation.catalog.list",
  "listed",
  readonly PublicCatalogRow[]
>;
export type CatalogListRefusal = PublicOperationRefused<
  "abg.operation.catalog.list",
  "catalog_missing" | "catalog_stale" | "view_mismatch" | "unsupported_kind"
>;

export type CatalogDescribeResult = PublicOperationAccepted<
  "abg.operation.catalog.describe",
  "described",
  PublicCatalogDescription
>;
export type CatalogDescribeRefusal = PublicOperationRefused<
  "abg.operation.catalog.describe",
  "catalog_missing" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view" | "stale"
>;

export type CatalogAllowResult = PublicOperationAccepted<
  "abg.operation.catalog.allow",
  "allowed",
  PublicSessionCatalogView
>;
export type CatalogAllowRefusal = PublicOperationRefused<
  "abg.operation.catalog.allow",
  "duplicate_handle" | "unknown_handle" | "unauthorized" | "inadmissible" | "unready"
>;

export type CatalogInvokeResult =
  | PublicOperationAccepted<
      "abg.operation.catalog.invoke",
      "converged",
      PublicResultProjection
    >
  | PublicOperationAccepted<
      "abg.operation.catalog.invoke",
      "stopped" | "yielded" | "blocked" | "human_gate_required",
      PublicResultProjection,
      "accepted_non_terminal"
    >;
export type CatalogInvokeRefusal = PublicOperationRefused<
  "abg.operation.catalog.invoke",
  "catalog_stale" | "view_mismatch" | "disallowed" | "non_callable" | "unready" | "interface_mismatch" | "input_invalid" | "missing_capability" | "preflight_failure" | "runtime_refused"
>;

export type FhInteractionResult<K extends PublicOperationId> =
  PublicOperationAccepted<
    K,
    "responded" | "held",
    PublicFhInteractionProjection,
    "accepted_non_terminal"
  >;

export type FhInteractionRefusal<K extends PublicOperationId> = PublicOperationRefused<
  K,
  | "workspace_mismatch"
  | "unknown_interaction"
  | "ambiguous_interaction"
  | "stale_basis"
  | "interaction_not_pending"
  | "operation_not_declared"
  | "choice_not_declared"
  | "response_contract_mismatch"
  | "capability_mismatch"
  | "capability_provenance_missing"
  | "evidence_missing"
  | "replay_invalid"
>;

export type FhSelectResult = FhInteractionResult<"abg.operation.fh.select">;
export type FhSelectRefusal = FhInteractionRefusal<"abg.operation.fh.select">;
export type FhApproveResult = FhInteractionResult<"abg.operation.fh.approve">;
export type FhApproveRefusal = FhInteractionRefusal<"abg.operation.fh.approve">;
export type FhRejectResult = FhInteractionResult<"abg.operation.fh.reject">;
export type FhRejectRefusal = FhInteractionRefusal<"abg.operation.fh.reject">;
export type FhAssessResult = FhInteractionResult<"abg.operation.fh.assess">;
export type FhAssessRefusal = FhInteractionRefusal<"abg.operation.fh.assess">;
export type FhAnswerEscalationResult =
  FhInteractionResult<"abg.operation.fh.answer-escalation">;
export type FhAnswerEscalationRefusal =
  FhInteractionRefusal<"abg.operation.fh.answer-escalation">;

export type RunResumeResult = PublicOperationAccepted<
  "abg.operation.run.resume",
  "resume_admitted",
  PublicFhInteractionProjection,
  "accepted_non_terminal"
>;
export type RunResumeRefusal = PublicOperationRefused<
  "abg.operation.run.resume",
  | "workspace_mismatch"
  | "unknown_interaction"
  | "ambiguous_interaction"
  | "stale_basis"
  | "interaction_not_pending"
  | "response_mismatch"
  | "continuation_mismatch"
  | "response_not_resume_eligible"
  | "replay_invalid"
>;

export type ReadResultResult = PublicOperationAccepted<
  "abg.operation.read.result",
  "projected",
  PublicResultProjection
>;
export type ReadResultRefusal = PublicOperationRefused<
  "abg.operation.read.result",
  "unknown_identity" | "ambiguous_identity" | "stale_basis" | "malformed_replay"
>;

export type ReadReplayResult = PublicOperationAccepted<
  "abg.operation.read.replay",
  "projected",
  PublicReplayProjection
>;
export type ReadReplayRefusal = PublicOperationRefused<
  "abg.operation.read.replay",
  "unknown_identity" | "invalid_range" | "corrupt_event" | "ordinal_collision" | "stale_basis"
>;

export interface OperationContract<Request, Result, Refusal> {
  readonly request: Request;
  readonly result: Result;
  readonly refusal: Refusal;
}

export interface Ds1PublicOperationContractMap {
  readonly "abg.operation.workspace.create": OperationContract<WorkspaceCreateRequest, WorkspaceCreateResult, WorkspaceCreateRefusal>;
  readonly "abg.operation.workspace.open": OperationContract<WorkspaceOpenRequest, WorkspaceOpenResult, WorkspaceOpenRefusal>;
  readonly "abg.operation.catalog.resolve": OperationContract<CatalogResolveRequest, CatalogResolveResult, CatalogResolveRefusal>;
  readonly "abg.operation.catalog.verify": OperationContract<CatalogVerifyRequest, CatalogVerifyResult, CatalogVerifyRefusal>;
  readonly "abg.operation.install.install": OperationContract<InstallProductRequest, InstallProductResult, InstallProductRefusal>;
  readonly "abg.operation.catalog.bind": OperationContract<CatalogBindRequest, CatalogBindResult, CatalogBindRefusal>;
  readonly "abg.operation.catalog.admit": OperationContract<CatalogAdmitRequest, CatalogAdmitResult, CatalogAdmitRefusal>;
  readonly "abg.operation.catalog.list": OperationContract<CatalogListRequest, CatalogListResult, CatalogListRefusal>;
  readonly "abg.operation.catalog.describe": OperationContract<CatalogDescribeRequest, CatalogDescribeResult, CatalogDescribeRefusal>;
  readonly "abg.operation.catalog.allow": OperationContract<CatalogAllowRequest, CatalogAllowResult, CatalogAllowRefusal>;
  readonly "abg.operation.catalog.invoke": OperationContract<CatalogInvokeRequest, CatalogInvokeResult, CatalogInvokeRefusal>;
  readonly "abg.operation.fh.select": OperationContract<FhSelectRequest, FhSelectResult, FhSelectRefusal>;
  readonly "abg.operation.fh.approve": OperationContract<FhApproveRequest, FhApproveResult, FhApproveRefusal>;
  readonly "abg.operation.fh.reject": OperationContract<FhRejectRequest, FhRejectResult, FhRejectRefusal>;
  readonly "abg.operation.fh.assess": OperationContract<FhAssessRequest, FhAssessResult, FhAssessRefusal>;
  readonly "abg.operation.fh.answer-escalation": OperationContract<FhAnswerEscalationRequest, FhAnswerEscalationResult, FhAnswerEscalationRefusal>;
  readonly "abg.operation.run.resume": OperationContract<RunResumeRequest, RunResumeResult, RunResumeRefusal>;
  readonly "abg.operation.read.result": OperationContract<ReadResultRequest, ReadResultResult, ReadResultRefusal>;
  readonly "abg.operation.read.replay": OperationContract<ReadReplayRequest, ReadReplayResult, ReadReplayRefusal>;
}

export type AnyDs1OperationRequest = {
  readonly [K in PublicOperationId]: Ds1PublicOperationContractMap[K]["request"];
}[PublicOperationId];

export interface PublicOperationInvocationEnvelope<K extends PublicOperationId> {
  readonly schemaVersion: 1;
  readonly invocationSchemaId: string;
  readonly invocationSchemaVersion: "1.0.0";
  readonly invocationSchemaDigest: Sha256Digest;
  readonly invocationId: string;
  readonly operationId: K;
  readonly operationContractVersion: "1.0.0";
  readonly operationContractDigest: Sha256Digest;
  readonly requestId: string;
  readonly requestSchemaId: string;
  readonly requestSchemaVersion: "1.0.0";
  readonly requestSchemaDigest: Sha256Digest;
  readonly resultSchemaId: string;
  readonly resultSchemaVersion: "1.0.0";
  readonly resultSchemaDigest: Sha256Digest;
  readonly refusalSchemaId: string;
  readonly refusalSchemaVersion: "1.0.0";
  readonly refusalSchemaDigest: Sha256Digest;
  readonly request: Ds1PublicOperationContractMap[K]["request"];
  readonly actorRef: string | null;
  readonly provenanceRefs: readonly string[];
  readonly adapter: AdapterIdentity;
  readonly correlationId: string;
}

export type AnyPublicOperationInvocationEnvelope = {
  readonly [K in PublicOperationId]: PublicOperationInvocationEnvelope<K>;
}[PublicOperationId];

export interface HostInvocationDescriptorBase
  extends PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke"> {
  readonly contractCatalogVersion: string;
  readonly contractCatalogDigest: Sha256Digest;
  readonly workspaceId: string;
  readonly workspaceManifestDigest: Sha256Digest;
  readonly productSetDigest: Sha256Digest;
  readonly productBindingRefs: readonly string[];
  readonly bindingId: string;
  readonly resolvedLockId: string;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: Sha256Digest;
  readonly runtimeCatalogProjectionRef: string;
  readonly effectiveSessionViewId: string;
  readonly allowedHandles: readonly string[];
  readonly allowedEntryRefs: readonly string[];
  readonly graphFunctionHandle: string;
  readonly interfaceRef: string;
  readonly inputId: string;
  readonly inputSchemaId: string;
  readonly inputSchemaVersion: string;
  readonly inputSchemaDigest: Sha256Digest;
  readonly requiredCapabilityRefs: readonly string[];
  readonly transportSteering: TransportSteering | null;
  readonly mode: "invoke";
  readonly scope: "graph_function";
  readonly target: string;
  readonly until: "first_traversal" | "blocked" | "converged";
  readonly actorRef: string;
}

export type HostInvocationDescriptor = HostInvocationDescriptorBase & InvocationInput;

export interface WorkspacePathEffects {
  readonly readBytes: (absolutePath: string) => Promise<Uint8Array | null>;
  readonly writeBytes: (absolutePath: string, bytes: Uint8Array) => Promise<void>;
  readonly makeDirectory: (absolutePath: string) => Promise<void>;
}

export interface WorkspacePathContext {
  readonly kind: "workspace_path";
  readonly targetRoot: string;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly effects: WorkspacePathEffects;
}

export interface ProductIntakeEffects {
  readonly readArtifactBytes: (absolutePath: string) => Promise<Uint8Array>;
  readonly readInstalledBytes: (absolutePath: string) => Promise<Uint8Array | null>;
  readonly inspectArtifact: (
    artifact: SuppliedProductArtifact
  ) => Promise<readonly SuppliedProductArtifactEntry[]>;
  readonly readRecord: (absolutePath: string) => Promise<IJsonValue | null>;
  readonly writeRecord: (absolutePath: string, value: IJsonValue) => Promise<void>;
  readonly materializeVerifiedArtifact: (
    artifact: VerifiedProductArtifact,
    destinationRoot: string
  ) => Promise<void>;
  readonly readEnvironment: (name: "ABG_TOOLCHAIN_ROOT") => string | null;
  readonly readWorkspaceBinding: (
    bindingRef: string
  ) => Promise<ToolchainWorkspaceBindingV3 | null>;
}

export interface ProductIntakeContext {
  readonly kind: "product_intake";
  readonly publicContractCatalog: PublicContractCatalog;
  readonly effects: ProductIntakeEffects;
}

export interface WorkspaceBindingEffects {
  readonly readBinding: () => Promise<ToolchainWorkspaceBindingV3 | null>;
  readonly readInstalledProductRecord: (
    installedProductId: string
  ) => Promise<InstalledProductRecord | null>;
  readonly writeBinding: (binding: ToolchainWorkspaceBindingV3) => Promise<void>;
  readonly createMutableRoot: (absolutePath: string) => Promise<void>;
}

export interface WorkspaceBindingContext {
  readonly kind: "workspace_binding";
  readonly workspaceManifest: WorkspaceManifest;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly effects: WorkspaceBindingEffects;
}

export type OperatorCapabilityFactory = (input: {
  readonly workspaceRoot: string;
  readonly archiveRoot: string;
  readonly steering: TransportSteering;
}) => LiveCapabilityBinding;

// The 5.0 public execution path resolves a process-local body only through the
// already-admitted steering identity. The closure owns the TransportSteering
// body; neither it nor the callable enters public or replay truth.
export type AdmittedSteeringCapabilityFactory = (input: {
  readonly workspaceRoot: string;
  readonly archiveRoot: string;
  readonly steeringRef: string;
  readonly steeringDigest: Sha256Digest;
}) => LiveCapabilityBinding;

export interface BoundWorkspaceEffects {
  readonly readRecord: (absolutePath: string) => Promise<IJsonValue | null>;
  readonly readInputAsset: (inputRef: string) => Promise<IJsonValue | null>;
  readonly writeImmutableRuntimeRecord: (
    relativePath: string,
    value: IJsonValue
  ) => Promise<void>;
  readonly readRuntimeEventBytes: () => Promise<Uint8Array>;
  readonly createRuntimeEventSink: () => RuntimeEventSink;
  readonly operatorCapabilityFactories: Readonly<Record<string, OperatorCapabilityFactory>>;
  readonly operatorCapabilityFactoriesBySteeringRef?: Readonly<
    Record<string, AdmittedSteeringCapabilityFactory>
  >;
}

export interface BoundWorkspaceContext {
  readonly kind: "bound_workspace";
  readonly workspaceManifest: WorkspaceManifest;
  readonly binding: ToolchainWorkspaceBindingV3;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly effects: BoundWorkspaceEffects;
}

export type PublicSdkExecutionContext =
  | WorkspacePathContext
  | ProductIntakeContext
  | WorkspaceBindingContext
  | BoundWorkspaceContext;

export type PublicOperationOutcome<K extends PublicOperationId> =
  | Ds1PublicOperationContractMap[K]["result"]
  | Ds1PublicOperationContractMap[K]["refusal"];

export type Ds1PublicOperationOutcome<K extends PublicOperationId> =
  PublicOperationOutcome<K>;

export interface AbiogenesisPublicSdk {
  readonly workspaceCreate: (
    context: WorkspacePathContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.workspace.create">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.workspace.create">>;
  readonly workspaceOpen: (
    context: WorkspacePathContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.workspace.open">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.workspace.open">>;
  readonly catalogResolve: (
    context: ProductIntakeContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.resolve">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.resolve">>;
  readonly catalogVerify: (
    context: ProductIntakeContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.verify">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.verify">>;
  readonly installProduct: (
    context: ProductIntakeContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.install.install">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.install.install">>;
  readonly catalogBind: (
    context: WorkspaceBindingContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.bind">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.bind">>;
  readonly catalogAdmit: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.admit">>;
  readonly catalogList: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.list">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.list">>;
  readonly catalogDescribe: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.describe">>;
  readonly catalogAllow: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.allow">>;
  readonly catalogInvoke: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.catalog.invoke">>;
  readonly fhSelect: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.select">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.fh.select">>;
  readonly fhApprove: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.approve">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.fh.approve">>;
  readonly fhReject: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.reject">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.fh.reject">>;
  readonly fhAssess: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.assess">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.fh.assess">>;
  readonly fhAnswerEscalation: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.answer-escalation">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.fh.answer-escalation">>;
  readonly runResume: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.run.resume">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.run.resume">>;
  readonly readResult: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.read.result">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.read.result">>;
  readonly readReplay: (
    context: BoundWorkspaceContext,
    invocation: PublicOperationInvocationEnvelope<"abg.operation.read.replay">
  ) => Promise<Ds1PublicOperationOutcome<"abg.operation.read.replay">>;
}
