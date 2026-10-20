import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import type { CProgramNode } from "./c_algebra.js";
import { type GtlRequirementHandoffDeclaration } from "./requirement_handoff.js";
import { type SemanticLifecycleDeclaration } from "./semantic_stage.js";
import { type SemanticJobLifecycleDeclaration } from "./semantic_job.js";
declare const recursiveReference: unique symbol;
interface SyntaxReference {
    readonly [recursiveReference]: "c_program_syntax";
}
interface JsonReference {
    readonly [recursiveReference]: "json_value";
}
interface ExistingContractReference<Value> {
    readonly [recursiveReference]: readonly ["existing_contract", Value];
}
export type StructuralValue<T> = T extends SyntaxReference ? CProgramNode : T extends JsonReference ? JsonValue : T extends ExistingContractReference<infer Value> ? Value : T extends string | number | boolean | null | undefined ? T : {
    readonly [K in keyof T]: StructuralValue<{} extends Pick<T, K> ? Exclude<T[K], undefined> : T[K]>;
};
export type ContractValue<Schema extends v.GenericSchema> = StructuralValue<v.InferOutput<Schema>>;
export declare const EXECUTABLE_LEAF_REQUIREMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
    readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const INTERACTION_LEAF_REQUIREMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
    readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const C_LEAF_REQUIREMENT_SCHEMA: v.VariantSchema<"kind", [v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
    readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
    readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>], undefined>;
