import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
declare const gtlProgram: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.conformance.evaluate";
    readonly memberKey: "gtl_program";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    program: {
        ref: string;
        digest: `sha256:${string}`;
    };
    conformanceLaw: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inventoryBasis: {
        kind: "program_only";
    } | {
        kind: "declared_inventory";
        inventory: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    };
}, {
    program: {
        ref: string;
        digest: `sha256:${string}`;
    };
    conformanceLaw: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inventoryBasis: {
        kind: "program_only";
    } | {
        kind: "declared_inventory";
        inventory: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    program: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inventory: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "passed" | "failed";
    diagnostics: {
        code: "invalid_kind" | "identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "invalid_contract" | "non_canonical_value" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch" | "invalid_packet";
        path: string;
        message: string;
    }[];
    violatedAuthorities: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    repairAffordances: [];
}, {
    program: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inventory: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    assessment: {
        ref: string;
        digest: `sha256:${string}`;
    };
    disposition: "passed" | "failed";
    diagnostics: {
        code: "invalid_kind" | "identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "invalid_contract" | "non_canonical_value" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch" | "invalid_packet";
        path: string;
        message: string;
    }[];
    violatedAuthorities: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    repairAffordances: [];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "invalid_program" | "law_mismatch" | "inventory_mismatch" | "assessment_blocked";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "invalid_program" | "law_mismatch" | "inventory_mismatch" | "assessment_blocked";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const CONFORMANCE_OPERATION_CONTRACTS: Readonly<{
    evaluate: Readonly<{
        gtl_program: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.conformance.evaluate";
            readonly memberKey: "gtl_program";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            conformanceLaw: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inventoryBasis: {
                kind: "program_only";
            } | {
                kind: "declared_inventory";
                inventory: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            };
        }, {
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            conformanceLaw: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inventoryBasis: {
                kind: "program_only";
            } | {
                kind: "declared_inventory";
                inventory: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inventory: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            assessment: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "passed" | "failed";
            diagnostics: {
                code: "invalid_kind" | "identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "invalid_contract" | "non_canonical_value" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch" | "invalid_packet";
                path: string;
                message: string;
            }[];
            violatedAuthorities: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            repairAffordances: [];
        }, {
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inventory: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            assessment: {
                ref: string;
                digest: `sha256:${string}`;
            };
            disposition: "passed" | "failed";
            diagnostics: {
                code: "invalid_kind" | "identity_mismatch" | "duplicate_identity" | "topology_mismatch" | "invalid_contract" | "non_canonical_value" | "carrier_mismatch" | "invalid_application" | "invalid_constructor" | "invalid_contribution" | "invalid_fibre" | "invalid_leaf_requirement" | "invalid_reference" | "invalid_result_cardinality" | "missing_binding" | "missing_contract" | "missing_membership" | "raw_subject_mismatch" | "invalid_packet";
                path: string;
                message: string;
            }[];
            violatedAuthorities: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            repairAffordances: [];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "invalid_program" | "law_mismatch" | "inventory_mismatch" | "assessment_blocked";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "invalid_program" | "law_mismatch" | "inventory_mismatch" | "assessment_blocked";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>;
export interface ConformancePort {
    readonly evaluateGtlProgram: ExactOwnerOperationPort<typeof gtlProgram>;
}
export {};
