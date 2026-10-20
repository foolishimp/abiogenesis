import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
declare const contextBootstrap: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.product.materialize";
    readonly memberKey: "context_bootstrap";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contextInputs: {
        name: string;
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("./index.js").JsonValue;
    }[];
}, {
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contextInputs: {
        name: string;
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        value: import("./index.js").JsonValue;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    materializationKind: "configuration" | "context_bootstrap";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    content: {
        ref: string;
        digest: `sha256:${string}`;
    };
    manifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: {
        disposition: "preserved" | "created" | "refreshed";
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    materializationKind: "configuration" | "context_bootstrap";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    content: {
        ref: string;
        digest: `sha256:${string}`;
    };
    manifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: {
        disposition: "preserved" | "created" | "refreshed";
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const configuration: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.product.materialize";
    readonly memberKey: "configuration";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    configurationContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inputs: import("./index.js").JsonValue;
}, {
    configurationContract: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    inputs: import("./index.js").JsonValue;
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    materializationKind: "configuration" | "context_bootstrap";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    content: {
        ref: string;
        digest: `sha256:${string}`;
    };
    manifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: {
        disposition: "preserved" | "created" | "refreshed";
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    materializationKind: "configuration" | "context_bootstrap";
    subject: {
        ref: string;
        digest: `sha256:${string}`;
    };
    content: {
        ref: string;
        digest: `sha256:${string}`;
    };
    manifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: {
        disposition: "preserved" | "created" | "refreshed";
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const MATERIALIZATION_OPERATION_CONTRACTS: Readonly<{
    context_bootstrap: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.materialize";
        readonly memberKey: "context_bootstrap";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contextInputs: {
            name: string;
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            value: import("./index.js").JsonValue;
        }[];
    }, {
        workspace: {
            ref: string;
            digest: `sha256:${string}`;
        };
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contextInputs: {
            name: string;
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            value: import("./index.js").JsonValue;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        materializationKind: "configuration" | "context_bootstrap";
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
        manifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: {
            disposition: "preserved" | "created" | "refreshed";
            content: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        materializationKind: "configuration" | "context_bootstrap";
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
        manifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: {
            disposition: "preserved" | "created" | "refreshed";
            content: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
    configuration: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.materialize";
        readonly memberKey: "configuration";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        configurationContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        inputs: import("./index.js").JsonValue;
    }, {
        configurationContract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        inputs: import("./index.js").JsonValue;
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        materializationKind: "configuration" | "context_bootstrap";
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
        manifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: {
            disposition: "preserved" | "created" | "refreshed";
            content: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        materializationKind: "configuration" | "context_bootstrap";
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        content: {
            ref: string;
            digest: `sha256:${string}`;
        };
        manifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: {
            disposition: "preserved" | "created" | "refreshed";
            content: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
}>;
export interface ProductMaterializationPort {
    readonly context_bootstrap: ExactOwnerOperationPort<typeof contextBootstrap>;
    readonly configuration: ExactOwnerOperationPort<typeof configuration>;
}
export {};
