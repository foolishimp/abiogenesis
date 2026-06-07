// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import type { RuntimeFailureClass } from "../../../abg/m03/transport/index.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "../control/carriers.js";
import type { PublicStartRequest } from "../contracts/carriers.js";
import type {
  PublicLiveStatusProjection,
  ProjectionResultAssessmentRef
} from "../live_status/carriers.js";
import type { M04RequestDefaultsResolution } from "../../../shared/lever_registry/overrides.js";

export type PublicStopClassKind =
  | "not_started"
  | "advanced"
  | "assessed"
  | "converged"
  | "worker_dispatch_required"
  | "human_decision_required"
  | "yielded"
  | "rejected"
  | RuntimeFailureClass;

export interface PublicStopClass {
  readonly kind: PublicStopClassKind;
  readonly detail: string;
  readonly source: "control_loop" | "live_status";
  readonly runtimeFailureClass: RuntimeFailureClass | null;
}

export interface PublicCallableStartRequest {
  readonly kind: "callable_start_request";
  readonly startRequest: PublicStartRequest;
  readonly leverResolution: M04RequestDefaultsResolution;
}

export interface PublicCallableStartTraceRef {
  readonly controlOutcomeKind: PublicControlLoopOutcome["kind"] | null;
  readonly liveStatusKind: PublicLiveStatusProjection["kind"] | null;
  readonly liveRunStatus: string | null;
  readonly resultAssessmentStatus: ProjectionResultAssessmentRef["status"] | null;
  readonly eventKinds: readonly string[];
}

interface PublicCallableStartOutcomeBase {
  readonly request: PublicCallableStartRequest;
  readonly controlRequest: PublicControlLoopRequest;
  readonly controlOutcome: PublicControlLoopOutcome;
  readonly liveStatus: PublicLiveStatusProjection;
  readonly stopClass: PublicStopClass;
  readonly trace: PublicCallableStartTraceRef;
}

export interface PublicCallableStartResolved
  extends PublicCallableStartOutcomeBase {
  readonly kind: "resolved";
}

export interface PublicCallableStartRejected
  extends PublicCallableStartOutcomeBase {
  readonly kind: "rejected";
  readonly reason: string;
}

export type PublicCallableStartOutcome =
  | PublicCallableStartResolved
  | PublicCallableStartRejected;
