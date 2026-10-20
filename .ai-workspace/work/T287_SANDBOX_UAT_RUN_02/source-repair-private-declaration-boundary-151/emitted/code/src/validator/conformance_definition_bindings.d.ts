import { type ReadyGraphFunctionCatalog, type GraphFunctionCatalogView } from "../product/catalog.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { ExactDefinitionCallable } from "../shared/effect_definition.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type ConformanceEvaluatePacket } from "./conformance_operation.js";
export interface ConformanceEvaluationResourceAssertion {
    readonly kind: "conformance_evaluation_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly packet: ConformanceEvaluatePacket;
    readonly conformanceLaw: ReferenceDigest<"GtlConformanceLaw">;
    readonly declaredInventory: readonly ModulePublication[];
    readonly declarationCatalog?: Readonly<{
        catalog: ReadyGraphFunctionCatalog;
        catalogView: GraphFunctionCatalogView;
    }>;
}
/** Read-only Definition resource handoff. The existing admitted grants bind
 * the approved resource scope; no input packet, catalog or new proof is echoed. */
export interface ConformanceEvaluationResourceReceipt {
    readonly kind: "conformance_evaluation_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly invocation: ReferenceDigest;
    readonly request: ReferenceDigest;
    readonly capabilityGrants: readonly ReferenceDigest[];
}
export declare const CONFORMANCE_DEFINITION_BINDINGS: Readonly<{
    evaluate: Readonly<{
        gtl_program: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
        }>, null>, import("../product/admission_authority.js").AdmissionAuthorizedResources<ConformanceEvaluationResourceAssertion>, ConformanceEvaluationResourceReceipt>;
    }>;
}>;
