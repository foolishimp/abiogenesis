import { type JsonValue } from "./canonical_json.js";
import { type Sha256Digest } from "./digests.js";
import { type OwnerContractSourceDeclaration, type OwnerDefinitionMetadata, type RuntimeContractSchema } from "./public_function_contracts.js";
import type { PublicDefinitionKeyLike } from "./public_invocation.js";
export declare const EXACT_OWNER_CONTRACT_KEY_SET_DIGEST: "sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f";
declare const OWNER_BINDING_PACKAGE_NAME = "@abiogenesis/typescript-tenant";
export type IntrinsicOwnerContractSlot = "request" | "result" | "refusal" | "non_terminal";
export type DefinitionExecutionBindingKind = "direct_owner_primitive" | "statically_composed_callable" | "owner_projection";
export interface ExactOwnerMemberCoordinate {
    readonly abstractModule: string;
    readonly exportName: string;
    readonly memberPath: readonly string[];
    readonly sourceModuleDigest: Sha256Digest;
    readonly memberDigest: Sha256Digest;
}
export interface OwnerNativeSchemaIdentity {
    readonly schemaRef: string;
    readonly schemaVersion: "5.0.0";
    readonly ownerMember: ExactOwnerMemberCoordinate;
}
export interface ExactOwnerContractReference {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly slot: IntrinsicOwnerContractSlot;
    readonly contractId: string;
    readonly contractVersion: "5.0.0";
    readonly source: ExactOwnerMemberCoordinate;
    readonly ownerAuthorityRef: string;
    readonly ownerAuthorityDigest: Sha256Digest;
    readonly nativeSchemaIdentity: OwnerNativeSchemaIdentity;
}
export interface ExactOwnerMetadataReference {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly source: ExactOwnerMemberCoordinate;
    readonly metadataDigest: Sha256Digest;
}
export interface ExactOwnerCallableCoordinate {
    readonly packageName: typeof OWNER_BINDING_PACKAGE_NAME;
    readonly packageExportPath: string;
    readonly namedExport: string;
    readonly memberPath: readonly string[];
    readonly ownerAuthorityRef: string;
    readonly callableContractDigest: Sha256Digest;
}
export interface ExecutionBindingSpecification {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly kind: DefinitionExecutionBindingKind;
    readonly callable: ExactOwnerCallableCoordinate;
    readonly semanticOwnerRef: string;
    readonly selectedFrameRef: string;
}
/** The accepted exact source-map packet. It is declarative and never callable. */
export interface OwnerContractPacket {
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly requestContract: ExactOwnerContractReference;
    readonly resultContract: ExactOwnerContractReference;
    readonly refusalContract: ExactOwnerContractReference;
    readonly nonTerminalContract: ExactOwnerContractReference | null;
    readonly metadata: ExactOwnerMetadataReference;
    readonly executionBindingSpecification: ExecutionBindingSpecification;
    readonly executionBindingSpecificationDigest: Sha256Digest;
}
export interface ResolvedOwnerContractBinding extends ExactOwnerContractReference {
    readonly schema: RuntimeContractSchema;
}
export interface OwnerContractModuleSource {
    readonly sourceModulePath: string;
    readonly packageExportPath: "./product" | "./abg" | "./validator";
    readonly definitionBindingExportName: string;
    readonly definitionBindingKind: DefinitionExecutionBindingKind;
    readonly contractRoot: Readonly<Record<string, unknown>>;
}
export declare const OWNER_CONTRACT_MODULE_SOURCES: readonly [Readonly<{
    sourceModulePath: "product/workspace_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "WORKSPACE_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        create: Readonly<{
            clean: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.workspace.create";
                readonly memberKey: "clean";
            }, RuntimeContractSchema<{
                targetRoot: string;
                createPolicy: "clean";
                scaffoldPolicy: "none" | "root_layout";
            }, {
                targetRoot: string;
                createPolicy: "clean";
                scaffoldPolicy: "none" | "root_layout";
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "filesystem_failure" | "invalid_target" | "workspace_exists" | "workspace_identity_conflict" | "invalid_scaffold" | "invalid_import_authority" | "preservation_failure";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            imported: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.workspace.create";
                readonly memberKey: "imported";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            open: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.workspace.open";
                readonly memberKey: "open";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
}>, Readonly<{
    sourceModulePath: "product/project_read_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "PRODUCT_PROJECT_READ_DEFINITION_BINDINGS";
    definitionBindingKind: "owner_projection";
    contractRoot: Readonly<{
        catalog_list: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "catalog_list";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
        catalog_describe: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "catalog_describe";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
        workspace_status: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "workspace_status";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
        install_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "install_evidence";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
        release_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "release_evidence";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
        ticket_consensus: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "ticket_consensus";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "abg/project_read_operation_contracts.ts";
    packageExportPath: "./abg";
    definitionBindingExportName: "ABG_PROJECT_READ_DEFINITION_BINDINGS";
    definitionBindingKind: "owner_projection";
    contractRoot: Readonly<{
        run_status: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_status";
        }, RuntimeContractSchema<{
            caseKey: "run_status";
            source: {
                sourceKind: "run";
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
            caseKey: "run_status";
            source: {
                sourceKind: "run";
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
        }>, RuntimeContractSchema<{
            caseKey: "run_status";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "run_status";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        graph_call_status: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "graph_call_status";
        }, RuntimeContractSchema<{
            caseKey: "graph_call_status";
            source: {
                sourceKind: "graph_call";
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
            caseKey: "graph_call_status";
            source: {
                sourceKind: "graph_call";
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
        }>, RuntimeContractSchema<{
            caseKey: "graph_call_status";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "graph_call_status";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
            } | {
                kind: "run_status_projection" | "graph_call_status_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                activeFluents: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        run_result: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_result";
        }, RuntimeContractSchema<{
            caseKey: "run_result";
            source: {
                sourceKind: "run";
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
            caseKey: "run_result";
            source: {
                sourceKind: "run";
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
        }>, RuntimeContractSchema<{
            caseKey: "run_result";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_result_projection" | "graph_call_result_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "run_result";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_result_projection" | "graph_call_result_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        graph_call_result: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "graph_call_result";
        }, RuntimeContractSchema<{
            caseKey: "graph_call_result";
            source: {
                sourceKind: "graph_call";
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
            caseKey: "graph_call_result";
            source: {
                sourceKind: "graph_call";
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
        }>, RuntimeContractSchema<{
            caseKey: "graph_call_result";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_result_projection" | "graph_call_result_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "graph_call_result";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_result_projection" | "graph_call_result_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        run_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_evidence";
        }, RuntimeContractSchema<{
            caseKey: "run_evidence";
            source: {
                sourceKind: "run";
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
            caseKey: "run_evidence";
            source: {
                sourceKind: "run";
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
        }>, RuntimeContractSchema<{
            caseKey: "run_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "run_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        graph_call_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "graph_call_evidence";
        }, RuntimeContractSchema<{
            caseKey: "graph_call_evidence";
            source: {
                sourceKind: "graph_call";
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
            caseKey: "graph_call_evidence";
            source: {
                sourceKind: "graph_call";
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
        }>, RuntimeContractSchema<{
            caseKey: "graph_call_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "graph_call_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        result_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "result_evidence";
        }, RuntimeContractSchema<{
            caseKey: "result_evidence";
            source: {
                sourceKind: "runtime_result";
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
            caseKey: "result_evidence";
            source: {
                sourceKind: "runtime_result";
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
        }>, RuntimeContractSchema<{
            caseKey: "result_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "result_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        assessment_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "assessment_evidence";
        }, RuntimeContractSchema<{
            caseKey: "assessment_evidence";
            source: {
                sourceKind: "result_assessment";
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
            caseKey: "assessment_evidence";
            source: {
                sourceKind: "result_assessment";
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
        }>, RuntimeContractSchema<{
            caseKey: "assessment_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "assessment_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        witness_evidence: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "witness_evidence";
        }, RuntimeContractSchema<{
            caseKey: "witness_evidence";
            source: {
                sourceKind: "witnessed_act";
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
            caseKey: "witness_evidence";
            source: {
                sourceKind: "witnessed_act";
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
        }>, RuntimeContractSchema<{
            caseKey: "witness_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "witness_evidence";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                eventAtoms: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        workspace_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "workspace_replay";
        }, RuntimeContractSchema<{
            caseKey: "workspace_replay";
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
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }, {
            caseKey: "workspace_replay";
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
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }>, RuntimeContractSchema<{
            caseKey: "workspace_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "workspace_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        run_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_replay";
        }, RuntimeContractSchema<{
            caseKey: "run_replay";
            source: {
                sourceKind: "run";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }, {
            caseKey: "run_replay";
            source: {
                sourceKind: "run";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }>, RuntimeContractSchema<{
            caseKey: "run_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "run_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        graph_call_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "graph_call_replay";
        }, RuntimeContractSchema<{
            caseKey: "graph_call_replay";
            source: {
                sourceKind: "graph_call";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }, {
            caseKey: "graph_call_replay";
            source: {
                sourceKind: "graph_call";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }>, RuntimeContractSchema<{
            caseKey: "graph_call_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "graph_call_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        interaction_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "interaction_replay";
        }, RuntimeContractSchema<{
            caseKey: "interaction_replay";
            source: {
                sourceKind: "fh_interaction";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }, {
            caseKey: "interaction_replay";
            source: {
                sourceKind: "fh_interaction";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }>, RuntimeContractSchema<{
            caseKey: "interaction_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "interaction_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        continuation_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "continuation_replay";
        }, RuntimeContractSchema<{
            caseKey: "continuation_replay";
            source: {
                sourceKind: "continuation";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }, {
            caseKey: "continuation_replay";
            source: {
                sourceKind: "continuation";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
            };
        }>, RuntimeContractSchema<{
            caseKey: "continuation_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "continuation_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        c_call_replay: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "c_call_replay";
        }, RuntimeContractSchema<{
            caseKey: "c_call_replay";
            source: {
                sourceKind: "c_program_atom_receipt";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
                cCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "c_call_replay";
            source: {
                sourceKind: "c_program_atom_receipt";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "ordinal_page";
                fromOrdinal: number;
                limit: number;
                cCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            caseKey: "c_call_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "c_call_replay";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                status: "workspace" | "refused" | "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "stopped";
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
            } | {
                kind: string;
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                fromOrdinal: number;
                limit: number;
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        workspace_gaps: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "workspace_gaps";
        }, RuntimeContractSchema<{
            caseKey: "workspace_gaps";
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
                kind: "workspace_gap_basis";
                gapBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "workspace_gaps";
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
                kind: "workspace_gap_basis";
                gapBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            caseKey: "workspace_gaps";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "workspace_gaps";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        run_gaps: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_gaps";
        }, RuntimeContractSchema<{
            caseKey: "run_gaps";
            source: {
                sourceKind: "run";
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
            caseKey: "run_gaps";
            source: {
                sourceKind: "run";
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
        }>, RuntimeContractSchema<{
            caseKey: "run_gaps";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "run_gaps";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "workspace_gap_projection" | "run_gap_projection";
                subject: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                gaps: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                frontiers: {
                    kind: "abg_admitted_gap";
                    schemaVersion: "5.0.0";
                    run: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    route: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    routeAdmissionEventRef: string;
                    stop: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    nextAction: {
                        result: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        contractRef: string;
                        valueKind: "next_action_basis" | "next_action_projection";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                    };
                    basis: {
                        contractRef: string;
                        valueKind: "next_action_basis";
                        valueDigest: `sha256:${string}`;
                        value: {
                            [x: string]: JsonValue;
                        };
                        inputEvidence: {
                            evidence: {
                                ref: string;
                                digest: `sha256:${string}`;
                            };
                            admissionEventRef: string;
                        }[];
                    };
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        run_lawful_actions: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.project.read";
            readonly memberKey: "run_lawful_actions";
        }, RuntimeContractSchema<{
            caseKey: "run_lawful_actions";
            source: {
                sourceKind: "run";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "next_action";
                projection: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            caseKey: "run_lawful_actions";
            source: {
                sourceKind: "run";
                sourceRef: string;
                sourceDigest: `sha256:${string}`;
            };
            projectionBasis: {
                projectionBasisRef: string;
                projectionBasisDigest: `sha256:${string}`;
            };
            selector: {
                kind: "next_action";
                projection: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>, RuntimeContractSchema<{
            caseKey: "run_lawful_actions";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_lawful_action_projection";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                actions: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run_lawful_action_projection";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                actions: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }, {
            caseKey: "run_lawful_actions";
            source: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            projection: {
                kind: "run_lawful_action_projection";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                actions: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                kind: "run_lawful_action_projection";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                actions: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                nativeLiveness: {
                    kind: "native_liveness_read_projection";
                    schemaVersion: "5.0.0";
                    profileSchedule: {
                        kind: "root_event_profile_schedule";
                        schemaVersion: "5.0.0";
                        spans: {
                            eventContractDigest: string;
                            firstOrdinal: number;
                            lastOrdinal: number;
                        }[];
                        boundaryEventRef: string | null;
                        currentEventContractDigest: string;
                    };
                    invocations: {
                        kind: "runtime_liveness_observer_projection";
                        schemaVersion: "5.0.0";
                        projectionRef: string;
                        projectionDigest: string;
                        scope: {
                            basisRef: string;
                            programRef: string;
                            runId: string;
                            graphFunctionRef: string;
                            graphCallId: string;
                            frameId: string;
                            cCallRef: string | null;
                            programLocusRef: string | null;
                            taskOrdinal: number | null;
                            vectorIndex: number | null;
                            edgeRef: string | null;
                            attempt: number;
                            actorInvocationRef: string | null;
                            actorRef: string | null;
                            workerBindingRef: string | null;
                            backendRef: string | null;
                        };
                        policyRef: string | null;
                        prefixDigest: string;
                        retryBudget: {
                            remaining: number | null;
                            retryEligible: boolean;
                            continuationRef: string | null;
                            terminalPolicy: "block" | "escalate" | "reprice_policy";
                            resultRejectionRef: string | null;
                        };
                        asOf: {
                            clockOriginRef: string;
                            elapsedMs: number;
                            eventRef: string | null;
                        };
                        coverage: {
                            probeRef: string;
                            source: "stdout" | "stderr" | "pty" | "structured_output" | "tool_progress" | "api_progress" | "process_lifecycle" | "worker_heartbeat" | "graph_progress" | "frame_progress" | "evaluator_progress" | "event_log" | "ledger" | "manifest" | "projection" | "report" | "dossier" | "archive" | "result_artifact";
                            state: "unknown" | "observed";
                        }[];
                        activeSystems: string[];
                        inactiveSystems: string[];
                        interruptedSystems: string[];
                        lastArtifactObservationRef: string | null;
                        evidenceRefs: string[];
                        lastActivityElapsedMs: number | null;
                        leaseDeadlineElapsedMs: number | null;
                        hardDeadlineElapsedMs: number | null;
                        leaseExpired: boolean;
                        hardCapReached: boolean;
                        externallyInterrupted: boolean;
                        artifactState: "admitted" | "absent" | "pending" | "rejected";
                        disposition: {
                            kind: "runtime_invocation_disposition";
                            schemaVersion: "5.0.0";
                            disposition: "retry" | "continue_waiting" | "controlled_terminate" | "yield_continuation" | "block" | "inspect_archive" | "escalate" | "reprice_policy";
                            reason: string;
                        };
                    }[];
                };
            };
        }>, RuntimeContractSchema<{
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found" | "cursor_invalid" | "range_invalid";
            issuePaths: string[];
            evidenceRefs: string[];
        } | {
            code: "not_ready" | "unknown_source" | "source_kind_mismatch" | "source_digest_mismatch" | "projection_basis_mismatch" | "projection_unsupported" | "not_found";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/verification_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "PRODUCT_VERIFICATION_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        verify: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.product.verify";
            readonly memberKey: "verify";
        }, RuntimeContractSchema<{
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productContent: {
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
            declaredDependencies: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            compatibilityInputs: {
                compatibilityRef: string;
                subjectRef: string;
            }[];
            targetKind: "packed_artifact";
        } | {
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedProduct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installManifest: {
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
            descriptor: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributionManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredDependencies: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            compatibilityInputs: {
                compatibilityRef: string;
                subjectRef: string;
            }[];
            targetKind: "installed_artifact";
        }, {
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            productContent: {
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
            declaredDependencies: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            compatibilityInputs: {
                compatibilityRef: string;
                subjectRef: string;
            }[];
            targetKind: "packed_artifact";
        } | {
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedProduct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installManifest: {
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
            descriptor: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributionManifest: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredDependencies: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            compatibilityInputs: {
                compatibilityRef: string;
                subjectRef: string;
            }[];
            targetKind: "installed_artifact";
        }>, RuntimeContractSchema<{
            targetKind: "packed_artifact";
            disposition: "locally_verified";
            verifiedArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            localNativeEvidence: {
                ref: string;
                digest: `sha256:${string}`;
            };
            pendingExternalSelectors: {
                selectorRef: `sha256:${string}`;
                sourceProductContentDigest: `sha256:${string}`;
                sourceContractRef: string;
                sourceContractDigest: `sha256:${string}`;
                sourcePackageExportPath: string;
                sourceNamedSymbol: string;
                physicalRelationRef: string;
                externalPackageName: string;
                externalModuleSpecifier: string;
                origin: {
                    kind: "import_declaration";
                    clause: "default" | "side_effect" | "named" | "namespace";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "export_declaration";
                    clause: "named" | "namespace" | "star";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "import_type_expression";
                    operator: "type" | "typeof";
                } | {
                    kind: "import_equals_declaration";
                } | {
                    kind: "type_reference_directive";
                } | {
                    kind: "module_augmentation";
                };
                selection: {
                    kind: "module";
                } | {
                    kind: "name";
                    targetName: string;
                    exposedName: string;
                } | {
                    kind: "namespace";
                    exposedName: string;
                } | {
                    kind: "all";
                };
                localAccessPath: string[];
            }[];
            definitionContractCoordinates: {
                operations: {
                    operationId: string;
                    members: {
                        memberKey: string;
                        slots: {
                            request: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            result: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            refusal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            nonTerminal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            } | null;
                        };
                    }[];
                }[];
            } | null;
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
        } | {
            targetKind: "installed_artifact";
            disposition: "installed_verified";
            verifiedArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedProduct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            definitionContractCoordinates: {
                operations: {
                    operationId: string;
                    members: {
                        memberKey: string;
                        slots: {
                            request: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            result: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            refusal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            nonTerminal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            } | null;
                        };
                    }[];
                }[];
            } | null;
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
            targetKind: "packed_artifact";
            disposition: "locally_verified";
            verifiedArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            localNativeEvidence: {
                ref: string;
                digest: `sha256:${string}`;
            };
            pendingExternalSelectors: {
                selectorRef: `sha256:${string}`;
                sourceProductContentDigest: `sha256:${string}`;
                sourceContractRef: string;
                sourceContractDigest: `sha256:${string}`;
                sourcePackageExportPath: string;
                sourceNamedSymbol: string;
                physicalRelationRef: string;
                externalPackageName: string;
                externalModuleSpecifier: string;
                origin: {
                    kind: "import_declaration";
                    clause: "default" | "side_effect" | "named" | "namespace";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "export_declaration";
                    clause: "named" | "namespace" | "star";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "import_type_expression";
                    operator: "type" | "typeof";
                } | {
                    kind: "import_equals_declaration";
                } | {
                    kind: "type_reference_directive";
                } | {
                    kind: "module_augmentation";
                };
                selection: {
                    kind: "module";
                } | {
                    kind: "name";
                    targetName: string;
                    exposedName: string;
                } | {
                    kind: "namespace";
                    exposedName: string;
                } | {
                    kind: "all";
                };
                localAccessPath: string[];
            }[];
            definitionContractCoordinates: {
                operations: {
                    operationId: string;
                    members: {
                        memberKey: string;
                        slots: {
                            request: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            result: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            refusal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            nonTerminal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            } | null;
                        };
                    }[];
                }[];
            } | null;
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
        } | {
            targetKind: "installed_artifact";
            disposition: "installed_verified";
            verifiedArtifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedProduct: {
                ref: string;
                digest: `sha256:${string}`;
            };
            definitionContractCoordinates: {
                operations: {
                    operationId: string;
                    members: {
                        memberKey: string;
                        slots: {
                            request: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            result: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            refusal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            };
                            nonTerminal: {
                                contractCatalog: {
                                    productId: string;
                                    productContentDigest: `sha256:${string}`;
                                    catalogId: string;
                                    catalogVersion: "5.0.0";
                                    catalogDigest: `sha256:${string}`;
                                };
                                flatRow: {
                                    contractId: string;
                                    contractVersion: "5.0.0";
                                    contractDigest: `sha256:${string}`;
                                };
                                nestedSelector: {
                                    selectorKind: "flat_contract";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: null;
                                } | {
                                    selectorKind: "operation_definition_slot";
                                    definitionKey: {
                                        operationId: string;
                                        memberKey: string;
                                    };
                                    slot: "request" | "result" | "refusal" | "non_terminal";
                                    definitionRef: string;
                                } | {
                                    selectorKind: "schema_definition";
                                    definitionKey: null;
                                    slot: null;
                                    definitionRef: string;
                                };
                            } | null;
                        };
                    }[];
                }[];
            } | null;
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
        }>, RuntimeContractSchema<{
            code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/environment_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        resolve: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.product.resolve";
            readonly memberKey: "resolve";
        }, RuntimeContractSchema<{
            requirements: {
                productId: string;
                packageVersion: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            verifiedCandidates: {
                invocation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                outcome: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }[];
        }, {
            requirements: {
                productId: string;
                packageVersion: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            verifiedCandidates: {
                invocation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                outcome: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }[];
        }>, RuntimeContractSchema<{
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            selections: {
                requirement: {
                    productId: string;
                    packageVersion: string;
                    requiredContractRefs: string[];
                    requiredCapabilityRefs: string[];
                };
                product: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verification: {
                    invocation: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    outcome: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }[];
            dependencyEdges: {
                kind: "requires";
                fromProductId: string;
                toProductId: string;
                packageVersion: string;
                compatibilityRef: string;
                compatibilityDisposition: "compatible";
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            selectorDispositions: ({
                kind: "semantic_occurrences";
                selectorRef: `sha256:${string}`;
                occurrenceRefs: `sha256:${string}`[];
            } | {
                kind: "no_external_contribution";
                selectorRef: `sha256:${string}`;
                reason: "locally_shadowed" | "not_in_source_contract_meaning";
                checkerWitnessDigest: `sha256:${string}`;
            })[];
            occurrences: {
                occurrenceRef: `sha256:${string}`;
                sourceProductContentDigest: `sha256:${string}`;
                sourceContractRef: string;
                sourceContractDigest: `sha256:${string}`;
                sourcePackageExportPath: string;
                sourceNamedSymbol: string;
                sourceWitnesses: {
                    witnessDigest: `sha256:${string}`;
                    selectorRef: `sha256:${string}`;
                    physicalRelationRef: string;
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    sourceStart: number;
                    sourceEnd: number;
                    origin: {
                        kind: "import_declaration";
                        clause: "default" | "side_effect" | "named" | "namespace";
                        declarationTypeOnly: boolean;
                        specifierTypeOnly: boolean;
                    } | {
                        kind: "export_declaration";
                        clause: "named" | "namespace" | "star";
                        declarationTypeOnly: boolean;
                        specifierTypeOnly: boolean;
                    } | {
                        kind: "import_type_expression";
                        operator: "type" | "typeof";
                    } | {
                        kind: "import_equals_declaration";
                    } | {
                        kind: "type_reference_directive";
                    } | {
                        kind: "module_augmentation";
                    };
                    selection: {
                        kind: "module";
                    } | {
                        kind: "name";
                        targetName: string;
                        exposedName: string;
                    } | {
                        kind: "namespace";
                        exposedName: string;
                    } | {
                        kind: "all";
                    };
                }[];
                semanticSelection: {
                    derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
                    targetExportedSymbol: string;
                    exposedMemberPath: string[];
                    semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
                    requiredSymbolSpace: "value" | "type" | "namespace";
                };
                checkerTarget: {
                    targetProductContentDigest: `sha256:${string}`;
                    targetPackageName: string;
                    targetPackageExportPath: string;
                    targetExportedSymbol: string;
                    requiredSymbolSpace: "value" | "type" | "namespace";
                    boundaryDeclarationWitnesses: {
                        declarationPath: string;
                        declarationDigest: `sha256:${string}`;
                        declarationKind: string;
                        exportedName: string;
                    }[];
                    targetIdentityDigest: `sha256:${string}`;
                };
            }[];
            nativeBindings: {
                kind: "external_binding";
                sourceOccurrenceRef: `sha256:${string}`;
                directDependencyEdge: {
                    kind: "requires";
                    productId: string;
                    packageVersion: string;
                    compatibilityRef: string;
                    requiredContractRefs: string[];
                    requiredCapabilityRefs: string[];
                };
                targetProductContentDigest: `sha256:${string}`;
                targetContractRef: string;
                targetContractDigest: `sha256:${string}`;
                targetPackageExportPath: string;
                targetNamedSymbol: string;
                checkerTarget: {
                    targetProductContentDigest: `sha256:${string}`;
                    targetPackageName: string;
                    targetPackageExportPath: string;
                    targetExportedSymbol: string;
                    requiredSymbolSpace: "value" | "type" | "namespace";
                    boundaryDeclarationWitnesses: {
                        declarationPath: string;
                        declarationDigest: `sha256:${string}`;
                        declarationKind: string;
                        exportedName: string;
                    }[];
                    targetIdentityDigest: `sha256:${string}`;
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
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            selections: {
                requirement: {
                    productId: string;
                    packageVersion: string;
                    requiredContractRefs: string[];
                    requiredCapabilityRefs: string[];
                };
                product: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verification: {
                    invocation: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    outcome: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }[];
            dependencyEdges: {
                kind: "requires";
                fromProductId: string;
                toProductId: string;
                packageVersion: string;
                compatibilityRef: string;
                compatibilityDisposition: "compatible";
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            }[];
            selectorDispositions: ({
                kind: "semantic_occurrences";
                selectorRef: `sha256:${string}`;
                occurrenceRefs: `sha256:${string}`[];
            } | {
                kind: "no_external_contribution";
                selectorRef: `sha256:${string}`;
                reason: "locally_shadowed" | "not_in_source_contract_meaning";
                checkerWitnessDigest: `sha256:${string}`;
            })[];
            occurrences: {
                occurrenceRef: `sha256:${string}`;
                sourceProductContentDigest: `sha256:${string}`;
                sourceContractRef: string;
                sourceContractDigest: `sha256:${string}`;
                sourcePackageExportPath: string;
                sourceNamedSymbol: string;
                sourceWitnesses: {
                    witnessDigest: `sha256:${string}`;
                    selectorRef: `sha256:${string}`;
                    physicalRelationRef: string;
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    sourceStart: number;
                    sourceEnd: number;
                    origin: {
                        kind: "import_declaration";
                        clause: "default" | "side_effect" | "named" | "namespace";
                        declarationTypeOnly: boolean;
                        specifierTypeOnly: boolean;
                    } | {
                        kind: "export_declaration";
                        clause: "named" | "namespace" | "star";
                        declarationTypeOnly: boolean;
                        specifierTypeOnly: boolean;
                    } | {
                        kind: "import_type_expression";
                        operator: "type" | "typeof";
                    } | {
                        kind: "import_equals_declaration";
                    } | {
                        kind: "type_reference_directive";
                    } | {
                        kind: "module_augmentation";
                    };
                    selection: {
                        kind: "module";
                    } | {
                        kind: "name";
                        targetName: string;
                        exposedName: string;
                    } | {
                        kind: "namespace";
                        exposedName: string;
                    } | {
                        kind: "all";
                    };
                }[];
                semanticSelection: {
                    derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
                    targetExportedSymbol: string;
                    exposedMemberPath: string[];
                    semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
                    requiredSymbolSpace: "value" | "type" | "namespace";
                };
                checkerTarget: {
                    targetProductContentDigest: `sha256:${string}`;
                    targetPackageName: string;
                    targetPackageExportPath: string;
                    targetExportedSymbol: string;
                    requiredSymbolSpace: "value" | "type" | "namespace";
                    boundaryDeclarationWitnesses: {
                        declarationPath: string;
                        declarationDigest: `sha256:${string}`;
                        declarationKind: string;
                        exportedName: string;
                    }[];
                    targetIdentityDigest: `sha256:${string}`;
                };
            }[];
            nativeBindings: {
                kind: "external_binding";
                sourceOccurrenceRef: `sha256:${string}`;
                directDependencyEdge: {
                    kind: "requires";
                    productId: string;
                    packageVersion: string;
                    compatibilityRef: string;
                    requiredContractRefs: string[];
                    requiredCapabilityRefs: string[];
                };
                targetProductContentDigest: `sha256:${string}`;
                targetContractRef: string;
                targetContractDigest: `sha256:${string}`;
                targetPackageExportPath: string;
                targetNamedSymbol: string;
                checkerTarget: {
                    targetProductContentDigest: `sha256:${string}`;
                    targetPackageName: string;
                    targetPackageExportPath: string;
                    targetExportedSymbol: string;
                    requiredSymbolSpace: "value" | "type" | "namespace";
                    boundaryDeclarationWitnesses: {
                        declarationPath: string;
                        declarationDigest: `sha256:${string}`;
                        declarationKind: string;
                        exportedName: string;
                    }[];
                    targetIdentityDigest: `sha256:${string}`;
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
        }>, RuntimeContractSchema<{
            code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        bind: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.workspace.bind";
            readonly memberKey: "bind";
        }, RuntimeContractSchema<{
            workspaceAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedSet: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredRoots: {
                rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
                path: string;
            }[];
        }, {
            workspaceAuthority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedSet: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredRoots: {
                rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
                path: string;
            }[];
        }>, RuntimeContractSchema<{
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedSet: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredRoots: {
                rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
                path: string;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            installedSet: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            resolvedLock: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaredRoots: {
                rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
                path: string;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, RuntimeContractSchema<{
            code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/install_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "PRODUCT_INSTALL_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        install: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.product.install";
            readonly memberKey: "install";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
            code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/catalog_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "CATALOG_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        admit: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.admit";
            readonly memberKey: "admit";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
            code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        view: Readonly<{
            allowlist: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.catalog.view";
                readonly memberKey: "allowlist";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
        }>;
        apply: Readonly<{
            node_type: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.catalog.apply";
                readonly memberKey: "node_type";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            overlay: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.catalog.apply";
                readonly memberKey: "overlay";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
        }>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/run_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "RUN_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        invoke: Readonly<{
            invoke: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.run.invoke";
                readonly memberKey: "invoke";
            }, RuntimeContractSchema<{
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                catalogHandle: string;
                inputContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                input: JsonValue;
                catalogView: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                allowlist: string[];
                sourceBasis: {
                    kind: "none";
                } | {
                    kind: "admitted_source_result";
                    projectionAuthority: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    sourceResult: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                catalogHandle: string;
                inputContract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                input: JsonValue;
                catalogView: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                allowlist: string[];
                sourceBasis: {
                    kind: "none";
                } | {
                    kind: "admitted_source_result";
                    projectionAuthority: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    sourceResult: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                invocationKind: "invoke" | "start";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                disposition: "completed" | "blocked" | "runtime_failed";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                stop: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                invocationKind: "invoke" | "start";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                disposition: "completed" | "blocked" | "runtime_failed";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                stop: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<{
                code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
                invocationKind: "invoke" | "start";
                disposition: "held" | "gap_stop";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                invocationKind: "invoke" | "start";
                disposition: "held" | "gap_stop";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>>;
            start: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.run.invoke";
                readonly memberKey: "start";
            }, RuntimeContractSchema<{
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                scope: "program";
                target: {
                    kind: "next";
                } | {
                    kind: "graph_function";
                    handle: string;
                } | {
                    kind: "asset";
                    handle: string;
                } | {
                    kind: "declared_start";
                    start: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                until: "converged";
                catalogView: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                allowlist: string[];
                input: {
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueRef: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                };
                fhMode?: "direct" | "human-proxy" | undefined;
                rootMode?: "direct" | "supervised" | undefined;
                sourceBasis: {
                    kind: "none";
                } | {
                    kind: "admitted_source_result";
                    projectionAuthority: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    sourceResult: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                scope: "program";
                target: {
                    kind: "next";
                } | {
                    kind: "graph_function";
                    handle: string;
                } | {
                    kind: "asset";
                    handle: string;
                } | {
                    kind: "declared_start";
                    start: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                until: "converged";
                catalogView: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                allowlist: string[];
                input: {
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueRef: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                };
                fhMode: "direct" | "human-proxy";
                rootMode: "direct" | "supervised";
                sourceBasis: {
                    kind: "none";
                } | {
                    kind: "admitted_source_result";
                    projectionAuthority: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    sourceResult: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                invocationKind: "invoke" | "start";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                disposition: "completed" | "blocked" | "runtime_failed";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                stop: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                invocationKind: "invoke" | "start";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                disposition: "completed" | "blocked" | "runtime_failed";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                terminalResult: {
                    kind: "abg_typed_terminal_result";
                    schemaVersion: "5.0.0";
                    result: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    contract: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    valueKind: string;
                    valueDigest: `sha256:${string}`;
                    value: JsonValue;
                    producer: {
                        runRef: string;
                        graphCallRef: string;
                        invocationAdmissionRef: string;
                        program: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        graphFunction: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        executionBasis: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                        cCallRef: string;
                        resultAdmissionEventRef: string;
                        judgmentRef: string;
                        judgmentAdmissionEventRef: string;
                        terminalRoute: {
                            ref: string;
                            digest: `sha256:${string}`;
                        };
                    };
                    projectionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                stop: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<{
                code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
                invocationKind: "invoke" | "start";
                disposition: "held" | "gap_stop";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                invocationKind: "invoke" | "start";
                disposition: "held" | "gap_stop";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                interaction: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                gap: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>>;
        }>;
        continue: Readonly<{
            current_intent: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.run.continue";
                readonly memberKey: "current_intent";
            }, RuntimeContractSchema<{
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                currentIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuationInput: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                expectedBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                selectedAction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basisRelation: {
                    kind: "same_basis";
                } | {
                    kind: "authority_changed";
                    coveringReprice: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                currentIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuationInput: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                expectedBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                selectedAction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basisRelation: {
                    kind: "same_basis";
                } | {
                    kind: "authority_changed";
                    coveringReprice: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                continuationKind: "current_intent";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                admittedIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                successor: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "completed" | "blocked" | "runtime_failed";
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                continuationKind: "current_intent";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                admittedIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                successor: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "completed" | "blocked" | "runtime_failed";
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<{
                code: "basis_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "replay_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "basis_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "replay_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
                continuationKind: "current_intent";
                disposition: "held" | "gap_stop";
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
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                continuationKind: "current_intent";
                disposition: "held" | "gap_stop";
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
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>>;
            selected_action: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.run.continue";
                readonly memberKey: "selected_action";
            }, RuntimeContractSchema<{
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                currentIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuationInput: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                expectedBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                selectedAction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basisRelation: {
                    kind: "same_basis";
                } | {
                    kind: "authority_changed";
                    coveringReprice: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                currentIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuationInput: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                expectedBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            } | {
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                continuation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                selectedAction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                basisRelation: {
                    kind: "same_basis";
                } | {
                    kind: "authority_changed";
                    coveringReprice: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                continuationKind: "selected_action";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                admittedIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                successor: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "completed" | "blocked" | "runtime_failed";
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                continuationKind: "selected_action";
                run: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphCall: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                admittedIntent: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                successor: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                disposition: "completed" | "blocked" | "runtime_failed";
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<{
                code: "basis_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "replay_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "basis_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "replay_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
                continuationKind: "selected_action";
                disposition: "held" | "gap_stop";
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
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }, {
                continuationKind: "selected_action";
                disposition: "held" | "gap_stop";
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
                replay: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>>;
        }>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/interaction_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "INTERACTION_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        respond: Readonly<{
            select: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.interaction.respond";
                readonly memberKey: "select";
            }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                currentBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<never, never>, RuntimeContractSchema<{
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
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
            approve: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.interaction.respond";
                readonly memberKey: "approve";
            }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                currentBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<never, never>, RuntimeContractSchema<{
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
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
            reject: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.interaction.respond";
                readonly memberKey: "reject";
            }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                currentBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<never, never>, RuntimeContractSchema<{
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
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
            assess: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.interaction.respond";
                readonly memberKey: "assess";
            }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                currentBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<never, never>, RuntimeContractSchema<{
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
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
            answer_escalation: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.interaction.respond";
                readonly memberKey: "answer_escalation";
            }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
                evidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                currentBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            }>, RuntimeContractSchema<never, never>, RuntimeContractSchema<{
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "kind_mismatch" | "basis_mismatch" | "contract_mismatch" | "capability_mismatch" | "value_mismatch" | "missing_interaction" | "resolved_interaction" | "choice_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, RuntimeContractSchema<{
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
}>, Readonly<{
    sourceModulePath: "product/interaction_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "RESULT_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        assess: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.result.assess";
            readonly memberKey: "assess";
        }, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
            code: "evidence_mismatch" | "basis_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "evidence_mismatch" | "basis_mismatch" | "contract_mismatch" | "digest_mismatch" | "capability_mismatch" | "result_mismatch" | "value_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, RuntimeContractSchema<{
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
}>, Readonly<{
    sourceModulePath: "abg/witness_operation_contracts.ts";
    packageExportPath: "./abg";
    definitionBindingExportName: "WITNESS_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        admit: Readonly<{
            reprice: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "reprice";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            attest: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "attest";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            "hygiene-stamp": OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "hygiene-stamp";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            intake: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "intake";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            "run-resumed": OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "run-resumed";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }, {
                code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
                issuePaths: string[];
                evidenceRefs: string[];
            }>, null>;
            "run-stopped": OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.witness.admit";
                readonly memberKey: "run-stopped";
            }, RuntimeContractSchema<{
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
                    value: JsonValue;
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
                    value: JsonValue;
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
}>, Readonly<{
    sourceModulePath: "validator/conformance_operation_contracts.ts";
    packageExportPath: "./validator";
    definitionBindingExportName: "CONFORMANCE_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        evaluate: Readonly<{
            gtl_program: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.conformance.evaluate";
                readonly memberKey: "gtl_program";
            }, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
            }>, RuntimeContractSchema<{
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
}>, Readonly<{
    sourceModulePath: "product/materialization_operation_contracts.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "MATERIALIZATION_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        context_bootstrap: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.product.materialize";
            readonly memberKey: "context_bootstrap";
        }, RuntimeContractSchema<{
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
                value: JsonValue;
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
                value: JsonValue;
            }[];
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
            code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        configuration: OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.product.materialize";
            readonly memberKey: "configuration";
        }, RuntimeContractSchema<{
            configurationContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inputs: JsonValue;
        }, {
            configurationContract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            binding: {
                ref: string;
                digest: `sha256:${string}`;
            };
            inputs: JsonValue;
        }>, RuntimeContractSchema<{
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
        }>, RuntimeContractSchema<{
            code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "binding_mismatch" | "workspace_mismatch" | "contract_mismatch" | "filesystem_failure" | "authority_mismatch" | "input_mismatch" | "mutable_default";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>, Readonly<{
    sourceModulePath: "product/release_snapshot_operations.ts";
    packageExportPath: "./product";
    definitionBindingExportName: "RELEASE_SNAPSHOT_DEFINITION_BINDINGS";
    definitionBindingKind: "statically_composed_callable";
    contractRoot: Readonly<{
        snapshot: Readonly<{
            published_rc: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.release.snapshot";
                readonly memberKey: "published_rc";
            }, RuntimeContractSchema<{
                qualificationBasis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                lawBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verdict: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                requestedIdentity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                qualificationBasis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                lawBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verdict: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                requestedIdentity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                kind: "release_snapshot_result";
                schemaVersion: "5.0.0";
                memberKey: "published_rc";
                disposition: "complete";
                identity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                };
            }, {
                kind: "release_snapshot_result";
                schemaVersion: "5.0.0";
                memberKey: "published_rc";
                disposition: "complete";
                identity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                };
            }>, RuntimeContractSchema<{
                kind: "release_snapshot_refusal";
                schemaVersion: "5.0.0";
                memberKey: "published_rc" | "tapped_release";
                disposition: "refused" | "incomplete_effect";
                code: "identity_mismatch" | "basis_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
                message: string;
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                } | null;
            }, {
                kind: "release_snapshot_refusal";
                schemaVersion: "5.0.0";
                memberKey: "published_rc" | "tapped_release";
                disposition: "refused" | "incomplete_effect";
                code: "identity_mismatch" | "basis_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
                message: string;
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                } | null;
            }>, null>;
            tapped_release: OwnerContractSourceDeclaration<{
                readonly operationId: "abg.operation.release.snapshot";
                readonly memberKey: "tapped_release";
            }, RuntimeContractSchema<{
                acceptedRc: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                acceptance: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                predecessor: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                qualificationBasis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                lawBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verdict: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                requestedIdentity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }, {
                acceptedRc: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                acceptance: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                predecessor: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                qualificationBasis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                lawBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                verdict: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                requestedIdentity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            }>, RuntimeContractSchema<{
                memberKey: "tapped_release";
                decision: "accept";
                publication: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                acceptance: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                addendum: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "release_snapshot_result";
                schemaVersion: "5.0.0";
                disposition: "complete";
                identity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                };
            }, {
                memberKey: "tapped_release";
                decision: "accept";
                publication: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                acceptance: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                addendum: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                kind: "release_snapshot_result";
                schemaVersion: "5.0.0";
                disposition: "complete";
                identity: {
                    productId: string;
                    namespace: "abiogenesis";
                    profile: "one_project_unqualified";
                    projectSubtree: ".";
                    versionLine: "5.0.0";
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                };
            }>, RuntimeContractSchema<{
                kind: "release_snapshot_refusal";
                schemaVersion: "5.0.0";
                memberKey: "published_rc" | "tapped_release";
                disposition: "refused" | "incomplete_effect";
                code: "identity_mismatch" | "basis_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
                message: string;
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                } | null;
            }, {
                kind: "release_snapshot_refusal";
                schemaVersion: "5.0.0";
                memberKey: "published_rc" | "tapped_release";
                disposition: "refused" | "incomplete_effect";
                code: "identity_mismatch" | "basis_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
                message: string;
                artifact: {
                    ref: string;
                    digest: `sha256:${string}`;
                } | null;
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
                    sourceCommit: string | null;
                    sourceTree: string | null;
                    refs: {
                        ref: string;
                        object: string;
                        peeled: string;
                    }[];
                    snapshotManifest: {
                        ref: string;
                        digest: `sha256:${string}`;
                    } | null;
                    snapshotFiles: {
                        path: string;
                        digest: `sha256:${string}`;
                    }[];
                } | null;
            }>, null>;
        }>;
    }>;
}>];
export interface ResolvedOwnerContractSource {
    readonly sourceModulePath: string;
    readonly sourceModuleDigest: Sha256Digest;
    readonly memberDigest: Sha256Digest;
    readonly declaration: OwnerContractSourceDeclaration;
    readonly packet: OwnerContractPacket;
    readonly contracts: Readonly<{
        readonly request: ResolvedOwnerContractBinding;
        readonly result: ResolvedOwnerContractBinding;
        readonly refusal: ResolvedOwnerContractBinding;
        readonly nonTerminal: ResolvedOwnerContractBinding | null;
    }>;
    readonly metadata: OwnerDefinitionMetadata;
}
export declare const OWNER_CONTRACT_SOURCES: readonly ResolvedOwnerContractSource[];
export declare const OWNER_CONTRACT_KEY_SET_DIGEST: `sha256:${string}`;
export declare const OWNER_CONTRACT_SOURCE_MAP: Readonly<{
    [k: string]: Readonly<{
        [k: string]: ResolvedOwnerContractSource;
    }>;
}>;
export {};
