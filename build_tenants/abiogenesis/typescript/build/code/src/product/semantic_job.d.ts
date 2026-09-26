import { type SemanticJobRevisionEnvelope } from "./semantic_revision.js";
import { type NativeWorkspaceWorkTask, type NativeWorkspaceWorkObservation } from "./native_workspace_work.js";
import { type NativeWorksiteCommandExecutionTask } from "./worksite_command_execution.js";
import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type SemanticJobLifecycleDeclaration } from "../gtl/semantic_job.js";
import type { ContextDeclaration, RequirementTerm, GtlContractFulfillmentBinding } from "../gtl/requirement_handoff.js";
import type { SemanticProofPolicy, SemanticProofShape } from "../gtl/semantic_stage.js";
import { type SemanticAssetCandidate, type SemanticAssessmentCandidate, type SemanticActorSource, type SemanticSourceQuote, type SemanticWorksiteBasis, type SemanticEvidenceInput } from "./semantic_stage.js";
import type { WorksiteCommandPreparationInput } from "./worksite_preparation_contracts.js";
import { type WorksiteCommandExecutionLimits, type WorksiteDeclaredCommandInput, type WorksiteOutcomePredicateInput } from "./worksite_command_execution.js";
import { type WorksiteContextObservation } from "./worksite_effect.js";
export declare function semanticJobRelativePath(path: string, root?: boolean): boolean;
export declare function semanticJobPathWithin(path: string, roots: readonly string[]): boolean;
export interface SemanticJobExecutionCapability {
    readonly executable: string;
    readonly relativeCwdRoots: readonly string[];
    readonly environment: Readonly<Record<string, string>>;
    readonly maxTimeoutMs: number;
    readonly maxTerminationGraceMs: number;
}
export interface SemanticJobInput {
    readonly kind: "semantic_job_input";
    readonly schemaVersion: "5.0.0";
    readonly lifecycleRef: string;
    readonly sourceRoleRef: string;
    readonly members: readonly {
        readonly memberRef: string;
        readonly path: string;
        readonly sourceLocator: string;
        readonly base64: string;
    }[];
    readonly taskData: Readonly<Record<string, JsonValue>>;
    readonly evaluationData: Readonly<Record<string, JsonValue>>;
    readonly worksiteScope: {
        readonly readRoots: readonly string[];
        readonly writeRoots: readonly string[];
        readonly parentWriteRoots: readonly string[];
        readonly evidenceWriteRoots: readonly string[];
        readonly executableCapabilities: readonly SemanticJobExecutionCapability[];
    };
}
export declare const SEMANTIC_JOB_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"semantic_job_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly lifecycleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceRoleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly base64: v.StringSchema<undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        memberRef: string;
        path: string;
        sourceLocator: string;
        base64: string;
    }[], 1, undefined>]>;
    readonly taskData: v.RecordSchema<v.StringSchema<undefined>, v.UnknownSchema, undefined>;
    readonly evaluationData: v.RecordSchema<v.StringSchema<undefined>, v.UnknownSchema, undefined>;
    readonly worksiteScope: v.StrictObjectSchema<{
        readonly readRoots: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly writeRoots: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly parentWriteRoots: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evidenceWriteRoots: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly executableCapabilities: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly executable: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly relativeCwdRoots: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly environment: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly maxTimeoutMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
            readonly maxTerminationGraceMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            executable: string;
            relativeCwdRoots: string[];
            environment: {
                [x: string]: string;
            };
            maxTimeoutMs: number;
            maxTerminationGraceMs: number;
        }[], 1, undefined>]>;
    }, undefined>;
}, undefined>;
export declare function isSemanticJobInput(value: unknown): value is SemanticJobInput;
export declare function constructSemanticJobInput(value: SemanticJobInput): Readonly<SemanticJobInput>;
export interface SemanticJobBasis {
    readonly jobRef: string;
    readonly jobDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly rootExecutionBasisRef: string;
    readonly rootInputRef: string;
    readonly rootInputDigest: Sha256Digest;
    readonly declarationDigest: Sha256Digest;
    readonly intakeCCallRef: string;
    readonly intakeCCallDigest: Sha256Digest;
    readonly intakeExecutionBasisRef: string;
}
export declare function semanticJobIdentity(input: SemanticJobInput, declaration: SemanticJobLifecycleDeclaration, coordinate: Pick<SemanticJobBasis, "invocationAdmissionRef" | "rootExecutionBasisRef" | "rootInputRef" | "rootInputDigest">): {
    jobRef: string;
    jobDigest: `sha256:${string}`;
};
export declare function semanticJobSourceContext(job: SemanticJobInput, jobRef: string): Readonly<ContextDeclaration>;
export declare function semanticJobSourceText(envelope: SemanticJobEnvelope): {
    memberRef: string;
    path: string;
    sourceLocator: string;
    text: string;
}[];
export declare function groundSemanticJobQuote(envelope: SemanticJobEnvelope, selected: SemanticSourceQuote): RequirementTerm["sourceBindings"][number] | null;
export interface SemanticJobBindingCandidate {
    readonly requirement: {
        readonly kind: "existing" | "candidate";
        readonly ref: string;
    };
    readonly previousVersionRef: string | null;
    readonly templateRef: string;
    readonly scope: string;
    readonly realizationMeaning: readonly string[];
    readonly proofMeaning: readonly string[];
    readonly unprovedScope: readonly string[];
    readonly closureRule: string;
    readonly requiredContent: readonly string[];
}
export interface SemanticJobDesign {
    readonly targets: readonly {
        readonly relativePath: string;
        readonly role: "implementation" | "verifier" | "configuration";
        readonly obligationRefs: readonly string[];
        readonly bindingVersionRefs: readonly string[];
        readonly changeInstruction: string;
    }[];
    readonly dependencyPaths: readonly string[];
    readonly dependencyDisposition: "sufficient" | "unknown";
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
}
export interface SemanticJobAssetCandidate {
    readonly kind: "semantic_job_asset_candidate";
    readonly schemaVersion: "5.0.0";
    readonly asset: SemanticAssetCandidate;
    readonly bindings: readonly SemanticJobBindingCandidate[];
    readonly design: SemanticJobDesign | null;
}
export declare function isSemanticJobAssetCandidate(value: unknown): value is SemanticJobAssetCandidate;
declare const designResponseSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"semantic_job_design_response", undefined>;
    readonly bindings: v.TupleSchema<[], undefined>;
    readonly asset: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"semantic_stage_asset_candidate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly statements: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly statementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly modality: v.PicklistSchema<["normative", "supporting", "speculative", "conflicting"], undefined>;
            readonly sourceQuotes: v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>;
                readonly quote: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
            readonly requirementRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
            readonly obligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
            readonly predecessorStatementRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            statementRef: string;
            text: string;
            modality: "conflicting" | "normative" | "supporting" | "speculative";
            sourceQuotes: {
                memberRef: number;
                quote: string;
            }[];
            requirementRefs: number[];
            obligationRefs: number[];
            predecessorStatementRefs: number[];
        }[], 1, undefined>]>;
        readonly requirementCandidates: v.TupleSchema<[], undefined>;
        readonly worksiteDesign: v.NullSchema<undefined>;
        readonly pressure: v.ArraySchema<v.StrictObjectSchema<{
            readonly pressureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requirementRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
            readonly disposition: v.PicklistSchema<["pending", "conflicting", "unassessed"], undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly design: v.NullableSchema<v.StrictObjectSchema<{
        readonly targets: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly relativePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly role: v.PicklistSchema<["implementation", "verifier", "configuration"], undefined>;
            readonly obligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
            readonly bindingVersionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MaxValueAction<number, number, undefined>]>, undefined>;
            readonly changeInstruction: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            relativePath: string;
            role: "configuration" | "implementation" | "verifier";
            obligationRefs: number[];
            bindingVersionRefs: number[];
            changeInstruction: string;
        }[], 1, undefined>]>;
        readonly dependencyPaths: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly dependencyDisposition: v.PicklistSchema<["sufficient", "unknown"], undefined>;
        readonly commands: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly executable: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly args: v.ArraySchema<v.StringSchema<undefined>, undefined>;
            readonly relativeCwd: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly environment: v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>;
            readonly timeoutMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
            readonly terminationGraceMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
            readonly expectedReports: v.ArraySchema<v.StrictObjectSchema<{
                readonly reportIdentity: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly relativePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            commandId: string;
            executable: string;
            args: string[];
            relativeCwd: string;
            environment: {
                [x: string]: string;
            };
            timeoutMs: number;
            terminationGraceMs: number;
            expectedReports: {
                reportIdentity: string;
                relativePath: string;
            }[];
        }[], 1, undefined>]>;
        readonly outcomePredicates: v.ArraySchema<v.StrictObjectSchema<{
            readonly predicateId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly predicateKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly declaration: v.UnknownSchema;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
}, undefined>;
export declare function isSemanticJobDesignResponse(value: unknown): value is v.InferOutput<typeof designResponseSchema>;
export declare function semanticJobUsesDesignResponse(role: "author" | "assessor", capabilities: readonly string[]): boolean;
/** Expand only declared reference fields; arbitrary JSON and all authored
 * meaning remain untouched. Canonical admission/assessment are separate. */
