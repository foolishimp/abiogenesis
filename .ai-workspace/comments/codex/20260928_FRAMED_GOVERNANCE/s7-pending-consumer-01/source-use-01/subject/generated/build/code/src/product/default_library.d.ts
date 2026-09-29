import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import type { NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";
import { type WorksiteContextObservation } from "./worksite_effect.js";
export * from "./default_library_fulfillment.js";
export { governanceRef, governanceContract } from "./default_library_identity.js";
export declare const GOVERNANCE_PURPOSES: readonly ["induction", "specification", "design", "construction", "testing", "uat"];
export type GovernancePurpose = typeof GOVERNANCE_PURPOSES[number];
export declare const GOVERNANCE_OPERATIONS: readonly ["prepare-selection", "select", "evaluate-parent", "prepare-native", "prepare-testing", "fold", "project-choice"];
export type GovernanceOperation = typeof GOVERNANCE_OPERATIONS[number];
export declare const GOVERNANCE_IMPLEMENTATION_REFS: string[];
export declare const DEFAULT_LIBRARY_POLICY = "Ordinary conditional governance capabilities. Preserve the complete original task, source, selected authority, valid work and unresolved outcomes. Reuse sufficient existing artifacts without rerunning their authors. Missing capability or authority remains an explicit gap. Open interpretation, suitability and sufficiency are native F_P judgments; deterministic adapters only project declared data and admitted observations. A completed child or successful measurement does not establish application success. Testing records actual commands, streams and predicates, including failures. UAT independently assesses the original source, exact candidate, rubric and current admitted execution evidence. Only the parent projects the independent verdict into its declared termination rule. No mandatory stage order, caller loop, invented source, claimed execution file or generated runtime graph.\n";
export declare const GOVERNANCE_POLICIES: Readonly<Record<GovernancePurpose, string>>;
declare const judgmentSchema: v.StrictObjectSchema<{
    readonly interpretation: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly contribution: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly supportRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly dependsOn: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly gaps: v.ArraySchema<v.StrictObjectSchema<{
        readonly supportRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly nextGraphFunctionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly nextReason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly nextEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly subjectEvidenceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly revisionReason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly revisionEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly requirementProposals: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly candidateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly meaning: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceQuotes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly quote: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            quote: string;
        }[], 1, undefined>]>;
        readonly predecessorRequirementRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>, undefined>;
}, undefined>;
declare const synthesisBasisSchema: v.StrictObjectSchema<{
    readonly inputRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly environmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly frameEvidenceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly frameRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly previousResultRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
declare const stateSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"governance_work_state", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly original: v.StrictObjectSchema<{
        readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            path: string;
            digest: string;
        }[], 1, undefined>]>;
        readonly requiredSupportRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly authorityRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly readRoots: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly maxContextFiles: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxContextBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly maxPromptBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly workOrders: v.RecordSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.StrictObjectSchema<{
            readonly outcome: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly instructions: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly readFirst: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly writeRoots: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly checks: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
        readonly testing: v.StrictObjectSchema<{
            readonly selectedPaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly commands: v.ArraySchema<v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>, undefined>;
            readonly outcomePredicates: v.ArraySchema<v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>, undefined>;
            readonly allowedWriteTerritories: v.ArraySchema<v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>, undefined>;
        }, undefined>;
        readonly assessment: v.StrictObjectSchema<{
            readonly sources: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly candidatePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rubricPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly resultContract: v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>;
            readonly schemaAsset: v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>;
            readonly verdictField: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly satisfiedValue: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
        readonly fulfillment: v.OptionalSchema<v.CustomSchema<{
            profileRef: string;
            context: {
                contextRef: string;
                sourceLocator: string;
                inventoryDigest: string;
                members: {
                    memberRef: string;
                    path: string;
                    byteCount: number;
                    digest: string;
                }[];
            };
            terms: {
                requirementRef: string;
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[];
            bindings: {
                obligationRef: string;
                requirementRef: string;
                realizationContractRef: string | null;
                proofContractRef: string | null;
                proofPolicyRef: string | null;
                proofShapeRef: string | null;
            }[];
            policies: {
                policyRef: string;
                sourceRequirementRef: string;
                sourceBindings: {
                    contextRef: string;
                    memberRef: string;
                    memberDigest: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
                scope: string;
                realizationMeaning: string[];
                proofMeaning: string[];
                unprovedScope: string[];
                closureRule: string;
                obligationRef: string;
            }[];
            shapes: {
                proofShapeRef: string;
                requiredEvidenceRoles: ("realization" | "verifier_artifact" | "verifier_execution" | "semantic_assessment")[];
                sharedBasis: string[];
                requiredContent: string[];
                nativeCarrierBoundary: string;
                requirementRef: string;
                obligationRef: string;
                roleContractRefs: {
                    realization: string;
                    proof: string;
                };
            }[];
            completeness: {
                policyRef: string;
                semanticCriteria: string[];
                depthClasses: {
                    classRef: string;
                    permitsNonApplicability: boolean;
                }[];
                strengthRuleRef: string;
                adverseCommands: {
                    commandId: string;
                    disposition: "zero" | "nonzero";
                }[];
            }[];
            discoveryClasses: {
                classRef: string;
                ruleRef: string;
                templatePolicyRef: string | null;
                templateShapeRef: string | null;
            }[];
            assessmentContractRef: string;
        }, undefined>, undefined>;
    }, undefined>;
    readonly synthesis: v.NullableSchema<v.StrictObjectSchema<{
        readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly basis: v.StrictObjectSchema<{
            readonly inputRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly environmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly frameEvidenceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly frameRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly previousResultRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>;
        readonly judgment: v.StrictObjectSchema<{
            readonly interpretation: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly contributions: v.ArraySchema<v.StrictObjectSchema<{
                readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly contribution: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly supportRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly dependsOn: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
            readonly gaps: v.ArraySchema<v.StrictObjectSchema<{
                readonly supportRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
            readonly nextGraphFunctionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly nextReason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly nextEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly subjectEvidenceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly revisionReason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly revisionEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly requirementProposals: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly candidateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly meaning: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceQuotes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly quote: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    memberRef: string;
                    quote: string;
                }[], 1, undefined>]>;
                readonly predecessorRequirementRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>, undefined>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly observations: v.ArraySchema<v.StrictObjectSchema<{
        readonly purpose: v.PicklistSchema<readonly ["induction", "specification", "design", "construction", "testing", "uat"], undefined>;
        readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorInvocationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly synthesisResultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly selectedGraphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly value: v.CustomSchema<Readonly<Record<string, JsonValue>>, undefined>;
        readonly fulfillmentEvidence: v.OptionalSchema<v.StrictObjectSchema<{
            readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly resultDigest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly actorInvocationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly kind: v.PicklistSchema<["native", "execution", "assessment"], undefined>;
            readonly files: v.ArraySchema<v.StrictObjectSchema<{
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly dependencies: v.ArraySchema<v.StrictObjectSchema<{
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly commands: v.ArraySchema<v.StrictObjectSchema<{
                readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly exitStatus: v.NullableSchema<v.NumberSchema<undefined>, undefined>;
                readonly timedOut: v.BooleanSchema<undefined>;
            }, undefined>, undefined>;
            readonly assessmentContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly producerResultRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly producerActorRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly unresolvedSupportRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly terminal: v.BooleanSchema<undefined>;
    readonly fulfillment: v.OptionalSchema<v.StrictObjectSchema<{
        readonly additions: v.ArraySchema<v.StrictObjectSchema<{
            readonly candidateRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly meaning: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proposalDigest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly introducedByResultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly term: v.StrictObjectSchema<{
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
            readonly binding: v.StrictObjectSchema<{
                readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly requirementRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly realizationContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly proofContractRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly proofPolicyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly proofShapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>;
            readonly policy: v.NullableSchema<v.StrictObjectSchema<{
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
            readonly shape: v.NullableSchema<v.StrictObjectSchema<{
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
            readonly completeness: v.NullableSchema<v.StrictObjectSchema<{
                readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly semanticCriteria: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly depthClasses: v.ArraySchema<v.StrictObjectSchema<{
                    readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly permitsNonApplicability: v.BooleanSchema<undefined>;
                }, undefined>, undefined>;
                readonly strengthRuleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly adverseCommands: v.ArraySchema<v.StrictObjectSchema<{
                    readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly disposition: v.PicklistSchema<["nonzero", "zero"], undefined>;
                }, undefined>, undefined>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
            readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly disposition: v.PicklistSchema<["eligible", "open", "stale"], undefined>;
            readonly gaps: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly assessmentResultRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly supportResultRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly dependencies: v.ArraySchema<v.StrictObjectSchema<{
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export type GovernanceWorkState = v.InferOutput<typeof stateSchema>;
export type GovernanceObservation = GovernanceWorkState["observations"][number];
export type GovernanceOriginal = GovernanceWorkState["original"];
export declare function isGovernanceWorkState(value: unknown): value is GovernanceWorkState;
export declare function constructGovernanceWorkState(original: GovernanceOriginal): Readonly<GovernanceWorkState>;
/** A source-use candidate, not evidence admission. The original state remains
 * immutable; current invocation/observation owners establish applicability. */
export declare function retainedGovernanceWorkInput(value: unknown): Readonly<GovernanceWorkState> | null;
export declare function governanceTestingConfiguration(state: GovernanceWorkState): {
    commands: readonly WorksiteDeclaredCommandInput[];
    outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
};
export declare function governanceAssessmentContract(state: GovernanceWorkState): {
    sources: readonly string[];
    candidatePath: string;
    rubricPath: string;
    resultContract: NativeWorkspaceAssessmentSelection["resultContract"];
    schemaAsset: NativeWorkspaceAssessmentSelection["schemaAsset"];
    verdictField: string;
    satisfiedValue: string;
};
/** This reads a declared scalar verdict only. The owned parent projection additionally
 * establishes the independent assessment's current producer and causal relation. */
export declare function governanceVerdict(state: GovernanceWorkState): boolean;
export type FramedSynthesisJudgment = v.InferOutput<typeof judgmentSchema>;
export type FramedSynthesisBasis = v.InferOutput<typeof synthesisBasisSchema>;
export interface FramedSynthesisTarget {
    readonly graphFunctionRef: string;
    readonly definitionDigest: `sha256:${string}`;
    readonly purpose: GovernancePurpose;
}
export interface FramedSynthesisTask {
    readonly kind: "framed_synthesis_task";
    readonly schemaVersion: "5.0.0";
    readonly state: GovernanceWorkState;
    readonly context: WorksiteContextObservation;
}
export interface FramedSynthesisResult {
    readonly kind: "framed_synthesis_result";
    readonly schemaVersion: "5.0.0";
    readonly state: GovernanceWorkState;
    readonly basis: FramedSynthesisBasis;
    readonly judgment: FramedSynthesisJudgment;
}
export declare function isFramedSynthesisJudgment(value: unknown): value is FramedSynthesisJudgment;
export declare function isFramedSynthesisTask(value: unknown): value is FramedSynthesisTask;
export declare function isFramedSynthesisResult(value: unknown): value is FramedSynthesisResult;
export declare function framedSynthesisEvidenceRefs(task: FramedSynthesisTask): readonly string[];
/** Presentation over the already-bound task. Integrity/authority carriers stay
 * in that task; this projection neither chooses evidence nor judges adequacy. */
export declare function projectFramedSynthesisPromptTask(task: FramedSynthesisTask): Readonly<Record<string, JsonValue>>;
/** One strict binder, shared by raw completion and admission. It transports no
 * provider edits to original state and stores no previous bound Result body. */
export declare function bindFramedSynthesisResult(task: FramedSynthesisTask, targets: readonly FramedSynthesisTarget[], basis: FramedSynthesisBasis, raw: unknown): Readonly<FramedSynthesisResult> | null;
export declare function framedSynthesisResponseSchema(task: FramedSynthesisTask, targets: readonly FramedSynthesisTarget[]): Readonly<Record<string, JsonValue>>;
