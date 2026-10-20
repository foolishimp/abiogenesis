import { type AdmissionAuthorityResource } from "../product/admission_authority.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type ReopenedAbgEventResourceInput, type AbgEventResourceOutcome } from "./definition_event_resource.js";
type ReopenAssertion = ReopenedAbgEventResourceInput;
/** The fixed owner consumes serialized acquisition or an actual native selection. */
export interface WitnessRepriceResourceAssertion {
    readonly kind: "witness_reprice_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: ReopenAssertion;
    readonly admissionAuthority: AdmissionAuthorityResource;
}
export interface WitnessRunStoppedResourceAssertion extends Omit<WitnessRepriceResourceAssertion, "kind"> {
    readonly kind: "witness_run_stopped_resource_assertion";
}
export interface WitnessRunStoppedResourceReceipt {
    readonly kind: "witness_run_stopped_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceOutcome;
}
interface OrdinaryWitnessRepriceResourceReceipt {
    readonly kind: "witness_reprice_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceOutcome;
}
export type WitnessRepriceResourceReceipt = OrdinaryWitnessRepriceResourceReceipt | Readonly<{
    kind: "witness_profile_reprice_resource_receipt";
    schemaVersion: "5.0.0";
    eventResource: AbgEventResourceOutcome;
    boundaryEventRef: string;
}>;
export declare function witnessRepriceResourcesCorrespond(assertion: WitnessRepriceResourceAssertion, receipt: WitnessRepriceResourceReceipt, content: unknown): boolean;
/** Only the two selected, already-declared members; no wildcard witness grant. */
export declare const WITNESS_DEFINITION_BINDINGS: Readonly<{
    admit: Readonly<{
        reprice: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "reprice";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>, WitnessRepriceResourceAssertion, WitnessRepriceResourceReceipt>;
        "run-stopped": ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.witness.admit";
            readonly memberKey: "run-stopped";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "actor_mismatch" | "subject_mismatch" | "act_mismatch" | "content_mismatch" | "context_mismatch" | "evidence_mismatch" | "provenance_mismatch" | "basis_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>, WitnessRunStoppedResourceAssertion, WitnessRunStoppedResourceReceipt>;
    }>;
}>;
export {};
