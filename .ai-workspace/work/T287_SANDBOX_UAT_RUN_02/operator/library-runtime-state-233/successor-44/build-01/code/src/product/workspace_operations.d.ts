import { type Sha256Digest } from "../shared/digests.js";
export type WorkspaceCreationMember = "clean" | "imported";
export interface CleanWorkspaceCreatePacket {
    readonly kind: "workspace_create_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "clean";
    readonly targetRoot: string;
    readonly scaffoldPolicy: "none";
}
export interface ImportedWorkspaceCreatePacket {
    readonly kind: "workspace_create_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "imported";
    readonly targetRoot: string;
    readonly importAuthority: Readonly<{
        authorityRef: string;
        authorityDigest: Sha256Digest;
    }>;
    readonly preservationPolicy: "preserve_existing_project_truth";
}
export type WorkspaceCreatePacket = CleanWorkspaceCreatePacket | ImportedWorkspaceCreatePacket;
export interface WorkspaceOpenPacket {
    readonly kind: "workspace_open_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "open";
    readonly targetRoot: string;
    readonly expectedWorkspaceAuthorityRef: string;
    readonly expectedWorkspaceAuthorityDigest: Sha256Digest;
}
export interface WorkspaceManifestAuthorityBasis {
    readonly kind: "workspace_authority_basis";
    readonly schemaVersion: "5.0.0";
    readonly authorityRef: string;
    readonly authorityDigest: Sha256Digest;
    readonly source: "clean_creation" | "admitted_import";
    readonly importAuthorityRef: string | null;
    readonly importAuthorityDigest: Sha256Digest | null;
}
export interface WorkspaceProvenanceCoordinate {
    readonly provenanceRef: string;
    readonly provenanceDigest: Sha256Digest;
}
export interface WorkspaceManifest {
    readonly kind: "workspace_manifest";
    readonly schemaVersion: "5.0.0";
    readonly workspaceRef: string;
    readonly workspaceDigest: Sha256Digest;
    readonly canonicalRoot: string;
    readonly authorityMode: WorkspaceCreationMember;
    readonly authorityBasis: WorkspaceManifestAuthorityBasis;
    readonly scaffoldPolicy: "none" | "not_applicable";
    readonly scaffoldState: "no_project_authority" | "preserved_project_authority";
    readonly preservationPolicy: "not_applicable" | "preserve_existing_project_truth";
    readonly preservationState: "not_applicable" | "preserved";
    readonly creationManifestRef: string;
    readonly creationManifestDigest: Sha256Digest;
    readonly provenance: readonly WorkspaceProvenanceCoordinate[];
    readonly bindingRef: string | null;
    readonly bindingDigest: Sha256Digest | null;
    readonly configurationRef: string | null;
    readonly configurationDigest: Sha256Digest | null;
}
export interface WorkspaceCreateResult {
    readonly kind: "workspace_create_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "created";
    readonly manifestPath: string;
    readonly workspaceRef: string;
    readonly workspaceDigest: Sha256Digest;
    readonly workspaceAuthorityRef: string;
    readonly workspaceAuthorityDigest: Sha256Digest;
    readonly creationManifestRef: string;
    readonly creationManifestDigest: Sha256Digest;
    readonly provenance: readonly WorkspaceProvenanceCoordinate[];
    readonly manifest: WorkspaceManifest;
}
export type WorkspaceOpenDisposition = "ready" | "unbound" | "stale" | "malformed" | "incompatible";
export type WorkspaceOpenResidualCode = "binding_absent" | "manifest_json_malformed" | "manifest_shape_malformed" | "manifest_version_incompatible" | "workspace_authority_incompatible" | "workspace_state_stale";
export interface WorkspaceOpenResidual {
    readonly code: WorkspaceOpenResidualCode;
    readonly message: string;
}
export interface WorkspaceOpenProjection {
    readonly kind: "workspace_open_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: WorkspaceOpenDisposition;
    readonly manifestPath: string;
    readonly workspaceRef: string | null;
    readonly workspaceDigest: Sha256Digest | null;
    readonly workspaceAuthorityRef: string | null;
    readonly workspaceAuthorityDigest: Sha256Digest | null;
    readonly authorityMode: WorkspaceCreationMember | null;
    readonly authorityBasis: WorkspaceManifestAuthorityBasis | null;
    readonly bindingRef: string | null;
    readonly bindingDigest: Sha256Digest | null;
    readonly configurationRef: string | null;
    readonly configurationDigest: Sha256Digest | null;
    readonly creationManifestRef: string | null;
    readonly creationManifestDigest: Sha256Digest | null;
    readonly provenance: readonly WorkspaceProvenanceCoordinate[];
    readonly residuals: readonly WorkspaceOpenResidual[];
    readonly manifest: WorkspaceManifest | null;
}
export type WorkspaceOperationRefusalCode = "invalid_packet" | "target_missing" | "target_not_clean" | "target_not_directory" | "workspace_already_exists" | "workspace_manifest_missing" | "workspace_io_refusal";
export interface WorkspaceOperationRefusal {
    readonly kind: "workspace_operation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: WorkspaceOperationRefusalCode;
    readonly message: string;
}
export type WorkspaceCreateOperationResult = WorkspaceCreateResult | WorkspaceOperationRefusal;
export type WorkspaceOpenOperationResult = WorkspaceOpenProjection | WorkspaceOperationRefusal;
/** Pure Product owner reconstruction shared by open and read projections. */
export declare function reconstructWorkspaceManifest(value: unknown): WorkspaceManifest | null;
export declare function createWorkspace(packet: WorkspaceCreatePacket): Promise<WorkspaceCreateOperationResult>;
export declare function openWorkspace(packet: WorkspaceOpenPacket): Promise<WorkspaceOpenOperationResult>;
export declare const WorkspaceOperationPort: Readonly<{
    create: typeof createWorkspace;
    open: typeof openWorkspace;
}>;
export declare const WORKSPACE_OPERATION_CONTRACTS: Readonly<{
    create: Readonly<{
        clean: typeof createWorkspace;
        imported: typeof createWorkspace;
    }>;
    open: Readonly<{
        open: typeof openWorkspace;
    }>;
}>;
