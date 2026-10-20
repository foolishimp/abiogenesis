import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { type SemanticStageEnvelope } from "../product/semantic_stage.js";
import { type WorksiteConstructionTask } from "../product/worksite_construction.js";
import { type WorksitePreservedResultSource, type WorksitePreservedResultArtifact, type WorksitePreservedSourceProof, type PreservedProtocolRecord } from "../product/worksite_construction_recovery.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type CCall } from "./c_call.js";
import { type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
export interface WorksitePreservedResultNativeBasis {
    readonly publication: Readonly<ModulePublication>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly executionBasis: Readonly<ExecutionBasis>;
    readonly cCall: Readonly<CCall>;
    readonly cursor: Readonly<TraversalCursorCandidate>;
    readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
/** Protocol parsing is local to preserved-source authentication, never the transport parser. */
export declare function projectPreservedStructuredProposal(stdout: Uint8Array): {
    workerCandidate: JsonValue;
    proposal: PreservedProtocolRecord;
    acknowledgment: PreservedProtocolRecord;
    toolUseId: string;
    sessionId: string;
};
/** Native historical read projection. This admits neither the old proposal nor a new effect. */
export declare function projectPreservedWorksiteProposal(selector: WorksitePreservedResultSource): Readonly<{
    source: Readonly<WorksitePreservedResultSource>;
    originalTask: Readonly<Record<string, JsonValue>> & WorksiteConstructionTask;
    workerResult: import("../product/worksite_construction.js").WorksiteConstructionWorkerResult;
    proof: WorksitePreservedSourceProof;
    envelope: Readonly<Record<string, JsonValue>> & SemanticStageEnvelope;
}> | null;
export declare function authenticateWorksitePreservedResultBasis(basis: WorksitePreservedResultNativeBasis): {
    source: Readonly<WorksitePreservedResultSource>;
    events: readonly RuntimeEvent[];
    prefix: ValidatedRuntimeEventPrefix;
    execution: ExecutionBasis;
    call: CCall;
    task: Readonly<Record<string, JsonValue>> & WorksiteConstructionTask;
    input: JsonValue | undefined;
    bridge: {
        envelope: Readonly<Record<string, JsonValue>> & SemanticStageEnvelope;
        bridge: {
            execution: ExecutionBasis;
            resultEvent: RuntimeEvent;
            judgmentEvent: RuntimeEvent;
            cCall: CCall;
            result: import("./c_call.js").AdmittedCCallResult;
            judgment: import("./c_call.js").AdmittedCCallJudgment;
        };
    };
} | null;
export declare function constructWorksitePreservedResultNativeBasis(basis: WorksitePreservedResultNativeBasis): Readonly<WorksitePreservedResultNativeBasis> | null;
export declare function projectWorksitePreservedResultArtifact(basis: WorksitePreservedResultNativeBasis, input: unknown): Readonly<WorksitePreservedResultArtifact> | null;
export declare function projectWorksitePreservedCandidateBundle(basis: WorksitePreservedResultNativeBasis, input: unknown): import("../product/worksite_construction.js").WorksiteCandidateBundle | null;
export declare function worksitePreservedResultMatchesBasis(basis: WorksitePreservedResultNativeBasis, input: unknown, value: unknown): boolean;
/** Replay/C2 recognizes the exact admitted recovery owner and both F_D producers.
 * It reads no original application bytes or temporary command snapshot. */
export declare function nativeWorksiteRecoverySourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis): boolean;
