import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ProductPublicContract } from "./contracts.js";
import type { WorkspaceBinding } from "./environment.js";
export type ProductMaterializationMember = "context_bootstrap" | "configuration";
export interface MaterializationWorkspaceCoordinate {
    readonly workspaceRef: string;
    readonly workspaceDigest: Sha256Digest;
    readonly authorityRef: string;
    readonly authorityDigest: Sha256Digest;
}
export interface DeclaredContextInput {
    readonly kind: "declared_context_input";
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly content: JsonValue;
}
interface ProductMaterializePacketBase<M extends ProductMaterializationMember> {
    readonly kind: "product_materialize_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: M;
    readonly workspace: MaterializationWorkspaceCoordinate;
    readonly binding: WorkspaceBinding;
}
export interface ContextBootstrapMaterializePacket extends ProductMaterializePacketBase<"context_bootstrap"> {
    readonly contextInputs: readonly DeclaredContextInput[];
}
export interface ConfigurationMaterializePacket extends ProductMaterializePacketBase<"configuration"> {
    readonly configurationContract: ProductPublicContract;
    readonly inputs: JsonValue;
}
export interface ProductMaterializePacketByMember {
    readonly context_bootstrap: ContextBootstrapMaterializePacket;
    readonly configuration: ConfigurationMaterializePacket;
}
export type ProductMaterializePacket<M extends ProductMaterializationMember = ProductMaterializationMember> = ProductMaterializePacketByMember[M];
export type ProductMaterializationRefusalCode = "workspace_not_ready" | "binding_mismatch" | "input_invalid" | "authority_overwrite_forbidden" | "contract_invalid" | "mutable_default_forbidden" | "filesystem_failure";
export interface ProductMaterializationRefusal {
    readonly kind: "product_materialization_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly memberKey: ProductMaterializationMember;
    readonly code: ProductMaterializationRefusalCode;
    readonly message: string;
    readonly workspaceRef: string | null;
    readonly bindingRef: string | null;
}
export interface MaterializationRow {
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly assetRef: string;
    readonly assetDigest: Sha256Digest;
    readonly assetPath: string;
    readonly disposition: "created" | "preserved";
}
export interface MaterializationManifestCoordinate {
    readonly manifestRef: string;
    readonly manifestDigest: Sha256Digest;
    readonly manifestPath: string;
}
export interface MaterializationContentCoordinate {
    readonly contentRef: string;
    readonly contentDigest: Sha256Digest;
    readonly contentPath: string;
}
export interface ProductMaterializationResult<M extends ProductMaterializationMember = ProductMaterializationMember> {
    readonly kind: "product_materialization_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "materialized";
    readonly materializationKind: M;
    readonly subject: Readonly<{
        workspaceRef: string;
        workspaceDigest: Sha256Digest;
        bindingRef: string;
        bindingDigest: Sha256Digest;
    }>;
    readonly content: MaterializationContentCoordinate;
    readonly manifest: MaterializationManifestCoordinate;
    readonly rows: readonly MaterializationRow[];
    readonly validationDisposition: "admitted";
    readonly residuals: readonly [];
    readonly provenance: readonly Readonly<{
        provenanceRef: string;
        provenanceDigest: Sha256Digest;
    }>[];
}
export type ProductMaterializationOperationResult<M extends ProductMaterializationMember = ProductMaterializationMember> = ProductMaterializationResult<M> | ProductMaterializationRefusal;
export declare function materializeContextBootstrap(packet: ContextBootstrapMaterializePacket): Promise<ProductMaterializationOperationResult<"context_bootstrap">>;
export declare function materializeConfiguration(packet: ConfigurationMaterializePacket): Promise<ProductMaterializationOperationResult<"configuration">>;
export declare const ProductMaterializationPort: Readonly<{
    context_bootstrap: typeof materializeContextBootstrap;
    configuration: typeof materializeConfiguration;
}>;
export declare const MATERIALIZATION_OPERATION_CONTRACTS: Readonly<{
    context_bootstrap: typeof materializeContextBootstrap;
    configuration: typeof materializeConfiguration;
}>;
export {};
