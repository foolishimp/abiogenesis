import type { FanOutApplication, GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ReplayState } from "./replay.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
export interface FanOutCompletedTaskRow {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly inputMemberDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly foldbackRef: string;
    readonly foldbackEventRef: string;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly judgmentRef: string;
    readonly outputMemberRef: string;
    readonly outputMemberDigest: Sha256Digest;
    readonly value: JsonValue;
}
export interface FanOutStoppingTaskRow {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly inputMemberDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly foldbackRef: string;
    readonly foldbackEventRef: string;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly judgmentRef: string;
    readonly disposition: "blocked";
    readonly stoppingEventRef: string;
}
interface FanOutCompletionBase {
    readonly kind: "fan_out_completion_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly completionRef: string;
    readonly completionDigest: Sha256Digest;
    readonly applicationRef: string;
    readonly batchRef: string;
    readonly inputVectorRef: string;
    readonly outputVectorContractRef: string;
    readonly inputMemberContractRef: string;
    readonly outputMemberContractRef: string;
    readonly admissionEventRef: string;
}
export interface CompleteFanOutAdmission extends FanOutCompletionBase {
    readonly completionKind: "complete_vector";
    readonly taskRows: readonly FanOutCompletedTaskRow[];
    readonly outputVectorRef: string;
    readonly outputVectorDigest: Sha256Digest;
    readonly outputVector: Readonly<Record<string, JsonValue>>;
}
export interface PartialFanOutAdmission extends FanOutCompletionBase {
    readonly completionKind: "partial_stop";
    readonly completedRows: readonly FanOutCompletedTaskRow[];
    readonly stoppingRow: FanOutStoppingTaskRow;
    readonly unstartedRows: readonly {
        readonly ordinal: number;
        readonly inputMemberRef: string;
        readonly inputMemberDigest: Sha256Digest;
    }[];
}
export type FanOutCompletionAdmission = CompleteFanOutAdmission | PartialFanOutAdmission;
export interface FanOutCompletionReceipt {
    readonly kind: "fan_out_completion_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly admission: FanOutCompletionAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface FanOutCompletionRefusal {
    readonly kind: "fan_out_completion_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "application_mismatch" | "completion_already_admitted" | "replay_mismatch" | "task_census_mismatch" | "vector_contract_mismatch";
    readonly message: string;
}
export type FanOutCompletionResult = FanOutCompletionReceipt | FanOutCompletionRefusal;
export interface AdmitFanOutCompletionInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly graph: Readonly<GtlGraph>;
    readonly application: Readonly<FanOutApplication>;
    readonly sourceCursor: TraversalCursorCandidate;
    readonly replayState: ReplayState;
    readonly completionKind: "complete_vector" | "partial_stop";
    readonly validateOutputVector: (value: unknown) => value is Readonly<Record<string, JsonValue>>;
    readonly basis: RuntimeAdmissionBasis;
}
export declare function admitFanOutCompletion(input: AdmitFanOutCompletionInput): FanOutCompletionResult;
export {};
