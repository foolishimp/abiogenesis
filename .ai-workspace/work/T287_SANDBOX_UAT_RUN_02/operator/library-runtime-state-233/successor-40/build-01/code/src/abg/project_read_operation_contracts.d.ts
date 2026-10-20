import * as v from "valibot";
import { type ExactOwnerOperationPort, type RuntimeContractSchema } from "../shared/public_function_contracts.js";
export declare const ABG_PROJECT_READ_CASES: readonly ["run_status", "graph_call_status", "run_result", "graph_call_result", "run_evidence", "graph_call_evidence", "result_evidence", "assessment_evidence", "witness_evidence", "workspace_replay", "run_replay", "graph_call_replay", "interaction_replay", "continuation_replay", "c_call_replay", "workspace_gaps", "run_gaps", "run_lawful_actions"];
export declare const ABG_ADMITTED_GAP_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_admitted_gap", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly run: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly executionBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly route: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly routeAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly stop: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly nextAction: v.StrictObjectSchema<{
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly valueKind: v.LiteralSchema<"next_action_basis" | "next_action_projection", undefined>;
        readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<import("../index.js").JsonValue, import("../index.js").JsonValue>, undefined>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly basis: v.StrictObjectSchema<{
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly valueKind: v.LiteralSchema<"next_action_basis", undefined>;
        readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.RecordSchema<v.StringSchema<undefined>, v.GenericSchema<import("../index.js").JsonValue, import("../index.js").JsonValue>, undefined>;
        readonly inputEvidence: v.ArraySchema<v.StrictObjectSchema<{
            readonly evidence: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>;
    }, undefined>;
}, undefined>;
declare const runStatus: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const graphCallStatus: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const runResult: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const graphCallResult: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const runEvidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const graphCallEvidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const resultEvidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const assessmentEvidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const witnessEvidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
declare const workspaceReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const runReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const graphCallReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const interactionReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const continuationReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const cCallReplay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
            value: import("../index.js").JsonValue;
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
declare const workspaceGaps: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
declare const runGaps: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
                    [x: string]: import("../index.js").JsonValue;
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
declare const runLawfulActions: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
export declare const ABG_PROJECT_READ_CONTRACTS: Readonly<{
    run_status: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    graph_call_status: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    run_result: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    graph_call_result: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    run_evidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    graph_call_evidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    result_evidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    assessment_evidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    witness_evidence: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
    workspace_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    run_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    graph_call_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    interaction_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    continuation_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    c_call_replay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
                value: import("../index.js").JsonValue;
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
    workspace_gaps: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
    run_gaps: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
                        [x: string]: import("../index.js").JsonValue;
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
    run_lawful_actions: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
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
export interface RunProjectionPort {
    readonly run_status: ExactOwnerOperationPort<typeof runStatus>;
    readonly run_result: ExactOwnerOperationPort<typeof runResult>;
    readonly run_evidence: ExactOwnerOperationPort<typeof runEvidence>;
    readonly run_replay: ExactOwnerOperationPort<typeof runReplay>;
    readonly run_gaps: ExactOwnerOperationPort<typeof runGaps>;
    readonly run_lawful_actions: ExactOwnerOperationPort<typeof runLawfulActions>;
}
export interface GraphCallProjectionPort {
    readonly graph_call_status: ExactOwnerOperationPort<typeof graphCallStatus>;
    readonly graph_call_result: ExactOwnerOperationPort<typeof graphCallResult>;
    readonly graph_call_evidence: ExactOwnerOperationPort<typeof graphCallEvidence>;
    readonly graph_call_replay: ExactOwnerOperationPort<typeof graphCallReplay>;
}
export interface ResultProjectionPort {
    readonly evidence: ExactOwnerOperationPort<typeof resultEvidence>;
}
export interface AssessmentProjectionPort {
    readonly evidence: ExactOwnerOperationPort<typeof assessmentEvidence>;
}
export interface WitnessProjectionPort {
    readonly evidence: ExactOwnerOperationPort<typeof witnessEvidence>;
}
export interface WorkspaceProjectionPort {
    readonly workspace_replay: ExactOwnerOperationPort<typeof workspaceReplay>;
    readonly workspace_gaps: ExactOwnerOperationPort<typeof workspaceGaps>;
}
export interface InteractionProjectionPort {
    readonly replay: ExactOwnerOperationPort<typeof interactionReplay>;
}
export interface ContinuationProjectionPort {
    readonly replay: ExactOwnerOperationPort<typeof continuationReplay>;
}
export interface CCallProjectionPort {
    readonly replay: ExactOwnerOperationPort<typeof cCallReplay>;
}
export {};
