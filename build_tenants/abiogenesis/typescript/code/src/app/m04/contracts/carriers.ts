// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type {
  AssuranceAmbiguityStatus,
  AssuranceClosureDecisionKind,
  RuntimeEvent,
  StartIntent,
  TerminalKind
} from "../../../abg/m03/index.js";
import type { EngineAssuranceGateKind } from "../../../abg/m03/runner/index.js";

export type FhMode = "direct" | "human-proxy";
export type RootMode = "direct" | "supervised";

export interface PublicControlModes {
  readonly fhMode: FhMode;
  readonly rootMode: RootMode;
}

export interface ConfiguredRuntimeSelector {
  readonly workerRef: string | null;
  readonly runtimeRef: string | null;
}

export interface PublicStartRequest {
  readonly startIntent: StartIntent;
  readonly controlModes: PublicControlModes;
  readonly runtimeSelector: ConfiguredRuntimeSelector | null;
}

export interface PublicRuntimeIdentityProjection {
  readonly workerId: string;
  readonly backendId: string;
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
}

export interface PublicAssuranceTraceRef {
  readonly status: EngineAssuranceGateKind;
  readonly reason: string;
  readonly projectionRefs: readonly string[];
  readonly closureDecisions: readonly AssuranceClosureDecisionKind[];
  readonly blockingStatuses: readonly AssuranceAmbiguityStatus[];
}

export interface PublicKernelTraceRef {
  readonly basisId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
  readonly eventKinds: readonly RuntimeEvent["kind"][];
  readonly assurance?: PublicAssuranceTraceRef;
}

export interface PublicStopDetail {
  readonly terminalKind: TerminalKind | null;
  readonly gateReason: string | null;
  readonly dispatchRef: string | null;
  readonly approvalSubjectRef: string | null;
}

export interface PublicStartAdvanced {
  readonly kind: "advanced";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicKernelTraceRef;
}

export interface PublicStartBlocked {
  readonly kind: "blocked";
  readonly stopPredicate:
    | "dispatch_required"
    | "human_gate_required"
    | "gap_stop";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicKernelTraceRef;
  readonly stopDetail: PublicStopDetail;
}

export interface PublicStartYielded {
  readonly kind: "yielded";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicKernelTraceRef;
  readonly stopDetail: PublicStopDetail;
}

export interface PublicStartConverged {
  readonly kind: "converged";
  readonly terminalKind: "converged" | "nothing_to_do";
  readonly runtimeIdentity: PublicRuntimeIdentityProjection;
  readonly trace: PublicKernelTraceRef;
}

export interface PublicStartRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly runtimeIdentity: PublicRuntimeIdentityProjection | null;
}

export type PublicStartOutcome =
  | PublicStartAdvanced
  | PublicStartBlocked
  | PublicStartYielded
  | PublicStartConverged
  | PublicStartRejected;
