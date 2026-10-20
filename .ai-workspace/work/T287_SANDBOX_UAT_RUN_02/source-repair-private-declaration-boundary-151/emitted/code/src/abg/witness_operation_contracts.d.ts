import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
export declare const WITNESS_ACTS: readonly ["reprice", "attest", "hygiene-stamp", "intake", "run-resumed", "run-stopped"];
declare const reprice: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "reprice";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "reprice";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "reprice";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "reprice";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "reprice";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const attest: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "attest";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "attest";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "attest";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "attest";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "attest";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const hygieneStamp: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "hygiene-stamp";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "hygiene-stamp";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "hygiene-stamp";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "hygiene-stamp";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "hygiene-stamp";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const intake: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "intake";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "intake";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "intake";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "intake";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "intake";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const runResumed: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "run-resumed";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "run-resumed";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "run-resumed";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "run-resumed";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "run-resumed";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const runStopped: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.witness.admit";
    readonly memberKey: "run-stopped";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "run-stopped";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    act: "run-stopped";
    content: {
        kind: "typed_reason" | "typed_payload";
        contentContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("../index.js").JsonValue;
    };
    context: {
        kind: "basis";
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "workspace";
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "segment";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        segment: {
            ref: string;
            digest: `sha256:${string}`;
        };
    } | {
        kind: "run";
        run: {
            ref: string;
            digest: `sha256:${string}`;
        };
        basis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    act: "run-stopped";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    act: "run-stopped";
    witnessedAct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    admittedEvent: {
        ref: string;
        digest: `sha256:${string}`;
    };
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const WITNESS_OPERATION_CONTRACTS: Readonly<{
    admit: Readonly<{
        reprice: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "reprice";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "reprice";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "reprice";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "reprice";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "reprice";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        attest: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "attest";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "attest";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "attest";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "attest";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "attest";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        "hygiene-stamp": import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "hygiene-stamp";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "hygiene-stamp";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "hygiene-stamp";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "hygiene-stamp";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "hygiene-stamp";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        intake: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "intake";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "intake";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "intake";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "intake";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "intake";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        "run-resumed": import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "run-resumed";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "run-resumed";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "run-resumed";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "run-resumed";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "run-resumed";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        "run-stopped": import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "run-stopped";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "run-stopped";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            subjectKind: "run" | "workspace" | "authority_basis" | "evidence_claim" | "intake_item";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            act: "run-stopped";
            content: {
                kind: "typed_reason" | "typed_payload";
                contentContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                value: import("../index.js").JsonValue;
            };
            context: {
                kind: "basis";
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace";
                workspace: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "segment";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                segment: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            act: "run-stopped";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            act: "run-stopped";
            witnessedAct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            admittedEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>;
export interface WitnessAdmissionPort {
    readonly admit: ExactOwnerOperationPort<typeof reprice | typeof attest | typeof hygieneStamp | typeof intake | typeof runResumed | typeof runStopped>;
}
export {};