export declare function materializeSemanticJobDesignResponse(input: SemanticJobEnvelope | SemanticJobRevisionEnvelope, stageRef: string, raw: unknown): Readonly<SemanticJobAssetCandidate> | null;
export interface SemanticJobAsset {
    readonly assetRef: string;
    readonly assetDigest: Sha256Digest;
    readonly stageRef: string;
    readonly candidate: SemanticJobAssetCandidate;
    readonly groundedTerms: readonly RequirementTerm[];
    readonly source: SemanticActorSource;
    readonly assessment: {
        readonly candidate: SemanticAssessmentCandidate;
        readonly source: SemanticActorSource;
        readonly disposition: "satisfied" | "falsified" | "indeterminate";
    } | null;
}
export interface SemanticJobBindingVersion {
    readonly versionRef: string;
    readonly versionDigest: Sha256Digest;
    readonly jobRef: string;
    readonly jobDigest: Sha256Digest;
    readonly ordinal: number;
    readonly previousVersionRef: string | null;
    readonly previousVersionDigest: Sha256Digest | null;
    readonly templateRef: string;
    readonly templateDigest: Sha256Digest;
    readonly introducingAssetRef: string;
    readonly introducingAssetDigest: Sha256Digest;
    readonly assessmentSource: SemanticActorSource;
    readonly binding: GtlContractFulfillmentBinding;
    readonly policy: SemanticProofPolicy;
    readonly shape: SemanticProofShape;
}
export interface SemanticJobEnvelope {
    readonly kind: "semantic_stage_envelope";
    readonly schemaVersion: "5.0.0";
    readonly job: SemanticJobInput;
    readonly declaration: SemanticJobLifecycleDeclaration;
    readonly basis: SemanticJobBasis;
    readonly sourceContext: ContextDeclaration;
    readonly assets: readonly SemanticJobAsset[];
    readonly bindingVersions: readonly SemanticJobBindingVersion[];
    readonly context: WorksiteContextObservation | null;
    readonly worksite: SemanticWorksiteBasis | null;
    readonly evidence: SemanticEvidenceInput | null;
    readonly applicationCoverage: "non_closing";
    readonly remainingGaps: readonly string[];
}
export declare function projectSemanticJobBindings(envelope: SemanticJobEnvelope): readonly SemanticJobBindingVersion[] | null;
export declare function isSemanticJobEnvelope(value: unknown): value is SemanticJobEnvelope;
export declare function constructSemanticJobEnvelope(job: SemanticJobInput, declaration: SemanticJobLifecycleDeclaration, coordinate: Omit<SemanticJobBasis, "jobRef" | "jobDigest" | "declarationDigest">): Readonly<SemanticJobEnvelope>;
export interface SemanticJobContractIssue {
    readonly path: string;
    readonly rule: string;
    readonly expected: JsonValue;
    readonly actual: JsonValue;
}
/** One Product-owned reference and coverage relation. Assembly renders this
 * projection; native validators consume the same domains, not prompt copies. */
