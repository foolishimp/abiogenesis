// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";

export interface EventCommandProvenance {
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface ApprovedCommandPayload {
  readonly approvalKind: "fh_review" | "fh_intent";
  readonly edge: string;
  readonly actor: "human" | "human-proxy";
}

export interface RevokedCommandPayload {
  readonly approvalKind: "fh_approval";
  readonly edge: string;
  readonly actor: string;
  readonly reason: string;
}

export interface ResetCommandPayload {
  readonly scope: "workspace" | "work_key" | "edge";
  readonly actor: string;
  readonly reason: string;
  readonly workKey: string | null;
  readonly edge: string | null;
}

export interface PublicEventIngressApprovedRequest {
  readonly kind: "approved";
  readonly payload: ApprovedCommandPayload;
  readonly provenance: EventCommandProvenance;
}

export interface PublicEventIngressRevokedRequest {
  readonly kind: "revoked";
  readonly payload: RevokedCommandPayload;
  readonly provenance: EventCommandProvenance;
}

export interface PublicEventIngressResetRequest {
  readonly kind: "reset";
  readonly payload: ResetCommandPayload;
  readonly provenance: EventCommandProvenance;
}

export type PublicEventIngressRequest =
  | PublicEventIngressApprovedRequest
  | PublicEventIngressRevokedRequest
  | PublicEventIngressResetRequest;

export interface EventIngressTraceRef {
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly emittedKinds: readonly RuntimeEvent["kind"][];
}

export interface ResetFollowupRef {
  readonly kind: "canonical_reset_followups_owned_downstream";
}

export interface PublicEventIngressAccepted {
  readonly kind: "accepted";
  readonly commandKind: PublicEventIngressRequest["kind"];
  readonly trace: EventIngressTraceRef;
  readonly resetFollowup: ResetFollowupRef | null;
}

export interface PublicEventIngressRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly trace: EventIngressTraceRef | null;
}

export type PublicEventIngressOutcome =
  | PublicEventIngressAccepted
  | PublicEventIngressRejected;
