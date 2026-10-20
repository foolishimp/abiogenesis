import * as v from "valibot";
import { type GtlRequirementHandoffDeclaration, type RequirementTerm } from "../gtl/requirement_handoff.js";
/** Pure quote projection over an already bound immutable source member. */
export declare function groundBoundSourceQuote(contextRef: string, member: Readonly<{
    memberRef: string;
    digest: `sha256:${string}`;
    base64: string;
}>, quoteText: string): RequirementTerm["sourceBindings"][number] | null;
export declare const REQUIREMENT_HANDOFF_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"requirement_handoff_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceRoleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly base64: v.StringSchema<undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        memberRef: string;
        base64: string;
    }[], 1, undefined>]>;
}, undefined>;
export declare const REQUIREMENT_HANDOFF_COORDINATE_SCHEMA: v.StrictObjectSchema<{
    readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly declarationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly executionBasisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly executionBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly graphFunctionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly implementationResolutionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly implementationResolutionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly predecessorPrefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly predecessorEventCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
    readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const REQUIREMENT_HANDOFF_GAPS: readonly ["full_source_semantic_assessment_required", "instruction_assembly_required", "semantic_stage_result_required", "proof_depth_and_strength_unassessed", "discovered_obligations_unassessed", "application_closure_not_evaluated"];
export declare const REQUIREMENT_HANDOFF_OUTPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"requirement_handoff_output", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly source: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"requirement_handoff_input", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceRoleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly base64: v.StringSchema<undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            base64: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly declaration: v.StrictObjectSchema<{
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
    readonly basis: v.StrictObjectSchema<{
        readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly declarationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly executionBasisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly executionBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphFunctionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly implementationResolutionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly implementationResolutionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly predecessorPrefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly predecessorEventCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly coverage: v.StrictObjectSchema<{
        readonly disposition: v.LiteralSchema<"non_closing", undefined>;
        readonly obligations: v.ArraySchema<v.StrictObjectSchema<{
            readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly role: v.PicklistSchema<["realization", "proof"], undefined>;
            readonly requiredContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly proofPolicyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly proofShapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly disposition: v.LiteralSchema<"no_admitted_evidence", undefined>;
            readonly policyGap: v.BooleanSchema<undefined>;
        }, undefined>, undefined>;
        readonly gaps: v.TupleSchema<[v.LiteralSchema<string, undefined>, ...v.LiteralSchema<string, undefined>[]], undefined>;
    }, undefined>;
}, undefined>;
export interface RequirementHandoffInput {
    readonly kind: "requirement_handoff_input";
    readonly schemaVersion: "5.0.0";
    readonly declarationRef: string;
    readonly sourceRoleRef: string;
    readonly members: readonly {
        readonly memberRef: string;
        readonly base64: string;
    }[];
}
export interface RequirementHandoffCoordinate {
    readonly publicationDigest: `sha256:${string}`;
    readonly declarationDigest: `sha256:${string}`;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: `sha256:${string}`;
    readonly programRef: string;
    readonly programDigest: `sha256:${string}`;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: `sha256:${string}`;
    readonly cCallRef: string;
    readonly cCallDigest: `sha256:${string}`;
    readonly implementationResolutionRef: string;
    readonly implementationResolutionDigest: `sha256:${string}`;
    readonly predecessorPrefixDigest: `sha256:${string}`;
    readonly predecessorEventCount: number;
    readonly inputDigest: `sha256:${string}`;
}
export interface RequirementHandoffOutput {
    readonly kind: "requirement_handoff_output";
    readonly schemaVersion: "5.0.0";
    readonly source: RequirementHandoffInput;
    readonly declaration: GtlRequirementHandoffDeclaration;
    readonly basis: RequirementHandoffCoordinate;
    readonly coverage: {
        readonly disposition: "non_closing";
        readonly obligations: readonly {
            readonly obligationRef: string;
            readonly requirementRef: string;
            readonly role: "realization" | "proof";
            readonly requiredContractRef: string | null;
            readonly proofPolicyRef: string | null;
            readonly proofShapeRef: string | null;
            readonly disposition: "no_admitted_evidence";
            readonly policyGap: boolean;
        }[];
        readonly gaps: readonly string[];
    };
}
export declare function isRequirementHandoffInput(value: unknown): value is RequirementHandoffInput;
export declare function constructRequirementHandoffInput(value: RequirementHandoffInput): Readonly<RequirementHandoffInput>;
export declare function requirementHandoffInputMatches(input: unknown, declaration: unknown): boolean;
/** Pure candidate construction. Only ABG admission can make this runtime truth. */
export declare function deriveRequirementHandoffCandidate(input: RequirementHandoffInput, declaration: GtlRequirementHandoffDeclaration, basis: RequirementHandoffCoordinate): Readonly<RequirementHandoffOutput> | null;
export declare function isRequirementHandoffOutput(value: unknown): value is RequirementHandoffOutput;