export declare function projectSemanticJobActorContract(envelope: SemanticJobEnvelope, stageRef: string, role: "author" | "assessor", retainedTerms?: readonly RequirementTerm[], executionLimits?: WorksiteCommandExecutionLimits): Readonly<{
    contractDigest: `sha256:${string}`;
    kind: string;
    schemaVersion: string;
    stageRef: string;
    role: "author" | "assessor";
    sourceMemberRefs: string[];
    quoteRule: string;
    requirementRefs: string[];
    obligationRefs: string[];
    predecessorStatementRefs: string[];
    currentCandidate: {
        assetRef: string;
        statementRefs: string[];
    } | null;
    templateRefs: string[];
    criteria: string[];
    capabilities: readonly ("requirement_refinement" | "worksite_design" | "application_assessment")[];
    bindingRule: {
        candidate: string;
        existing: string;
        activation: string;
        previousVersions: {
            requirementRef: string;
            versionRef: string;
        }[];
        newPreviousVersionRef: null;
    };
    design: {
        dependencyRule: string;
        readinessRule: string;
        executionCapacity?: {
            selectedLimits: WorksiteCommandExecutionLimits;
            budgetRule: Readonly<{
                aggregation: "sum";
                commandFields: readonly ["timeoutMs", "terminationGraceMs"];
                httpResponseFields: {
                    readonly launch: readonly ["timeoutMs", "terminationGraceMs"];
                    readonly request: readonly ["timeoutMs"];
                };
                ownerAllowanceMs: number;
                limitComparison: "required_budget_strictly_less_than_each_limit";
                limitOrdering: "absolute_strictly_greater_than_inactivity";
            }>;
            currentCandidate: {
                commandBudgetMs: number;
                httpProbeBudgetMs: number;
                requiredExecutionBudgetMs: number;
                compatible: boolean;
            } | null;
        };
        groundedRequirementRefs: string[];
        active: {
            requirementRef: string;
            obligationRef: string;
            versionRef: string;
        }[];
        targetRoles: string[];
        scope: {
            readonly readRoots: readonly string[];
            readonly writeRoots: readonly string[];
            readonly parentWriteRoots: readonly string[];
            readonly evidenceWriteRoots: readonly string[];
            readonly executableCapabilities: readonly SemanticJobExecutionCapability[];
        };
        bounds: {
            readonly maxSourceMembers: number;
            readonly maxSourceBytes: number;
            readonly maxContextFiles: number;
            readonly maxContextBytes: number;
            readonly maxTargets: number;
            readonly maxCommands: number;
        };
        coverageRules: string[];
        pathRule: string;
        commandRule: string;
    };
}>;
/** Transport coordinates remain in the admitted envelope, not duplicated as
 * actor instructions. Only explicitly declared predecessor semantics render. */
