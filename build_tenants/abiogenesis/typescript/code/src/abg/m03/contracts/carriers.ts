// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import type { Graph, GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { Job } from "../../../gtl/m02/contracts/carriers.js";

export type RuntimeRegime = "F_D" | "F_P" | "F_H";

export type StartUntil = "first_traversal" | "blocked" | "converged";

export interface StartIntent {
  readonly scope: {
    readonly kind: "workspace";
    readonly workspaceRoot: string;
    readonly moduleName: string;
  };
  readonly target: {
    readonly kind: "graph_function";
    readonly handle: string;
  };
  readonly until: StartUntil;
}

export interface ExecutionBasis {
  readonly id: string;
  readonly workspaceRoot: string;
  readonly moduleName: string;
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly job: Job;
  readonly runtimeIdentity: {
    readonly workerId: string;
    readonly backendId: string;
    readonly buildId: string;
    readonly resolvedRuntimeRef: string;
  };
  readonly resolvedPolicy: {
    readonly resolvedPolicyBundleRef: string;
    readonly defaultRegime: RuntimeRegime;
    readonly dispatchRef: string | null;
    readonly approvalSubjectRef: string | null;
  };
  readonly startIntent: StartIntent;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export type TerminalKind =
  | "converged"
  | "nothing_to_do"
  | "gap_stop"
  | "yielded"
  | "dispatch_required"
  | "human_gate_required"
  | "traversal_applied";

export interface FdAdvanceTransition {
  readonly kind: "fd_advance";
  readonly basis: ExecutionBasis;
  readonly status: "ready";
}

export interface FpDispatchTransition {
  readonly kind: "fp_dispatch";
  readonly basis: ExecutionBasis;
  readonly dispatchRef: string;
}

export interface FhEscalationTransition {
  readonly kind: "fh_escalation";
  readonly basis: ExecutionBasis;
  readonly approvalSubjectRef: string;
  readonly gateReason: string;
}

export interface TerminalTransition {
  readonly kind: "terminal";
  readonly basis: ExecutionBasis;
  readonly terminalKind: TerminalKind;
  readonly reason: string | null;
}

export type AdvancementTransition =
  | FdAdvanceTransition
  | FpDispatchTransition
  | FhEscalationTransition
  | TerminalTransition;

export interface BasisAdmittedEvent {
  readonly kind: "basis_admitted";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly resolvedRuntimeRef: string;
  readonly resolvedPolicyBundleRef: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface FdAdvanceReadyEvent {
  readonly kind: "fd_advance_ready";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly status: "ready";
}

export interface FpDispatchRequestedEvent {
  readonly kind: "fp_dispatch_requested";
  readonly basisId: string;
  readonly dispatchRef: string;
}

export interface FhEscalatedEvent {
  readonly kind: "fh_escalated";
  readonly basisId: string;
  readonly approvalSubjectRef: string;
  readonly gateReason: string;
}

export interface TerminalReachedEvent {
  readonly kind: "terminal_reached";
  readonly basisId: string;
  readonly terminalKind: TerminalKind;
  readonly reason: string | null;
}

export interface ApprovedRuntimeEvent {
  readonly kind: "approved";
  readonly approvalKind: "fh_review" | "fh_intent";
  readonly edge: string;
  readonly actor: "human" | "human-proxy";
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface RevokedRuntimeEvent {
  readonly kind: "revoked";
  readonly approvalKind: "fh_approval";
  readonly edge: string;
  readonly actor: string;
  readonly reason: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface ResetRuntimeEvent {
  readonly kind: "reset";
  readonly scope: "workspace" | "work_key" | "edge";
  readonly actor: string;
  readonly reason: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly edge: string | null;
}

export interface AssessedRuntimeEvent {
  readonly kind: "assessed";
  readonly assessmentKind: "fp";
  readonly edge: string;
  readonly obligationId: string;
  readonly publishedLedgerRef: string;
  readonly actor: string;
  readonly specHash: string;
  readonly manifestId: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly selectedWorkerId: string | null;
  readonly selectedBackend: string | null;
  readonly roleId: string | null;
  readonly authorityRef: string | null;
  readonly assignmentSource: string | null;
  readonly resolvedRuntimeRef: string | null;
}

export type RuntimeEvent =
  | BasisAdmittedEvent
  | FdAdvanceReadyEvent
  | FpDispatchRequestedEvent
  | FhEscalatedEvent
  | TerminalReachedEvent
  | ApprovedRuntimeEvent
  | RevokedRuntimeEvent
  | ResetRuntimeEvent
  | AssessedRuntimeEvent;
