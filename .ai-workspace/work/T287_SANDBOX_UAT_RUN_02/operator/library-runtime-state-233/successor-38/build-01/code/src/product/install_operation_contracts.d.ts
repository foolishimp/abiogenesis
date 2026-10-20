import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
declare const install: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.product.install";
    readonly memberKey: "install";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    verifiedArtifact: {
        ref: string;
        digest: `sha256:${string}`;
    };
    descriptor: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributionManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    targetRoot: string;
    installPolicy: "clean" | "idempotent";
}, {
    verifiedArtifact: {
        ref: string;
        digest: `sha256:${string}`;
    };
    descriptor: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributionManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    targetRoot: string;
    installPolicy: "clean" | "idempotent";
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    disposition: "materialized" | "idempotent";
    installedProduct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installerManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    disposition: "materialized" | "idempotent";
    installedProduct: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installerManifest: {
        ref: string;
        digest: `sha256:${string}`;
    };
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const PRODUCT_INSTALL_CONTRACTS: Readonly<{
    install: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.install";
        readonly memberKey: "install";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        verifiedArtifact: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptor: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contributionManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        targetRoot: string;
        installPolicy: "clean" | "idempotent";
    }, {
        verifiedArtifact: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptor: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contributionManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        targetRoot: string;
        installPolicy: "clean" | "idempotent";
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        disposition: "materialized" | "idempotent";
        installedProduct: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installerManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        disposition: "materialized" | "idempotent";
        installedProduct: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installerManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
}>;
export interface ProductInstallPort {
    readonly install: ExactOwnerOperationPort<typeof install>;
}
export {};