export declare function projectSemanticJobActorContext(envelope: SemanticJobEnvelope, stageRef: string, role: "author" | "assessor"): Readonly<{
    predecessors: {
        assetRef: string;
        assetDigest: `sha256:${string}`;
        stageRef: string;
        candidate: SemanticJobAssetCandidate;
        groundedTerms: readonly RequirementTerm[];
        assessment: {
            disposition: "satisfied" | "falsified" | "indeterminate";
            assessmentDigest: `sha256:${string}`;
        } | null;
    }[];
    currentCandidate: {
        assetRef: string;
        assetDigest: `sha256:${string}`;
        stageRef: string;
        candidate: SemanticJobAssetCandidate;
        groundedTerms: readonly RequirementTerm[];
        assessment: {
            disposition: "satisfied" | "falsified" | "indeterminate";
            assessmentDigest: `sha256:${string}`;
        } | null;
    } | null;
    activeBindings: {
        versionRef: string;
        versionDigest: `sha256:${string}`;
        templateRef: string;
        previousVersionRef: string | null;
        binding: GtlContractFulfillmentBinding;
        policy: SemanticProofPolicy;
        shape: SemanticProofShape;
    }[];
    omitted: string[];
}>;
/** One assembly's contract and context share the same established binding
 * projection. Standalone entrypoints above still establish their own input;
 * callers cannot supply a fabricated precomputed binding set. */
