import { type AbgEventResourceReceipt } from "../abg/definition_event_resource.js";
import { type DurablePrefixCoordinate, type ExactPrefixArtifactTruthProjection } from "../abg/index.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type CatalogDescribeProjectReadPacket, type CatalogListProjectReadPacket, type InstallEvidenceProjectReadPacket, type ReleaseEvidenceProjectReadPacket, type TicketConsensusProjectReadPacket, type WorkspaceStatusProjectReadPacket } from "./project_read_ports.js";
import { type WorkspaceManifest } from "./workspace_operations.js";
type ProjectReadPacket = CatalogListProjectReadPacket | CatalogDescribeProjectReadPacket | WorkspaceStatusProjectReadPacket | InstallEvidenceProjectReadPacket | ReleaseEvidenceProjectReadPacket | TicketConsensusProjectReadPacket;
export interface ProductProjectReadResourceAssertion<TPacket extends ProjectReadPacket = ProjectReadPacket> {
    readonly kind: "product_project_read_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly packet: TPacket;
    readonly artifactTruth?: ExactPrefixArtifactTruthProjection;
    readonly workspaceManifest?: WorkspaceManifest;
    readonly runtime?: Readonly<{
        readonly prefix: DurablePrefixCoordinate;
        readonly runId: string;
        readonly graphCallId: string;
    }>;
}
export declare const PRODUCT_PROJECT_READ_DEFINITION_BINDINGS: Readonly<{
    catalog_list: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "catalog_list";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "catalog_list";
        source: {
            sourceKind: "catalog";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "catalog_list";
            visibility: {
                kind: "workspace_catalog";
            } | {
                kind: "session_view";
                view: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        };
    }, {
        caseKey: "catalog_list";
        source: {
            sourceKind: "catalog";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "catalog_list";
            visibility: {
                kind: "workspace_catalog";
            } | {
                kind: "session_view";
                view: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "catalog_list";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "catalog_list_projection";
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            visibility: "workspace_catalog" | "session_view";
            view: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            rows: {
                handle: string;
                contributionKind: "graph_function" | "node_type" | "overlay";
                entry: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                readiness: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
            }[];
        };
    }, {
        caseKey: "catalog_list";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "catalog_list_projection";
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            visibility: "workspace_catalog" | "session_view";
            view: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            rows: {
                handle: string;
                contributionKind: "graph_function" | "node_type" | "overlay";
                entry: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                readiness: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
            }[];
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>, ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>>;
    catalog_describe: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "catalog_describe";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "catalog_describe";
        source: {
            sourceKind: "catalog";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "catalog_describe";
            handle: string;
            visibilityBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        caseKey: "catalog_describe";
        source: {
            sourceKind: "catalog";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "catalog_describe";
            handle: string;
            visibilityBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "catalog_describe";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "catalog_description_projection";
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            visibility: "workspace_catalog" | "session_view";
            view: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            handle: string;
            contributionKind: "graph_function" | "node_type" | "overlay";
            entry: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readiness: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
        };
    }, {
        caseKey: "catalog_describe";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "catalog_description_projection";
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            visibility: "workspace_catalog" | "session_view";
            view: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            handle: string;
            contributionKind: "graph_function" | "node_type" | "overlay";
            entry: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readiness: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>, ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>>;
    workspace_status: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "workspace_status";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "workspace_status";
        source: {
            sourceKind: "workspace_binding";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "none";
        };
    }, {
        caseKey: "workspace_status";
        source: {
            sourceKind: "workspace_binding";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "none";
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "workspace_status";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "workspace_status_projection";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            workspaceAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productSet: {
                ref: string;
                digest: `sha256:${string}`;
            };
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            boundProducts: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            declaredRoots: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            configurations: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            readiness: "ready";
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
            admissionEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        caseKey: "workspace_status";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "workspace_status_projection";
            workspace: {
                ref: string;
                digest: `sha256:${string}`;
            };
            workspaceAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productSet: {
                ref: string;
                digest: `sha256:${string}`;
            };
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            boundProducts: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            declaredRoots: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            configurations: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            readiness: "ready";
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
            admissionEvent: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>, ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>>;
    install_evidence: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "install_evidence";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "install_evidence";
        source: {
            sourceKind: "installed_product";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "install_manifest";
            manifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        caseKey: "install_evidence";
        source: {
            sourceKind: "installed_product";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "install_manifest";
            manifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "install_evidence";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "install_evidence_projection";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            product: {
                ref: string;
                digest: `sha256:${string}`;
            };
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productContent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            manifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            producer: "ProductInstallPort.install";
            basis: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }, {
        caseKey: "install_evidence";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "install_evidence_projection";
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            product: {
                ref: string;
                digest: `sha256:${string}`;
            };
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productContent: {
                ref: string;
                digest: `sha256:${string}`;
            };
            manifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            producer: "ProductInstallPort.install";
            basis: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>, ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>>;
    release_evidence: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "release_evidence";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "release_evidence";
        source: {
            sourceKind: "release_cut";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "release_operation_observation";
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        caseKey: "release_evidence";
        source: {
            sourceKind: "release_cut";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "release_operation_observation";
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "release_evidence";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "release_evidence_projection";
            disposition: "accepted" | "incomplete_effect" | "superseded" | "published_unqualified" | "qualified_unaccepted";
            observationArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: "incomplete" | "accepted" | "withheld";
            ownerRuling?: {
                ref: string;
                digest: `sha256:${string}`;
            } | null | undefined;
            addendum?: {
                ref: string;
                digest: `sha256:${string}`;
            } | null | undefined;
            originalRuling?: JsonValue | undefined;
            sourceApproval?: JsonValue | undefined;
            releaseCut: {
                ref: string;
                digest: `sha256:${string}`;
            };
            snapshotManifest: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            artifacts: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            qualification: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }, {
        caseKey: "release_evidence";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "release_evidence_projection";
            disposition: "accepted" | "incomplete_effect" | "superseded" | "published_unqualified" | "qualified_unaccepted";
            observationArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: "incomplete" | "accepted" | "withheld";
            ownerRuling?: {
                ref: string;
                digest: `sha256:${string}`;
            } | null | undefined;
            addendum?: {
                ref: string;
                digest: `sha256:${string}`;
            } | null | undefined;
            originalRuling?: JsonValue | undefined;
            sourceApproval?: JsonValue | undefined;
            releaseCut: {
                ref: string;
                digest: `sha256:${string}`;
            };
            snapshotManifest: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            artifacts: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            qualification: {
                ref: string;
                digest: `sha256:${string}`;
            };
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, {
        kind: "release_evidence_resources";
        schemaVersion: "5.0.0";
        eventResource: Readonly<{
            readonly kind: "reopen_abg_event_resource";
            readonly schemaVersion: "5.0.0";
            readonly closeHandoff: import("../abg/event_store.js").EventStoreCloseHandoff;
            readonly handoffDigest: import("../shared/digests.js").Sha256Digest;
        }>;
        artifactPath: string;
    }, {
        kind: "release_evidence_receipt";
        schemaVersion: "5.0.0";
        eventResource: AbgEventResourceReceipt & {
            readonly acquisitionKind: "reopen";
        };
    }>;
    ticket_consensus: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.project.read";
        readonly memberKey: "ticket_consensus";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "ticket_consensus";
        source: {
            sourceKind: "consensus_result";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "ticket_consensus";
            ticket: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outputAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            replayBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        caseKey: "ticket_consensus";
        source: {
            sourceKind: "consensus_result";
            sourceRef: string;
            sourceDigest: `sha256:${string}`;
        };
        projectionBasis: {
            projectionBasisRef: string;
            projectionBasisDigest: `sha256:${string}`;
        };
        selector: {
            kind: "ticket_consensus";
            ticket: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outputAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            replayBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        caseKey: "ticket_consensus";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "ticket_consensus_projection";
            ticket: {
                ref: string;
                digest: `sha256:${string}`;
            };
            consensus: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outputAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            replayBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }, {
        caseKey: "ticket_consensus";
        source: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        projection: {
            kind: "ticket_consensus_projection";
            ticket: {
                ref: string;
                digest: `sha256:${string}`;
            };
            consensus: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outputAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            replayBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
        issuePaths: string[];
        evidenceRefs: string[];
    } | {
        code: "incompatible" | "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "inadmissible" | "unbound" | "unknown_handle" | "ambiguous_handle" | "hidden_by_view";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>, ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>>;
}>;
export {};
