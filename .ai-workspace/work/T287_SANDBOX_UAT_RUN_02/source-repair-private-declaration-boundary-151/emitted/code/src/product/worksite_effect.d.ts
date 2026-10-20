import { type Sha256Digest } from "../shared/digests.js";
import type { CCall } from "../abg/c_call.js";
import type { AdmittedImplementationSet, ExecutionBasis } from "../abg/execution_basis.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
export declare const WORKSITE_FILE_REPLACE_EFFECT_URI: "effect://abiogenesis/worksite/file.replace/v1";
export declare const WORKSITE_FILE_REPLACE_HANDLER_REF: "handler://abiogenesis/product/worksite/file.replace/v1";
export declare const WORKSITE_FILE_REPLACE_HANDLER_DIGEST: `sha256:${string}`;
export interface WorksiteSubject {
    readonly kind: "worksite_subject";
    readonly schemaVersion: "5.0.0";
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly subjectUri: string;
    readonly relativePath: string;
}
export interface WorksiteTerritory {
    readonly kind: "worksite_territory";
    readonly schemaVersion: "5.0.0";
    readonly territoryRef: string;
    readonly territoryDigest: Sha256Digest;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly territoryUri: string;
    readonly relativeRoot: string;
    readonly operations: readonly ["atomic_replace"];
}
interface WorksiteObservationBase {
    readonly kind: "worksite_observation";
    readonly schemaVersion: "5.0.0";
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
    readonly workspaceBindingIdentity: string;
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
}
export interface AbsentWorksiteObservation extends WorksiteObservationBase {
    readonly state: "absent";
}
export interface FileWorksiteObservation extends WorksiteObservationBase {
    readonly state: "file";
    readonly fileIdentity: string;
    readonly fileDigest: Sha256Digest;
    readonly byteLength: number;
}
export type WorksiteObservation = AbsentWorksiteObservation | FileWorksiteObservation;
export interface WorksiteEffectAuthorization {
    readonly kind: "worksite_effect_authorization";
    readonly schemaVersion: "5.0.0";
    readonly authorizationRef: string;
    readonly authorizationDigest: Sha256Digest;
    readonly actorRef: string;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly capabilityGrantRef: string;
    readonly capabilityGrantDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly cCallDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    /** The exact admitted set and leaf candidate selected for this owner call. */
    readonly implementationSetRef: string;
    readonly implementationSetDigest: Sha256Digest;
    readonly leafResolutionCandidateRef: string;
    readonly leafResolutionCandidateDigest: Sha256Digest;
    readonly implementationBindingRef: string;
    readonly implementationBindingDigest: Sha256Digest;
    readonly implementationRef: string;
    readonly effectUri: typeof WORKSITE_FILE_REPLACE_EFFECT_URI;
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly territoryRef: string;
    readonly territoryDigest: Sha256Digest;
    readonly implementationOwnerRef: string;
    readonly handlerRef: typeof WORKSITE_FILE_REPLACE_HANDLER_REF;
    readonly handlerDigest: Sha256Digest;
    readonly predecessorObservationRef: string;
    readonly predecessorObservationDigest: Sha256Digest;
}
export interface WorksiteFileReplaceReceipt {
    readonly kind: "worksite_file_replace_receipt";
    readonly schemaVersion: "5.0.0";
    readonly receiptRef: string;
    readonly receiptDigest: Sha256Digest;
    readonly authorizationRef: string;
    readonly authorizationDigest: Sha256Digest;
    readonly beforeObservationRef: string;
    readonly beforeObservationDigest: Sha256Digest;
    readonly afterObservationRef: string;
    readonly afterObservationDigest: Sha256Digest;
    readonly writtenDigest: Sha256Digest;
    readonly committed: true;
}
export interface WorksiteFileReplaceRequest {
    readonly kind: "worksite_file_replace_request";
    readonly schemaVersion: "5.0.0";
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly capabilityGrant: CapabilityGrant;
    readonly subject: WorksiteSubject;
    readonly territory: WorksiteTerritory;
    readonly predecessorObservation: WorksiteObservation;
    readonly replacementEncoding: "base64";
    readonly replacementBytes: string;
    readonly replacementByteLength: number;
    readonly replacementDigest: Sha256Digest;
}
export declare const WORKSITE_EFFECT_REFUSAL_CODES: readonly ["invalid_coordinate", "invalid_relative_path", "subject_outside_territory", "binding_mismatch", "authorization_mismatch", "invalid_worksite_root", "target_parent_missing", "target_not_file", "aliased_subject", "symlink_forbidden", "stale_observation", "replacement_invalid", "filesystem_refused", "successor_observation_mismatch"];
export type WorksiteEffectRefusalCode = (typeof WORKSITE_EFFECT_REFUSAL_CODES)[number];
export interface WorksiteEffectRefusal {
    readonly kind: "worksite_effect_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: WorksiteEffectRefusalCode;
    readonly message: string;
    readonly lastObservation: WorksiteObservation | null;
    readonly substrateCode: string | null;
}
/** C0 owner evidence only; publication does not imply an admitted successor. */
export interface WorksitePostPublicationDiagnostic {
    readonly stage: "staging_cleanup" | "target_compensation" | "staging_residue" | "successor_observation" | "successor_receipt" | "product_inventory" | "owner_reobservation";
    readonly code: WorksiteEffectRefusalCode;
    readonly message: string;
    readonly substrateCode: string | null;
}
export interface CompletedWorksiteOwner {
    readonly authorization: WorksiteEffectAuthorization;
    readonly receipt: WorksiteFileReplaceReceipt;
    readonly successorObservation: FileWorksiteObservation;
}
export interface WorksitePublicationFacts {
    readonly committed: true;
    readonly method: "link" | "rename";
    readonly writtenDigest: Sha256Digest;
    readonly byteLength: number;
    readonly stagingPath: string;
    readonly stagingFileIdentity: string;
}
export type WorksitePhysicalOutcome = Readonly<{
    readonly postPublicationObservation: WorksiteObservation | null;
    readonly diagnostics: readonly WorksitePostPublicationDiagnostic[];
}> & (Readonly<{
    readonly kind: "publication_only";
    readonly authorization: WorksiteEffectAuthorization;
    readonly publication: WorksitePublicationFacts;
    readonly compensation: "not_attempted" | "succeeded" | "failed" | "skipped_unverified_identity";
    readonly stagingCleanup: "consumed_by_rename" | "removed" | "failed" | "skipped_unverified_identity";
    readonly stagingResidue: Readonly<{
        readonly state: "absent" | "owned_file" | "other_path" | "unknown";
        readonly fileIdentity: string | null;
    }>;
}> | Readonly<{
    readonly kind: "owner_completed";
    readonly completedOwner: CompletedWorksiteOwner;
}>);
export interface WorksitePostPublicationFailure extends WorksiteEffectRefusal {
    readonly phase: "post_publication";
    readonly physicalOutcome: WorksitePhysicalOutcome;
}
export declare function postPublicationWorksiteFailure(firstFailure: WorksiteEffectRefusal, physicalOutcome: WorksitePhysicalOutcome): WorksitePostPublicationFailure;
export declare function worksiteFailureAuthorization(value: WorksitePostPublicationFailure): WorksiteEffectAuthorization;
/** Structural closure and intrinsic joins; admission separately authenticates A/W/B/call. */
export declare function isWorksitePostPublicationFailure(value: unknown): value is WorksitePostPublicationFailure;
export declare function worksitePostPublicationFailureMatches(value: unknown, request: WorksiteFileReplaceRequest, expectedAuthorization: WorksiteEffectAuthorization): value is WorksitePostPublicationFailure;
export interface WorksiteSubjectInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly subjectUri: string;
    readonly relativePath: string;
}
export interface WorksiteTerritoryInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly territoryUri: string;
    readonly relativeRoot: string;
}
export interface WorksiteObservationInput {
    readonly subject: WorksiteSubject;
    readonly state: "absent";
}
export interface WorksiteFileObservationInput {
    readonly subject: WorksiteSubject;
    readonly state: "file";
    readonly fileIdentity: string;
    readonly fileDigest: Sha256Digest;
    readonly byteLength: number;
}
export interface WorksiteFileReplaceRequestInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly subject: WorksiteSubject;
    readonly territory: WorksiteTerritory;
    readonly predecessorObservation: WorksiteObservation;
    readonly replacementBytes: Uint8Array;
}
export interface WorksiteEffectAuthorizationInput {
    readonly workspaceBinding: WorkspaceBinding;
    readonly request: WorksiteFileReplaceRequest;
    readonly executionBasis: ExecutionBasis;
    readonly cCall: CCall;
    readonly implementationSet: AdmittedImplementationSet;
}
export declare function exactWorkspaceBinding(value: WorkspaceBinding): boolean;
export declare function worksiteRefusal(code: WorksiteEffectRefusalCode, message: string, lastObservation?: WorksiteObservation | null, substrateCode?: string | null): WorksiteEffectRefusal;
export declare function normalizeWorksiteRelativePath(value: string, allowRoot: boolean): string | null;
export declare function worksiteSubjectWithinTerritory(subject: WorksiteSubject, territory: WorksiteTerritory): boolean;
export declare function constructWorksiteSubject(input: WorksiteSubjectInput): WorksiteEffectRefusal | WorksiteSubject;
export declare function isWorksiteSubject(value: unknown): value is WorksiteSubject;
export declare function constructWorksiteTerritory(input: WorksiteTerritoryInput): WorksiteEffectRefusal | WorksiteTerritory;
export declare function isWorksiteTerritory(value: unknown): value is WorksiteTerritory;
export declare function constructWorksiteObservation(input: WorksiteObservationInput | WorksiteFileObservationInput): WorksiteEffectRefusal | WorksiteObservation;
export declare function isWorksiteObservation(value: unknown): value is WorksiteObservation;
export declare function constructWorksiteFileReplaceRequest(input: WorksiteFileReplaceRequestInput): WorksiteEffectRefusal | WorksiteFileReplaceRequest;
export declare function isWorksiteFileReplaceRequest(value: unknown): value is WorksiteFileReplaceRequest;
export declare function constructWorksiteEffectAuthorization(input: WorksiteEffectAuthorizationInput): WorksiteEffectRefusal | WorksiteEffectAuthorization;
export declare function isWorksiteEffectAuthorization(value: unknown): value is WorksiteEffectAuthorization;
export declare function constructWorksiteFileReplaceReceipt(authorization: WorksiteEffectAuthorization, before: WorksiteObservation, after: FileWorksiteObservation, writtenDigest: Sha256Digest): WorksiteEffectRefusal | WorksiteFileReplaceReceipt;
export declare function isWorksiteFileReplaceReceipt(value: unknown): value is WorksiteFileReplaceReceipt;
/** A separate effect: atomic_replace never grants directory creation. */
export declare const WORKSITE_FILE_PARENTS_EFFECT_URI = "effect://abiogenesis/worksite/file.parents/v1";
export declare const WORKSITE_FILE_PARENTS_HANDLER_REF = "handler://abiogenesis/product/worksite/file.parents/v1";
export declare const WORKSITE_FILE_PARENTS_HANDLER_DIGEST: `sha256:${string}`;
export interface WorksiteFileParentsSource {
    readonly sourceEnvelopeRef: string;
    readonly sourceEnvelopeDigest: Sha256Digest;
    readonly sourceDesignAssetRef: string;
    readonly sourceDesignAssetDigest: Sha256Digest;
    readonly jobRef: string;
    readonly jobDigest: Sha256Digest;
    readonly targets: readonly Readonly<{
        relativePath: string;
        territory: WorksiteTerritory;
    }>[];
    readonly parentWriteRoots: readonly string[];
}
export interface WorksiteAncestorObservation {
    readonly relativePath: string;
    readonly state: "directory" | "absent";
    readonly fileIdentity: string | null;
}
export interface WorksiteFileParentsRequest extends WorksiteFileParentsSource {
    readonly kind: "worksite_file_parents_request";
    readonly schemaVersion: "5.0.0";
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly planRef: string;
    readonly planDigest: Sha256Digest;
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly capabilityGrant: CapabilityGrant;
    readonly ancestorObservations: readonly WorksiteAncestorObservation[];
}
export interface WorksiteFileParentsRequestInput extends WorksiteFileParentsSource {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly ancestorObservations: readonly WorksiteAncestorObservation[];
}
export type WorksiteFileParentsAuthorization = Omit<WorksiteEffectAuthorization, "kind" | "effectUri" | "handlerRef" | "handlerDigest" | "subjectRef" | "subjectDigest" | "territoryRef" | "territoryDigest" | "predecessorObservationRef" | "predecessorObservationDigest"> & Readonly<{
    kind: "worksite_file_parents_authorization";
    effectUri: typeof WORKSITE_FILE_PARENTS_EFFECT_URI;
    handlerRef: typeof WORKSITE_FILE_PARENTS_HANDLER_REF;
    handlerDigest: Sha256Digest;
    requestRef: string;
    requestDigest: Sha256Digest;
    planRef: string;
    planDigest: Sha256Digest;
    jobRef: string;
    jobDigest: Sha256Digest;
}>;
export interface WorksiteFileParentOutcome {
    readonly relativePath: string;
    readonly disposition: "existing" | "created";
    readonly identityState: "known" | "unknown";
    readonly fileIdentity: string | null;
}
export interface WorksiteFileParentsReceipt {
    readonly kind: "worksite_file_parents_receipt";
    readonly schemaVersion: "5.0.0";
    readonly receiptRef: string;
    readonly receiptDigest: Sha256Digest;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly authorizationRef: string;
    readonly authorizationDigest: Sha256Digest;
    readonly outcomes: readonly WorksiteFileParentOutcome[];
}
export interface WorksiteFileParentsSuccess {
    readonly kind: "worksite_file_parents_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "committed";
    readonly request: WorksiteFileParentsRequest;
    readonly authorization: WorksiteFileParentsAuthorization;
    readonly receipt: WorksiteFileParentsReceipt;
}
export interface WorksiteFileParentsFailure extends WorksiteEffectRefusal {
    readonly phase: "file_parents";
    readonly physicalOutcome: Readonly<{
        request: WorksiteFileParentsRequest;
        authorization: WorksiteFileParentsAuthorization;
        outcomes: readonly WorksiteFileParentOutcome[];
        diagnostics: readonly WorksiteEffectRefusal[];
    }>;
}
export type WorksiteFileParentsResult = WorksiteEffectRefusal | WorksiteFileParentsFailure | WorksiteFileParentsSuccess;
/** Includes A's root observation; only strict descendants can be created. */
export declare function worksiteFileParentPaths(targets: readonly Readonly<{
    relativePath: string;
}>[]): readonly string[];
export declare function isWorksiteFileParentsRequest(value: unknown): value is WorksiteFileParentsRequest;
export declare function constructWorksiteFileParentsRequest(input: WorksiteFileParentsRequestInput): WorksiteFileParentsRequest | WorksiteEffectRefusal;
export declare function constructWorksiteFileParentsAuthorization(input: Omit<WorksiteEffectAuthorizationInput, "request"> & {
    readonly request: WorksiteFileParentsRequest;
}): WorksiteFileParentsAuthorization | WorksiteEffectRefusal;
export declare function isWorksiteFileParentsAuthorization(value: unknown): value is WorksiteFileParentsAuthorization;
export declare function constructWorksiteFileParentsSuccess(request: WorksiteFileParentsRequest, authorization: WorksiteFileParentsAuthorization, outcomes: readonly WorksiteFileParentOutcome[]): WorksiteFileParentsSuccess | WorksiteEffectRefusal;
export declare function isWorksiteFileParentsSuccess(value: unknown): value is WorksiteFileParentsSuccess;
/** Keep first failure and ordered physical facts; never compensate by deletion. */
export declare function worksiteFileParentsFailure(request: WorksiteFileParentsRequest, authorization: WorksiteFileParentsAuthorization, outcomes: readonly WorksiteFileParentOutcome[], failure: WorksiteEffectRefusal, diagnostics?: readonly WorksiteEffectRefusal[]): WorksiteFileParentsFailure;
export declare function isWorksiteFileParentsFailure(value: unknown): value is WorksiteFileParentsFailure;
export type WorksiteContextEntry = Readonly<{
    relativePath: string;
    state: "directory";
    fileIdentity: string;
    members: readonly string[];
}> | Readonly<{
    relativePath: string;
    state: "file";
    fileIdentity: string;
    byteLength: number;
    digest: Sha256Digest;
    encoding: "base64";
    bytes: string;
}> | Readonly<{
    relativePath: string;
    state: "absent";
}>;
export interface WorksiteContextObservation {
    readonly kind: "worksite_context_observation";
    readonly schemaVersion: "5.0.0";
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
    readonly workspaceAuthorityBasisRef: string;
    readonly workspaceAuthorityBasisDigest: Sha256Digest;
    readonly workspaceBindingIdentity: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly readRoots: readonly string[];
    readonly maxFiles: number;
    readonly maxBytes: number;
    readonly entries: readonly WorksiteContextEntry[];
}
/** Saved-context validation is pure; it neither refreshes nor reconstructs I/O. */
export declare function isWorksiteContextObservation(value: unknown): value is WorksiteContextObservation;
export {};