export declare function projectSemanticJobActorMaterial(envelope: SemanticJobEnvelope, stageRef: string, role: "author" | "assessor", retainedTerms?: readonly RequirementTerm[], executionLimits?: WorksiteCommandExecutionLimits): {
    active: readonly SemanticJobBindingVersion[];
    contract: Readonly<{
        contractDigest: `sha256:${string}`;
        kind: string;
        schemaVersion: string;
        stageRef: string;
        role: "author" | "assessor";
        sourceMemberRefs: string[];
        quoteRule: string;
        requirementRefs: string[];
        obligationRefs: string[];
        predecessorStatementRefs: string[];
        currentCandidate: {
            assetRef: string;
            statementRefs: string[];
        } | null;
        templateRefs: string[];
        criteria: string[];
        capabilities: readonly ("requirement_refinement" | "worksite_design" | "application_assessment")[];
        bindingRule: {
            candidate: string;
            existing: string;
            activation: string;
            previousVersions: {
                requirementRef: string;
                versionRef: string;
            }[];
            newPreviousVersionRef: null;
        };
        design: {
            dependencyRule: string;
            readinessRule: string;
            executionCapacity?: {
                selectedLimits: WorksiteCommandExecutionLimits;
                budgetRule: Readonly<{
                    aggregation: "sum";
                    commandFields: readonly ["timeoutMs", "terminationGraceMs"];
                    httpResponseFields: {
                        readonly launch: readonly ["timeoutMs", "terminationGraceMs"];
                        readonly request: readonly ["timeoutMs"];
                    };
                    ownerAllowanceMs: number;
                    limitComparison: "required_budget_strictly_less_than_each_limit";
                    limitOrdering: "absolute_strictly_greater_than_inactivity";
                }>;
                currentCandidate: {
                    commandBudgetMs: number;
                    httpProbeBudgetMs: number;
                    requiredExecutionBudgetMs: number;
                    compatible: boolean;
                } | null;
            };
            groundedRequirementRefs: string[];
            active: {
                requirementRef: string;
                obligationRef: string;
                versionRef: string;
            }[];
            targetRoles: string[];
            scope: {
                readonly readRoots: readonly string[];
                readonly writeRoots: readonly string[];
                readonly parentWriteRoots: readonly string[];
                readonly evidenceWriteRoots: readonly string[];
                readonly executableCapabilities: readonly SemanticJobExecutionCapability[];
            };
            bounds: {
                readonly maxSourceMembers: number;
                readonly maxSourceBytes: number;
                readonly maxContextFiles: number;
                readonly maxContextBytes: number;
                readonly maxTargets: number;
                readonly maxCommands: number;
            };
            coverageRules: string[];
            pathRule: string;
            commandRule: string;
        };
    }>;
    context: Readonly<{
        predecessors: {
            assetRef: string;
            assetDigest: `sha256:${string}`;
            stageRef: string;
            candidate: SemanticJobAssetCandidate;
            groundedTerms: readonly RequirementTerm[];
            assessment: {
                disposition: "satisfied" | "falsified" | "indeterminate";
                assessmentDigest: `sha256:${string}`;
            } | null;
        }[];
        currentCandidate: {
            assetRef: string;
            assetDigest: `sha256:${string}`;
            stageRef: string;
            candidate: SemanticJobAssetCandidate;
            groundedTerms: readonly RequirementTerm[];
            assessment: {
                disposition: "satisfied" | "falsified" | "indeterminate";
                assessmentDigest: `sha256:${string}`;
            } | null;
        } | null;
        activeBindings: {
            versionRef: string;
            versionDigest: `sha256:${string}`;
            templateRef: string;
            previousVersionRef: string | null;
            binding: GtlContractFulfillmentBinding;
            policy: SemanticProofPolicy;
            shape: SemanticProofShape;
        }[];
        omitted: string[];
    }>;
} | null;
/** Prompt-only sharing of identical bodies already visible in the same prompt.
 * The conserved context, validator domains and C1 projection remain unchanged. */
