import * as v from "valibot";
import { type Sha256Digest } from "./digests.js";
import type { PublicContractCoordinate, PublicDefinitionKeyLike } from "./public_invocation.js";
export declare const CAPABILITY_DEFINITION_GRAPH_ID: "capability-definition-graph://abiogenesis/abg-5";
export declare const CAPABILITY_DEFINITION_GRAPH_VERSION: "5.0.0";
export declare const CAPABILITY_DEFINITION_GRAPH_ASSET_PATH: "contracts/capabilities/capability-definition-graph.json";
export declare const MANDATORY_ABI5_CAPABILITY_IDS: readonly ["abg.capability.gtl.declare@5", "abg.capability.gtl.admit@5", "abg.capability.gtl.serialize@5", "abg.capability.gtl.typecheck@5", "abg.capability.module.publish@5", "abg.capability.catalog.contribute@5", "abg.capability.catalog.invoke-graph-function@5", "abg.capability.catalog.apply-node-type@5", "abg.capability.catalog.apply-overlay@5", "abg.capability.runtime.execute-seven-term-c@5", "abg.capability.runtime.admit-fp-result@5", "abg.capability.runtime.replay-continuation@5", "abg.capability.operator.public-contract@5", "abg.capability.install.bind-products@5", "abg.capability.qualification.self-conformance@5", "abg.capability.graph-function.consensus@5"];
export interface CapabilityContractRegisterRow {
    readonly capabilityId: string;
    readonly capabilityVersion: "5.0.0";
    readonly owningPublicContractIds: readonly [string, ...string[]];
    readonly projectedPublicContractIds: readonly [string, ...string[]];
    readonly owningPublicDefinitionKeys: readonly PublicDefinitionKeyLike[];
    readonly projectedPublicDefinitionKeys: readonly PublicDefinitionKeyLike[];
    readonly dependentCapabilityIds: readonly string[];
    readonly effectRefs: readonly string[];
    readonly boundedProofRefs: readonly [string, ...string[]];
}
/**
 * The one Product-owned capability authoring surface. It is immutable
 * module data, never a runtime registry or dispatch table.
 */
export declare const DS1_CAPABILITY_CONTRACT_REGISTER: readonly [CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow, CapabilityContractRegisterRow];
export declare function capabilityRefsForContract(contractId: string): readonly string[];
export declare function capabilityRefsForDefinition(definitionKey: PublicDefinitionKeyLike): readonly string[];
export interface CapabilityDefinitionDependencyCoordinate {
    readonly capabilityId: string;
    readonly capabilityDefinitionRef: string;
    readonly capabilityDefinitionDigest: Sha256Digest;
}
export interface CapabilityDefinitionGraphRow {
    readonly capabilityId: string;
    readonly capabilityVersion: "5.0.0";
    readonly capabilityDefinitionRef: string;
    readonly capabilityDefinitionDigest: Sha256Digest;
    readonly owningPublicContracts: readonly [
        PublicContractCoordinate,
        ...PublicContractCoordinate[]
    ];
    readonly dependentCapabilities: readonly CapabilityDefinitionDependencyCoordinate[];
    readonly effectRefs: readonly string[];
    readonly boundedProofRefs: readonly [string, ...string[]];
}
export interface CapabilityDefinitionGraph {
    readonly kind: "abg_capability_definition_graph";
    readonly schemaVersion: "5.0.0";
    readonly graphId: typeof CAPABILITY_DEFINITION_GRAPH_ID;
    readonly graphVersion: typeof CAPABILITY_DEFINITION_GRAPH_VERSION;
    readonly graphDigest: Sha256Digest;
    readonly rows: readonly CapabilityDefinitionGraphRow[];
}
export interface CapabilityDefinitionGraphCoordinate {
    readonly graphId: typeof CAPABILITY_DEFINITION_GRAPH_ID;
    readonly graphVersion: typeof CAPABILITY_DEFINITION_GRAPH_VERSION;
    readonly graphDigest: Sha256Digest;
}
export declare const capabilityDefinitionGraphSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_capability_definition_graph", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly graphId: v.LiteralSchema<"capability-definition-graph://abiogenesis/abg-5", undefined>;
    readonly graphVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly graphDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly rows: v.ArraySchema<v.StrictObjectSchema<{
        readonly capabilityId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>;
        readonly capabilityVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly capabilityDefinitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>;
        readonly capabilityDefinitionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly owningPublicContracts: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contractCatalog: v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly catalogId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly flatRow: v.StrictObjectSchema<{
                readonly contractId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly contractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly nestedSelector: v.UnionSchema<[v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"flat_contract", undefined>;
                readonly definitionKey: v.NullSchema<undefined>;
                readonly slot: v.NullSchema<undefined>;
                readonly definitionRef: v.NullSchema<undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"operation_definition_slot", undefined>;
                readonly definitionKey: v.StrictObjectSchema<{
                    readonly operationId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly memberKey: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>;
                readonly slot: v.PicklistSchema<["request", "result", "refusal", "non_terminal"], undefined>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer_fragment">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"schema_definition", undefined>;
                readonly definitionKey: v.NullSchema<undefined>;
                readonly slot: v.NullSchema<undefined>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer_fragment">]>;
            }, undefined>], undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contractCatalog: {
                productId: string;
                productContentDigest: `sha256:${string}`;
                catalogId: string;
                catalogVersion: "5.0.0";
                catalogDigest: `sha256:${string}`;
            };
            flatRow: {
                contractId: string;
                contractVersion: "5.0.0";
                contractDigest: `sha256:${string}`;
            };
            nestedSelector: {
                selectorKind: "flat_contract";
                definitionKey: null;
                slot: null;
                definitionRef: null;
            } | {
                selectorKind: "operation_definition_slot";
                definitionKey: {
                    operationId: string;
                    memberKey: string;
                };
                slot: "request" | "result" | "refusal" | "non_terminal";
                definitionRef: string;
            } | {
                selectorKind: "schema_definition";
                definitionKey: null;
                slot: null;
                definitionRef: string;
            };
        }[], 1, undefined>]>;
        readonly dependentCapabilities: v.ArraySchema<v.StrictObjectSchema<{
            readonly capabilityId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>;
            readonly capabilityDefinitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>;
            readonly capabilityDefinitionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly effectRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>, undefined>;
        readonly boundedProofRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.NonEmptyAction<string, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>;
}, undefined>;
export declare function capabilityDefinitionGraphDigest(graph: CapabilityDefinitionGraph): Sha256Digest;
export declare function constructCapabilityDefinitionGraph(publicContractCoordinates: readonly PublicContractCoordinate[]): CapabilityDefinitionGraph;
export declare function isCapabilityDefinitionGraph(value: unknown): value is CapabilityDefinitionGraph;
export declare function capabilityDefinitionGraphCoordinate(graph: CapabilityDefinitionGraph): CapabilityDefinitionGraphCoordinate;
export declare function capabilityDefinitionGraphAssetBytes(graph: CapabilityDefinitionGraph): Uint8Array;
