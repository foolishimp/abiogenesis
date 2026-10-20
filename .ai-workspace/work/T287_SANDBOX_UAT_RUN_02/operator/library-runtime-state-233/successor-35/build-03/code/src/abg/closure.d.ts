import type { ClosureContract } from "../gtl/contracts.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type AdmittedCCallJudgment, type AdmittedCCallResult, type CCall } from "./c_call.js";
import type { RuntimeAdmissionBasis } from "./execution_basis.js";
import { type AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type OpenedTraversalScope } from "./open_call.js";
import { type ReplayState } from "./replay.js";
import { type AdmittedRoute } from "./traversal_route.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";
export interface ScopeClosureAdmission {
    readonly kind: "scope_closure_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "closed";
    readonly scopeClass: "run" | "graph_call";
    readonly closureRef: string;
    readonly closureDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly routeRef: string;
    readonly closureContractRef: string;
    readonly terminalReachedEventRef: string;
    readonly frameClosedEventRef: string;
    readonly graphCallClosedEventRef: string;
    readonly runClosedEventRef: string | null;
    readonly childGraphCallId: string | null;
    readonly childFrameId: string | null;
    readonly replayState: ReplayState;
}
export interface ScopeClosureAdmissionRefusal {
    readonly kind: "scope_closure_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "closure_contract_mismatch" | "replay_mismatch" | "runtime_basis_mismatch" | "stale_prefix";
    readonly message: string;
    readonly failureEventRef: string | null;
}
export type ScopeClosureAdmissionResult = ScopeClosureAdmission | ScopeClosureAdmissionRefusal;
export type ScopeClosureSubject = Readonly<{
    kind: "ordinary";
    scope: OpenedTraversalScope;
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
}> | Readonly<{
    kind: "interaction";
    scope: OpenedTraversalScope;
    cCall: CCall;
    pendingResult: AdmittedCCallResult;
    pendingJudgment: AdmittedCCallJudgment;
    resume: FhInteractionResumeAdmission;
}>;
export declare function admitScopeClosure(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, subject: ScopeClosureSubject, route: AdmittedRoute, closureContract: Readonly<ClosureContract>, basis: RuntimeAdmissionBasis): ScopeClosureAdmissionResult;
