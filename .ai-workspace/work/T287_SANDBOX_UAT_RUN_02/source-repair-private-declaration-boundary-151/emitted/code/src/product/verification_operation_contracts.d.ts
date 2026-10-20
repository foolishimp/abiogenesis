import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
declare const verify: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.product.verify";
    readonly memberKey: "verify";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const PRODUCT_VERIFICATION_CONTRACTS: Readonly<{
    verify: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.verify";
        readonly memberKey: "verify";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "identity_mismatch" | "contribution_mismatch" | "stale_installed_state" | "artifact_mismatch" | "content_mismatch" | "lock_mismatch" | "descriptor_mismatch" | "invalid_declared_dependency" | "unsupported_contract";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
}>;
export interface ProductVerificationPort {
    readonly verify: ExactOwnerOperationPort<typeof verify>;
}
export {};
