import type { FanOutApplication, GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
interface FanOutProjectionAuthority {
    readonly graph: Readonly<GtlGraph>;
    readonly application: Readonly<FanOutApplication>;
    readonly basisId: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
}
export type ExactFanOutCompletionProjectionRequest = Readonly<{
    mode: "candidate";
    expectedPrefixDigest: Sha256Digest;
    authority: FanOutProjectionAuthority;
    completionKind: "complete_vector" | "partial_stop";
    validateOutputVector: (value: unknown) => value is Readonly<Record<string, JsonValue>>;
}> | Readonly<{
    mode: "event_canonical";
    admissionEventRef: string;
}> | Readonly<{
    mode: "graph_bound";
    admissionEventRef: string;
    authority: FanOutProjectionAuthority;
}>;
export interface FanOutCompletionCandidateProjection {
    readonly kind: "fan_out_completion_candidate_projection";
    readonly schemaVersion: "5.0.0";
    readonly completionBody: Readonly<Record<string, JsonValue>>;
    readonly completionRef: string;
    readonly completionDigest: Sha256Digest;
    readonly requiredCausationEventRefs: readonly string[];
}
export declare function projectExactFanOutCompletion(prefix: ValidatedRuntimeEventPrefix, request: ExactFanOutCompletionProjectionRequest): FanOutCompletionCandidateProjection | FanOutCompletionAdmission | null;
export interface PartialFanOutStopRouteBridgeCoordinates {
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
}
export declare function hasExactPartialFanOutStopRouteBridge(prefix: ValidatedRuntimeEventPrefix, routeAdmissionEventRef: string, coordinates: PartialFanOutStopRouteBridgeCoordinates): boolean;
export {};
