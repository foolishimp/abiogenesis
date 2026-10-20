import { type CatalogApplicationConstruction } from "./declaration_application.js";
import { type AbgEventResourceInput, type AbgEventResourceOutcome } from "../abg/definition_event_resource.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { ExactDefinitionCallable } from "../shared/effect_definition.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type { DeclarationCatalogEntry, GraphFunctionCatalogView, ReadyGraphFunctionCatalog } from "./catalog.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import { type ProductInstall, type ResolvedProductLock, type WorkspaceBinding } from "./environment.js";
export interface CatalogAdmissionResourceAssertion {
    readonly kind: "catalog_admission_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceInput;
    readonly workspaceBinding: WorkspaceBinding;
    readonly resolvedLock: ResolvedProductLock;
    readonly verifiedProducts: readonly VerifiedProductArtifact[];
    readonly admittedInstalls: readonly ProductInstall[];
    readonly publications: readonly Readonly<ModulePublication>[];
}
export interface CatalogAdmissionResourceReceipt {
    readonly kind: "catalog_admission_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "read_only_unchanged";
    readonly eventResource: AbgEventResourceOutcome;
    readonly workspaceBinding: ReferenceDigest<"WorkspaceBinding">;
    readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
    readonly installedProducts: readonly ReferenceDigest<"InstalledProduct">[];
    readonly descriptors: readonly ReferenceDigest<"ProductDescriptor">[];
    readonly contributionManifests: readonly ReferenceDigest<"ContributionManifest">[];
    readonly publishedGtl: readonly ReferenceDigest<"ModulePublication">[];
    readonly catalog: ReferenceDigest<"ProductCatalog"> | null;
}
export interface CatalogViewResourceAssertion {
    readonly kind: "catalog_view_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly catalog: ReadyGraphFunctionCatalog;
}
export interface CatalogViewResourceReceipt {
    readonly kind: "catalog_view_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "read_only_unchanged";
    readonly catalog: ReferenceDigest<"ProductCatalog">;
    readonly view: ReferenceDigest<"CatalogView"> | null;
}
export interface CatalogApplicationResourceAssertion {
    readonly kind: "catalog_application_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogRow: DeclarationCatalogEntry;
    readonly catalogView: GraphFunctionCatalogView;
    readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
    readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
    readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
    readonly construction: CatalogApplicationConstruction;
}
export interface CatalogApplicationResourceReceipt {
    readonly kind: "catalog_application_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "read_only_unchanged";
    readonly catalog: ReferenceDigest<"ProductCatalog">;
    readonly catalogRow: ReferenceDigest<"CatalogContributionRow">;
    readonly catalogView: ReferenceDigest<"CatalogView">;
    readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
    readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
    readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
    readonly application: ReferenceDigest<"CatalogApplication"> | null;
}
export declare const CATALOG_DEFINITION_BINDINGS: Readonly<{
    admit: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.catalog.admit";
        readonly memberKey: "admit";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        workspaceBinding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptors: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        contributionManifests: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }, {
        workspaceBinding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptors: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        contributionManifests: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        catalog: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: ({
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "admitted";
        } | {
            reason: {
                code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "rejected";
        } | {
            reason: {
                code: "compatibility_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "incompatible";
        } | {
            reason: {
                code: "canonical_handle_conflict" | "manifest_row_ambiguous";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "conflicting";
        } | {
            reason: {
                code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unready";
        } | {
            reason: {
                code: "publication_owner_unresolved";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unresolved";
        })[];
        conservation: {
            relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
            inputRowKeys: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            }[];
            conservationDigest: string;
        };
    }, {
        catalog: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: ({
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "admitted";
        } | {
            reason: {
                code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "rejected";
        } | {
            reason: {
                code: "compatibility_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "incompatible";
        } | {
            reason: {
                code: "canonical_handle_conflict" | "manifest_row_ambiguous";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "conflicting";
        } | {
            reason: {
                code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unready";
        } | {
            reason: {
                code: "publication_owner_unresolved";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unresolved";
        })[];
        conservation: {
            relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
            inputRowKeys: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            }[];
            conservationDigest: string;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<CatalogAdmissionResourceAssertion>, CatalogAdmissionResourceReceipt>;
    view: Readonly<{
        allowlist: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.view";
            readonly memberKey: "allowlist";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            allowlist: string[];
        }, {
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            allowlist: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            view: {
                ref: string;
                digest: `sha256:${string}`;
            };
            effectiveHandles: string[];
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        }, {
            view: {
                ref: string;
                digest: `sha256:${string}`;
            };
            effectiveHandles: string[];
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<CatalogViewResourceAssertion>, CatalogViewResourceReceipt>;
    }>;
    apply: Readonly<{
        node_type: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.apply";
            readonly memberKey: "node_type";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "node_type";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            applicationKind: "node_type";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "node_type";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            applicationKind: "node_type";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<CatalogApplicationResourceAssertion>, CatalogApplicationResourceReceipt>;
        overlay: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.apply";
            readonly memberKey: "overlay";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "overlay";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            applicationKind: "overlay";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "overlay";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            applicationKind: "overlay";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<CatalogApplicationResourceAssertion>, CatalogApplicationResourceReceipt>;
    }>;
}>;