export declare function projectSemanticJobPromptContext(envelope: SemanticJobEnvelope, context: ReturnType<typeof projectSemanticJobActorContext>): Readonly<{
    predecessors: ({
        assetRef: string;
        assetDigest: `sha256:${string}`;
        stageRef: string;
        candidate: SemanticJobAssetCandidate;
        groundedTerms: readonly RequirementTerm[];
        assessment: {
            disposition: "satisfied" | "falsified" | "indeterminate";
            assessmentDigest: `sha256:${string}`;
        } | null;
    } | {
        groundedRequirementRefs: string[];
        assetRef: string;
        assetDigest: `sha256:${string}`;
        stageRef: string;
        candidate: SemanticJobAssetCandidate;
        assessment: {
            disposition: "satisfied" | "falsified" | "indeterminate";
            assessmentDigest: `sha256:${string}`;
        } | null;
    })[];
    activeBindings: ({
        versionRef: string;
        versionDigest: `sha256:${string}`;
        templateRef: string;
        previousVersionRef: string | null;
        binding: GtlContractFulfillmentBinding;
        policy: SemanticProofPolicy;
        shape: SemanticProofShape;
    } | {
        policy: {
            proposalSource: {
                assetRef: string;
                bindingIndex: number;
            };
            policyRef: string;
            sourceRequirementRef: string;
            sourceBindings: RequirementTerm["sourceBindings"];
            obligationRef: string;
        };
        versionRef: string;
        versionDigest: `sha256:${string}`;
        templateRef: string;
        previousVersionRef: string | null;
        binding: GtlContractFulfillmentBinding;
        shape: SemanticProofShape;
    })[];
    currentCandidate: {
        assetRef: string;
        assetDigest: `sha256:${string}`;
        stageRef: string;
        candidate: SemanticJobAssetCandidate;
        groundedTerms: readonly RequirementTerm[];
        assessment: {
            disposition: "satisfied" | "falsified" | "indeterminate";
            assessmentDigest: `sha256:${string}`;
        } | null;
    } | null;
    omitted: string[];
}>;
export declare function evaluateSemanticJobActorCandidate(envelope: SemanticJobEnvelope, stageRef: string, role: "author" | "assessor", raw: unknown, retainedTerms?: readonly RequirementTerm[], executionLimits?: WorksiteCommandExecutionLimits): readonly SemanticJobContractIssue[];
export declare function deriveSemanticJobAsset(envelope: SemanticJobEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource, retainedTerms?: readonly RequirementTerm[], onContractIssues?: (issues: readonly SemanticJobContractIssue[]) => void, executionLimits?: WorksiteCommandExecutionLimits): Readonly<SemanticJobEnvelope> | null;
export declare function deriveSemanticJobAssessment(envelope: SemanticJobEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource, retainedTerms?: readonly RequirementTerm[], executionLimits?: WorksiteCommandExecutionLimits): Readonly<SemanticJobEnvelope> | null;
/** Coverage required to author a worksite Design, not to admit partial refinement. */
export declare function semanticJobMissingBindingRequirementRefs(envelope: SemanticJobEnvelope, active: readonly SemanticJobBindingVersion[]): readonly string[];
export declare function semanticJobDesignIssues(envelope: SemanticJobEnvelope, design: SemanticJobDesign, executionLimits?: WorksiteCommandExecutionLimits): readonly SemanticJobContractIssue[];
export declare function semanticJobDesignMatches(envelope: SemanticJobEnvelope, design: SemanticJobDesign, executionLimits?: WorksiteCommandExecutionLimits): boolean;
export declare function semanticJobAssessmentDomain(envelope: SemanticJobEnvelope): {
    assetRef: string;
    statementRefs: string[];
} | null;
/** Pure projection of already observed context. Native owners establish its
 * admission/currentness; this never observes a file or grants a write. */
export declare function deriveSemanticJobReadDependencies(envelope: SemanticJobEnvelope, operating: Pick<SemanticWorksiteBasis, "workspaceAuthorityBasis" | "workspaceBinding">): import("./worksite_command_execution.js").WorksiteReadDependencyBasis | undefined;
export declare function deriveSemanticJobPreparation(envelope: SemanticJobEnvelope, worksite: SemanticWorksiteBasis, revision?: {
    readonly selectedPaths: readonly string[];
    readonly feedback: JsonValue;
}): Readonly<WorksiteCommandPreparationInput> | null;
export declare function semanticJobWorkerResultSchema(role: "author" | "assessor", capabilities: readonly ("requirement_refinement" | "worksite_design" | "application_assessment")[], designReferences?: ReturnType<typeof projectSemanticJobActorContract>): Readonly<Record<string, JsonValue>>;
/** Domain relation only. ABG separately authenticates exact producers/ancestry. */
export declare function evaluateSemanticJobRelation(predicateRef: string, input: unknown, output: unknown): boolean | null;
/** Native workspace realization of the same semantic algebra. These pure
 * projections do not grant admission; abg/semantic_job authenticates each
 * actual native producer and its separate deterministic projection. */
