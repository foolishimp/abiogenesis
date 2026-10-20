import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
declare const clean: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.workspace.create";
    readonly memberKey: "clean";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    targetRoot: string;
    createPolicy: "clean";
    scaffoldPolicy: "none" | "root_layout";
}, {
    targetRoot: string;
    createPolicy: "clean";
    scaffoldPolicy: "none" | "root_layout";
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    createPolicy: "clean" | "imported";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authorityMode: "clean" | "imported";
    scaffoldState: "none" | "preserved" | "root_layout";
    creationManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    createPolicy: "clean" | "imported";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authorityMode: "clean" | "imported";
    scaffoldState: "none" | "preserved" | "root_layout";
    creationManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const imported: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.workspace.create";
    readonly memberKey: "imported";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    targetRoot: string;
    createPolicy: "imported";
    importAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    preservationPolicy: "preserve_project_owned_roots" | "preserve_all_existing";
}, {
    targetRoot: string;
    createPolicy: "imported";
    importAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    preservationPolicy: "preserve_project_owned_roots" | "preserve_all_existing";
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    createPolicy: "clean" | "imported";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authorityMode: "clean" | "imported";
    scaffoldState: "none" | "preserved" | "root_layout";
    creationManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    createPolicy: "clean" | "imported";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authorityMode: "clean" | "imported";
    scaffoldState: "none" | "preserved" | "root_layout";
    creationManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const open: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.workspace.open";
    readonly memberKey: "open";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    targetRoot: string;
    expectedAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    targetRoot: string;
    expectedAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "incompatible" | "ready" | "stale" | "unbound" | "malformed";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    residuals: string[];
}, {
    disposition: "incompatible" | "ready" | "stale" | "unbound" | "malformed";
    workspace: {
        ref: string;
        digest: `sha256:${string}`;
    };
    authority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    residuals: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "authority_mismatch" | "invalid_target" | "missing_workspace";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "authority_mismatch" | "invalid_target" | "missing_workspace";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const WORKSPACE_OPERATION_CONTRACTS: Readonly<{
    create: Readonly<{
        clean: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.workspace.create";
            readonly memberKey: "clean";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            targetRoot: string;
            createPolicy: "clean";
            scaffoldPolicy: "none" | "root_layout";
        }, {
            targetRoot: string;
            createPolicy: "clean";
            scaffoldPolicy: "none" | "root_layout";
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            createPolicy: "clean" | "imported";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authorityMode: "clean" | "imported";
            scaffoldState: "none" | "preserved" | "root_layout";
            creationManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            createPolicy: "clean" | "imported";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authorityMode: "clean" | "imported";
            scaffoldState: "none" | "preserved" | "root_layout";
            creationManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        imported: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.workspace.create";
            readonly memberKey: "imported";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            targetRoot: string;
            createPolicy: "imported";
            importAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            preservationPolicy: "preserve_project_owned_roots" | "preserve_all_existing";
        }, {
            targetRoot: string;
            createPolicy: "imported";
            importAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            preservationPolicy: "preserve_project_owned_roots" | "preserve_all_existing";
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            createPolicy: "clean" | "imported";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authorityMode: "clean" | "imported";
            scaffoldState: "none" | "preserved" | "root_layout";
            creationManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            createPolicy: "clean" | "imported";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authorityMode: "clean" | "imported";
            scaffoldState: "none" | "preserved" | "root_layout";
            creationManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
    open: Readonly<{
        open: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.workspace.open";
            readonly memberKey: "open";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            targetRoot: string;
            expectedAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            targetRoot: string;
            expectedAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            disposition: "incompatible" | "ready" | "stale" | "unbound" | "malformed";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            residuals: string[];
        }, {
            disposition: "incompatible" | "ready" | "stale" | "unbound" | "malformed";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            authority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            residuals: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "authority_mismatch" | "invalid_target" | "missing_workspace";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "authority_mismatch" | "invalid_target" | "missing_workspace";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>;
export interface WorkspaceOperationPort {
    readonly create: ExactOwnerOperationPort<typeof clean | typeof imported>;
    readonly open: ExactOwnerOperationPort<typeof open>;
}
export {};
