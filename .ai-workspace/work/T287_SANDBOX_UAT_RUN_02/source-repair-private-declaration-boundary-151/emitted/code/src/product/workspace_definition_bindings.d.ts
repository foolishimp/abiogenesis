import { type ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type OwnerContractSourceDeclaration } from "../shared/public_function_contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
export interface WorkspaceResourceAssertion {
    readonly kind: "workspace_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly targetRoot: string;
    readonly targetRootDigest: Sha256Digest;
}
export interface WorkspaceResourceReceipt {
    readonly kind: "workspace_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly targetRoot: string;
    readonly targetRootDigest: Sha256Digest;
    readonly manifest: Readonly<{
        readonly locator: string;
        readonly valueDigest: Sha256Digest;
    }> | null;
}
export declare const WORKSPACE_DEFINITION_BINDINGS: Readonly<{
    create: Readonly<{
        clean: ExactDefinitionCallable<OwnerContractSourceDeclaration<{
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
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<WorkspaceResourceAssertion>, WorkspaceResourceReceipt>;
        imported: ExactDefinitionCallable<OwnerContractSourceDeclaration<{
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
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<WorkspaceResourceAssertion>, WorkspaceResourceReceipt>;
    }>;
    open: Readonly<{
        open: ExactDefinitionCallable<OwnerContractSourceDeclaration<{
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
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<WorkspaceResourceAssertion>, WorkspaceResourceReceipt>;
    }>;
}>;
