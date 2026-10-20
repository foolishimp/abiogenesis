import { type JsonValue } from "./canonical_json.js";
import { type ExecutionBindingSpecification, type IntrinsicOwnerContractSlot as OwnerContractSlot, type OwnerNativeSchemaIdentity, type ResolvedOwnerContractBinding } from "./owner_contract_source_set.js";
import { type Sha256Digest } from "./digests.js";
import type { PublicAdapterExitMap, PublicAuthorityClass, PublicAuthoritySlotRequirement, PublicEventAdmission } from "./public_function_contracts.js";
import type { PublicDefinitionKeyLike } from "./public_invocation.js";
export type IntrinsicOwnerContractSlot = OwnerContractSlot;
export interface IntrinsicOwnerContractIdentity {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly slot: IntrinsicOwnerContractSlot;
    readonly contractId: string;
    readonly contractVersion: "5.0.0";
    readonly ownerAuthorityRef: string;
    readonly ownerAuthorityDigest: Sha256Digest;
    readonly nativeSchemaIdentity: OwnerNativeSchemaIdentity;
}
export type IntrinsicExecutionBindingSpecification = ExecutionBindingSpecification;
export type IntrinsicOwnerNativeSchemaIdentity = OwnerNativeSchemaIdentity;
export interface IntrinsicSchemaCoordinate {
    readonly schemaId: string;
    readonly schemaVersion: "5.0.0";
    readonly definitionRef: string;
    readonly nativeExport: "PUBLIC_OPERATION_SCHEMAS";
    readonly nativeMemberPath: readonly [
        operationId: string,
        memberKey: string,
        slot: IntrinsicOwnerContractSlot
    ];
}
export interface IntrinsicSchemaCoordinateSet {
    readonly request: IntrinsicSchemaCoordinate;
    readonly result: IntrinsicSchemaCoordinate;
    readonly refusal: IntrinsicSchemaCoordinate;
    readonly nonTerminal: IntrinsicSchemaCoordinate | null;
}
export interface IntrinsicPublicFunctionDefinition {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly definitionRef: string;
    readonly version: "5.0.0";
    readonly requestContract: ResolvedOwnerContractBinding;
    readonly resultContract: ResolvedOwnerContractBinding;
    readonly refusalContract: ResolvedOwnerContractBinding;
    readonly nonTerminalContract: ResolvedOwnerContractBinding | null;
    readonly executionBindingSpecification: IntrinsicExecutionBindingSpecification;
    readonly executionBindingSpecificationDigest: Sha256Digest;
    readonly semanticAuthorityRef: string;
    readonly semanticAuthorityDigest: Sha256Digest;
    readonly authorityClass: PublicAuthorityClass;
    readonly effectClass: string;
    readonly eventAdmission: PublicEventAdmission;
    readonly actorRequirement: "forbidden" | "required";
    readonly workspaceBindingRequirement: "forbidden" | "exactly_one";
    readonly authoritySlotRequirements: readonly PublicAuthoritySlotRequirement[];
    readonly capabilityRefs: readonly string[];
    readonly defaults: Readonly<Record<string, JsonValue>>;
    readonly closedDomains: Readonly<Record<string, readonly JsonValue[]>>;
    readonly schemaCoordinates: IntrinsicSchemaCoordinateSet;
    readonly sdkCoordinate: string;
    readonly cliCoordinate: string;
    readonly adapterExitMap: PublicAdapterExitMap;
    readonly definitionDigest: Sha256Digest;
}
export interface IntrinsicPublicFunctionFamily {
    readonly kind: "intrinsic_public_function_family";
    readonly schemaVersion: "5.0.0";
    readonly familyVersion: "5.0.0";
    readonly familyRef: string;
    readonly familyDigest: Sha256Digest;
    readonly keySetDigest: Sha256Digest;
    readonly requirementAuthorityRefs: readonly string[];
    readonly definitions: readonly IntrinsicPublicFunctionDefinition[];
}
export interface IntrinsicPublicFunctionFamilyCoordinate {
    readonly requirementAuthorityRefs: readonly string[];
    readonly familyRef: string;
    readonly familyVersion: "5.0.0";
    readonly familyDigest: Sha256Digest;
}
export interface IntrinsicProjectedDefinitionSlot {
    readonly identity: IntrinsicOwnerContractIdentity;
    readonly definitionRef: string;
}
export interface IntrinsicPublicOperationContractProjection {
    readonly rowKind: "public_operation_contract";
    readonly rowRef: string;
    readonly rowDigest: Sha256Digest;
    readonly requirementAuthorityRefs: readonly string[];
    readonly operationId: string;
    readonly operationVersion: "5.0.0";
    readonly family: IntrinsicPublicFunctionFamilyCoordinate;
    readonly definitions: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly definitionRef: string;
        readonly definitionDigest: Sha256Digest;
        readonly requestContract: IntrinsicProjectedDefinitionSlot;
        readonly resultContract: IntrinsicProjectedDefinitionSlot;
        readonly refusalContract: IntrinsicProjectedDefinitionSlot;
        readonly nonTerminalContract: IntrinsicProjectedDefinitionSlot | null;
        readonly executionBindingSpecification: IntrinsicExecutionBindingSpecification;
    }>[];
    readonly invocationContractId: "abg.schema.public-operation-invocation";
    readonly outcomeContractId: "abg.schema.public-operation-outcome";
    readonly projectionRefusalContract: Readonly<{
        readonly contractId: "abg.schema.public-operation-outcome";
        readonly definitionRef: "#/$defs/OutcomeProjectionRefusal";
    }>;
    readonly authorityClassByDefinition: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly value: PublicAuthorityClass;
    }>[];
    readonly effectClassByDefinition: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly value: string;
    }>[];
    readonly workspaceBindingRequirementByDefinition: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly value: "forbidden" | "exactly_one";
    }>[];
    readonly capabilityRefsByDefinition: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly value: readonly string[];
    }>[];
    readonly adapterCoordinateByDefinition: readonly Readonly<{
        readonly definitionKey: PublicDefinitionKeyLike;
        readonly sdkCoordinate: string;
        readonly cliCoordinate: string;
        readonly adapterExitMap: PublicAdapterExitMap;
    }>[];
}
export declare function projectOwnerContractIdentity(binding: ResolvedOwnerContractBinding): IntrinsicOwnerContractIdentity;
/** Exact intrinsic 18-operation/56-definition family closure. */
export declare const PUBLIC_FUNCTION_DEFINITION_FAMILY: IntrinsicPublicFunctionFamily;
export declare function selectIntrinsicPublicFunctionDefinition(definitionKey: PublicDefinitionKeyLike): IntrinsicPublicFunctionDefinition | null;
/** PFC-F07's deterministic operation projection over only the closed family. */
export declare function derivePublicOperationContractProjections(family: IntrinsicPublicFunctionFamily): readonly IntrinsicPublicOperationContractProjection[];
export declare const PUBLIC_OPERATION_CONTRACT_PROJECTIONS: readonly IntrinsicPublicOperationContractProjection[];
