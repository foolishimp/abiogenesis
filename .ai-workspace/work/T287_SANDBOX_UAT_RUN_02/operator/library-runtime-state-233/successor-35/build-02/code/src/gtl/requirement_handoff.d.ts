import * as v from "valibot";
import type { ModulePublication, RootModuleArtifactBasis, ContractDeclaration } from "./contracts.js";
export declare const CONTEXT_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        memberRef: string;
        path: string;
        byteCount: number;
        digest: string;
    }[], 1, undefined>]>;
}, undefined>;
export declare const REQUIREMENT_TERM_SCHEMA: v.StrictObjectSchema<{
    readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly memberDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        contextRef: string;
        memberRef: string;
        memberDigest: string;
        startByte: number;
        endByte: number;
        spanDigest: string;
    }[], 1, undefined>]>;
}, undefined>;
export declare const GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA: v.StrictObjectSchema<{
    readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly realizationContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly proofContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly proofPolicyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly proofShapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const REQUIREMENT_HANDOFF_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceRoleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly context: v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly terms: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        requirementRef: string;
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[], 1, undefined>]>;
    readonly fulfillmentBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly realizationContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly proofContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly proofPolicyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly proofShapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        obligationRef: string;
        requirementRef: string;
        realizationContractRef: string | null;
        proofContractRef: string | null;
        proofPolicyRef: string | null;
        proofShapeRef: string | null;
    }[], 1, undefined>]>;
}, undefined>;
export interface ContextDeclaration {
    readonly contextRef: string;
    readonly sourceLocator: string;
    readonly inventoryDigest: `sha256:${string}`;
    readonly members: readonly {
        readonly memberRef: string;
        readonly path: string;
        readonly byteCount: number;
        readonly digest: `sha256:${string}`;
    }[];
}
export interface RequirementTerm {
    readonly requirementRef: string;
    readonly sourceBindings: readonly {
        readonly contextRef: string;
        readonly memberRef: string;
        readonly memberDigest: `sha256:${string}`;
        readonly startByte: number;
        readonly endByte: number;
        readonly spanDigest: `sha256:${string}`;
    }[];
}
export interface GtlContractFulfillmentBinding {
    readonly obligationRef: string;
    readonly requirementRef: string;
    readonly realizationContractRef: string | null;
    readonly proofContractRef: string | null;
    readonly proofPolicyRef: string | null;
    readonly proofShapeRef: string | null;
}
export interface GtlRequirementHandoffDeclaration {
    readonly declarationRef: string;
    readonly graphFunctionRef: string;
    readonly sourceRoleRef: string;
    readonly context: ContextDeclaration;
    readonly terms: readonly RequirementTerm[];
    readonly fulfillmentBindings: readonly GtlContractFulfillmentBinding[];
}
export declare function isRequirementHandoffDeclaration(value: unknown): value is GtlRequirementHandoffDeclaration;
export declare function constructRequirementHandoffDeclaration(value: GtlRequirementHandoffDeclaration): Readonly<GtlRequirementHandoffDeclaration>;
export declare function validRequirementHandoffPublication(publication: Readonly<ModulePublication>): boolean;
export declare const REQUIREMENT_HANDOFF_IDS: Readonly<{
    moduleRef: "module://abiogenesis/requirement-handoff@5";
    programRef: "program://abiogenesis/requirement-handoff@5";
    graphFunctionRef: "graph-function://abiogenesis/requirement-handoff@5";
    graphRef: "graph://abiogenesis/requirement-handoff@5";
    nodeRef: "node://abiogenesis/requirement-handoff@5";
    startRef: "start://abiogenesis/requirement-handoff@5";
    armId: "arm://abiogenesis/requirement-handoff@5";
    implementationRef: "implementation://abiogenesis/requirement-handoff-fd@5";
    implementationBindingRef: "implementation-binding://abiogenesis/requirement-handoff-fd@5";
    inputContractRef: "contract://abiogenesis/requirement-handoff/input@5";
    outputContractRef: "contract://abiogenesis/requirement-handoff/output@5";
    failureContractRef: "contract://abiogenesis/requirement-handoff/failure@5";
    refusalContractRef: "contract://abiogenesis/requirement-handoff/refusal@5";
    evidenceContractRef: "contract://abiogenesis/requirement-handoff/evidence@5";
    judgmentContractRef: "contract://abiogenesis/requirement-handoff/judgment@5";
    transitionContractRef: "contract://abiogenesis/requirement-handoff/transition@5";
    closureContractRef: "contract://abiogenesis/requirement-handoff/closure@5";
    judgmentPredicateRef: "predicate://abiogenesis/requirement-handoff/transfer@5";
}>;
export declare function constructRequirementHandoffModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
/** Consumer data owns its Program/source basis; implementation and semantics retain their installed ABI owner. */
export declare function constructRequirementHandoffConsumerPublication(consumer: RootModuleArtifactBasis, nativePublication: Readonly<ModulePublication>, declaration: GtlRequirementHandoffDeclaration, identity: Readonly<{
    moduleRef: string;
    programRef: string;
    startRef: string;
    graphRef: string;
    closureContractRef: string;
    descriptorRef: string;
    contributionManifestRef: string;
}>, roleContracts?: readonly ContractDeclaration[]): Readonly<ModulePublication>;
