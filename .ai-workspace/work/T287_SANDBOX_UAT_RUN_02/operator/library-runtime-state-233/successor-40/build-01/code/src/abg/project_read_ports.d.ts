import { type JsonValue } from "../shared/canonical_json.js";
import { type AbgTypedTerminalResult, type AbgHistoricalDeclarationProof, type AbgHistoricalGraphCallSourceResource, type AbgHistoricalGraphCallSource } from "./terminal_result_contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type DurablePrefixCoordinate } from "./event_store.js";
import { type ReplayState } from "./replay.js";
export declare const ABG_PROJECT_READ_MEMBER_KEYS: readonly ["run_status", "graph_call_status", "run_result", "graph_call_result", "run_evidence", "graph_call_evidence", "result_evidence", "assessment_evidence", "witness_evidence", "workspace_replay", "run_replay", "graph_call_replay", "interaction_replay", "continuation_replay", "c_call_replay", "workspace_gaps", "run_gaps", "run_lawful_actions"];
export type AbgProjectReadMemberKey = (typeof ABG_PROJECT_READ_MEMBER_KEYS)[number];
/**
 * The durable coordinate is the JSON carrier. The owner validates its bytes
 * and constructs the nominal immutable prefix before any projection runs.
 */
export interface AbgProjectReadPacket<K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey> {
    readonly kind: "abg_project_read_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: K;
    readonly prefix: DurablePrefixCoordinate;
    readonly targetRef: string;
    readonly declarationProof?: AbgHistoricalDeclarationProof;
}
export type ProjectReadRefusalCode = "invalid_history" | "invalid_packet" | "target_not_ready" | "target_absent";
export interface AbgProjectReadRefusal<K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey> {
    readonly kind: "abg_project_read_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly memberKey: K;
    readonly targetRef: string | null;
    readonly code: ProjectReadRefusalCode;
    readonly message: string;
}
export interface AbgProjectReadProjection<K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey> {
    readonly kind: "abg_project_read_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
    readonly memberKey: K;
    readonly targetRef: string;
    readonly prefixCoordinateDigest: Sha256Digest;
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly value: JsonValue;
}
export type AbgProjectReadResult<K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey> = AbgProjectReadProjection<K> | AbgProjectReadRefusal<K>;
export interface AbgRunTruthCoordinate {
    readonly ref: string;
    readonly digest: Sha256Digest;
}
/**
 * Canonical typed ABG truth for one Run. Product owners consume this carrier;
 * it contains no Product result/nonterminal/refusal meaning.
 */
export interface AbgRunTruthProjection {
    readonly kind: "abg_run_truth_projection";
    readonly schemaVersion: "5.0.0";
    readonly prefixCoordinateDigest: Sha256Digest;
    readonly runtimeStatus: ReplayState["runtimeStatus"];
    readonly run: AbgRunTruthCoordinate;
    readonly executionBasis: AbgRunTruthCoordinate;
    readonly workspaceBinding: AbgRunTruthCoordinate;
    readonly graphCall: AbgRunTruthCoordinate | null;
    readonly result: AbgRunTruthCoordinate | null;
    readonly terminalResult: AbgTypedTerminalResult | null;
    readonly stop: AbgRunTruthCoordinate | null;
    readonly gap: AbgRunTruthCoordinate | null;
    readonly interaction: AbgRunTruthCoordinate | null;
    readonly evidence: readonly AbgRunTruthCoordinate[];
    readonly replay: AbgRunTruthCoordinate;
}
export interface AbgRunTruthRefusal {
    readonly kind: "abg_run_truth_refusal";
    readonly schemaVersion: "5.0.0";
    readonly code: ProjectReadRefusalCode;
    readonly targetRef: string;
    readonly message: string;
    readonly diagnosticRef?: string;
}
export type AbgRunTruthResult = AbgRunTruthProjection | AbgRunTruthRefusal;
/** Owner-only Run resource path. The complete DefinitionCall has already passed
 * raw ingress. All authority still comes from the current history and R10 joins.
 * Copies/closed owners reconstruct; an immutable resource identity retains the
 * borrowed result only within the existing authenticated prefix lineage. */
export declare function projectHistoricalGraphCallSourceAtDurablePrefix(suppliedPrefix: DurablePrefixCoordinate, resource: AbgHistoricalGraphCallSourceResource): AbgHistoricalGraphCallSource | null;
/** Internal reuse of the same R10 owner. No Public invocation or store acquisition. */
export declare function projectClosedGraphCallTerminalAtDurablePrefix(prefix: DurablePrefixCoordinate, graphCallId: string, declarationProof: AbgHistoricalDeclarationProof): AbgTypedTerminalResult | null;
export declare function projectRunTruthAtDurablePrefix(prefix: DurablePrefixCoordinate, runId: string): AbgRunTruthResult;
/** Source identity for the two GraphCall companions of the existing Run read
 * kernel. This does not evaluate or trust the optional child declaration proof. */
