import { type WorkspaceManifest } from "./workspace_operations.js";
import { type AbgEventResourceInput, type AbgEventResourceOutcome } from "../abg/definition_event_resource.js";
import { type ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type OwnerRequestOf, type OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import { type ProductInstall, type ResolvedProductLock, type WorkspaceAuthorityBasis, type WorkspaceDeclaredRoots } from "./environment.js";
import { PRODUCT_ENVIRONMENT_CONTRACTS, type ResolvedNativeContractClosure } from "./environment_operation_contracts.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
type ResolvePacket = typeof PRODUCT_ENVIRONMENT_CONTRACTS.resolve;
type ResolveRequest = OwnerRequestOf<ResolvePacket>;
type VerificationPacket = typeof PRODUCT_VERIFICATION_CONTRACTS.verify;
type SuccessfulVerificationOutput = Extract<OwnerSemanticOutput<VerificationPacket>, {
    readonly outcomeKind: "result";
}>;
export interface ProductResolutionVerifiedPreimage {
    readonly verification: ResolveRequest["verifiedCandidates"][number];
    readonly verifiedArtifact: VerifiedProductArtifact;
    readonly verificationOutput: SuccessfulVerificationOutput;
}
export interface ProductResolutionResourceAssertion {
    readonly kind: "product_resolution_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly verifiedPreimages: readonly ProductResolutionVerifiedPreimage[];
    readonly nativeContractClosure: ResolvedNativeContractClosure;
}
export interface ProductResolutionResourceReceipt {
    readonly kind: "product_resolution_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "read_only_unchanged";
    readonly verifiedArtifacts: readonly ReferenceDigest<"VerifiedProductArtifact">[];
    readonly resolvedLock: ReferenceDigest<"ResolvedProductLock"> | null;
    readonly nativeContractClosureDigest: string;
}
export interface ProductWorkspaceBindingResourceAssertion {
    readonly kind: "product_workspace_binding_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceInput;
    readonly workspaceAuthority: WorkspaceAuthorityBasis;
    readonly workspaceManifest: WorkspaceManifest;
    readonly admittedInstalls: readonly ProductInstall[];
    readonly resolvedLock: ResolvedProductLock;
    readonly declaredRoots: WorkspaceDeclaredRoots;
}
export interface ProductWorkspaceBindingResourceReceipt {
    readonly kind: "product_workspace_binding_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceOutcome;
    readonly workspaceAuthority: ReferenceDigest<"WorkspaceAuthority">;
    readonly admittedInstalls: readonly ReferenceDigest<"InstalledProduct">[];
    readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
    readonly binding: ReferenceDigest<"WorkspaceBinding"> | null;
}
export declare const PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS: Readonly<{
    resolve: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.resolve";
        readonly memberKey: "resolve";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<ProductResolutionResourceAssertion>, ProductResolutionResourceReceipt>;
    bind: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.workspace.bind";
        readonly memberKey: "bind";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<ProductWorkspaceBindingResourceAssertion>, ProductWorkspaceBindingResourceReceipt>;
}>;
export {};
