import { type JsonValue } from "./canonical_json.js";
import { type Sha256Digest } from "./digests.js";
import type { AdmittedPublicInvocation, PublicContractCoordinate, PublicDefinitionKeyLike } from "./public_invocation.js";
export declare const PUBLIC_FUNCTION_VERSION: "5.0.0";
export interface RuntimeContractSchema<TInput = unknown, TOutput = TInput> {
    readonly "~types"?: Readonly<{
        readonly input: TInput;
        readonly output: TOutput;
    }> | undefined;
}
export type RuntimeContractInput<TSchema extends RuntimeContractSchema> = NonNullable<TSchema["~types"]>["input"];
export type RuntimeContractOutput<TSchema extends RuntimeContractSchema> = NonNullable<TSchema["~types"]>["output"];
export type PublicJsonSchema = Readonly<Record<string, JsonValue>>;
export type PublicAuthorityClass = "pure" | "read" | "write" | "attestation";
export type PublicEventAdmission = "none" | "owning_semantic_authority" | "immutable_artifact_boundary";
export type PublicAdapterProfile = "terminal_only" | "runtime_nonterminal";
export interface PublicAdapterExitMap {
    readonly acceptedTerminal: 0;
    readonly refused: 1;
    readonly invalidInvocation: 2;
    readonly acceptedNonTerminal: 3 | null;
    readonly adapterFailure: 70;
}
export declare const TERMINAL_ONLY_ADAPTER_EXIT_MAP: Readonly<{
    readonly acceptedTerminal: 0;
    readonly refused: 1;
    readonly invalidInvocation: 2;
    readonly acceptedNonTerminal: null;
    readonly adapterFailure: 70;
}>;
export declare const RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP: Readonly<{
    readonly acceptedTerminal: 0;
    readonly refused: 1;
    readonly invalidInvocation: 2;
    readonly acceptedNonTerminal: 3;
    readonly adapterFailure: 70;
}>;
export type PublicAuthoritySlot = "workspace_binding" | "product_set" | "dependency_lock" | "catalog_scope" | "execution_program" | "graph_function" | "input_contract" | "session_policy" | "capability_grants" | "actor" | "transport_steering" | "verification_references" | "execution_basis";
export declare const PUBLIC_AUTHORITY_SLOTS: readonly ["workspace_binding", "product_set", "dependency_lock", "catalog_scope", "execution_program", "graph_function", "input_contract", "session_policy", "capability_grants", "actor", "transport_steering", "verification_references", "execution_basis"];
export type PublicAuthoritySlotRequirement = PublicAuthoritySlot | Readonly<{
    readonly slot: PublicAuthoritySlot;
    readonly requiredWhen: Readonly<{
        readonly requestPath: readonly string[];
        readonly equalsAny: readonly JsonValue[];
    }>;
}>;
export declare function requestDependentAuthoritySlot(slot: PublicAuthoritySlot, requestPath: readonly string[], equalsAny: readonly JsonValue[]): PublicAuthoritySlotRequirement;
export declare function ownerAuthorityDigest(authorityRef: string): Sha256Digest;
export interface OwnerContractSourceDeclaration<TDefinitionKey extends PublicDefinitionKeyLike = PublicDefinitionKeyLike, TRequestSchema extends RuntimeContractSchema = RuntimeContractSchema, TResultSchema extends RuntimeContractSchema = RuntimeContractSchema, TRefusalSchema extends RuntimeContractSchema = RuntimeContractSchema, TNonTerminalSchema extends RuntimeContractSchema | null = RuntimeContractSchema | null> {
    readonly definitionKey: TDefinitionKey;
    readonly requestSchema: TRequestSchema;
    readonly resultSchema: TResultSchema;
    readonly refusalSchema: TRefusalSchema;
    readonly nonTerminalSchema: TNonTerminalSchema;
    readonly owner: Readonly<{
        abstractModule: string;
        exportName: string;
        memberPath: readonly string[];
        authorityRef: string;
        authorityDigest: `sha256:${string}`;
    }>;
    readonly contractIds: Readonly<{
        request: string;
        result: string;
        refusal: string;
        nonTerminal: string | null;
    }>;
    readonly metadata: Readonly<{
        authorityClass: PublicAuthorityClass;
        effectClass: string;
        eventAdmission: PublicEventAdmission;
        actorRequirement: "forbidden" | "required";
        workspaceBindingRequirement: "forbidden" | "exactly_one";
        authoritySlotRequirements: readonly PublicAuthoritySlotRequirement[];
        capabilityRefs: readonly string[];
        defaults: Readonly<Record<string, JsonValue>>;
        closedDomains: Readonly<Record<string, readonly JsonValue[]>>;
        sdkCoordinate: string;
        cliCoordinate: string;
        adapterExitMap: PublicAdapterExitMap;
    }>;
}
export interface CompleteDefinitionContractCoordinateMap {
    readonly operations: readonly Readonly<{
        readonly operationId: string;
        readonly members: readonly Readonly<{
            readonly memberKey: string;
            readonly slots: Readonly<{
                readonly request: PublicContractCoordinate;
                readonly result: PublicContractCoordinate;
                readonly refusal: PublicContractCoordinate;
                readonly nonTerminal: PublicContractCoordinate | null;
            }>;
        }>[];
    }>[];
}
export type OwnerDefinitionMetadata = OwnerContractSourceDeclaration["metadata"] & Readonly<{
    readonly ownerAuthorityRef: string;
    readonly ownerAuthorityDigest: `sha256:${string}`;
}>;
export interface OwnerContractSchemas<TRequestSchema extends RuntimeContractSchema = RuntimeContractSchema, TResultSchema extends RuntimeContractSchema = RuntimeContractSchema, TRefusalSchema extends RuntimeContractSchema = RuntimeContractSchema, TNonTerminalSchema extends RuntimeContractSchema | null = RuntimeContractSchema | null> {
    readonly request: TRequestSchema;
    readonly result: TResultSchema;
    readonly refusal: TRefusalSchema;
    readonly nonTerminal: TNonTerminalSchema;
}
export type OwnerRequestOf<TPacket extends OwnerContractSourceDeclaration> = RuntimeContractOutput<TPacket["requestSchema"]>;
export type OwnerResultOf<TPacket extends OwnerContractSourceDeclaration> = RuntimeContractOutput<TPacket["resultSchema"]>;
export type OwnerRefusalOf<TPacket extends OwnerContractSourceDeclaration> = RuntimeContractOutput<TPacket["refusalSchema"]>;
export type OwnerNonTerminalOf<TPacket extends OwnerContractSourceDeclaration> = TPacket["nonTerminalSchema"] extends RuntimeContractSchema ? RuntimeContractOutput<TPacket["nonTerminalSchema"]> : never;
export type OwnerSemanticOutput<TPacket extends OwnerContractSourceDeclaration> = Readonly<{
    outcomeKind: "result";
    value: OwnerResultOf<TPacket>;
}> | Readonly<{
    outcomeKind: "refusal";
    value: OwnerRefusalOf<TPacket>;
}> | (OwnerNonTerminalOf<TPacket> extends never ? never : Readonly<{
    outcomeKind: "nonterminal";
    value: OwnerNonTerminalOf<TPacket>;
}>);
export type ExactOwnerOperationPort<TPacket extends OwnerContractSourceDeclaration> = (invocation: AdmittedPublicInvocation<TPacket["definitionKey"], OwnerRequestOf<TPacket> & Readonly<Record<string, JsonValue>>>) => OwnerSemanticOutput<TPacket> | Promise<OwnerSemanticOutput<TPacket>>;
export declare function ownerContractPacket<const TDefinitionKey extends PublicDefinitionKeyLike, const TRequestSchema extends RuntimeContractSchema, const TResultSchema extends RuntimeContractSchema, const TRefusalSchema extends RuntimeContractSchema, const TNonTerminalSchema extends RuntimeContractSchema | null>(definitionKey: TDefinitionKey, requestSchema: TRequestSchema, resultSchema: TResultSchema, refusal: TRefusalSchema, nonTerminalSchema: TNonTerminalSchema, owner: OwnerContractSourceDeclaration["owner"], metadata: OwnerContractSourceDeclaration["metadata"]): OwnerContractSourceDeclaration<TDefinitionKey, RuntimeContractSchema<RuntimeContractInput<TRequestSchema>, RuntimeContractOutput<TRequestSchema>>, RuntimeContractSchema<RuntimeContractInput<TResultSchema>, RuntimeContractOutput<TResultSchema>>, RuntimeContractSchema<RuntimeContractInput<TRefusalSchema>, RuntimeContractOutput<TRefusalSchema>>, TNonTerminalSchema extends RuntimeContractSchema ? RuntimeContractSchema<RuntimeContractInput<TNonTerminalSchema>, RuntimeContractOutput<TNonTerminalSchema>> : null>;
export declare function ownerMetadata(input: OwnerContractSourceDeclaration["metadata"]): OwnerContractSourceDeclaration["metadata"];
export declare function contractSchemaEntries(schema: RuntimeContractSchema): Readonly<Record<string, RuntimeContractSchema>>;
export type RuntimeContractAdmission = Readonly<{
    disposition: "admitted";
    value: unknown;
}> | Readonly<{
    disposition: "refused";
    issuePaths: readonly string[];
}>;
export declare function admitRuntimeContract(schema: RuntimeContractSchema, candidate: unknown): RuntimeContractAdmission;
export declare function projectStrictJsonSchema(schema: RuntimeContractSchema): PublicJsonSchema;
