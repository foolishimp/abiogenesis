import type { RawAdmittedValue } from "../validator/raw_admission.js";
import type { BlockedRouteAdmissionEvidence, FanOutRouteAdmissionEvidence, HoldRouteAdmissionEvidence, InteractionResumeRouteAdmissionEvidence, RecursionRouteAdmissionEvidence, RetryRouteAdmissionEvidence, RouteAdmissionEvidence, RouteCandidate, StructuralIdentityRouteAdmissionEvidence } from "./traversal_route.js";
import type { JsonValue } from "../shared/canonical_json.js";
export type TraversalTransitionEvidence = BlockedRouteAdmissionEvidence | FanOutRouteAdmissionEvidence | HoldRouteAdmissionEvidence | InteractionResumeRouteAdmissionEvidence | RecursionRouteAdmissionEvidence | RetryRouteAdmissionEvidence | RouteAdmissionEvidence | StructuralIdentityRouteAdmissionEvidence | null;
export type RouteCandidateBody = Omit<RouteCandidate, "kind" | "schemaVersion" | "candidateRef" | "candidateDigest">;
export interface TraversalRouteBodySource {
    readonly routeKind: RouteCandidate["routeKind"];
    readonly declarationRef: string;
    readonly declarationDigest: `sha256:${string}`;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: `sha256:${string}`;
    readonly targetCursorRef: string | null;
    readonly targetCursorDigest: `sha256:${string}` | null;
    readonly cCallRef: string | null;
    readonly judgmentRef: string | null;
    readonly consumedAvailabilityRefs: readonly string[] | null;
    readonly contractRef: string | null;
    readonly replayStateDigest: `sha256:${string}` | null;
    readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly registeredSelectionApplicationRef?: string;
    readonly nextActionProjectionRef?: string;
    readonly nextActionProjectionDigest?: `sha256:${string}`;
    readonly nextActionProjection?: Readonly<object>;
    readonly graphSpanReentryProjectionRef?: string;
    readonly graphSpanReentryProjectionDigest?: `sha256:${string}`;
    readonly graphSpanReentryProjection?: Readonly<object>;
}
export type TraversalTransitionCandidateBody = Readonly<{
    kind: "traversal_transition_candidate";
    schemaVersion: "5.0.0";
    transitionClass: "route";
    route: RouteCandidate;
    evidence: TraversalTransitionEvidence;
    terminalizeRun: boolean;
}> | Readonly<{
    kind: "traversal_transition_candidate";
    schemaVersion: "5.0.0";
    transitionClass: "retry";
    route: RouteCandidate;
    evidence: RetryRouteAdmissionEvidence | StructuralIdentityRouteAdmissionEvidence | null;
    retryInput: Readonly<Record<string, JsonValue>>;
    terminalizeRun: false;
}>;
export type TraversalTransitionCandidate = TraversalTransitionCandidateBody & Readonly<{
    candidateRef: string;
    candidateDigest: `sha256:${string}`;
}>;
export declare function projectTraversalRouteBody(route: TraversalRouteBodySource): RouteCandidateBody | null;
export declare function routeCandidateBody(value: unknown): RouteCandidateBody | null;
export declare function isRouteCandidate(value: unknown): value is RouteCandidate;
export declare function completeRouteCandidate(body: RouteCandidateBody): RouteCandidate;
export declare function isTraversalTransitionCandidate(value: unknown): value is TraversalTransitionCandidate;
export declare function completeTraversalTransitionCandidate(body: TraversalTransitionCandidateBody): TraversalTransitionCandidate;
