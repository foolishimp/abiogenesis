import { type JsonValue } from "./canonical_json.js";
import { type RuntimeContractSchema } from "./public_function_contracts.js";
import { type IntrinsicPublicFunctionDefinition, type IntrinsicPublicFunctionFamilyCoordinate } from "./public_function_family.js";
import { type Sha256Digest } from "./digests.js";
export declare const S06_COMMON_PUBLIC_CONTRACT_IDS: readonly ["abg.schema.public-operation-contract", "abg.schema.public-operation-invocation", "abg.schema.public-operation-outcome"];
type PublicOperationSchemaSlots = Readonly<{
    readonly request: RuntimeContractSchema;
    readonly result: RuntimeContractSchema;
    readonly refusal: RuntimeContractSchema;
    readonly nonTerminal: RuntimeContractSchema | null;
}>;
export type PublicOperationSchemaMap = Readonly<Record<string, Readonly<Record<string, PublicOperationSchemaSlots>>>>;
export interface PublicProjectionAsset {
    readonly assetKind: "common_public_schema" | "operation_slot_schema" | "operation_contract_projection" | "adapter_projection";
    readonly path: string;
    readonly mediaType: "application/json" | "application/schema+json";
    readonly schemaVersion: "5.0.0";
    readonly content: JsonValue;
    readonly bytes: string;
    readonly contentDigest: Sha256Digest;
    readonly operationId: string | null;
    readonly slot: "request" | "result" | "refusal" | "non_terminal" | null;
}
export interface PublicSdkMemberProjection {
    readonly definitionKey: Readonly<{
        operationId: string;
        memberKey: string;
    }>;
    readonly definitionRef: string;
    readonly sdkCoordinate: string;
    readonly requestSchemaCoordinate: string;
    readonly resultSchemaCoordinate: string;
    readonly refusalSchemaCoordinate: string;
    readonly nonTerminalSchemaCoordinate: string | null;
}
export interface PublicCliGrammarProjection {
    readonly definitionKey: Readonly<{
        operationId: string;
        memberKey: string;
    }>;
    readonly cliCoordinate: string;
    readonly adapterExitMap: IntrinsicPublicFunctionDefinition["adapterExitMap"];
}
export interface PublicDocumentationInventoryRow {
    readonly definitionKey: Readonly<{
        operationId: string;
        memberKey: string;
    }>;
    readonly definitionRef: string;
    readonly definitionDigest: Sha256Digest;
    readonly semanticAuthorityRef: string;
    readonly capabilityRefs: readonly string[];
    readonly sdkCoordinate: string;
    readonly cliCoordinate: string;
}
export interface PublicProjectionPayloads {
    readonly family: IntrinsicPublicFunctionFamilyCoordinate;
    readonly nativeSchemas: PublicOperationSchemaMap;
    readonly commonSchemaAsset: PublicProjectionAsset;
    readonly operationSchemaAssets: readonly PublicProjectionAsset[];
    readonly operationContractAssets: readonly PublicProjectionAsset[];
    readonly adapterAsset: PublicProjectionAsset;
    readonly assets: readonly PublicProjectionAsset[];
    readonly sdkMembers: readonly PublicSdkMemberProjection[];
    readonly cliGrammar: readonly PublicCliGrammarProjection[];
    readonly documentationInventory: readonly PublicDocumentationInventoryRow[];
    readonly projectionDigest: Sha256Digest;
}
export declare const PUBLIC_OPERATION_SCHEMAS: Readonly<Record<string, Readonly<Record<string, Readonly<{
    readonly request: RuntimeContractSchema;
    readonly result: RuntimeContractSchema;
    readonly refusal: RuntimeContractSchema;
    readonly nonTerminal: RuntimeContractSchema | null;
}>>>>>;
/** PFC-F07 payload projection. Its sole semantic input is the closed family. */
export declare const PUBLIC_PROJECTION_PAYLOADS: PublicProjectionPayloads;
export {};
