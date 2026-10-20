import { type AbgEventResourceInput, type AbgEventResourceOutcome } from "../abg/definition_event_resource.js";
import { type AbgRunTruthCoordinate } from "../abg/project_read_ports.js";
import { type ProductRunInvocationResourceAssertion } from "../product/run_invocation_operation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type Sha256Digest } from "../shared/digests.js";
export interface RunInvocationResourceAssertion extends ProductRunInvocationResourceAssertion {
    readonly kind: "run_invocation_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceInput;
    readonly applicationResources?: readonly CatalogApplicationResources[];
}
export interface RunInvocationResourceReceipt {
    readonly kind: "run_invocation_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceOutcome;
    readonly productExecutionResolution: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }> | null;
    readonly invocationAdmission: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }> | null;
    readonly run: AbgRunTruthCoordinate | null;
    readonly replay: AbgRunTruthCoordinate | null;
}
/** Structural validation only; exact owner, prefix and tuple admission remains separate. */
export declare function isRunInvocationResourceAssertion(value: unknown): value is RunInvocationResourceAssertion;
export declare const RUN_DEFINITION_BINDINGS: Readonly<{
    invoke: Readonly<{
        invoke: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.run.invoke";
            readonly memberKey: "invoke";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>>, RunInvocationResourceAssertion, RunInvocationResourceReceipt>;
        start: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.run.invoke";
            readonly memberKey: "start";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "invalid_program" | "invalid_graph_function" | "invalid_input" | "invalid_view" | "invalid_intent" | "invalid_capability" | "invalid_target" | "invalid_mode" | "invalid_until";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>>, RunInvocationResourceAssertion, RunInvocationResourceReceipt>;
    }>;
    continue: Readonly<{
        current_intent: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.run.continue";
            readonly memberKey: "current_intent";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "replay_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "replay_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>>, RunInvocationResourceAssertion, RunInvocationResourceReceipt>;
        selected_action: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.run.continue";
            readonly memberKey: "selected_action";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "basis_mismatch" | "replay_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "basis_mismatch" | "replay_mismatch" | "missing_continuation" | "resolved_continuation" | "intent_mismatch" | "response_mismatch" | "stale_action" | "action_mismatch" | "reprice_mismatch";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
        }>>, RunInvocationResourceAssertion, RunInvocationResourceReceipt>;
    }>;
}>;
import type { CatalogApplicationResources } from "../product/declaration_application.js";