export declare const NATIVE_SEMANTIC_ASSESSMENT_CONTRACT: Readonly<{
    readonly contractRef: "contract://abiogenesis/semantic-stage/native-assessment@5";
    readonly contractVersion: "5.0.0";
    readonly contractKind: "output";
    readonly valueKind: "semantic_stage_assessment_candidate";
}>;
export declare const NATIVE_SEMANTIC_ASSESSMENT_SCHEMA: Readonly<{
    $schema: string;
    $id: "contract://abiogenesis/semantic-stage/native-assessment@5";
}>;
export declare const NATIVE_SEMANTIC_ASSESSMENT_SCHEMA_TEXT: string;
export type NativeSemanticOperating = Pick<SemanticWorksiteBasis, "workspaceAuthorityBasis" | "workspaceBinding" | "capabilityGrant">;
export declare function nativeSemanticCommandExecutionLimits(envelope: SemanticJobEnvelope): WorksiteCommandExecutionLimits | null;
export declare function nativeSemanticPaths(envelope: SemanticJobEnvelope): {
    assets: {
        stageRef: string;
        path: string;
    }[];
    rubricPath: string;
};
export declare function nativeSemanticContextMatches(envelope: SemanticJobEnvelope, context: WorksiteContextObservation, admittedRevision?: boolean): boolean;
export declare function nativeSemanticAssetSource(envelope: SemanticJobEnvelope, stageRef: string, observation: NativeWorkspaceWorkObservation, adapter: {
    readonly cCallRef: string;
    readonly inputDigest: Sha256Digest;
}): SemanticActorSource;
export declare function deriveNativeSemanticAsset(envelope: SemanticJobEnvelope, stageRef: string, observation: NativeWorkspaceWorkObservation, adapter: {
    readonly cCallRef: string;
    readonly inputDigest: Sha256Digest;
}, onContractIssues?: (issues: readonly SemanticJobContractIssue[]) => void): Readonly<SemanticJobEnvelope> | null;
export declare function deriveNativeSemanticAssessment(envelope: SemanticJobEnvelope, stageRef: string, observation: NativeWorkspaceWorkObservation, adapter: {
    readonly cCallRef: string;
    readonly inputDigest: Sha256Digest;
}): Readonly<SemanticJobEnvelope> | null;
/** Value projection only. ABG separately authenticates the native producers and
 * same-Run predecessor before admitting these observed artifact bytes. */
export declare function nativeSemanticEvidenceArtifacts(envelope: SemanticJobEnvelope, value: unknown, revision?: NativeSemanticRevisionConstruction): SemanticEvidenceInput["artifacts"] | null;
export declare function constructNativeSemanticTask(envelope: SemanticJobEnvelope, stageRef: string, role: "author" | "assessor", operating: NativeSemanticOperating, context: WorksiteContextObservation): Readonly<NativeWorkspaceWorkTask>;
export interface NativeSemanticRevisionConstruction {
    readonly selectedPaths: readonly string[];
    readonly feedback: JsonValue;
    readonly executionLimits: WorksiteCommandExecutionLimits;
}
export declare function constructNativeSemanticConstructionTask(envelope: SemanticJobEnvelope, operating: NativeSemanticOperating, context: WorksiteContextObservation, revision?: NativeSemanticRevisionConstruction): Readonly<NativeWorkspaceWorkTask>;
export declare function constructNativeSemanticExecutionTask(envelope: SemanticJobEnvelope, source: NativeWorkspaceWorkObservation, revision?: NativeSemanticRevisionConstruction): Readonly<NativeWorksiteCommandExecutionTask>;
/** Shape/meaning consequence only; native admission validates the exact owner
 * source and projection CCalls separately before this judgment can advance. */
export declare function evaluateNativeSemanticRelation(predicate: string, input: unknown, output: unknown): boolean | null;
export {};