export declare const C_OF_SCHEMA: v.StrictObjectSchema<{
    readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
    readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly resultBearing: v.BooleanSchema<undefined>;
    readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
        readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
        readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>], undefined>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_of", undefined>;
}, undefined>;
export declare const C_IDENTITY_SCHEMA: v.StrictObjectSchema<{
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_identity", undefined>;
}, undefined>;
export declare const C_COMPOSE_SCHEMA: v.StrictObjectSchema<{
    readonly terms: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 2, undefined>]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_compose", undefined>;
}, undefined>;
export declare const C_EDGE_SCHEMA: v.StrictObjectSchema<{
    readonly transform: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly evaluate: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly consequence: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_edge", undefined>;
}, undefined>;
export declare const C_WORKFLOW_SCHEMA: v.StrictObjectSchema<{
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_workflow", undefined>;
}, undefined>;
export declare const C_BATCH_SCHEMA: v.StrictObjectSchema<{
    readonly taskInputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly taskOutputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly tasks: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 1, undefined>]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_batch", undefined>;
}, undefined>;
export declare const C_RETRY_SCHEMA: v.StrictObjectSchema<{
    readonly budget: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly term: v.GenericSchema<unknown, SyntaxReference>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_retry", undefined>;
}, undefined>;
export declare const C_PROGRAM_SYNTAX_SCHEMA: v.VariantSchema<"kind", [v.StrictObjectSchema<{
    readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
    readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly resultBearing: v.BooleanSchema<undefined>;
    readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
        readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
        readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>], undefined>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_of", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_identity", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly terms: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 2, undefined>]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_compose", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly transform: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly evaluate: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly consequence: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_edge", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_workflow", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly taskInputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly taskOutputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly tasks: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 1, undefined>]>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_batch", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly budget: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly term: v.GenericSchema<unknown, SyntaxReference>;
    readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"c_retry", undefined>;
}, undefined>], undefined>;
export declare const CONTRACT_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
    readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const ENVIRONMENT_SCHEMA: v.StrictObjectSchema<{
    readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const EVALUATOR_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
    readonly description: v.StringSchema<undefined>;
    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const RULE_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const NODE_SCHEMA: v.StrictObjectSchema<{
    readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
    readonly term: v.GenericSchema<unknown, SyntaxReference>;
}, undefined>;
export declare const EDGE_INPUT_BINDING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
    readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const EDGE_SCHEMA: v.StrictObjectSchema<{
    readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
        readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
}, undefined>;
export declare const FOLDBACK_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly mode: v.LiteralSchema<"rebind", undefined>;
    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
}, undefined>;
export declare const COMPOSE_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"compose", undefined>;
    readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const SUBSTITUTE_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"substitute", undefined>;
    readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const RECURSE_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"recurse", undefined>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly foldback: v.StrictObjectSchema<{
        readonly mode: v.LiteralSchema<"rebind", undefined>;
        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const FAN_OUT_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const FAN_IN_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
    readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const GATE_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"gate", undefined>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const REGISTERED_SELECTION_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const REENTER_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const PROMOTE_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"promote", undefined>;
    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const IDENTITY_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"identity", undefined>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const SAME_OBJECT_APPLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"same_object", undefined>;
    readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const GRAPH_APPLICATION_SCHEMA: v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"compose", undefined>;
    readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"substitute", undefined>;
    readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"recurse", undefined>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly foldback: v.StrictObjectSchema<{
        readonly mode: v.LiteralSchema<"rebind", undefined>;
        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
    readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"gate", undefined>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"promote", undefined>;
    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"identity", undefined>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>, v.StrictObjectSchema<{
    readonly relationKind: v.LiteralSchema<"same_object", undefined>;
    readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>], undefined>;
export declare const GRAPH_TEMPLATE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"inline_graph", undefined>;
    readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
        readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
        readonly term: v.GenericSchema<unknown, SyntaxReference>;
    }, undefined>, undefined>;
    readonly edges: v.ArraySchema<v.StrictObjectSchema<{
        readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
            readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"compose", undefined>;
        readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"substitute", undefined>;
        readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"recurse", undefined>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly foldback: v.StrictObjectSchema<{
            readonly mode: v.LiteralSchema<"rebind", undefined>;
            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
        }, undefined>;
        readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
        readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
        readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"gate", undefined>;
        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"promote", undefined>;
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"identity", undefined>;
        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly relationKind: v.LiteralSchema<"same_object", undefined>;
        readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>], undefined>, undefined>;
}, undefined>;
export declare const GRAPH_FUNCTION_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"graph_function", undefined>;
    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly version: v.LiteralSchema<"5.0.0", undefined>;
    readonly environment: v.StrictObjectSchema<{
        readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>;
    readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly template: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"inline_graph", undefined>;
        readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
            readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
            readonly term: v.GenericSchema<unknown, SyntaxReference>;
        }, undefined>, undefined>;
        readonly edges: v.ArraySchema<v.StrictObjectSchema<{
            readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"compose", undefined>;
            readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"substitute", undefined>;
            readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"recurse", undefined>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly foldback: v.StrictObjectSchema<{
                readonly mode: v.LiteralSchema<"rebind", undefined>;
                readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
            }, undefined>;
            readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
            readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
            readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"gate", undefined>;
            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
            readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"promote", undefined>;
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"identity", undefined>;
            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly relationKind: v.LiteralSchema<"same_object", undefined>;
            readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>, undefined>;
    }, undefined>;
    readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const IMPLEMENTATION_BINDING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
    readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const PRODUCT_SEMANTICS_BINDING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
    readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const CLOSURE_CONTRACT_SCHEMA: v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
    readonly closureScope: v.LiteralSchema<"run", undefined>;
    readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
    readonly kind: v.LiteralSchema<"closure_contract", undefined>;
    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminalKind: v.LiteralSchema<"completed", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
    readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
    readonly kind: v.LiteralSchema<"closure_contract", undefined>;
    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly terminalKind: v.LiteralSchema<"completed", undefined>;
}, undefined>], undefined>;
export declare const PROGRAM_START_SCHEMA: v.StrictObjectSchema<{
    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const ACTION_CATALOG_ROW_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export declare const ACTION_CATALOG_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"action_catalog", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly rows: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
        readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
}, undefined>;
export declare const CONSTRUCTION_AUTHORITY_BINDING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const CONSTRUCTION_POLICY_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
}, undefined>;
export declare const CONSTRUCTION_COMPOSITION_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"construction_composition", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>], undefined>;
    readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly closurePolicy: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_policy", undefined>;
        readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
        readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
    }, undefined>;
}, undefined>;
export declare const GTL_PROGRAM_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"gtl_program", undefined>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly version: v.LiteralSchema<"5.0.0", undefined>;
    readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly starts: v.ArraySchema<v.StrictObjectSchema<{
        readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
    readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
    readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
        readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>, undefined>;
    readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"action_catalog", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly rows: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
            readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"construction_composition", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>], undefined>;
        readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly closurePolicy: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_policy", undefined>;
            readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
            readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
        }, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export declare const CATALOG_CONTRIBUTION_SCHEMA: v.StrictObjectSchema<{
    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
    readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export declare const MODULE_PUBLICATION_SCHEMA: v.StrictObjectSchema<{
    readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
        kind: "stdo_run_environment_declaration";
        schemaVersion: "5.0.0";
        declarationRef: string;
        source: {
            releaseUri: string;
            manifestDigest: string;
        };
        representation: {
            program: {
                path: string;
                uri: string;
                byteDigest: string;
                canonicalDigest: string;
            };
            map: {
                path: string;
                uri: string;
                byteDigest: string;
                canonicalDigest: string;
            };
            productRef: string;
            releaseRef: string;
            tagObject: string;
            recordUri: string;
            recordDigest: string;
            inventoryDigest: string;
            members: {
                path: string;
                type: "file" | "symlink";
                digest: string;
                target: string | null;
            }[];
        };
        axiom: {
            executablePath: string;
            outputContractPath: string;
            outputContractVersion: "axiom-indexer.frame-projection@1";
            pythonExecutableDigest: string;
            productRef: string;
            releaseRef: string;
            tagObject: string;
            recordUri: string;
            recordDigest: string;
            inventoryDigest: string;
            members: {
                path: string;
                type: "file" | "symlink";
                digest: string;
                target: string | null;
            }[];
        };
        contexts: {
            contextRef: string;
            sourceLocator: string;
            inventoryDigest: string;
            members: {
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[];
        }[];
        accesses: {
            accessRef: string;
            operation: "project";
            mode: "materialized";
            frameIndexRefs: string[];
            maxOutputBytes: number;
            timeoutMs: number;
        }[];
        roles: {
            graphFunctionRef: string;
            programLocusRef: string;
            role: "author" | "assessor" | "constructor" | "command_executor";
            frameRefs: string[];
            policy: {
                policyRef: string;
                text: string;
                digest: string;
            };
            accessRefs: string[];
            sourceBindings: {
                contextRef: string;
                memberRef: string;
                memberDigest: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[];
        }[];
    }>>>, undefined>, undefined>;
    readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
        kind: "run_environment_declaration";
        schemaVersion: "5.0.0";
        declarationRef: string;
        dependencies: {
            dependencyRef: string;
            basisRef: string;
            recordRef: string;
            recordDigest: string;
            recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
            inventoryDigest: string;
            members: {
                path: string;
                type: "file" | "symlink";
                digest: string;
                target: string | null;
            }[];
        }[];
        contexts: {
            contextRef: string;
            sourceLocator: string;
            inventoryDigest: string;
            members: {
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[];
        }[];
        corpusAccess: {
            kind: "axiom_indexer";
            sourceDependencyRef: string;
            representationDependencyRef: string;
            axiomDependencyRef: string;
            program: {
                path: string;
                uri: string;
                byteDigest: string;
                canonicalDigest: string;
            };
            map: {
                path: string;
                uri: string;
                byteDigest: string;
                canonicalDigest: string;
            };
            executablePath: string;
            outputContractPath: string;
            pythonExecutableDigest: string;
            pythonVersion: string;
        } | null;
        accesses: {
            accessRef: string;
            operation: "project" | "validate";
            mode: "validation" | "materialized";
            frameIndexRefs: string[];
            maxOutputBytes: number;
            timeoutMs: number;
        }[];
        roles: {
            role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
            accessRefs: string[];
            contextPolicy: {
                policyRef: string;
                selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
            };
            graphFunctionRef: string;
            programLocusRef: string;
            frameRefs: string[];
            policy: {
                policyRef: string;
                text: string;
                digest: string;
            };
            sourceBindings: {
                contextRef: string;
                memberRef: string;
                memberDigest: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[];
        }[];
    }>>>, undefined>, undefined>;
    readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
    readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
    readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
    readonly kind: v.LiteralSchema<"module_publication", undefined>;
    readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly productSemanticsBinding: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
        readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
        readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
    readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
        readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly description: v.StringSchema<undefined>;
        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, undefined>;
    readonly rules: v.ArraySchema<v.StrictObjectSchema<{
        readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
        readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, undefined>;
    readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
        readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
    readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
        readonly closureScope: v.LiteralSchema<"run", undefined>;
        readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
        readonly kind: v.LiteralSchema<"closure_contract", undefined>;
        readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminalKind: v.LiteralSchema<"completed", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
        readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
        readonly kind: v.LiteralSchema<"closure_contract", undefined>;
        readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminalKind: v.LiteralSchema<"completed", undefined>;
    }, undefined>], undefined>, undefined>;
    readonly programs: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"gtl_program", undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly version: v.LiteralSchema<"5.0.0", undefined>;
        readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly starts: v.ArraySchema<v.StrictObjectSchema<{
            readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
        readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
            readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>, undefined>;
        readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"action_catalog", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_composition", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>], undefined>;
            readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly closurePolicy: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"graph_function", undefined>;
        readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly version: v.LiteralSchema<"5.0.0", undefined>;
        readonly environment: v.StrictObjectSchema<{
            readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>;
        readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly template: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"inline_graph", undefined>;
            readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                readonly term: v.GenericSchema<unknown, SyntaxReference>;
            }, undefined>, undefined>;
            readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                    readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"compose", undefined>;
                readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldback: v.StrictObjectSchema<{
                    readonly mode: v.LiteralSchema<"rebind", undefined>;
                    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                }, undefined>;
                readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"gate", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"promote", undefined>;
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"identity", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>, undefined>;
        }, undefined>;
        readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
        readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, undefined>;
    readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
        readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
        readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export declare const GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"conformance_evaluate_packet", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly memberKey: v.LiteralSchema<"gtl_program", undefined>;
    readonly publication: v.StrictObjectSchema<{
        readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "stdo_run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            source: {
                releaseUri: string;
                manifestDigest: string;
            };
            representation: {
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            axiom: {
                executablePath: string;
                outputContractPath: string;
                outputContractVersion: "axiom-indexer.frame-projection@1";
                pythonExecutableDigest: string;
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            accesses: {
                accessRef: string;
                operation: "project";
                mode: "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                graphFunctionRef: string;
                programLocusRef: string;
                role: "author" | "assessor" | "constructor" | "command_executor";
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                accessRefs: string[];
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            dependencies: {
                dependencyRef: string;
                basisRef: string;
                recordRef: string;
                recordDigest: string;
                recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            }[];
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            corpusAccess: {
                kind: "axiom_indexer";
                sourceDependencyRef: string;
                representationDependencyRef: string;
                axiomDependencyRef: string;
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                executablePath: string;
                outputContractPath: string;
                pythonExecutableDigest: string;
                pythonVersion: string;
            } | null;
            accesses: {
                accessRef: string;
                operation: "project" | "validate";
                mode: "validation" | "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                accessRefs: string[];
                contextPolicy: {
                    policyRef: string;
                    selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                };
                graphFunctionRef: string;
                programLocusRef: string;
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
        readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
        readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"module_publication", undefined>;
        readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly productSemanticsBinding: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
            readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
            readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly description: v.StringSchema<undefined>;
            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly rules: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"run", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>], undefined>, undefined>;
        readonly programs: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"gtl_program", undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, undefined>;
            readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>], undefined>;
                readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly closurePolicy: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"graph_function", undefined>;
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly environment: v.StrictObjectSchema<{
                readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>;
            readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly template: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                    readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                    readonly term: v.GenericSchema<unknown, SyntaxReference>;
                }, undefined>, undefined>;
                readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                    readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                        readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"compose", undefined>;
                    readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                    readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldback: v.StrictObjectSchema<{
                        readonly mode: v.LiteralSchema<"rebind", undefined>;
                        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                    }, undefined>;
                    readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                    readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"gate", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"promote", undefined>;
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"identity", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                    readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>], undefined>, undefined>;
            }, undefined>;
            readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
            readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
            readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly program: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"gtl_program", undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly version: v.LiteralSchema<"5.0.0", undefined>;
        readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly starts: v.ArraySchema<v.StrictObjectSchema<{
            readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
        readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
            readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>, undefined>;
        readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"action_catalog", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"construction_composition", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>], undefined>;
            readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly closurePolicy: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
}, undefined>;
export declare const GTL_LANGUAGE_CONFORMANCE_CORPUS_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"gtl_language_conformance_corpus", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly corpusVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly diagnosticVocabularyContractRef: v.LiteralSchema<"abg.vocabulary.gtl-program-diagnostic-id", undefined>;
    readonly schema: v.StrictObjectSchema<{
        readonly path: v.LiteralSchema<"contracts/schemas/gtl-serialization.schema.json", undefined>;
        readonly contentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly definitionRef: v.LiteralSchema<"#/$defs/GtlLanguageConformanceCorpus", undefined>;
    }, undefined>;
    readonly premises: v.StrictObjectSchema<{
        readonly scope: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly originalOwner: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly originalOwnerDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly declarationBasis: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly constructorExamples: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly programs: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly caseId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packet: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"conformance_evaluate_packet", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly memberKey: v.LiteralSchema<"gtl_program", undefined>;
            readonly publication: v.StrictObjectSchema<{
                readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                    kind: "stdo_run_environment_declaration";
                    schemaVersion: "5.0.0";
                    declarationRef: string;
                    source: {
                        releaseUri: string;
                        manifestDigest: string;
                    };
                    representation: {
                        program: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        map: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        productRef: string;
                        releaseRef: string;
                        tagObject: string;
                        recordUri: string;
                        recordDigest: string;
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    };
                    axiom: {
                        executablePath: string;
                        outputContractPath: string;
                        outputContractVersion: "axiom-indexer.frame-projection@1";
                        pythonExecutableDigest: string;
                        productRef: string;
                        releaseRef: string;
                        tagObject: string;
                        recordUri: string;
                        recordDigest: string;
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    };
                    contexts: {
                        contextRef: string;
                        sourceLocator: string;
                        inventoryDigest: string;
                        members: {
                            memberRef: string;
                            path: string;
                            byteCount: number;
                            digest: string;
                        }[];
                    }[];
                    accesses: {
                        accessRef: string;
                        operation: "project";
                        mode: "materialized";
                        frameIndexRefs: string[];
                        maxOutputBytes: number;
                        timeoutMs: number;
                    }[];
                    roles: {
                        graphFunctionRef: string;
                        programLocusRef: string;
                        role: "author" | "assessor" | "constructor" | "command_executor";
                        frameRefs: string[];
                        policy: {
                            policyRef: string;
                            text: string;
                            digest: string;
                        };
                        accessRefs: string[];
                        sourceBindings: {
                            contextRef: string;
                            memberRef: string;
                            memberDigest: string;
                            startByte: number;
                            endByte: number;
                            spanDigest: string;
                        }[];
                    }[];
                }>>>, undefined>, undefined>;
                readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                    kind: "run_environment_declaration";
                    schemaVersion: "5.0.0";
                    declarationRef: string;
                    dependencies: {
                        dependencyRef: string;
                        basisRef: string;
                        recordRef: string;
                        recordDigest: string;
                        recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    }[];
                    contexts: {
                        contextRef: string;
                        sourceLocator: string;
                        inventoryDigest: string;
                        members: {
                            memberRef: string;
                            path: string;
                            byteCount: number;
                            digest: string;
                        }[];
                    }[];
                    corpusAccess: {
                        kind: "axiom_indexer";
                        sourceDependencyRef: string;
                        representationDependencyRef: string;
                        axiomDependencyRef: string;
                        program: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        map: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        executablePath: string;
                        outputContractPath: string;
                        pythonExecutableDigest: string;
                        pythonVersion: string;
                    } | null;
                    accesses: {
                        accessRef: string;
                        operation: "project" | "validate";
                        mode: "validation" | "materialized";
                        frameIndexRefs: string[];
                        maxOutputBytes: number;
                        timeoutMs: number;
                    }[];
                    roles: {
                        role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                        accessRefs: string[];
                        contextPolicy: {
                            policyRef: string;
                            selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                        };
                        graphFunctionRef: string;
                        programLocusRef: string;
                        frameRefs: string[];
                        policy: {
                            policyRef: string;
                            text: string;
                            digest: string;
                        };
                        sourceBindings: {
                            contextRef: string;
                            memberRef: string;
                            memberDigest: string;
                            startByte: number;
                            endByte: number;
                            spanDigest: string;
                        }[];
                    }[];
                }>>>, undefined>, undefined>;
                readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
                readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
                readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
                readonly kind: v.LiteralSchema<"module_publication", undefined>;
                readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly productSemanticsBinding: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
                    readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>;
                readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
                    readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
                    readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
                readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
                    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
                    readonly description: v.StringSchema<undefined>;
                    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, undefined>;
                readonly rules: v.ArraySchema<v.StrictObjectSchema<{
                    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
                    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, undefined>;
                readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
                    readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
                readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
                    readonly closureScope: v.LiteralSchema<"run", undefined>;
                    readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
                    readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminalKind: v.LiteralSchema<"completed", undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
                    readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
                    readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminalKind: v.LiteralSchema<"completed", undefined>;
                }, undefined>], undefined>, undefined>;
                readonly programs: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"gtl_program", undefined>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly version: v.LiteralSchema<"5.0.0", undefined>;
                    readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                        readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                    readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                    readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                        readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>, undefined>;
                    readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                        readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                            readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                            readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                            readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                            readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, undefined>;
                    }, undefined>, undefined>;
                    readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                        readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                            readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        }, undefined>], undefined>;
                        readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly closurePolicy: v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                            readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                            readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                        }, undefined>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"graph_function", undefined>;
                    readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly version: v.LiteralSchema<"5.0.0", undefined>;
                    readonly environment: v.StrictObjectSchema<{
                        readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>;
                    readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly template: v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                        readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                            readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                            readonly term: v.GenericSchema<unknown, SyntaxReference>;
                        }, undefined>, undefined>;
                        readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                            readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                                readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                                readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                                readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                                readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            }, undefined>, undefined>;
                        }, undefined>, undefined>;
                        readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"compose", undefined>;
                            readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                            readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                            readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly foldback: v.StrictObjectSchema<{
                                readonly mode: v.LiteralSchema<"rebind", undefined>;
                                readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                                readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                            }, undefined>;
                            readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                            readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                            readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"gate", undefined>;
                            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                            readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"promote", undefined>;
                            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"identity", undefined>;
                            readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, v.StrictObjectSchema<{
                            readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                            readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                            readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>], undefined>, undefined>;
                    }, undefined>;
                    readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                    readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, undefined>;
                readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
                    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
                    readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, undefined>;
            }, undefined>;
            readonly program: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"gtl_program", undefined>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly version: v.LiteralSchema<"5.0.0", undefined>;
                readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
                readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>, undefined>;
                readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                        readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>], undefined>;
                    readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly closurePolicy: v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                        readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                        readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                    }, undefined>;
                }, undefined>, undefined>;
            }, undefined>;
        }, undefined>;
        readonly expectedDisposition: v.LiteralSchema<"passed", undefined>;
        readonly expectedDiagnosticIds: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly mutations: v.ArraySchema<v.StrictObjectSchema<{
            readonly caseId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly target: v.PicklistSchema<["program_and_published_program", "publication"], undefined>;
            readonly path: v.ArraySchema<v.UnionSchema<[v.StringSchema<undefined>, v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>], undefined>, undefined>;
            readonly operation: v.PicklistSchema<["replace", "append", "append_first"], undefined>;
            readonly value: v.OptionalSchema<v.GenericSchema<unknown, JsonReference>, undefined>;
            readonly expectedDiagnosticIds: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        caseId: string;
        packet: {
            kind: "conformance_evaluate_packet";
            schemaVersion: "5.0.0";
            memberKey: "gtl_program";
            publication: {
                stdoRunEnvironments?: ExistingContractReference<Readonly<{
                    kind: "stdo_run_environment_declaration";
                    schemaVersion: "5.0.0";
                    declarationRef: string;
                    source: {
                        releaseUri: string;
                        manifestDigest: string;
                    };
                    representation: {
                        program: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        map: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        productRef: string;
                        releaseRef: string;
                        tagObject: string;
                        recordUri: string;
                        recordDigest: string;
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    };
                    axiom: {
                        executablePath: string;
                        outputContractPath: string;
                        outputContractVersion: "axiom-indexer.frame-projection@1";
                        pythonExecutableDigest: string;
                        productRef: string;
                        releaseRef: string;
                        tagObject: string;
                        recordUri: string;
                        recordDigest: string;
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    };
                    contexts: {
                        contextRef: string;
                        sourceLocator: string;
                        inventoryDigest: string;
                        members: {
                            memberRef: string;
                            path: string;
                            byteCount: number;
                            digest: string;
                        }[];
                    }[];
                    accesses: {
                        accessRef: string;
                        operation: "project";
                        mode: "materialized";
                        frameIndexRefs: string[];
                        maxOutputBytes: number;
                        timeoutMs: number;
                    }[];
                    roles: {
                        graphFunctionRef: string;
                        programLocusRef: string;
                        role: "author" | "assessor" | "constructor" | "command_executor";
                        frameRefs: string[];
                        policy: {
                            policyRef: string;
                            text: string;
                            digest: string;
                        };
                        accessRefs: string[];
                        sourceBindings: {
                            contextRef: string;
                            memberRef: string;
                            memberDigest: string;
                            startByte: number;
                            endByte: number;
                            spanDigest: string;
                        }[];
                    }[];
                }>>[] | undefined;
                runEnvironments?: ExistingContractReference<Readonly<{
                    kind: "run_environment_declaration";
                    schemaVersion: "5.0.0";
                    declarationRef: string;
                    dependencies: {
                        dependencyRef: string;
                        basisRef: string;
                        recordRef: string;
                        recordDigest: string;
                        recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                        inventoryDigest: string;
                        members: {
                            path: string;
                            type: "file" | "symlink";
                            digest: string;
                            target: string | null;
                        }[];
                    }[];
                    contexts: {
                        contextRef: string;
                        sourceLocator: string;
                        inventoryDigest: string;
                        members: {
                            memberRef: string;
                            path: string;
                            byteCount: number;
                            digest: string;
                        }[];
                    }[];
                    corpusAccess: {
                        kind: "axiom_indexer";
                        sourceDependencyRef: string;
                        representationDependencyRef: string;
                        axiomDependencyRef: string;
                        program: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        map: {
                            path: string;
                            uri: string;
                            byteDigest: string;
                            canonicalDigest: string;
                        };
                        executablePath: string;
                        outputContractPath: string;
                        pythonExecutableDigest: string;
                        pythonVersion: string;
                    } | null;
                    accesses: {
                        accessRef: string;
                        operation: "project" | "validate";
                        mode: "validation" | "materialized";
                        frameIndexRefs: string[];
                        maxOutputBytes: number;
                        timeoutMs: number;
                    }[];
                    roles: {
                        role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                        accessRefs: string[];
                        contextPolicy: {
                            policyRef: string;
                            selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                        };
                        graphFunctionRef: string;
                        programLocusRef: string;
                        frameRefs: string[];
                        policy: {
                            policyRef: string;
                            text: string;
                            digest: string;
                        };
                        sourceBindings: {
                            contextRef: string;
                            memberRef: string;
                            memberDigest: string;
                            startByte: number;
                            endByte: number;
                            spanDigest: string;
                        }[];
                    }[];
                }>>[] | undefined;
                semanticLifecycle?: ExistingContractReference<Readonly<SemanticLifecycleDeclaration>> | undefined;
                semanticJobLifecycle?: ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>> | undefined;
                requirementHandoffs?: ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>[] | undefined;
                kind: "module_publication";
                moduleRef: string;
                moduleVersion: "5.0.0";
                owningProductId: string;
                artifactDigest: `sha256:${string}`;
                productContentDigest: `sha256:${string}`;
                productManifestDigest: `sha256:${string}`;
                descriptorRef: string;
                contributionManifestRef: string;
                productSemanticsBinding: {
                    kind: "product_semantics_binding";
                    bindingRef: string;
                    packageName: string;
                    packageVersion: string;
                    modulePath: string;
                    namedSymbol: string;
                };
                contracts: {
                    contractRef: string;
                    contractVersion: "5.0.0";
                    contractKind: "refusal" | "input" | "output" | "evidence" | "closure" | "failure" | "judgment" | "transition";
                    valueKind: string;
                }[];
                evaluators: {
                    name: string;
                    regime: "F_D" | "F_P" | "F_H";
                    description: string;
                    binding: string;
                    consumedFieldRefs: string[];
                    tags: string[];
                }[];
                rules: {
                    name: string;
                    kind: string;
                    config: {
                        [x: string]: JsonReference;
                    };
                    tags: string[];
                }[];
                implementationBindings: {
                    kind: "implementation_binding";
                    bindingRef: string;
                    implementationRef: string;
                    packageName: string;
                    packageVersion: string;
                    modulePath: string;
                    namedSymbol: string;
                    computeRegime: "F_D" | "F_P";
                    inputContractRef: string;
                    outputContractRef: string;
                    failureContractRef: string;
                    refusalContractRef: string;
                }[];
                closureContracts: ({
                    closureScope: "run";
                    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"];
                    kind: "closure_contract";
                    closureContractRef: string;
                    predicateRef: string;
                    evidenceContractRef: string;
                    resultContractRef: string;
                    refusalContractRef: string;
                    refusalValueKind: string;
                    judgmentContractRef: string;
                    rejectionContractRef: string;
                    transitionContractRef: string;
                    replayProjectionRef: string;
                    terminalKind: "completed";
                } | {
                    closureScope: "graph_call";
                    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"];
                    kind: "closure_contract";
                    closureContractRef: string;
                    predicateRef: string;
                    evidenceContractRef: string;
                    resultContractRef: string;
                    refusalContractRef: string;
                    refusalValueKind: string;
                    judgmentContractRef: string;
                    rejectionContractRef: string;
                    transitionContractRef: string;
                    replayProjectionRef: string;
                    terminalKind: "completed";
                })[];
                programs: {
                    kind: "gtl_program";
                    programRef: string;
                    version: "5.0.0";
                    moduleRef: string;
                    starts: {
                        startRef: string;
                        graphFunctionRef: string;
                    }[];
                    callableMembership: string[];
                    closureContractRef: string;
                    policies: {
                        [x: string]: string;
                    };
                    publicAssetTargets?: {
                        kind: "program_public_asset_target";
                        handle: string;
                        assetRef: string;
                        startRef: string;
                    }[] | undefined;
                    actionCatalog?: {
                        kind: "action_catalog";
                        schemaVersion: "5.0.0";
                        catalogRef: string;
                        catalogDigest: `sha256:${string}`;
                        rows: {
                            kind: "action_catalog_row";
                            actionRef: string;
                            actionKind: string;
                            programRef: string;
                            graphFunctionRef: string;
                            targetProgramLocusRef: string;
                            targetObligationRefs: string[];
                            inputAssetRefs: string[];
                            outputAssetRefs: string[];
                            expectedDeltaRef: string;
                            progressConditionRef: string;
                            stopConditionRef: string;
                        }[];
                    } | undefined;
                    constructionComposition?: {
                        kind: "construction_composition";
                        schemaVersion: "5.0.0";
                        compositionRef: string;
                        compositionDigest: `sha256:${string}`;
                        graphFunctionRef: string;
                        authorities: [{
                            kind: "construction_authority_binding";
                            semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                            authorityRef: string;
                            initialProgramLocusRef: string;
                            refreshProgramLocusRef: string | null;
                        }, {
                            kind: "construction_authority_binding";
                            semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                            authorityRef: string;
                            initialProgramLocusRef: string;
                            refreshProgramLocusRef: string | null;
                        }, {
                            kind: "construction_authority_binding";
                            semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                            authorityRef: string;
                            initialProgramLocusRef: string;
                            refreshProgramLocusRef: string | null;
                        }, {
                            kind: "construction_authority_binding";
                            semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                            authorityRef: string;
                            initialProgramLocusRef: string;
                            refreshProgramLocusRef: string | null;
                        }];
                        interactionProgramLocusRef: string;
                        closurePolicy: {
                            kind: "construction_policy";
                            policyRef: string;
                            requireCompleteEvidence: boolean;
                            requirePostEvidenceRefresh: boolean;
                        };
                    } | undefined;
                }[];
                graphFunctions: {
                    kind: "graph_function";
                    name: string;
                    version: "5.0.0";
                    environment: {
                        requires: string[];
                        provides: string[];
                        carries: string[];
                    };
                    inputs: string[];
                    outputs: string[];
                    template: {
                        kind: "inline_graph";
                        graphRef: string;
                        startNodeRef: string;
                        terminalNodeRefs: string[];
                        nodes: {
                            nodeRef: string;
                            nodeKind: "c_locus";
                            term: SyntaxReference;
                        }[];
                        edges: {
                            edgeRef: string;
                            fromNodeRef: string;
                            toNodeRef: string;
                            inputBinding?: {
                                kind: "retain_graph_input";
                                entryContractRef: string;
                                sourceContractRef: string;
                                targetContractRef: string;
                            } | undefined;
                        }[];
                        applications: ({
                            relationKind: "compose";
                            leftGraphFunctionRef: string;
                            rightGraphFunctionRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "substitute";
                            outerGraphFunctionRef: string;
                            targetVectorRef: string;
                            innerGraphFunctionRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "recurse";
                            graphFunctionRef: string;
                            terminationRuleRef: string;
                            terminationEvaluatorRefs: string[];
                            terminationFieldRef: string;
                            foldbackRef: string;
                            foldback: {
                                mode: "rebind";
                                binding: string;
                                requiresParentEvaluation: true;
                            };
                            bound: number;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "fan_out";
                            batchRef: string;
                            elementGraphFunctionRef: string;
                            inputVectorRef: string;
                            outputVectorRef: string;
                            inputMemberContractRef: string;
                            outputMemberContractRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "fan_in";
                            reducerGraphFunctionRef: string;
                            inputVectorRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "gate";
                            targetRef: string;
                            ruleRef: string;
                            evaluatorRefs: string[];
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "registered_selection";
                            sourceProgramLocusRef: string;
                            evaluatorRef: string;
                            ruleRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "re_enter";
                            graphFunctionRef: string;
                            sourceProgramLocusRef: string;
                            targetProgramLocusRef: string;
                            maxApplications: number;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "promote";
                            sourceRef: string;
                            targetRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "identity";
                            targetRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        } | {
                            relationKind: "same_object";
                            leftRef: string;
                            rightRef: string;
                            witnessRef: string;
                            kind: "graph_function_application";
                            applicationRef: string;
                            inputContractRef: string;
                            outputContractRef: string;
                        })[];
                    };
                    effects: string[];
                    declarations: {
                        [x: string]: string;
                    };
                    tags: string[];
                }[];
                contributions: {
                    handle: string;
                    kind: "graph_function" | "node_type" | "overlay";
                    declarationOrContractRef: string;
                    owningProductId: string;
                    programMembershipRefs: string[];
                    readinessPrerequisiteRefs: string[];
                    compatibilityRefs: string[];
                    provenanceRefs: string[];
                }[];
            };
            program: {
                kind: "gtl_program";
                programRef: string;
                version: "5.0.0";
                moduleRef: string;
                starts: {
                    startRef: string;
                    graphFunctionRef: string;
                }[];
                callableMembership: string[];
                closureContractRef: string;
                policies: {
                    [x: string]: string;
                };
                publicAssetTargets?: {
                    kind: "program_public_asset_target";
                    handle: string;
                    assetRef: string;
                    startRef: string;
                }[] | undefined;
                actionCatalog?: {
                    kind: "action_catalog";
                    schemaVersion: "5.0.0";
                    catalogRef: string;
                    catalogDigest: `sha256:${string}`;
                    rows: {
                        kind: "action_catalog_row";
                        actionRef: string;
                        actionKind: string;
                        programRef: string;
                        graphFunctionRef: string;
                        targetProgramLocusRef: string;
                        targetObligationRefs: string[];
                        inputAssetRefs: string[];
                        outputAssetRefs: string[];
                        expectedDeltaRef: string;
                        progressConditionRef: string;
                        stopConditionRef: string;
                    }[];
                } | undefined;
                constructionComposition?: {
                    kind: "construction_composition";
                    schemaVersion: "5.0.0";
                    compositionRef: string;
                    compositionDigest: `sha256:${string}`;
                    graphFunctionRef: string;
                    authorities: [{
                        kind: "construction_authority_binding";
                        semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        authorityRef: string;
                        initialProgramLocusRef: string;
                        refreshProgramLocusRef: string | null;
                    }, {
                        kind: "construction_authority_binding";
                        semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        authorityRef: string;
                        initialProgramLocusRef: string;
                        refreshProgramLocusRef: string | null;
                    }, {
                        kind: "construction_authority_binding";
                        semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        authorityRef: string;
                        initialProgramLocusRef: string;
                        refreshProgramLocusRef: string | null;
                    }, {
                        kind: "construction_authority_binding";
                        semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        authorityRef: string;
                        initialProgramLocusRef: string;
                        refreshProgramLocusRef: string | null;
                    }];
                    interactionProgramLocusRef: string;
                    closurePolicy: {
                        kind: "construction_policy";
                        policyRef: string;
                        requireCompleteEvidence: boolean;
                        requirePostEvidenceRefresh: boolean;
                    };
                } | undefined;
            };
        };
        expectedDisposition: "passed";
        expectedDiagnosticIds: string[];
        mutations: {
            caseId: string;
            target: "publication" | "program_and_published_program";
            path: (string | number)[];
            operation: "replace" | "append" | "append_first";
            value?: JsonReference | undefined;
            expectedDiagnosticIds: string[];
        }[];
    }[], 1, undefined>]>;
    readonly constructors: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.PicklistSchema<["c_of", "c_identity", "c_compose", "c_edge", "c_workflow", "c_batch", "c_retry"], undefined>;
        readonly syntax: v.GenericSchema<unknown, SyntaxReference>;
        readonly expectedDisposition: v.LiteralSchema<"admitted", undefined>;
    }, undefined>, undefined>;
    readonly interactionSyntax: v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>;
    readonly localNegatives: v.ArraySchema<v.StrictObjectSchema<{
        readonly caseId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly constructorKind: v.PicklistSchema<["c_of", "c_identity", "c_compose", "c_edge", "c_workflow", "c_batch", "c_retry"], undefined>;
        readonly operation: v.PicklistSchema<["remove", "replace"], undefined>;
        readonly path: v.ArraySchema<v.UnionSchema<[v.StringSchema<undefined>, v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>], undefined>, undefined>;
        readonly value: v.OptionalSchema<v.GenericSchema<unknown, JsonReference>, undefined>;
        readonly expectedCode: v.LiteralSchema<"invalid_kind", undefined>;
        readonly expectedPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
}, undefined>;
/** Runtime schema and native projection share the same checked definition. */
export declare function nativeStructuralSchema<Schema extends v.GenericSchema>(schema: Schema): v.GenericSchema<unknown, ContractValue<Schema>>;
export declare const GTL_SERIALIZATION_SCHEMA_DEFINITIONS: Readonly<{
    GraphFunction: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"graph_function", undefined>;
        readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly version: v.LiteralSchema<"5.0.0", undefined>;
        readonly environment: v.StrictObjectSchema<{
            readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>;
        readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly template: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"inline_graph", undefined>;
            readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                readonly term: v.GenericSchema<unknown, SyntaxReference>;
            }, undefined>, undefined>;
            readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                    readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"compose", undefined>;
                readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldback: v.StrictObjectSchema<{
                    readonly mode: v.LiteralSchema<"rebind", undefined>;
                    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                }, undefined>;
                readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"gate", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"promote", undefined>;
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"identity", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>, undefined>;
        }, undefined>;
        readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
        readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>;
    ModulePublication: v.StrictObjectSchema<{
        readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "stdo_run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            source: {
                releaseUri: string;
                manifestDigest: string;
            };
            representation: {
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            axiom: {
                executablePath: string;
                outputContractPath: string;
                outputContractVersion: "axiom-indexer.frame-projection@1";
                pythonExecutableDigest: string;
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            accesses: {
                accessRef: string;
                operation: "project";
                mode: "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                graphFunctionRef: string;
                programLocusRef: string;
                role: "author" | "assessor" | "constructor" | "command_executor";
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                accessRefs: string[];
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            dependencies: {
                dependencyRef: string;
                basisRef: string;
                recordRef: string;
                recordDigest: string;
                recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            }[];
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            corpusAccess: {
                kind: "axiom_indexer";
                sourceDependencyRef: string;
                representationDependencyRef: string;
                axiomDependencyRef: string;
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                executablePath: string;
                outputContractPath: string;
                pythonExecutableDigest: string;
                pythonVersion: string;
            } | null;
            accesses: {
                accessRef: string;
                operation: "project" | "validate";
                mode: "validation" | "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                accessRefs: string[];
                contextPolicy: {
                    policyRef: string;
                    selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                };
                graphFunctionRef: string;
                programLocusRef: string;
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
        readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
        readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"module_publication", undefined>;
        readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly productSemanticsBinding: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
            readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
            readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly description: v.StringSchema<undefined>;
            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly rules: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"run", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>], undefined>, undefined>;
        readonly programs: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"gtl_program", undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, undefined>;
            readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>], undefined>;
                readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly closurePolicy: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"graph_function", undefined>;
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly environment: v.StrictObjectSchema<{
                readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>;
            readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly template: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                    readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                    readonly term: v.GenericSchema<unknown, SyntaxReference>;
                }, undefined>, undefined>;
                readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                    readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                        readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"compose", undefined>;
                    readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                    readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldback: v.StrictObjectSchema<{
                        readonly mode: v.LiteralSchema<"rebind", undefined>;
                        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                    }, undefined>;
                    readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                    readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"gate", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"promote", undefined>;
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"identity", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                    readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>], undefined>, undefined>;
            }, undefined>;
            readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
            readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
            readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    CProgramSyntax: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_identity", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly terms: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 2, undefined>]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_compose", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly transform: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly evaluate: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly consequence: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_edge", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_workflow", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly taskInputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly taskOutputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly tasks: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 1, undefined>]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_batch", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly budget: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly term: v.GenericSchema<unknown, SyntaxReference>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_retry", undefined>;
    }, undefined>], undefined>;
    GtlProgramConformanceInput: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"conformance_evaluate_packet", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly memberKey: v.LiteralSchema<"gtl_program", undefined>;
        readonly publication: v.StrictObjectSchema<{
            readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                kind: "stdo_run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                source: {
                    releaseUri: string;
                    manifestDigest: string;
                };
                representation: {
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                axiom: {
                    executablePath: string;
                    outputContractPath: string;
                    outputContractVersion: "axiom-indexer.frame-projection@1";
                    pythonExecutableDigest: string;
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                accesses: {
                    accessRef: string;
                    operation: "project";
                    mode: "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    graphFunctionRef: string;
                    programLocusRef: string;
                    role: "author" | "assessor" | "constructor" | "command_executor";
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    accessRefs: string[];
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>>>, undefined>, undefined>;
            readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                kind: "run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                dependencies: {
                    dependencyRef: string;
                    basisRef: string;
                    recordRef: string;
                    recordDigest: string;
                    recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                }[];
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                corpusAccess: {
                    kind: "axiom_indexer";
                    sourceDependencyRef: string;
                    representationDependencyRef: string;
                    axiomDependencyRef: string;
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    executablePath: string;
                    outputContractPath: string;
                    pythonExecutableDigest: string;
                    pythonVersion: string;
                } | null;
                accesses: {
                    accessRef: string;
                    operation: "project" | "validate";
                    mode: "validation" | "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                    accessRefs: string[];
                    contextPolicy: {
                        policyRef: string;
                        selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                    };
                    graphFunctionRef: string;
                    programLocusRef: string;
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>>>, undefined>, undefined>;
            readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
            readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
            readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
            readonly kind: v.LiteralSchema<"module_publication", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly productSemanticsBinding: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
                readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
                readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
                readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
                readonly description: v.StringSchema<undefined>;
                readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly rules: v.ArraySchema<v.StrictObjectSchema<{
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
                readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
                readonly closureScope: v.LiteralSchema<"run", undefined>;
                readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
                readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalKind: v.LiteralSchema<"completed", undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
                readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
                readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalKind: v.LiteralSchema<"completed", undefined>;
            }, undefined>], undefined>, undefined>;
            readonly programs: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"gtl_program", undefined>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly version: v.LiteralSchema<"5.0.0", undefined>;
                readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
                readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>, undefined>;
                readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                        readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>], undefined>;
                    readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly closurePolicy: v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                        readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                        readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                    }, undefined>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"graph_function", undefined>;
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly version: v.LiteralSchema<"5.0.0", undefined>;
                readonly environment: v.StrictObjectSchema<{
                    readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>;
                readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly template: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                    readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                        readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                        readonly term: v.GenericSchema<unknown, SyntaxReference>;
                    }, undefined>, undefined>;
                    readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                        readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                            readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, undefined>;
                    }, undefined>, undefined>;
                    readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"compose", undefined>;
                        readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                        readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly foldback: v.StrictObjectSchema<{
                            readonly mode: v.LiteralSchema<"rebind", undefined>;
                            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                        }, undefined>;
                        readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                        readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                        readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"gate", undefined>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"promote", undefined>;
                        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"identity", undefined>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                        readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>], undefined>, undefined>;
                }, undefined>;
                readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
                readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly program: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"gtl_program", undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, undefined>;
            readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>], undefined>;
                readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly closurePolicy: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
    }, undefined>;
}>;
export declare const GTL_SERIALIZATION_SCHEMA_FAMILY: v.StrictObjectSchema<Readonly<{
    GraphFunction: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"graph_function", undefined>;
        readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly version: v.LiteralSchema<"5.0.0", undefined>;
        readonly environment: v.StrictObjectSchema<{
            readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>;
        readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly template: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"inline_graph", undefined>;
            readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                readonly term: v.GenericSchema<unknown, SyntaxReference>;
            }, undefined>, undefined>;
            readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                    readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"compose", undefined>;
                readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly foldback: v.StrictObjectSchema<{
                    readonly mode: v.LiteralSchema<"rebind", undefined>;
                    readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                }, undefined>;
                readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"gate", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"promote", undefined>;
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"identity", undefined>;
                readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>, undefined>;
        }, undefined>;
        readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
        readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    }, undefined>;
    ModulePublication: v.StrictObjectSchema<{
        readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "stdo_run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            source: {
                releaseUri: string;
                manifestDigest: string;
            };
            representation: {
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            axiom: {
                executablePath: string;
                outputContractPath: string;
                outputContractVersion: "axiom-indexer.frame-projection@1";
                pythonExecutableDigest: string;
                productRef: string;
                releaseRef: string;
                tagObject: string;
                recordUri: string;
                recordDigest: string;
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            };
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            accesses: {
                accessRef: string;
                operation: "project";
                mode: "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                graphFunctionRef: string;
                programLocusRef: string;
                role: "author" | "assessor" | "constructor" | "command_executor";
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                accessRefs: string[];
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
            kind: "run_environment_declaration";
            schemaVersion: "5.0.0";
            declarationRef: string;
            dependencies: {
                dependencyRef: string;
                basisRef: string;
                recordRef: string;
                recordDigest: string;
                recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                inventoryDigest: string;
                members: {
                    path: string;
                    type: "file" | "symlink";
                    digest: string;
                    target: string | null;
                }[];
            }[];
            contexts: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            }[];
            corpusAccess: {
                kind: "axiom_indexer";
                sourceDependencyRef: string;
                representationDependencyRef: string;
                axiomDependencyRef: string;
                program: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                map: {
                    path: string;
                    uri: string;
                    byteDigest: string;
                    canonicalDigest: string;
                };
                executablePath: string;
                outputContractPath: string;
                pythonExecutableDigest: string;
                pythonVersion: string;
            } | null;
            accesses: {
                accessRef: string;
                operation: "project" | "validate";
                mode: "validation" | "materialized";
                frameIndexRefs: string[];
                maxOutputBytes: number;
                timeoutMs: number;
            }[];
            roles: {
                role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                accessRefs: string[];
                contextPolicy: {
                    policyRef: string;
                    selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                };
                graphFunctionRef: string;
                programLocusRef: string;
                frameRefs: string[];
                policy: {
                    policyRef: string;
                    text: string;
                    digest: string;
                };
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
        }>>>, undefined>, undefined>;
        readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
        readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
        readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"module_publication", undefined>;
        readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly productSemanticsBinding: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
            readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
            readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly description: v.StringSchema<undefined>;
            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly rules: v.ArraySchema<v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
            readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
        readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"run", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
            readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
            readonly kind: v.LiteralSchema<"closure_contract", undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalKind: v.LiteralSchema<"completed", undefined>;
        }, undefined>], undefined>, undefined>;
        readonly programs: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"gtl_program", undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, undefined>;
            readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>], undefined>;
                readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly closurePolicy: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"graph_function", undefined>;
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly environment: v.StrictObjectSchema<{
                readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>;
            readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly template: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                    readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                    readonly term: v.GenericSchema<unknown, SyntaxReference>;
                }, undefined>, undefined>;
                readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                    readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                        readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"compose", undefined>;
                    readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                    readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly foldback: v.StrictObjectSchema<{
                        readonly mode: v.LiteralSchema<"rebind", undefined>;
                        readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                    }, undefined>;
                    readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                    readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                    readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"gate", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"promote", undefined>;
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"identity", undefined>;
                    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                    readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                    readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>], undefined>, undefined>;
            }, undefined>;
            readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
        readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
            readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
            readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    CProgramSyntax: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
        readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
        readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultBearing: v.BooleanSchema<undefined>;
        readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
            readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
            readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>], undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_of", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_identity", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly terms: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 2, undefined>]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_compose", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly transform: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly evaluate: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly consequence: v.StrictObjectSchema<{
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly stageRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly fibre: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
            readonly armId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compositionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly vectorIndex: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, number, undefined>]>;
            readonly judgmentPredicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultBearing: v.BooleanSchema<undefined>;
            readonly requirement: v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"executable_leaf_requirement", undefined>;
                readonly implementationBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"interaction_leaf_requirement", undefined>;
                readonly interactionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly actorCapabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly requestContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly responseContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly continuationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>], undefined>;
            readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly kind: v.LiteralSchema<"c_of", undefined>;
        }, undefined>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_edge", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_workflow", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly taskInputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly taskOutputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly tasks: v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<unknown, SyntaxReference>, undefined>, v.MinLengthAction<SyntaxReference[], 1, undefined>]>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_batch", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly budget: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
        readonly term: v.GenericSchema<unknown, SyntaxReference>;
        readonly inputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly outputCarrierRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly kind: v.LiteralSchema<"c_retry", undefined>;
    }, undefined>], undefined>;
    GtlProgramConformanceInput: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"conformance_evaluate_packet", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly memberKey: v.LiteralSchema<"gtl_program", undefined>;
        readonly publication: v.StrictObjectSchema<{
            readonly stdoRunEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                kind: "stdo_run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                source: {
                    releaseUri: string;
                    manifestDigest: string;
                };
                representation: {
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                axiom: {
                    executablePath: string;
                    outputContractPath: string;
                    outputContractVersion: "axiom-indexer.frame-projection@1";
                    pythonExecutableDigest: string;
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                accesses: {
                    accessRef: string;
                    operation: "project";
                    mode: "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    graphFunctionRef: string;
                    programLocusRef: string;
                    role: "author" | "assessor" | "constructor" | "command_executor";
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    accessRefs: string[];
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>>>, undefined>, undefined>;
            readonly runEnvironments: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<{
                kind: "run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                dependencies: {
                    dependencyRef: string;
                    basisRef: string;
                    recordRef: string;
                    recordDigest: string;
                    recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                }[];
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                corpusAccess: {
                    kind: "axiom_indexer";
                    sourceDependencyRef: string;
                    representationDependencyRef: string;
                    axiomDependencyRef: string;
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    executablePath: string;
                    outputContractPath: string;
                    pythonExecutableDigest: string;
                    pythonVersion: string;
                } | null;
                accesses: {
                    accessRef: string;
                    operation: "project" | "validate";
                    mode: "validation" | "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                    accessRefs: string[];
                    contextPolicy: {
                        policyRef: string;
                        selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                    };
                    graphFunctionRef: string;
                    programLocusRef: string;
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>>>, undefined>, undefined>;
            readonly semanticLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticLifecycleDeclaration>>>, undefined>;
            readonly semanticJobLifecycle: v.OptionalSchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<SemanticJobLifecycleDeclaration>>>, undefined>;
            readonly requirementHandoffs: v.OptionalSchema<v.ArraySchema<v.GenericSchema<unknown, ExistingContractReference<Readonly<GtlRequirementHandoffDeclaration>>>, undefined>, undefined>;
            readonly kind: v.LiteralSchema<"module_publication", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly moduleVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly artifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly productManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly productSemanticsBinding: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"product_semantics_binding", undefined>;
                readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly contracts: v.ArraySchema<v.StrictObjectSchema<{
                readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly contractKind: v.PicklistSchema<["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"], undefined>;
                readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly evaluators: v.ArraySchema<v.StrictObjectSchema<{
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly regime: v.PicklistSchema<["F_D", "F_P", "F_H"], undefined>;
                readonly description: v.StringSchema<undefined>;
                readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly consumedFieldRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly rules: v.ArraySchema<v.StrictObjectSchema<{
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly config: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<unknown, JsonReference>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly implementationBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"implementation_binding", undefined>;
                readonly bindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly modulePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly namedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly computeRegime: v.PicklistSchema<["F_D", "F_P"], undefined>;
                readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly failureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly closureContracts: v.ArraySchema<v.VariantSchema<"closureScope", [v.StrictObjectSchema<{
                readonly closureScope: v.LiteralSchema<"run", undefined>;
                readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>, v.LiteralSchema<"run_closed", undefined>], undefined>;
                readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalKind: v.LiteralSchema<"completed", undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly closureScope: v.LiteralSchema<"graph_call", undefined>;
                readonly eventKindRefs: v.StrictTupleSchema<[v.LiteralSchema<"terminal_reached", undefined>, v.LiteralSchema<"frame_closed", undefined>, v.LiteralSchema<"graph_call_closed", undefined>], undefined>;
                readonly kind: v.LiteralSchema<"closure_contract", undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly predicateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly evidenceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly refusalValueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly rejectionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly transitionContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly replayProjectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalKind: v.LiteralSchema<"completed", undefined>;
            }, undefined>], undefined>, undefined>;
            readonly programs: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"gtl_program", undefined>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly version: v.LiteralSchema<"5.0.0", undefined>;
                readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
                readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                    readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>, undefined>;
                readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                        readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, undefined>;
                }, undefined>, undefined>;
                readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                        readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    }, undefined>], undefined>;
                    readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly closurePolicy: v.StrictObjectSchema<{
                        readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                        readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                        readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                    }, undefined>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly graphFunctions: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"graph_function", undefined>;
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly version: v.LiteralSchema<"5.0.0", undefined>;
                readonly environment: v.StrictObjectSchema<{
                    readonly requires: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly provides: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly carries: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>;
                readonly inputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly outputs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly template: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"inline_graph", undefined>;
                    readonly graphRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly startNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly terminalNodeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly nodes: v.ArraySchema<v.StrictObjectSchema<{
                        readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly nodeKind: v.LiteralSchema<"c_locus", undefined>;
                        readonly term: v.GenericSchema<unknown, SyntaxReference>;
                    }, undefined>, undefined>;
                    readonly edges: v.ArraySchema<v.StrictObjectSchema<{
                        readonly edgeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly fromNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly toNodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputBinding: v.OptionalSchema<v.StrictObjectSchema<{
                            readonly kind: v.LiteralSchema<"retain_graph_input", undefined>;
                            readonly entryContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        }, undefined>, undefined>;
                    }, undefined>, undefined>;
                    readonly applications: v.ArraySchema<v.VariantSchema<"relationKind", [v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"compose", undefined>;
                        readonly leftGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly rightGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"substitute", undefined>;
                        readonly outerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly innerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"recurse", undefined>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly terminationRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly terminationEvaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly terminationFieldRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly foldbackRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly foldback: v.StrictObjectSchema<{
                            readonly mode: v.LiteralSchema<"rebind", undefined>;
                            readonly binding: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                            readonly requiresParentEvaluation: v.LiteralSchema<true, undefined>;
                        }, undefined>;
                        readonly bound: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"fan_out", undefined>;
                        readonly batchRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly elementGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputMemberContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"fan_in", undefined>;
                        readonly reducerGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputVectorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"gate", undefined>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly evaluatorRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"registered_selection", undefined>;
                        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly evaluatorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"re_enter", undefined>;
                        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly sourceProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly maxApplications: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, number, undefined>]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"promote", undefined>;
                        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"identity", undefined>;
                        readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>, v.StrictObjectSchema<{
                        readonly relationKind: v.LiteralSchema<"same_object", undefined>;
                        readonly leftRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly rightRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly witnessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly kind: v.LiteralSchema<"graph_function_application", undefined>;
                        readonly applicationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly inputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                        readonly outputContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    }, undefined>], undefined>, undefined>;
                }, undefined>;
                readonly effects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly declarations: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
                readonly tags: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly kind: v.PicklistSchema<["graph_function", "node_type", "overlay"], undefined>;
                readonly declarationOrContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly owningProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly programMembershipRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly readinessPrerequisiteRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly compatibilityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                readonly provenanceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly program: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"gtl_program", undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly version: v.LiteralSchema<"5.0.0", undefined>;
            readonly moduleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly starts: v.ArraySchema<v.StrictObjectSchema<{
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>;
            readonly callableMembership: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly closureContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly policies: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly publicAssetTargets: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"program_public_asset_target", undefined>;
                readonly handle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly assetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly startRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, undefined>;
            readonly actionCatalog: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"action_catalog", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly rows: v.ArraySchema<v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"action_catalog_row", undefined>;
                    readonly actionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly actionKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly targetObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly inputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly outputAssetRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                    readonly expectedDeltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly progressConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly stopConditionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
            readonly constructionComposition: v.OptionalSchema<v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"construction_composition", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly compositionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly compositionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorities: v.StrictTupleSchema<[v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>, v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_authority_binding", undefined>;
                    readonly semanticAuthority: v.PicklistSchema<["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"], undefined>;
                    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly initialProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly refreshProgramLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
                }, undefined>], undefined>;
                readonly interactionProgramLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly closurePolicy: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"construction_policy", undefined>;
                    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly requireCompleteEvidence: v.BooleanSchema<undefined>;
                    readonly requirePostEvidenceRefresh: v.BooleanSchema<undefined>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
    }, undefined>;
}>, undefined>;
export {};
