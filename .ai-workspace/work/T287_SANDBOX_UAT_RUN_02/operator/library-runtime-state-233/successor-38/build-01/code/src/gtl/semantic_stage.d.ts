export { SEMANTIC_STAGE_IDS, SEMANTIC_IMPLEMENTATION_REFS } from "./semantic_stage_identity.js";
import * as v from "valibot";
import type { GtlProgram, ModulePublication } from "./contracts.js";
import { type RequirementTerm } from "./requirement_handoff.js";
export interface SemanticProofPolicy {
    readonly policyRef: string;
    readonly sourceRequirementRef: string;
    readonly sourceBindings: RequirementTerm["sourceBindings"];
    readonly scope: string;
    readonly realizationMeaning: readonly string[];
    readonly proofMeaning: readonly string[];
    readonly unprovedScope: readonly string[];
    readonly closureRule: string;
    readonly obligationRef: string;
}
export interface SemanticProofShape {
    readonly proofShapeRef: string;
    readonly requiredEvidenceRoles: readonly ("realization" | "verifier_artifact" | "verifier_execution" | "semantic_assessment")[];
    readonly sharedBasis: readonly string[];
    readonly requiredContent: readonly string[];
    readonly nativeCarrierBoundary: string;
    readonly requirementRef: string;
    readonly obligationRef: string;
    readonly roleContractRefs: {
        readonly realization: string;
        readonly proof: string;
    };
}
export interface SemanticAssetSurface {
    readonly kind: string;
    readonly requiredContexts: readonly string[];
    readonly standardsRefs: readonly string[];
    readonly outputContractRefs: readonly string[];
    readonly constructorRef: string;
    readonly rendererRef: string;
    readonly proofObligationRefs: readonly string[];
    readonly authoritySlots: readonly {
        readonly authorityKindRef: string;
        readonly disposition: "normal" | "bounded_fallback" | "forbidden_routine";
        readonly fallbackPreconditionRefs: readonly string[];
    }[];
}
export type SemanticWorksiteContentPolicy = "not_required" | "current_inventory";
export type SemanticStageAssembly = {
    readonly ruleRef: string;
    readonly graphFunctionRef: string;
    readonly sectionOrder: readonly ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"];
    readonly proportionalityPolicy: "declared_semantic_assessment";
    readonly maxPromptBytes: number;
} & ({
    readonly contentPolicy: "full_source_and_predecessors";
} | {
    readonly contentPolicy: "role_scoped_worksite";
    readonly worksiteContentByRole: {
        readonly author: SemanticWorksiteContentPolicy;
        readonly assessor: SemanticWorksiteContentPolicy;
    };
});
export interface SemanticStageDeclaration {
    readonly declarationRef: string;
    readonly graphFunctionRef: string;
    readonly authorLocusRef: string;
    readonly assessorLocusRef: string;
    readonly predecessorStageRefs: readonly string[];
    readonly assetSurface: SemanticAssetSurface;
    readonly purpose: string;
    readonly requiredContent: readonly string[];
    readonly rubric: readonly {
        readonly criterionRef: string;
        readonly instruction: string;
    }[];
    readonly bodyCapabilities: readonly ("requirement_refinement" | "worksite_design" | "application_assessment")[];
    readonly assembly: SemanticStageAssembly;
}
export interface SemanticLifecycleDeclaration {
    readonly declarationRef: string;
    readonly sourceDeclarationRef: string;
    readonly taskDataDigest: `sha256:${string}`;
    readonly evaluationDataDigest: `sha256:${string}`;
    readonly proofPolicies: readonly SemanticProofPolicy[];
    readonly proofShapes: readonly SemanticProofShape[];
    readonly stages: readonly SemanticStageDeclaration[];
}
export declare const POLICY_SCHEMA: v.StrictObjectSchema<{
    readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceRequirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
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
    readonly scope: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly realizationMeaning: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly proofMeaning: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly unprovedScope: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly closureRule: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
export declare const SHAPE_SCHEMA: v.StrictObjectSchema<{
    readonly proofShapeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly requiredEvidenceRoles: v.ArraySchema<v.PicklistSchema<["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"], undefined>, undefined>;
    readonly sharedBasis: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly requiredContent: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly nativeCarrierBoundary: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly roleContractRefs: v.StrictObjectSchema<{
        readonly realization: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proof: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const SEMANTIC_LIFECYCLE_SCHEMA: v.StrictObjectSchema<{
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceDeclarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskDataDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly evaluationDataDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly proofPolicies: v.ArraySchema<v.StrictObjectSchema<{
        readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceRequirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
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
        readonly scope: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly realizationMeaning: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly proofMeaning: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly unprovedScope: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly closureRule: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly proofShapes: v.ArraySchema<v.StrictObjectSchema<{
        readonly proofShapeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requiredEvidenceRoles: v.ArraySchema<v.PicklistSchema<["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"], undefined>, undefined>;
        readonly sharedBasis: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly requiredContent: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly nativeCarrierBoundary: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly roleContractRefs: v.StrictObjectSchema<{
            readonly realization: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proof: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly stages: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly assessorLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorStageRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly assetSurface: v.StrictObjectSchema<{
            readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
                readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
                readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly purpose: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requiredContent: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly rubric: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly instruction: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            criterionRef: string;
            instruction: string;
        }[], 1, undefined>]>;
        readonly bodyCapabilities: v.ArraySchema<v.PicklistSchema<["requirement_refinement", "worksite_design", "application_assessment"], undefined>, undefined>;
        readonly assembly: v.VariantSchema<"contentPolicy", [v.StrictObjectSchema<{
            readonly contentPolicy: v.LiteralSchema<"full_source_and_predecessors", undefined>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sectionOrder: v.StrictTupleSchema<[v.LiteralSchema<"role", undefined>, v.LiteralSchema<"source", undefined>, v.LiteralSchema<"obligations", undefined>, v.LiteralSchema<"predecessors", undefined>, v.LiteralSchema<"worksite", undefined>, v.LiteralSchema<"evidence", undefined>, v.LiteralSchema<"task", undefined>, v.LiteralSchema<"response", undefined>], undefined>;
            readonly proportionalityPolicy: v.LiteralSchema<"declared_semantic_assessment", undefined>;
            readonly maxPromptBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly contentPolicy: v.LiteralSchema<"role_scoped_worksite", undefined>;
            readonly worksiteContentByRole: v.StrictObjectSchema<{
                readonly author: v.PicklistSchema<["not_required", "current_inventory"], undefined>;
                readonly assessor: v.PicklistSchema<["not_required", "current_inventory"], undefined>;
            }, undefined>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sectionOrder: v.StrictTupleSchema<[v.LiteralSchema<"role", undefined>, v.LiteralSchema<"source", undefined>, v.LiteralSchema<"obligations", undefined>, v.LiteralSchema<"predecessors", undefined>, v.LiteralSchema<"worksite", undefined>, v.LiteralSchema<"evidence", undefined>, v.LiteralSchema<"task", undefined>, v.LiteralSchema<"response", undefined>], undefined>;
            readonly proportionalityPolicy: v.LiteralSchema<"declared_semantic_assessment", undefined>;
            readonly maxPromptBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        }, undefined>], undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        declarationRef: string;
        graphFunctionRef: string;
        authorLocusRef: string;
        assessorLocusRef: string;
        predecessorStageRefs: string[];
        assetSurface: {
            kind: string;
            requiredContexts: string[];
            standardsRefs: string[];
            outputContractRefs: string[];
            constructorRef: string;
            rendererRef: string;
            proofObligationRefs: string[];
            authoritySlots: {
                authorityKindRef: string;
                disposition: "normal" | "bounded_fallback" | "forbidden_routine";
                fallbackPreconditionRefs: string[];
            }[];
        };
        purpose: string;
        requiredContent: string[];
        rubric: {
            criterionRef: string;
            instruction: string;
        }[];
        bodyCapabilities: ("requirement_refinement" | "worksite_design" | "application_assessment")[];
        assembly: {
            contentPolicy: "full_source_and_predecessors";
            ruleRef: string;
            graphFunctionRef: string;
            sectionOrder: ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"];
            proportionalityPolicy: "declared_semantic_assessment";
            maxPromptBytes: number;
        } | {
            contentPolicy: "role_scoped_worksite";
            worksiteContentByRole: {
                author: "not_required" | "current_inventory";
                assessor: "not_required" | "current_inventory";
            };
            ruleRef: string;
            graphFunctionRef: string;
            sectionOrder: ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"];
            proportionalityPolicy: "declared_semantic_assessment";
            maxPromptBytes: number;
        };
    }[], 1, undefined>]>;
}, undefined>;
export declare function isSemanticStageDeclaration(value: unknown): value is SemanticStageDeclaration;
export declare function isSemanticLifecycleDeclaration(value: unknown): value is SemanticLifecycleDeclaration;
export declare function constructSemanticLifecycleDeclaration(value: SemanticLifecycleDeclaration): Readonly<SemanticLifecycleDeclaration>;
/** A borrowed lifecycle is a declaration dependency, never callable membership. */
export declare function semanticLifecycleRefForProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>): string | undefined;
export declare function validSemanticProgramOwners(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, lifecyclePublication: Readonly<ModulePublication>, sourcePublication: Readonly<ModulePublication>): boolean;
export declare function validSemanticLifecyclePublication(publication: Readonly<ModulePublication>, sourcePublication?: Readonly<ModulePublication>): boolean;
