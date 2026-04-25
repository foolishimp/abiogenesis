// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type {
  PublicRuntimeIdentityProjection,
  PublicStartOutcome,
  PublicStartRequest
} from "../contracts/carriers.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "../control/carriers.js";
import type {
  PublicResultAssessmentOutcome,
  PublicResultAssessmentRequest
} from "../result_assessment/carriers.js";
import type { RuntimeFailureClass } from "../../../abg/m03/transport/index.js";

export interface PublicLiveStatusRequest {
  readonly startRequest: PublicStartRequest | null;
  readonly startOutcome: PublicStartOutcome | null;
  readonly controlRequest: PublicControlLoopRequest | null;
  readonly controlOutcome: PublicControlLoopOutcome | null;
  readonly resultAssessmentRequest: PublicResultAssessmentRequest | null;
  readonly resultAssessmentOutcome: PublicResultAssessmentOutcome | null;
}

export interface ProjectionTraceRef {
  readonly sourceKinds: readonly string[];
}

export interface ProjectionResultAssessmentRef {
  readonly status: "accepted" | "rejected" | "runtime_failure" | null;
  readonly failureClass: RuntimeFailureClass | null;
  readonly valid: boolean | null;
  readonly publishedLedgerRef: string | null;
  readonly assessedCount: number | null;
}

interface PublicLiveStatusBase {
  readonly assetType: "run_status";
  readonly targetHandle: string | null;
  readonly activeEdge: string | null;
  readonly runtimeIdentity: PublicRuntimeIdentityProjection | null;
  readonly resultAssessment: ProjectionResultAssessmentRef | null;
  readonly trace: ProjectionTraceRef;
}

export interface PublicLiveStatusIdle extends PublicLiveStatusBase {
  readonly kind: "idle";
  readonly runStatus: "not_started";
}

export interface PublicLiveStatusReady extends PublicLiveStatusBase {
  readonly kind: "ready";
  readonly runStatus: "active" | "converged" | "assessed";
}

export interface PublicLiveStatusAttention extends PublicLiveStatusBase {
  readonly kind: "attention";
  readonly runStatus:
    | "blocked"
    | "yielded"
    | "rejected"
    | RuntimeFailureClass;
  readonly reason: string;
}

export type PublicLiveStatusProjection =
  | PublicLiveStatusIdle
  | PublicLiveStatusReady
  | PublicLiveStatusAttention;
