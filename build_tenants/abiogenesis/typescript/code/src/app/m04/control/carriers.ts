// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type {
  PublicRuntimeIdentityProjection,
  PublicStartOutcome,
  PublicStartRequest,
  PublicStopDetail
} from "../contracts/carriers.js";

export interface PublicControlLoopRequest {
  readonly startRequest: PublicStartRequest;
}

export interface PublicControlLoopTraceRef {
  readonly stepKinds: readonly PublicStartOutcome["kind"][];
  readonly basisIds: readonly string[];
  readonly eventKinds: readonly string[];
}

export interface PublicControlLoopStopDetail {
  readonly kind:
    | "yielded"
    | "dispatch_required"
    | "human_gate_required"
    | "gap_stop"
    | "advanced_reentry_required";
  readonly terminalKind: PublicStopDetail["terminalKind"];
  readonly gateReason: PublicStopDetail["gateReason"];
  readonly dispatchRef: PublicStopDetail["dispatchRef"];
  readonly approvalSubjectRef: PublicStopDetail["approvalSubjectRef"];
}

export interface HumanProxyApprovalHint {
  readonly actor: "human-proxy";
  readonly approvalSubjectRef: string;
}

export interface PublicControlLoopConverged {
  readonly kind: "converged";
  readonly terminalKind: "converged" | "nothing_to_do";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicControlLoopTraceRef;
}

export interface PublicControlLoopYielded {
  readonly kind: "yielded";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicControlLoopTraceRef;
  readonly stopDetail: PublicControlLoopStopDetail;
}

export interface PublicControlLoopDispatchRequired {
  readonly kind: "dispatch_required";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicControlLoopTraceRef;
  readonly stopDetail: PublicControlLoopStopDetail;
}

export interface PublicControlLoopHumanGateRequired {
  readonly kind: "human_gate_required";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicControlLoopTraceRef;
  readonly stopDetail: PublicControlLoopStopDetail;
  readonly approvalHint: HumanProxyApprovalHint | null;
}

export interface PublicControlLoopRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly runtimeIdentity: PublicRuntimeIdentityProjection | null;
  readonly trace: PublicControlLoopTraceRef;
  readonly stopDetail: PublicControlLoopStopDetail | null;
}

export type PublicControlLoopOutcome =
  | PublicControlLoopConverged
  | PublicControlLoopYielded
  | PublicControlLoopDispatchRequired
  | PublicControlLoopHumanGateRequired
  | PublicControlLoopRejected;
