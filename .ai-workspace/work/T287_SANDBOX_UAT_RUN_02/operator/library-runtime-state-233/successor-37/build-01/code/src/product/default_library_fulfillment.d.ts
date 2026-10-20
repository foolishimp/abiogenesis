import * as v from "valibot";
import type { ContractDeclaration, GtlProgram } from "../gtl/contracts.js";
import type { WorksiteContextObservation } from "./worksite_effect.js";
import type { JsonValue } from "../shared/canonical_json.js";
export declare const GOVERNANCE_FULFILLMENT_PROFILE: string;
export declare const GOVERNANCE_FULFILLMENT_STRENGTH: string;
export declare const GOVERNANCE_FULFILLMENT_DISCOVERY: string;
declare const file: v.StrictObjectSchema<{
    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly digest: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const GOVERNANCE_FULFILLMENT_DECLARATION_SCHEMA: v.StrictObjectSchema<{
    readonly profileRef: v.LiteralSchema<string, undefined>;
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
    readonly bindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
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
    readonly policies: v.ArraySchema<v.StrictObjectSchema<{
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
    readonly shapes: v.ArraySchema<v.StrictObjectSchema<{
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
    readonly completeness: v.ArraySchema<v.StrictObjectSchema<{
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
    readonly discoveryClasses: v.ArraySchema<v.StrictObjectSchema<{
        readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly templatePolicyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly templateShapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly assessmentContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
export type GovernanceFulfillmentDeclaration = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_DECLARATION_SCHEMA>;
export declare const GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA: v.StrictObjectSchema<{
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
}, undefined>;
export type GovernanceRequirementProposal = v.InferOutput<typeof GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA>;
export declare const GOVERNANCE_FULFILLMENT_ASSESSMENT_SCHEMA: v.StrictObjectSchema<{
    readonly obligations: v.ArraySchema<v.StrictObjectSchema<{
        readonly obligationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly policyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly shapeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly judgment: v.PicklistSchema<["satisfied", "falsified", "indeterminate"], undefined>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly support: v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
            readonly role: v.PicklistSchema<["realization", "verifier_artifact"], undefined>;
            readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly artifactPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.DescriptionAction<string, "Select the realization or verifier artifact path from this prior Result's files.">]>;
            readonly commandId: v.SchemaWithPipe<readonly [v.NullSchema<undefined>, v.DescriptionAction<null, "Must be null for realization and verifier_artifact, including artifacts observed by C2.">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly role: v.LiteralSchema<"verifier_execution", undefined>;
            readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly artifactPath: v.SchemaWithPipe<readonly [v.NullSchema<undefined>, v.DescriptionAction<null, "Must be null for verifier_execution; select the command, not an artifact path.">]>;
            readonly commandId: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.DescriptionAction<string, "Select a command ID from this prior execution Result's commands.">]>;
        }, undefined>], undefined>, undefined>;
        readonly adverseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly criteria: v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly judgment: v.PicklistSchema<["satisfied", "falsified", "indeterminate"], undefined>;
            readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
        readonly depth: v.ArraySchema<v.StrictObjectSchema<{
            readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly judgment: v.PicklistSchema<["satisfied", "falsified", "indeterminate", "not_applicable"], undefined>;
            readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly discoveries: v.ArraySchema<v.StrictObjectSchema<{
        readonly classRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly judgment: v.PicklistSchema<["satisfied", "falsified", "indeterminate"], undefined>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export type GovernanceFulfillmentAssessment = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_ASSESSMENT_SCHEMA>;
export declare const GOVERNANCE_FULFILLMENT_STATE_SCHEMA: v.StrictObjectSchema<{
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
}, undefined>;
export type GovernanceFulfillmentState = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_STATE_SCHEMA>;
/** Owned at existing retained child fold, never a worker-authored evidence packet. */
export declare const GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA: v.StrictObjectSchema<{
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
}, undefined>;
export type GovernanceFulfillmentEvidence = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA>;
export declare function isGovernanceFulfillmentDeclaration(value: unknown): value is GovernanceFulfillmentDeclaration;
/** Conditional selection over admitted definitions, with no definition hashing. */
export declare function governanceFulfillmentSelection(program: Pick<GtlProgram, "policies">, original: {
    fulfillment?: GovernanceFulfillmentDeclaration | undefined;
    sources: readonly {
        path: string;
        digest: string;
    }[];
    requiredSupportRefs: readonly string[];
    assessment: {
        resultContract: Readonly<Record<string, JsonValue>>;
    };
}): "absent" | "selected" | "invalid";
export declare function governanceFulfillmentContractsMatch(d: GovernanceFulfillmentDeclaration, contract: (ref: string) => ContractDeclaration | null): boolean;
/** First source acquisition only; subsequent internal owners retain this binding. */
export declare function governanceFulfillmentSourceMatches(d: GovernanceFulfillmentDeclaration, context: WorksiteContextObservation): boolean;
export declare function governanceFulfillmentActive(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState): {
    binding: {
        obligationRef: string;
        requirementRef: string;
        realizationContractRef: string | null;
        proofContractRef: string | null;
        proofPolicyRef: string | null;
        proofShapeRef: string | null;
    };
    term: {
        requirementRef: string;
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    };
    policy: {
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
    } | null;
    shape: {
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
    } | null;
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
    } | null;
}[];
export declare function initialGovernanceFulfillment(d: GovernanceFulfillmentDeclaration): GovernanceFulfillmentState;
export declare function governanceFulfillmentStateMatches(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState): boolean;
export declare function deriveGovernanceObligations(d: GovernanceFulfillmentDeclaration, prior: GovernanceFulfillmentState, proposals: readonly GovernanceRequirementProposal[], taskRef: string, sourceResultRef: string, context: WorksiteContextObservation, evidenceRefs: readonly string[]): GovernanceFulfillmentState | null;
/** Structural schema bytes are constant. Current domains are owned task data. */
export declare function governanceFulfillmentAssessmentJsonSchema(): Readonly<Record<string, JsonValue>>;
export declare function bindGovernanceFulfillmentAssessment(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState, raw: unknown, evidence: readonly GovernanceFulfillmentEvidence[]): GovernanceFulfillmentAssessment | null;
export declare function projectGovernanceFulfillment(d: GovernanceFulfillmentDeclaration, prior: GovernanceFulfillmentState, assessment: GovernanceFulfillmentAssessment, current: GovernanceFulfillmentEvidence, evidence: readonly GovernanceFulfillmentEvidence[]): GovernanceFulfillmentState;
export declare function invalidateGovernanceFulfillment(prior: GovernanceFulfillmentState, currentFiles: readonly v.InferOutput<typeof file>[], changedPaths: readonly string[]): GovernanceFulfillmentState;
export {};
