import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
export declare const INTERACTION_RESPONSE_KINDS: readonly ["select", "approve", "reject", "assess", "answer_escalation"];
declare const select: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.interaction.respond";
    readonly memberKey: "select";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "select";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "select";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "responded";
    responseKind: "select";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "responded";
    responseKind: "select";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
declare const approve: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.interaction.respond";
    readonly memberKey: "approve";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "approve";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "approve";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "responded";
    responseKind: "approve";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "responded";
    responseKind: "approve";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
declare const reject: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.interaction.respond";
    readonly memberKey: "reject";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "reject";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "reject";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "responded";
    responseKind: "reject";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "responded";
    responseKind: "reject";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
declare const responseAssess: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.interaction.respond";
    readonly memberKey: "assess";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "assess";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "assess";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "responded";
    responseKind: "assess";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "responded";
    responseKind: "assess";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
declare const answerEscalation: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.interaction.respond";
    readonly memberKey: "answer_escalation";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "answer_escalation";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    interaction: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    responseKind: "answer_escalation";
    choice: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    value: import("./index.js").JsonValue;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "responded";
    responseKind: "answer_escalation";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "responded";
    responseKind: "answer_escalation";
    responseEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    interaction: {
        kind: "fh_interaction_projection";
        interactionRef: string;
        interactionBasisDigest: `sha256:${string}`;
        status: "responded";
        graphCallId: string;
        continuationRef: string;
        responseContractRef: string;
        eligibleOperationIds: string[];
        resumeEligibleOperationIds: string[];
        declaredChoiceRefs: string[];
        requiredCapabilityRefs: string[];
        responseRef: string;
        eventRefs: string[];
        replayRefs: string[];
    };
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    continuation: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
export declare const INTERACTION_OPERATION_CONTRACTS: Readonly<{
    respond: Readonly<{
        select: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.interaction.respond";
            readonly memberKey: "select";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "select";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "select";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "responded";
            responseKind: "select";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            disposition: "responded";
            responseKind: "select";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>>;
        approve: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.interaction.respond";
            readonly memberKey: "approve";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "approve";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "approve";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "responded";
            responseKind: "approve";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            disposition: "responded";
            responseKind: "approve";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>>;
        reject: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.interaction.respond";
            readonly memberKey: "reject";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "reject";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "reject";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "responded";
            responseKind: "reject";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            disposition: "responded";
            responseKind: "reject";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>>;
        assess: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.interaction.respond";
            readonly memberKey: "assess";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "assess";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "assess";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "responded";
            responseKind: "assess";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            disposition: "responded";
            responseKind: "assess";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>>;
        answer_escalation: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.interaction.respond";
            readonly memberKey: "answer_escalation";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "answer_escalation";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            interaction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            responseKind: "answer_escalation";
            choice: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            value: import("./index.js").JsonValue;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            currentBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<never, never>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "kind_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "responded";
            responseKind: "answer_escalation";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            disposition: "responded";
            responseKind: "answer_escalation";
            responseEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            interaction: {
                kind: "fh_interaction_projection";
                interactionRef: string;
                interactionBasisDigest: `sha256:${string}`;
                status: "responded";
                graphCallId: string;
                continuationRef: string;
                responseContractRef: string;
                eligibleOperationIds: string[];
                resumeEligibleOperationIds: string[];
                declaredChoiceRefs: string[];
                requiredCapabilityRefs: string[];
                responseRef: string;
                eventRefs: string[];
                replayRefs: string[];
            };
            run: {
                ref: string;
                digest: `sha256:${string}`;
            };
            continuation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>>;
    }>;
}>;
declare const assess: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.result.assess";
    readonly memberKey: "assess";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    expectedResult: {
        ref: string;
        digest: `sha256:${string}`;
    };
    assessmentContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    assessment: {
        kind: "contract_admitted_assessment_value";
        schemaVersion: "5.0.0";
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueRef: string;
        valueDigest: `sha256:${string}`;
        value: {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "admitted";
            closureEligible: boolean;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        } | {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "rejected";
            closureEligible: false;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        } | {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "retry" | "blocked";
            closureEligible: false;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    expectedResult: {
        ref: string;
        digest: `sha256:${string}`;
    };
    assessmentContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    assessment: {
        kind: "contract_admitted_assessment_value";
        schemaVersion: "5.0.0";
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueRef: string;
        valueDigest: `sha256:${string}`;
        value: {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "admitted";
            closureEligible: boolean;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        } | {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "rejected";
            closureEligible: false;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        } | {
            kind: "result_assessment_value";
            schemaVersion: "5.0.0";
            expectedResult: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "retry" | "blocked";
            closureEligible: false;
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    currentBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "admitted" | "rejected";
    closureEligible: boolean;
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "admitted" | "rejected";
    closureEligible: boolean;
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "basis_mismatch" | "evidence_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "basis_mismatch" | "evidence_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "retry" | "blocked";
    closureEligible: false;
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "retry" | "blocked";
    closureEligible: false;
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>>;
export declare const RESULT_OPERATION_CONTRACTS: Readonly<{
    assess: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.result.assess";
        readonly memberKey: "assess";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        expectedResult: {
            ref: string;
            digest: `sha256:${string}`;
        };
        assessmentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        assessment: {
            kind: "contract_admitted_assessment_value";
            schemaVersion: "5.0.0";
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueRef: string;
            valueDigest: `sha256:${string}`;
            value: {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "admitted";
                closureEligible: boolean;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            } | {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "rejected";
                closureEligible: false;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            } | {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "retry" | "blocked";
                closureEligible: false;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            };
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        currentBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }, {
        expectedResult: {
            ref: string;
            digest: `sha256:${string}`;
        };
        assessmentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        assessment: {
            kind: "contract_admitted_assessment_value";
            schemaVersion: "5.0.0";
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueRef: string;
            valueDigest: `sha256:${string}`;
            value: {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "admitted";
                closureEligible: boolean;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            } | {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "rejected";
                closureEligible: false;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            } | {
                kind: "result_assessment_value";
                schemaVersion: "5.0.0";
                expectedResult: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "retry" | "blocked";
                closureEligible: false;
                residuals: {
                    kind: "typed_residual";
                    code: string;
                    subjectRef: string;
                    message: string;
                }[];
            };
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        currentBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        assessment: {
            ref: string;
            digest: `sha256:${string}`;
        };
        disposition: "admitted" | "rejected";
        closureEligible: boolean;
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        assessment: {
            ref: string;
            digest: `sha256:${string}`;
        };
        disposition: "admitted" | "rejected";
        closureEligible: boolean;
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "basis_mismatch" | "evidence_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "basis_mismatch" | "evidence_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        assessment: {
            ref: string;
            digest: `sha256:${string}`;
        };
        disposition: "retry" | "blocked";
        closureEligible: false;
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        assessment: {
            ref: string;
            digest: `sha256:${string}`;
        };
        disposition: "retry" | "blocked";
        closureEligible: false;
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>>;
}>;
export interface InteractionResponsePort {
    readonly respond: ExactOwnerOperationPort<typeof select | typeof approve | typeof reject | typeof responseAssess | typeof answerEscalation>;
}
export interface ResultAssessmentPort {
    readonly assess: ExactOwnerOperationPort<typeof assess>;
}
export {};
