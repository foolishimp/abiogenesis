export interface ConsensusReviewerCandidate {
    readonly kind: "consensus_reviewer_candidate";
    readonly schemaVersion: "5.0.0";
    readonly recommendation: "accept" | "revise";
    readonly findings: readonly {
        readonly findingContractRef: string;
        readonly findingPayloadRef: string;
    }[];
    readonly residualRefs: readonly string[];
}
export interface ConsensusSubmitterResponseCandidate {
    readonly kind: "consensus_submitter_response_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "acknowledge" | "address_findings" | "dispute_findings";
    readonly responseText: string;
    readonly addressedFindingRefs: readonly string[];
    readonly residualFindingRefs: readonly string[];
}
export declare function isConsensusReviewerCandidate(value: unknown): value is ConsensusReviewerCandidate;
export declare function isConsensusSubmitterResponseCandidate(value: unknown): value is ConsensusSubmitterResponseCandidate;
export declare const CONSENSUS_PUBLIC_SCHEMA: Readonly<{
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $id: "abg.schema.consensus@5";
    readonly title: "ABIogenesis Consensus Public Contracts";
    readonly description: "Canonical serialized field and value domains for the ABIogenesis 5 Consensus Product. Digest and cross-carrier equality invariants remain Product-owned admission laws.";
    readonly $defs: {
        readonly Ref: {
            readonly type: "string";
            readonly minLength: 1;
            readonly pattern: "\\S";
        };
        readonly Digest: {
            readonly type: "string";
            readonly pattern: "^sha256:[0-9a-f]{64}$";
        };
        readonly RefArray: {
            readonly type: "array";
            readonly uniqueItems: true;
            readonly items: {
                readonly $ref: "#/$defs/Ref";
            };
        };
        readonly ReviewRulingKind: {
            readonly enum: readonly ["decision_row", "draft_ticket", "split_ticket", "deferment", "rejected_finding"];
        };
        readonly ConsensusRoundOutcomeValue: {
            readonly enum: readonly ["closed_done", "recurse_next_round", "escalate_fh"];
        };
        readonly ConsensusClassification: {
            readonly enum: readonly ["unanimous_agreement", "partial_agreement_with_dissent", "unresolved_disagreement", "contract_failure"];
        };
        readonly ConsensusFhDecision: {
            readonly enum: readonly ["accept_with_dissent", "reject"];
        };
        readonly ConsensusReviewerCandidate: Readonly<{
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "recommendation", "findings", "residualRefs"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_reviewer_candidate";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly recommendation: {
                    readonly enum: readonly ["accept", "revise"];
                };
                readonly findings: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["findingContractRef", "findingPayloadRef"];
                        readonly properties: {
                            readonly findingContractRef: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly pattern: "\\S";
                            };
                            readonly findingPayloadRef: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly pattern: "\\S";
                            };
                        };
                    };
                };
                readonly residualRefs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly pattern: "\\S";
                    };
                    readonly uniqueItems: true;
                };
            };
            readonly allOf: readonly [{
                readonly if: {
                    readonly properties: {
                        readonly recommendation: {
                            readonly const: "accept";
                        };
                    };
                    readonly required: readonly ["recommendation"];
                };
                readonly then: {
                    readonly properties: {
                        readonly findings: {
                            readonly maxItems: 0;
                        };
                    };
                };
            }, {
                readonly if: {
                    readonly properties: {
                        readonly recommendation: {
                            readonly const: "revise";
                        };
                    };
                    readonly required: readonly ["recommendation"];
                };
                readonly then: {
                    readonly properties: {
                        readonly findings: {
                            readonly minItems: 1;
                        };
                    };
                };
            }];
        }>;
        readonly ConsensusSubmitterResponseCandidate: Readonly<{
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_submitter_response_candidate";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly disposition: {
                    readonly enum: readonly ["acknowledge", "address_findings", "dispute_findings"];
                };
                readonly responseText: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly addressedFindingRefs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly pattern: "\\S";
                    };
                    readonly uniqueItems: true;
                };
                readonly residualFindingRefs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly pattern: "\\S";
                    };
                    readonly uniqueItems: true;
                };
            };
            readonly allOf: readonly [{
                readonly if: {
                    readonly properties: {
                        readonly disposition: {
                            readonly const: "acknowledge";
                        };
                    };
                    readonly required: readonly ["disposition"];
                };
                readonly then: {
                    readonly properties: {
                        readonly addressedFindingRefs: {
                            readonly maxItems: 0;
                        };
                        readonly residualFindingRefs: {
                            readonly maxItems: 0;
                        };
                    };
                };
            }, {
                readonly if: {
                    readonly properties: {
                        readonly disposition: {
                            readonly const: "address_findings";
                        };
                    };
                    readonly required: readonly ["disposition"];
                };
                readonly then: {
                    readonly properties: {
                        readonly addressedFindingRefs: {
                            readonly minItems: 1;
                        };
                        readonly residualFindingRefs: {
                            readonly maxItems: 0;
                        };
                    };
                };
            }, {
                readonly if: {
                    readonly properties: {
                        readonly disposition: {
                            readonly const: "dispute_findings";
                        };
                    };
                    readonly required: readonly ["disposition"];
                };
                readonly then: {
                    readonly properties: {
                        readonly residualFindingRefs: {
                            readonly minItems: 1;
                        };
                    };
                };
            }];
        }>;
        readonly ConsensusSubmitterResponseRecord: Readonly<{
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["invocationRef", "responseRef", "outputDigest", "findingsVectorDigest", "roundRef", "roundOrdinal", "submittingActorRef", "profileRef", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs", "evidenceRefs"];
            readonly properties: {
                readonly invocationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly responseRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly outputDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly findingsVectorDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: number;
                };
                readonly submittingActorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly profileRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly disposition: {
                    readonly enum: readonly ["acknowledge", "address_findings", "dispute_findings"];
                };
                readonly responseText: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly addressedFindingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly residualFindingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
            };
        }>;
        readonly ConsensusSubject: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "subjectContractRef", "subjectRef", "subjectDigest", "submittingActorRef", "panelRef", "roundPolicyRef", "workspaceRef", "ticketRef", "ticketDigest"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_subject";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly subjectContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly submittingActorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundPolicyRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly workspaceRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly ticketRef: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Ref";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly ticketDigest: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Digest";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
            readonly allOf: readonly [{
                readonly if: {
                    readonly properties: {
                        readonly ticketRef: {
                            readonly type: "null";
                        };
                    };
                };
                readonly then: {
                    readonly properties: {
                        readonly ticketDigest: {
                            readonly type: "null";
                        };
                    };
                };
                readonly else: {
                    readonly properties: {
                        readonly ticketDigest: {
                            readonly $ref: "#/$defs/Digest";
                        };
                    };
                };
            }];
        };
        readonly ConsensusSubjectMaterialization: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "materializationRef", "subjectContractRef", "subjectRef", "contentDigest", "mediaType", "content"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_subject_materialization";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly materializationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly contentDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly mediaType: {
                    readonly const: "text/markdown; charset=utf-8";
                };
                readonly content: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly ConsensusReviewerInstruction: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "instructionContractRef", "roleContractRef", "instructionDigest", "instructionText", "responseSchema"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_reviewer_instruction";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly instructionContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roleContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly instructionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly instructionText: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly responseSchema: {
                    readonly const: Readonly<{
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["kind", "schemaVersion", "recommendation", "findings", "residualRefs"];
                        readonly properties: {
                            readonly kind: {
                                readonly const: "consensus_reviewer_candidate";
                            };
                            readonly schemaVersion: {
                                readonly const: "5.0.0";
                            };
                            readonly recommendation: {
                                readonly enum: readonly ["accept", "revise"];
                            };
                            readonly findings: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly additionalProperties: false;
                                    readonly required: readonly ["findingContractRef", "findingPayloadRef"];
                                    readonly properties: {
                                        readonly findingContractRef: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly pattern: "\\S";
                                        };
                                        readonly findingPayloadRef: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly pattern: "\\S";
                                        };
                                    };
                                };
                            };
                            readonly residualRefs: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly pattern: "\\S";
                                };
                                readonly uniqueItems: true;
                            };
                        };
                        readonly allOf: readonly [{
                            readonly if: {
                                readonly properties: {
                                    readonly recommendation: {
                                        readonly const: "accept";
                                    };
                                };
                                readonly required: readonly ["recommendation"];
                            };
                            readonly then: {
                                readonly properties: {
                                    readonly findings: {
                                        readonly maxItems: 0;
                                    };
                                };
                            };
                        }, {
                            readonly if: {
                                readonly properties: {
                                    readonly recommendation: {
                                        readonly const: "revise";
                                    };
                                };
                                readonly required: readonly ["recommendation"];
                            };
                            readonly then: {
                                readonly properties: {
                                    readonly findings: {
                                        readonly minItems: 1;
                                    };
                                };
                            };
                        }];
                    }>;
                };
            };
        };
        readonly ConsensusReviewerProfile: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "profileRef", "roleContractRef", "configurationDigest", "instructionContractRef", "instructionDigest", "resultContractRef", "capabilityRefs", "actorRef", "workerBindingRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_reviewer_profile";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly profileRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roleContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly configurationDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly instructionContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly instructionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly resultContractRef: {
                    readonly const: "contract://abg/schema/review-findings@5";
                };
                readonly capabilityRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly actorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly workerBindingRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
        };
        readonly ConsensusSubmitterInstruction: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "instructionContractRef", "roleContractRef", "instructionDigest", "instructionText", "responseSchema"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_submitter_instruction";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly instructionContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roleContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly instructionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly instructionText: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly responseSchema: {
                    readonly const: Readonly<{
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["kind", "schemaVersion", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs"];
                        readonly properties: {
                            readonly kind: {
                                readonly const: "consensus_submitter_response_candidate";
                            };
                            readonly schemaVersion: {
                                readonly const: "5.0.0";
                            };
                            readonly disposition: {
                                readonly enum: readonly ["acknowledge", "address_findings", "dispute_findings"];
                            };
                            readonly responseText: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly addressedFindingRefs: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly pattern: "\\S";
                                };
                                readonly uniqueItems: true;
                            };
                            readonly residualFindingRefs: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly pattern: "\\S";
                                };
                                readonly uniqueItems: true;
                            };
                        };
                        readonly allOf: readonly [{
                            readonly if: {
                                readonly properties: {
                                    readonly disposition: {
                                        readonly const: "acknowledge";
                                    };
                                };
                                readonly required: readonly ["disposition"];
                            };
                            readonly then: {
                                readonly properties: {
                                    readonly addressedFindingRefs: {
                                        readonly maxItems: 0;
                                    };
                                    readonly residualFindingRefs: {
                                        readonly maxItems: 0;
                                    };
                                };
                            };
                        }, {
                            readonly if: {
                                readonly properties: {
                                    readonly disposition: {
                                        readonly const: "address_findings";
                                    };
                                };
                                readonly required: readonly ["disposition"];
                            };
                            readonly then: {
                                readonly properties: {
                                    readonly addressedFindingRefs: {
                                        readonly minItems: 1;
                                    };
                                    readonly residualFindingRefs: {
                                        readonly maxItems: 0;
                                    };
                                };
                            };
                        }, {
                            readonly if: {
                                readonly properties: {
                                    readonly disposition: {
                                        readonly const: "dispute_findings";
                                    };
                                };
                                readonly required: readonly ["disposition"];
                            };
                            readonly then: {
                                readonly properties: {
                                    readonly residualFindingRefs: {
                                        readonly minItems: 1;
                                    };
                                };
                            };
                        }];
                    }>;
                };
            };
        };
        readonly ConsensusSubmitterProfile: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "profileRef", "roleContractRef", "configurationDigest", "instructionContractRef", "instructionDigest", "resultContractRef", "capabilityRefs", "actorRef", "workerBindingRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_submitter_profile";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly profileRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roleContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly configurationDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly instructionContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly instructionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly resultContractRef: {
                    readonly const: "contract://abg/consensus/submitter-response@5";
                };
                readonly capabilityRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly actorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly workerBindingRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
        };
        readonly ConsensusPanel: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "panelRef", "panelDigest", "profiles"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_panel";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly panelDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly profiles: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/ConsensusReviewerProfile";
                    };
                };
            };
        };
        readonly ConsensusRulingOverlay: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "overlayRef", "overlayDigest", "programRef", "graphFunctionRef", "policyContractRef", "disagreementRuleRef", "acceptedFindingRulingKind"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_ruling_overlay";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly overlayRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly overlayDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly programRef: {
                    readonly const: "program://abg/system/consensus-one-surface@5";
                };
                readonly graphFunctionRef: {
                    readonly const: "graph-function://abg/consensus/round-reducer@5";
                };
                readonly policyContractRef: {
                    readonly const: "contract://abg/consensus/round-policy@5";
                };
                readonly disagreementRuleRef: {
                    readonly const: "rule://abg/consensus/material-dispute@5";
                };
                readonly acceptedFindingRulingKind: {
                    readonly enum: readonly ["decision_row", "draft_ticket", "split_ticket", "rejected_finding"];
                };
            };
        };
        readonly ConsensusRoundPolicy: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "policyRef", "policyDigest", "roundBudget", "convergenceRuleRef", "disagreementRuleRef", "rulingOverlay", "escalationRuleRef", "foldbackContractRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_round_policy";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly policyRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly policyDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly roundBudget: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: 9007199254740991;
                };
                readonly convergenceRuleRef: {
                    readonly const: "rule://abg/consensus/exact-agreement@5";
                };
                readonly disagreementRuleRef: {
                    readonly const: "rule://abg/consensus/material-dispute@5";
                };
                readonly rulingOverlay: {
                    readonly oneOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly $ref: "#/$defs/ConsensusRulingOverlay";
                    }];
                };
                readonly escalationRuleRef: {
                    readonly const: "rule://abg/consensus/unresolved-to-fh@5";
                };
                readonly foldbackContractRef: {
                    readonly const: "contract://abg/consensus/round-foldback@5";
                };
            };
        };
        readonly ReviewFinding: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["findingRef", "findingContractRef", "findingPayloadRef", "evidenceRefs"];
            readonly properties: {
                readonly findingRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly findingContractRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly findingPayloadRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
            };
        };
        readonly ReviewRuling: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["rulingRef", "rulingKind", "findingRefs", "rationaleRef", "payloadRef"];
            readonly properties: {
                readonly rulingRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly rulingKind: {
                    readonly $ref: "#/$defs/ReviewRulingKind";
                };
                readonly findingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly rationaleRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly payloadRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
        };
        readonly ReviewRulings: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/ReviewRuling";
            };
        };
        readonly ConsensusReviewerTask: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "taskRef", "taskDigest", "invocationRef", "roundRef", "roundOrdinal", "panelPosition", "subject", "subjectMaterialization", "panel", "policy", "profile", "instruction", "submitterProfile", "submitterInstruction", "priorRoundRefs", "priorFindingSetRefs", "priorRulings", "priorDissentProfileRefs", "priorSubmitterResponses", "priorEvidenceRefs", "transportLane"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_reviewer_task";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly taskRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly taskDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly invocationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: 9007199254740991;
                };
                readonly panelPosition: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly maximum: 9007199254740991;
                };
                readonly subject: {
                    readonly $ref: "#/$defs/ConsensusSubject";
                };
                readonly subjectMaterialization: {
                    readonly $ref: "#/$defs/ConsensusSubjectMaterialization";
                };
                readonly panel: {
                    readonly $ref: "#/$defs/ConsensusPanel";
                };
                readonly policy: {
                    readonly $ref: "#/$defs/ConsensusRoundPolicy";
                };
                readonly profile: {
                    readonly $ref: "#/$defs/ConsensusReviewerProfile";
                };
                readonly instruction: {
                    readonly $ref: "#/$defs/ConsensusReviewerInstruction";
                };
                readonly submitterProfile: {
                    readonly $ref: "#/$defs/ConsensusSubmitterProfile";
                };
                readonly submitterInstruction: {
                    readonly $ref: "#/$defs/ConsensusSubmitterInstruction";
                };
                readonly priorRoundRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly priorFindingSetRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly priorRulings: {
                    readonly $ref: "#/$defs/ReviewRulings";
                };
                readonly priorDissentProfileRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly priorSubmitterResponses: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "#/$defs/ConsensusSubmitterResponseRecord";
                    };
                };
                readonly priorEvidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly transportLane: {
                    readonly enum: readonly ["closed_prompt_proof", "worker_executes"];
                };
            };
        };
        readonly ReviewFindings: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "reviewerTaskRef", "reviewerTaskDigest", "panelRef", "panelPosition", "cCallRef", "cCallAttempt", "profileRef", "configurationDigest", "invocationRef", "roundRef", "roundOrdinal", "recommendation", "outputDigest", "evidenceRefs", "findings", "residualRefs", "refusalRef", "task"];
            readonly properties: {
                readonly kind: {
                    readonly const: "review_findings";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly reviewerTaskRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly reviewerTaskDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly panelPosition: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly maximum: 9007199254740991;
                };
                readonly cCallRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly cCallAttempt: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: 9007199254740991;
                };
                readonly profileRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly configurationDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly invocationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: 9007199254740991;
                };
                readonly recommendation: {
                    readonly enum: readonly ["accept", "revise"];
                };
                readonly outputDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly findings: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "#/$defs/ReviewFinding";
                    };
                };
                readonly residualRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly refusalRef: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Ref";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly task: {
                    readonly $ref: "#/$defs/ConsensusReviewerTask";
                };
            };
            readonly oneOf: readonly [{
                readonly properties: {
                    readonly refusalRef: {
                        readonly type: "null";
                    };
                };
                readonly allOf: readonly [{
                    readonly if: {
                        readonly properties: {
                            readonly recommendation: {
                                readonly const: "accept";
                            };
                        };
                    };
                    readonly then: {
                        readonly properties: {
                            readonly findings: {
                                readonly maxItems: 0;
                            };
                        };
                    };
                    readonly else: {
                        readonly properties: {
                            readonly findings: {
                                readonly minItems: 1;
                            };
                        };
                    };
                }];
            }, {
                readonly properties: {
                    readonly refusalRef: {
                        readonly $ref: "#/$defs/Ref";
                    };
                    readonly recommendation: {
                        readonly const: "revise";
                    };
                    readonly findings: {
                        readonly maxItems: 0;
                    };
                    readonly residualRefs: {
                        readonly type: "array";
                        readonly minItems: 1;
                        readonly uniqueItems: true;
                        readonly items: {
                            readonly $ref: "#/$defs/Ref";
                        };
                    };
                };
            }];
        };
        readonly ConsensusFindingsVector: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "applicationRef", "members"];
            readonly properties: {
                readonly kind: {
                    readonly const: "gtl_fan_out_vector";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly applicationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly members: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["ordinal", "inputMemberRef", "outputMemberRef", "value"];
                        readonly properties: {
                            readonly ordinal: {
                                readonly type: "integer";
                                readonly minimum: 0;
                                readonly maximum: 9007199254740991;
                            };
                            readonly inputMemberRef: {
                                readonly $ref: "#/$defs/Ref";
                            };
                            readonly outputMemberRef: {
                                readonly $ref: "#/$defs/Ref";
                            };
                            readonly value: {
                                readonly $ref: "#/$defs/ReviewFindings";
                            };
                        };
                    };
                };
            };
        };
        readonly ConsensusSubmitterTask: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "invocationRef", "roundRef", "roundOrdinal", "subject", "subjectMaterialization", "panel", "policy", "profile", "instruction", "findingsVector", "priorRoundRefs", "priorSubmitterResponseRefs", "priorEvidenceRefs", "transportLane"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_submitter_task";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly invocationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: 9007199254740991;
                };
                readonly subject: {
                    readonly $ref: "#/$defs/ConsensusSubject";
                };
                readonly subjectMaterialization: {
                    readonly $ref: "#/$defs/ConsensusSubjectMaterialization";
                };
                readonly panel: {
                    readonly $ref: "#/$defs/ConsensusPanel";
                };
                readonly policy: {
                    readonly $ref: "#/$defs/ConsensusRoundPolicy";
                };
                readonly profile: {
                    readonly $ref: "#/$defs/ConsensusSubmitterProfile";
                };
                readonly instruction: {
                    readonly $ref: "#/$defs/ConsensusSubmitterInstruction";
                };
                readonly findingsVector: {
                    readonly $ref: "#/$defs/ConsensusFindingsVector";
                };
                readonly priorRoundRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly priorSubmitterResponseRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly priorEvidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly transportLane: {
                    readonly enum: readonly ["closed_prompt_proof", "worker_executes"];
                };
            };
        };
        readonly ConsensusSubmitterResponse: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "invocationRef", "responseRef", "outputDigest", "findingsVectorDigest", "roundRef", "roundOrdinal", "submittingActorRef", "profileRef", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs", "evidenceRefs", "configurationDigest", "task"];
            readonly properties: {
                readonly configurationDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly task: {
                    readonly $ref: "#/$defs/ConsensusSubmitterTask";
                };
                readonly invocationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly responseRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly outputDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly findingsVectorDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 1;
                    readonly maximum: number;
                };
                readonly submittingActorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly profileRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly disposition: {
                    readonly enum: readonly ["acknowledge", "address_findings", "dispute_findings"];
                };
                readonly responseText: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly addressedFindingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly residualFindingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly kind: {
                    readonly const: "consensus_submitter_response";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
            };
        };
        readonly ConsensusRoundOutcome: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "roundRef", "outcome", "findingSetRefs", "rulingRefs", "evidenceRefs"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_round_outcome";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly roundRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly outcome: {
                    readonly $ref: "#/$defs/ConsensusRoundOutcomeValue";
                };
                readonly findingSetRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly rulingRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
            };
        };
        readonly ConsensusResult: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "resultRef", "contractFailureRef", "replayRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_result";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly subjectRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly policyRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly findingSetRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly submitterResponseRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly rulings: {
                    readonly $ref: "#/$defs/ReviewRulings";
                };
                readonly classification: {
                    readonly $ref: "#/$defs/ConsensusClassification";
                };
                readonly dissentProfileRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly terminalOutcome: {
                    readonly $ref: "#/$defs/ConsensusRoundOutcome";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly lineageRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly resultRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly contractFailureRef: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Ref";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly replayRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
            readonly allOf: readonly [{
                readonly if: {
                    readonly properties: {
                        readonly classification: {
                            readonly const: "contract_failure";
                        };
                    };
                };
                readonly then: {
                    readonly properties: {
                        readonly contractFailureRef: {
                            readonly $ref: "#/$defs/Ref";
                        };
                    };
                };
                readonly else: {
                    readonly properties: {
                        readonly contractFailureRef: {
                            readonly type: "null";
                        };
                    };
                };
            }];
        };
        readonly ConsensusResultCandidate: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "contractFailureRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_result_candidate";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly subjectRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly policyRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly findingSetRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly submitterResponseRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly rulings: {
                    readonly $ref: "#/$defs/ReviewRulings";
                };
                readonly classification: {
                    readonly $ref: "#/$defs/ConsensusClassification";
                };
                readonly dissentProfileRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly terminalOutcome: {
                    readonly $ref: "#/$defs/ConsensusRoundOutcome";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly lineageRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly contractFailureRef: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Ref";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly ConsensusRoundDecision: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "resolutionKind", "schemaVersion", "decisionRef", "decisionDigest", "outcome", "result", "resolutionTerminal"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_resolution";
                };
                readonly resolutionKind: {
                    readonly const: "round_decision";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly decisionRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly decisionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly outcome: {
                    readonly $ref: "#/$defs/ConsensusRoundOutcome";
                };
                readonly result: {
                    readonly $ref: "#/$defs/ConsensusResultCandidate";
                };
                readonly resolutionTerminal: {
                    readonly type: "boolean";
                };
            };
        };
        readonly ConsensusHumanFinalization: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "resolutionKind", "schemaVersion", "finalizationRef", "finalizationDigest", "roundDecision", "decision", "humanActorRef", "rationaleRef", "result", "resolutionTerminal"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_resolution";
                };
                readonly resolutionKind: {
                    readonly const: "human_finalization";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly finalizationRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly finalizationDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly roundDecision: {
                    readonly $ref: "#/$defs/ConsensusRoundDecision";
                };
                readonly decision: {
                    readonly $ref: "#/$defs/ConsensusFhDecision";
                };
                readonly humanActorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly rationaleRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly result: {
                    readonly $ref: "#/$defs/ConsensusResultCandidate";
                };
                readonly resolutionTerminal: {
                    readonly const: true;
                };
            };
        };
        readonly ConsensusResolution: {
            readonly oneOf: readonly [{
                readonly $ref: "#/$defs/ConsensusRoundDecision";
            }, {
                readonly $ref: "#/$defs/ConsensusHumanFinalization";
            }];
        };
        readonly ConsensusEscalationDecision: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "roundDecision", "decisionRef", "decisionDigest", "decision", "humanActorRef", "rationaleRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "consensus_escalation_decision";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly roundDecision: {
                    readonly $ref: "#/$defs/ConsensusRoundDecision";
                };
                readonly decisionRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly decisionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly decision: {
                    readonly $ref: "#/$defs/ConsensusFhDecision";
                };
                readonly humanActorRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly rationaleRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
        };
        readonly TicketConsensusProjection: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "schemaVersion", "projectionRef", "projectionDigest", "ticketRef", "ticketDigest", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "resultRef", "replayRef"];
            readonly properties: {
                readonly kind: {
                    readonly const: "ticket_consensus_projection";
                };
                readonly schemaVersion: {
                    readonly const: "5.0.0";
                };
                readonly projectionRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly projectionDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly ticketRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly ticketDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly subjectRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly subjectDigest: {
                    readonly $ref: "#/$defs/Digest";
                };
                readonly panelRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly policyRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly roundRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly findingSetRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly submitterResponseRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly rulings: {
                    readonly $ref: "#/$defs/ReviewRulings";
                };
                readonly classification: {
                    readonly $ref: "#/$defs/ConsensusClassification";
                };
                readonly dissentProfileRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly terminalOutcome: {
                    readonly $ref: "#/$defs/ConsensusRoundOutcome";
                };
                readonly evidenceRefs: {
                    readonly $ref: "#/$defs/RefArray";
                };
                readonly lineageRefs: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly uniqueItems: true;
                    readonly items: {
                        readonly $ref: "#/$defs/Ref";
                    };
                };
                readonly resultRef: {
                    readonly $ref: "#/$defs/Ref";
                };
                readonly replayRef: {
                    readonly $ref: "#/$defs/Ref";
                };
            };
        };
    };
    readonly "x-abiogenesis-invariants": readonly ["All digests are recomputed from their Product-declared canonical bodies.", "Panel profile identities and all reference arrays governed as sets are duplicate-free.", "Subject, panel, policy, task, finding, result, ticket, workspace, and replay identities agree across their containing carriers.", "Reviewer and submitter instructions plus subject materialization match the exact digests and identities selected by the invocation.", "Each round binds one exact attributed submitter response to its complete admitted findings vector before reduction or recursion.", "Consensus classification is contract_failure exactly when contractFailureRef is non-null."];
}>;
export declare const REVIEW_RULING_KIND_VALUES: readonly ["decision_row", "draft_ticket", "split_ticket", "deferment", "rejected_finding"];
export declare const CONSENSUS_ROUND_OUTCOME_VALUES: readonly ["closed_done", "recurse_next_round", "escalate_fh"];
export declare const CONSENSUS_CLASSIFICATION_VALUES: readonly ["unanimous_agreement", "partial_agreement_with_dissent", "unresolved_disagreement", "contract_failure"];
export declare const CONSENSUS_FH_DECISION_VALUES: readonly ["accept_with_dissent", "reject"];
export declare const CONSENSUS_REVIEWER_RESPONSE_SCHEMA: Readonly<{
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "schemaVersion", "recommendation", "findings", "residualRefs"];
    readonly properties: {
        readonly kind: {
            readonly const: "consensus_reviewer_candidate";
        };
        readonly schemaVersion: {
            readonly const: "5.0.0";
        };
        readonly recommendation: {
            readonly enum: readonly ["accept", "revise"];
        };
        readonly findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["findingContractRef", "findingPayloadRef"];
                readonly properties: {
                    readonly findingContractRef: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly pattern: "\\S";
                    };
                    readonly findingPayloadRef: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly pattern: "\\S";
                    };
                };
            };
        };
        readonly residualRefs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly pattern: "\\S";
            };
            readonly uniqueItems: true;
        };
    };
    readonly allOf: readonly [{
        readonly if: {
            readonly properties: {
                readonly recommendation: {
                    readonly const: "accept";
                };
            };
            readonly required: readonly ["recommendation"];
        };
        readonly then: {
            readonly properties: {
                readonly findings: {
                    readonly maxItems: 0;
                };
            };
        };
    }, {
        readonly if: {
            readonly properties: {
                readonly recommendation: {
                    readonly const: "revise";
                };
            };
            readonly required: readonly ["recommendation"];
        };
        readonly then: {
            readonly properties: {
                readonly findings: {
                    readonly minItems: 1;
                };
            };
        };
    }];
}>;
export declare const CONSENSUS_SUBMITTER_RESPONSE_SCHEMA: Readonly<{
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "schemaVersion", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs"];
    readonly properties: {
        readonly kind: {
            readonly const: "consensus_submitter_response_candidate";
        };
        readonly schemaVersion: {
            readonly const: "5.0.0";
        };
        readonly disposition: {
            readonly enum: readonly ["acknowledge", "address_findings", "dispute_findings"];
        };
        readonly responseText: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly addressedFindingRefs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly pattern: "\\S";
            };
            readonly uniqueItems: true;
        };
        readonly residualFindingRefs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly pattern: "\\S";
            };
            readonly uniqueItems: true;
        };
    };
    readonly allOf: readonly [{
        readonly if: {
            readonly properties: {
                readonly disposition: {
                    readonly const: "acknowledge";
                };
            };
            readonly required: readonly ["disposition"];
        };
        readonly then: {
            readonly properties: {
                readonly addressedFindingRefs: {
                    readonly maxItems: 0;
                };
                readonly residualFindingRefs: {
                    readonly maxItems: 0;
                };
            };
        };
    }, {
        readonly if: {
            readonly properties: {
                readonly disposition: {
                    readonly const: "address_findings";
                };
            };
            readonly required: readonly ["disposition"];
        };
        readonly then: {
            readonly properties: {
                readonly addressedFindingRefs: {
                    readonly minItems: 1;
                };
                readonly residualFindingRefs: {
                    readonly maxItems: 0;
                };
            };
        };
    }, {
        readonly if: {
            readonly properties: {
                readonly disposition: {
                    readonly const: "dispute_findings";
                };
            };
            readonly required: readonly ["disposition"];
        };
        readonly then: {
            readonly properties: {
                readonly residualFindingRefs: {
                    readonly minItems: 1;
                };
            };
        };
    }];
}>;
export declare const CONSENSUS_SCHEMA_ASSET_BINDINGS: readonly [readonly ["abg.schema.consensus-subject", "ConsensusSubject"], readonly ["abg.schema.consensus-panel", "ConsensusPanel"], readonly ["abg.schema.consensus-reviewer-profile", "ConsensusReviewerProfile"], readonly ["abg.schema.consensus-submitter-profile", "ConsensusSubmitterProfile"], readonly ["abg.schema.consensus-ruling-overlay", "ConsensusRulingOverlay"], readonly ["abg.schema.consensus-submitter-response", "ConsensusSubmitterResponse"], readonly ["abg.schema.consensus-escalation-decision", "ConsensusEscalationDecision"], readonly ["abg.schema.review-findings", "ReviewFindings"], readonly ["abg.schema.review-rulings", "ReviewRulings"], readonly ["abg.schema.consensus-round-policy", "ConsensusRoundPolicy"], readonly ["abg.schema.consensus-round-outcome", "ConsensusRoundOutcome"], readonly ["abg.schema.consensus-result", "ConsensusResult"], readonly ["abg.schema.ticket-consensus-projection", "TicketConsensusProjection"]];
export declare const CONSENSUS_SCHEMA_REQUIRED_KEYS: Readonly<{
    ConsensusSubject: readonly ["kind", "schemaVersion", "subjectContractRef", "subjectRef", "subjectDigest", "submittingActorRef", "panelRef", "roundPolicyRef", "workspaceRef", "ticketRef", "ticketDigest"];
    ConsensusSubjectMaterialization: readonly ["kind", "schemaVersion", "materializationRef", "subjectContractRef", "subjectRef", "contentDigest", "mediaType", "content"];
    ConsensusReviewerInstruction: readonly ["kind", "schemaVersion", "instructionContractRef", "roleContractRef", "instructionDigest", "instructionText", "responseSchema"];
    ConsensusReviewerProfile: readonly ["kind", "schemaVersion", "profileRef", "roleContractRef", "configurationDigest", "instructionContractRef", "instructionDigest", "resultContractRef", "capabilityRefs", "actorRef", "workerBindingRef"];
    ConsensusSubmitterInstruction: readonly ["kind", "schemaVersion", "instructionContractRef", "roleContractRef", "instructionDigest", "instructionText", "responseSchema"];
    ConsensusSubmitterProfile: readonly ["kind", "schemaVersion", "profileRef", "roleContractRef", "configurationDigest", "instructionContractRef", "instructionDigest", "resultContractRef", "capabilityRefs", "actorRef", "workerBindingRef"];
    ConsensusPanel: readonly ["kind", "schemaVersion", "panelRef", "panelDigest", "profiles"];
    ConsensusRulingOverlay: readonly ["kind", "schemaVersion", "overlayRef", "overlayDigest", "programRef", "graphFunctionRef", "policyContractRef", "disagreementRuleRef", "acceptedFindingRulingKind"];
    ConsensusRoundPolicy: readonly ["kind", "schemaVersion", "policyRef", "policyDigest", "roundBudget", "convergenceRuleRef", "disagreementRuleRef", "rulingOverlay", "escalationRuleRef", "foldbackContractRef"];
    ConsensusReviewerTask: readonly ["kind", "schemaVersion", "taskRef", "taskDigest", "invocationRef", "roundRef", "roundOrdinal", "panelPosition", "subject", "subjectMaterialization", "panel", "policy", "profile", "instruction", "submitterProfile", "submitterInstruction", "priorRoundRefs", "priorFindingSetRefs", "priorRulings", "priorDissentProfileRefs", "priorSubmitterResponses", "priorEvidenceRefs", "transportLane"];
    ConsensusFindingsVector: readonly ["kind", "schemaVersion", "applicationRef", "members"];
    ConsensusSubmitterTask: readonly ["kind", "schemaVersion", "invocationRef", "roundRef", "roundOrdinal", "subject", "subjectMaterialization", "panel", "policy", "profile", "instruction", "findingsVector", "priorRoundRefs", "priorSubmitterResponseRefs", "priorEvidenceRefs", "transportLane"];
    ConsensusSubmitterResponseRecord: readonly ["invocationRef", "responseRef", "outputDigest", "findingsVectorDigest", "roundRef", "roundOrdinal", "submittingActorRef", "profileRef", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs", "evidenceRefs"];
    ConsensusSubmitterResponse: readonly ["kind", "schemaVersion", "invocationRef", "responseRef", "outputDigest", "findingsVectorDigest", "roundRef", "roundOrdinal", "submittingActorRef", "profileRef", "disposition", "responseText", "addressedFindingRefs", "residualFindingRefs", "evidenceRefs", "configurationDigest", "task"];
    ReviewFinding: readonly ["findingRef", "findingContractRef", "findingPayloadRef", "evidenceRefs"];
    ReviewFindings: readonly ["kind", "schemaVersion", "reviewerTaskRef", "reviewerTaskDigest", "panelRef", "panelPosition", "cCallRef", "cCallAttempt", "profileRef", "configurationDigest", "invocationRef", "roundRef", "roundOrdinal", "recommendation", "outputDigest", "evidenceRefs", "findings", "residualRefs", "refusalRef", "task"];
    ReviewRuling: readonly ["rulingRef", "rulingKind", "findingRefs", "rationaleRef", "payloadRef"];
    ConsensusRoundOutcome: readonly ["kind", "schemaVersion", "roundRef", "outcome", "findingSetRefs", "rulingRefs", "evidenceRefs"];
    ConsensusResultCandidate: readonly ["kind", "schemaVersion", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "contractFailureRef"];
    ConsensusResult: readonly ["kind", "schemaVersion", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "resultRef", "contractFailureRef", "replayRef"];
    ConsensusRoundDecision: readonly ["kind", "resolutionKind", "schemaVersion", "decisionRef", "decisionDigest", "outcome", "result", "resolutionTerminal"];
    ConsensusHumanFinalization: readonly ["kind", "resolutionKind", "schemaVersion", "finalizationRef", "finalizationDigest", "roundDecision", "decision", "humanActorRef", "rationaleRef", "result", "resolutionTerminal"];
    ConsensusEscalationDecision: readonly ["kind", "schemaVersion", "roundDecision", "decisionRef", "decisionDigest", "decision", "humanActorRef", "rationaleRef"];
    TicketConsensusProjection: readonly ["kind", "schemaVersion", "projectionRef", "projectionDigest", "ticketRef", "ticketDigest", "subjectRef", "subjectDigest", "panelRef", "policyRef", "roundRefs", "findingSetRefs", "submitterResponseRefs", "rulings", "classification", "dissentProfileRefs", "terminalOutcome", "evidenceRefs", "lineageRefs", "resultRef", "replayRef"];
}>;
