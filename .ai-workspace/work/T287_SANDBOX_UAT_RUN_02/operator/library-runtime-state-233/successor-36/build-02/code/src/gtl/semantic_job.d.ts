import * as v from "valibot";
import type { ModulePublication, GtlProgram, ContractDeclaration } from "./contracts.js";
import { type SemanticStageDeclaration, type SemanticProofShape } from "./semantic_stage.js";
/** Installed, job-independent constraints. Instances remain admitted values. */
export interface SemanticJobProofTemplate {
    readonly templateRef: string;
    readonly realizationContractRef: string;
    readonly proofContractRef: string;
    readonly requiredEvidenceRoles: SemanticProofShape["requiredEvidenceRoles"];
    readonly sharedBasis: readonly string[];
    readonly requiredContent: readonly string[];
}
export interface SemanticJobLifecycleDeclaration {
    readonly kind: "semantic_job_lifecycle_declaration";
    readonly schemaVersion: "5.0.0";
    readonly declarationRef: string;
    readonly intakeGraphFunctionRef: string;
    readonly sourceRoleRef: string;
    readonly bounds: {
        readonly maxSourceMembers: number;
        readonly maxSourceBytes: number;
        readonly maxContextFiles: number;
        readonly maxContextBytes: number;
        readonly maxTargets: number;
        readonly maxCommands: number;
    };
    readonly proofTemplates: readonly SemanticJobProofTemplate[];
    readonly stages: readonly SemanticStageDeclaration[];
}
export declare const SEMANTIC_JOB_LIFECYCLE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"semantic_job_lifecycle_declaration", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly intakeGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceRoleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly bounds: v.StrictObjectSchema<{
        readonly maxSourceMembers: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxSourceBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxContextFiles: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxContextBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxTargets: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxCommands: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
    }, undefined>;
    readonly proofTemplates: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly templateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly realizationContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proofContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requiredEvidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.PicklistSchema<["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"], undefined>, undefined>, v.MinLengthAction<("realization" | "verifier_artifact" | "verifier_execution" | "semantic_assessment")[], 1, undefined>]>;
        readonly sharedBasis: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly requiredContent: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        templateRef: string;
        realizationContractRef: string;
        proofContractRef: string;
        requiredEvidenceRoles: ("realization" | "verifier_artifact" | "verifier_execution" | "semantic_assessment")[];
        sharedBasis: string[];
        requiredContent: string[];
    }[], 1, undefined>]>;
    readonly stages: v.SchemaWithPipe<readonly [v.ArraySchema<v.CustomSchema<SemanticStageDeclaration, undefined>, undefined>, v.MinLengthAction<SemanticStageDeclaration[], 1, undefined>]>;
}, undefined>;
export declare function isSemanticJobLifecycleDeclaration(value: unknown): value is SemanticJobLifecycleDeclaration;
export declare function constructSemanticJobLifecycleDeclaration(value: SemanticJobLifecycleDeclaration): Readonly<SemanticJobLifecycleDeclaration>;
export declare function validSemanticJobLifecyclePublication(publication: Readonly<ModulePublication>, contracts?: readonly ContractDeclaration[]): boolean;
export declare function validSemanticJobProgramOwners(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, owner: Readonly<ModulePublication>, contracts?: readonly ContractDeclaration[]): boolean;