export declare function projectGraphCallSourceAtDurablePrefix(prefix: DurablePrefixCoordinate, graphCallId: string): Readonly<{
    source: AbgRunTruthCoordinate;
    workspaceBinding: AbgRunTruthCoordinate;
}> | null;
/** Retain the read owner's exact context across source authentication and
 * projection. The closure accepts only optional declaration proof, never a
 * caller-asserted context or another prefix. Source identity is proof-independent. */
export declare function prepareRunReadAtDurablePrefix(prefix: DurablePrefixCoordinate, memberKey: "run_status" | "run_result" | "run_replay" | "run_gaps" | "graph_call_result" | "graph_call_replay", targetRef: string): Readonly<{
    project: (declarationProof?: AbgHistoricalDeclarationProof) => AbgProjectReadResult<"run_status" | "run_result" | "graph_call_result" | "run_replay" | "graph_call_replay" | "run_gaps">;
    source: AbgRunTruthCoordinate;
    workspaceBinding: AbgRunTruthCoordinate;
}> | null;
/** Pure owner entry over already decoded history. This checks physical byte
 * correspondence, not resource acquisition/currentness or Public authority. */
export declare function projectGapReadAtValidatedPrefix<K extends "run_gaps" | "workspace_gaps">(packet: AbgProjectReadPacket<K>, fullPrefix: ValidatedRuntimeEventPrefix): AbgProjectReadResult<K>;
export declare const RunProjectionPort: Readonly<{
    run_status: (packet: AbgProjectReadPacket<"run_status">) => AbgProjectReadResult<"run_status">;
    run_result: (packet: AbgProjectReadPacket<"run_result">) => AbgProjectReadResult<"run_result">;
    run_evidence: (packet: AbgProjectReadPacket<"run_evidence">) => AbgProjectReadResult<"run_evidence">;
    run_replay: (packet: AbgProjectReadPacket<"run_replay">) => AbgProjectReadResult<"run_replay">;
    run_gaps: (packet: AbgProjectReadPacket<"run_gaps">) => AbgProjectReadResult<"run_gaps">;
    run_lawful_actions: (packet: AbgProjectReadPacket<"run_lawful_actions">) => AbgProjectReadResult<"run_lawful_actions">;
}>;
export declare const GraphCallProjectionPort: Readonly<{
    graph_call_status: (packet: AbgProjectReadPacket<"graph_call_status">) => AbgProjectReadResult<"graph_call_status">;
    graph_call_result: (packet: AbgProjectReadPacket<"graph_call_result">) => AbgProjectReadResult<"graph_call_result">;
    graph_call_evidence: (packet: AbgProjectReadPacket<"graph_call_evidence">) => AbgProjectReadResult<"graph_call_evidence">;
    graph_call_replay: (packet: AbgProjectReadPacket<"graph_call_replay">) => AbgProjectReadResult<"graph_call_replay">;
}>;
export declare const ResultProjectionPort: Readonly<{
    evidence: (packet: AbgProjectReadPacket<"result_evidence">) => AbgProjectReadResult<"result_evidence">;
}>;
export declare const AssessmentProjectionPort: Readonly<{
    evidence: (packet: AbgProjectReadPacket<"assessment_evidence">) => AbgProjectReadResult<"assessment_evidence">;
}>;
export declare const WitnessProjectionPort: Readonly<{
    evidence: (packet: AbgProjectReadPacket<"witness_evidence">) => AbgProjectReadResult<"witness_evidence">;
}>;
export declare const WorkspaceProjectionPort: Readonly<{
    workspace_replay: (packet: AbgProjectReadPacket<"workspace_replay">) => AbgProjectReadResult<"workspace_replay">;
    workspace_gaps: (packet: AbgProjectReadPacket<"workspace_gaps">) => AbgProjectReadResult<"workspace_gaps">;
}>;
export declare const InteractionProjectionPort: Readonly<{
    replay: (packet: AbgProjectReadPacket<"interaction_replay">) => AbgProjectReadResult<"interaction_replay">;
}>;
export declare const ContinuationProjectionPort: Readonly<{
    replay: (packet: AbgProjectReadPacket<"continuation_replay">) => AbgProjectReadResult<"continuation_replay">;
}>;
export declare const CCallProjectionPort: Readonly<{
    replay: (packet: AbgProjectReadPacket<"c_call_replay">) => AbgProjectReadResult<"c_call_replay">;
}>;
export declare const ABG_PROJECT_READ_OWNER_PORTS: Readonly<{
    run_status: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_status">) => AbgProjectReadResult<"run_status">;
    }>;
    graph_call_status: Readonly<{
        project: (packet: AbgProjectReadPacket<"graph_call_status">) => AbgProjectReadResult<"graph_call_status">;
    }>;
    run_result: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_result">) => AbgProjectReadResult<"run_result">;
    }>;
    graph_call_result: Readonly<{
        project: (packet: AbgProjectReadPacket<"graph_call_result">) => AbgProjectReadResult<"graph_call_result">;
    }>;
    run_evidence: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_evidence">) => AbgProjectReadResult<"run_evidence">;
    }>;
    graph_call_evidence: Readonly<{
        project: (packet: AbgProjectReadPacket<"graph_call_evidence">) => AbgProjectReadResult<"graph_call_evidence">;
    }>;
    result_evidence: Readonly<{
        project: (packet: AbgProjectReadPacket<"result_evidence">) => AbgProjectReadResult<"result_evidence">;
    }>;
    assessment_evidence: Readonly<{
        project: (packet: AbgProjectReadPacket<"assessment_evidence">) => AbgProjectReadResult<"assessment_evidence">;
    }>;
    witness_evidence: Readonly<{
        project: (packet: AbgProjectReadPacket<"witness_evidence">) => AbgProjectReadResult<"witness_evidence">;
    }>;
    workspace_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"workspace_replay">) => AbgProjectReadResult<"workspace_replay">;
    }>;
    run_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_replay">) => AbgProjectReadResult<"run_replay">;
    }>;
    graph_call_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"graph_call_replay">) => AbgProjectReadResult<"graph_call_replay">;
    }>;
    interaction_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"interaction_replay">) => AbgProjectReadResult<"interaction_replay">;
    }>;
    continuation_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"continuation_replay">) => AbgProjectReadResult<"continuation_replay">;
    }>;
    c_call_replay: Readonly<{
        project: (packet: AbgProjectReadPacket<"c_call_replay">) => AbgProjectReadResult<"c_call_replay">;
    }>;
    workspace_gaps: Readonly<{
        project: (packet: AbgProjectReadPacket<"workspace_gaps">) => AbgProjectReadResult<"workspace_gaps">;
    }>;
    run_gaps: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_gaps">) => AbgProjectReadResult<"run_gaps">;
    }>;
    run_lawful_actions: Readonly<{
        project: (packet: AbgProjectReadPacket<"run_lawful_actions">) => AbgProjectReadResult<"run_lawful_actions">;
    }>;
}>;
export declare const ABG_PROJECT_READ_CONTRACTS: Readonly<{
    run_status: (packet: AbgProjectReadPacket<"run_status">) => AbgProjectReadResult<"run_status">;
    graph_call_status: (packet: AbgProjectReadPacket<"graph_call_status">) => AbgProjectReadResult<"graph_call_status">;
    run_result: (packet: AbgProjectReadPacket<"run_result">) => AbgProjectReadResult<"run_result">;
    graph_call_result: (packet: AbgProjectReadPacket<"graph_call_result">) => AbgProjectReadResult<"graph_call_result">;
    run_evidence: (packet: AbgProjectReadPacket<"run_evidence">) => AbgProjectReadResult<"run_evidence">;
    graph_call_evidence: (packet: AbgProjectReadPacket<"graph_call_evidence">) => AbgProjectReadResult<"graph_call_evidence">;
    result_evidence: (packet: AbgProjectReadPacket<"result_evidence">) => AbgProjectReadResult<"result_evidence">;
    assessment_evidence: (packet: AbgProjectReadPacket<"assessment_evidence">) => AbgProjectReadResult<"assessment_evidence">;
    witness_evidence: (packet: AbgProjectReadPacket<"witness_evidence">) => AbgProjectReadResult<"witness_evidence">;
    workspace_replay: (packet: AbgProjectReadPacket<"workspace_replay">) => AbgProjectReadResult<"workspace_replay">;
    run_replay: (packet: AbgProjectReadPacket<"run_replay">) => AbgProjectReadResult<"run_replay">;
    graph_call_replay: (packet: AbgProjectReadPacket<"graph_call_replay">) => AbgProjectReadResult<"graph_call_replay">;
    interaction_replay: (packet: AbgProjectReadPacket<"interaction_replay">) => AbgProjectReadResult<"interaction_replay">;
    continuation_replay: (packet: AbgProjectReadPacket<"continuation_replay">) => AbgProjectReadResult<"continuation_replay">;
    c_call_replay: (packet: AbgProjectReadPacket<"c_call_replay">) => AbgProjectReadResult<"c_call_replay">;
    workspace_gaps: (packet: AbgProjectReadPacket<"workspace_gaps">) => AbgProjectReadResult<"workspace_gaps">;
    run_gaps: (packet: AbgProjectReadPacket<"run_gaps">) => AbgProjectReadResult<"run_gaps">;
    run_lawful_actions: (packet: AbgProjectReadPacket<"run_lawful_actions">) => AbgProjectReadResult<"run_lawful_actions">;
}>;
