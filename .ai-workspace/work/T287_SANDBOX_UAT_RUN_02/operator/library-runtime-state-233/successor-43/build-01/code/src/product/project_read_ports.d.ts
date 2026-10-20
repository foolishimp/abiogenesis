import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ConsensusResult, TicketConsensusProjection } from "../gtl/consensus.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type CatalogReadinessRowDisposition, type DeclarationCatalogEntry, type GraphFunctionCatalog, type GraphFunctionCatalogEntry, type GraphFunctionCatalogView } from "./catalog.js";
import type { ProductInstall, ProductSet, ResolvedProductLock, WorkspaceBinding } from "./environment.js";
import type { ReleaseSnapshotRefusal } from "./release_snapshot_operations.js";
export type ProductProjectReadCase = "catalog_list" | "catalog_describe" | "workspace_status" | "install_evidence" | "release_evidence" | "ticket_consensus";
export interface ProductProjectionBasis {
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly value: JsonValue;
}
export interface ProductReadCoordinate {
    readonly ref: string;
    readonly digest: Sha256Digest;
}
interface ProductProjectReadPacketBase<C extends ProductProjectReadCase> {
    readonly kind: "product_project_read_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: C;
    readonly sourceRef: string;
    readonly sourceDigest: Sha256Digest;
    readonly projectionBasis: ProductProjectionBasis;
}
export interface CatalogListProjectReadPacket extends ProductProjectReadPacketBase<"catalog_list"> {
    readonly catalog: GraphFunctionCatalog;
    readonly selector: Readonly<{
        kind: "catalog_list";
        visibility: Readonly<{
            kind: "workspace_catalog";
        }> | Readonly<{
            kind: "session_view";
            view: GraphFunctionCatalogView;
        }>;
    }>;
}
export interface CatalogDescribeProjectReadPacket extends ProductProjectReadPacketBase<"catalog_describe"> {
    readonly catalog: GraphFunctionCatalog;
    readonly selector: Readonly<{
        kind: "catalog_describe";
        handle: string;
        visibility: Readonly<{
            kind: "workspace_catalog";
        }> | Readonly<{
            kind: "session_view";
            view: GraphFunctionCatalogView;
        }>;
    }>;
}
export interface WorkspaceStatusProjectReadPacket extends ProductProjectReadPacketBase<"workspace_status"> {
    readonly binding: WorkspaceBinding;
    readonly resolvedLock: ResolvedProductLock;
    readonly productSet: ProductSet;
    readonly configurationCoordinates: readonly ProductReadCoordinate[];
    readonly catalogCoordinate: ProductReadCoordinate | null;
    readonly selector: Readonly<{
        kind: "none";
    }>;
}
export interface InstallEvidenceManifest {
    readonly manifestRef: string;
    readonly manifestDigest: Sha256Digest;
    readonly value: JsonValue;
}
export interface InstallEvidenceProjectReadPacket extends ProductProjectReadPacketBase<"install_evidence"> {
    readonly install: ProductInstall;
    readonly selector: Readonly<{
        kind: "install_manifest";
        manifest: InstallEvidenceManifest;
    }>;
}
export interface ReleaseEvidenceProjectReadPacket extends ProductProjectReadPacketBase<"release_evidence"> {
    readonly prefix: DurablePrefixCoordinate;
    readonly artifact: ProductReadCoordinate;
    readonly artifactPath: string;
    readonly selector: Readonly<{
        kind: "release_operation_observation";
        artifact: ProductReadCoordinate;
    }>;
}
export interface TicketConsensusProjectReadPacket extends ProductProjectReadPacketBase<"ticket_consensus"> {
    readonly consensusResult: Readonly<ConsensusResult>;
    readonly selector: Readonly<{
        kind: "ticket_consensus";
        ticket: ProductReadCoordinate;
        outputAuthority: ProductReadCoordinate;
        replayBasis: ProductReadCoordinate;
    }>;
}
export interface ProductProjectReadPacketByCase {
    readonly catalog_list: CatalogListProjectReadPacket;
    readonly catalog_describe: CatalogDescribeProjectReadPacket;
    readonly workspace_status: WorkspaceStatusProjectReadPacket;
    readonly install_evidence: InstallEvidenceProjectReadPacket;
    readonly release_evidence: ReleaseEvidenceProjectReadPacket;
    readonly ticket_consensus: TicketConsensusProjectReadPacket;
}
export type ProductProjectReadPacket<C extends ProductProjectReadCase = ProductProjectReadCase> = ProductProjectReadPacketByCase[C];
export type ProjectReadPacket<C extends ProductProjectReadCase = ProductProjectReadCase> = ProductProjectReadPacket<C>;
export type ProductProjectReadRefusalCode = "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "not_ready" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view" | "incompatible" | "unbound" | "inadmissible";
export interface ProductProjectReadRefusal {
    readonly kind: "product_project_read_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly memberKey: ProductProjectReadCase;
    readonly code: ProductProjectReadRefusalCode;
    readonly message: string;
    readonly sourceRef: string | null;
    readonly sourceDigest: Sha256Digest | null;
    readonly ownerRefusal: ReleaseSnapshotRefusal | null;
}
export interface ProductProjectReadResult<C extends ProductProjectReadCase, P extends JsonValue> {
    readonly kind: "product_project_read_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
    readonly memberKey: C;
    readonly sourceRef: string;
    readonly sourceDigest: Sha256Digest;
    readonly projectionBasisRef: string;
    readonly projectionBasisDigest: Sha256Digest;
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly projection: P;
}
export interface CatalogListProjectionRow {
    readonly handle: string;
    readonly contributionKind: "graph_function" | "node_type" | "overlay";
    readonly entry: Readonly<GraphFunctionCatalogEntry> | Readonly<DeclarationCatalogEntry>;
    readonly readiness: CatalogReadinessRowDisposition | null;
}
export interface CatalogListProjection {
    readonly kind: "catalog_list_projection";
    readonly catalogBasisDigest: Sha256Digest;
    readonly catalogSnapshotDigest: Sha256Digest;
    readonly visibility: "workspace_catalog" | "session_view";
    readonly viewDigest: Sha256Digest | null;
    readonly rows: readonly CatalogListProjectionRow[];
}
export interface CatalogDescriptionProjection {
    readonly kind: "catalog_description_projection";
    readonly catalogBasisDigest: Sha256Digest;
    readonly visibility: "workspace_catalog" | "session_view";
    readonly viewDigest: Sha256Digest | null;
    readonly handle: string;
    readonly contributionKind: "graph_function" | "node_type" | "overlay";
    readonly entry: Readonly<GraphFunctionCatalogEntry> | Readonly<DeclarationCatalogEntry>;
    readonly readiness: CatalogReadinessRowDisposition | null;
}
export interface WorkspaceStatusProjection {
    readonly kind: "workspace_status_projection";
    readonly workspaceRef: string;
    readonly workspaceAuthorityRef: string;
    readonly workspaceAuthorityDigest: Sha256Digest;
    readonly bindingRef: string;
    readonly bindingDigest: Sha256Digest;
    readonly productSetRef: string;
    readonly productSetDigest: Sha256Digest;
    readonly resolvedLockRef: string;
    readonly resolvedLockDigest: Sha256Digest;
    readonly boundProductRefs: readonly string[];
    readonly roots: WorkspaceBinding["roots"];
    readonly configurationCoordinates: readonly ProductReadCoordinate[];
    readonly catalogCoordinate: ProductReadCoordinate | null;
    readonly readiness: "ready";
    readonly residuals: readonly [];
    readonly admissionEventRef: string;
}
export interface InstallEvidenceProjection {
    readonly kind: "install_evidence_projection";
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly productId: string;
    readonly artifactRef: string;
    readonly artifactDigest: Sha256Digest;
    readonly productContentDigest: Sha256Digest;
    readonly manifest: InstallEvidenceManifest;
    readonly producer: "ProductInstallPort.install";
    readonly basisRefs: readonly string[];
    readonly provenanceRefs: readonly string[];
}
type CatalogListOperationResult = ProductProjectReadResult<"catalog_list", CatalogListProjection & JsonValue> | ProductProjectReadRefusal;
type CatalogDescribeOperationResult = ProductProjectReadResult<"catalog_describe", CatalogDescriptionProjection & JsonValue> | ProductProjectReadRefusal;
type WorkspaceStatusOperationResult = ProductProjectReadResult<"workspace_status", WorkspaceStatusProjection & JsonValue> | ProductProjectReadRefusal;
type InstallEvidenceOperationResult = ProductProjectReadResult<"install_evidence", InstallEvidenceProjection & JsonValue> | ProductProjectReadRefusal;
type TicketConsensusOperationResult = ProductProjectReadResult<"ticket_consensus", TicketConsensusProjection & JsonValue> | ProductProjectReadRefusal;
export declare function projectCatalogList(packet: CatalogListProjectReadPacket): CatalogListOperationResult;
export declare function projectCatalogDescription(packet: CatalogDescribeProjectReadPacket): CatalogDescribeOperationResult;
export declare function projectWorkspaceStatus(packet: WorkspaceStatusProjectReadPacket): WorkspaceStatusOperationResult;
export declare function projectInstallEvidence(packet: InstallEvidenceProjectReadPacket): InstallEvidenceOperationResult;
export declare function projectReleaseEvidence(packet: ReleaseEvidenceProjectReadPacket): ProductProjectReadRefusal | ProductProjectReadResult<"release_evidence", JsonValue>;
export declare function projectConsensusTicket(packet: TicketConsensusProjectReadPacket): TicketConsensusOperationResult;
export declare const CatalogProjectionPort: Readonly<{
    list: typeof projectCatalogList;
    describe: typeof projectCatalogDescription;
}>;
export declare const WorkspaceProjectionPort: Readonly<{
    status: typeof projectWorkspaceStatus;
}>;
export declare const InstallProjectionPort: Readonly<{
    evidence: typeof projectInstallEvidence;
}>;
export declare const ReleaseProjectionPort: Readonly<{
    evidence: typeof projectReleaseEvidence;
}>;
export declare const ConsensusProjectionPort: Readonly<{
    ticketConsensus: typeof projectConsensusTicket;
}>;
export declare const PRODUCT_PROJECT_READ_CONTRACTS: Readonly<{
    catalog_list: typeof projectCatalogList;
    catalog_describe: typeof projectCatalogDescription;
    workspace_status: typeof projectWorkspaceStatus;
    install_evidence: typeof projectInstallEvidence;
    release_evidence: typeof projectReleaseEvidence;
    ticket_consensus: typeof projectConsensusTicket;
}>;
export {};
