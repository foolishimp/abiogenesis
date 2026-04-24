import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import type {
  ApprovedCommandPayload,
  EventCommandProvenance,
  EventIngressTraceRef,
  PublicEventIngressAccepted,
  PublicEventIngressOutcome,
  PublicEventIngressRequest,
  PublicEventIngressRejected,
  ResetCommandPayload,
  ResetFollowupRef,
  RevokedCommandPayload
} from "./carriers.js";

export function constructEventCommandProvenance(
  workflowVersion: string,
  runId: string | null,
  workKey: string | null
): EventCommandProvenance {
  return Object.freeze({
    workflowVersion,
    runId,
    workKey
  });
}

export function constructApprovedCommandPayload(
  approvalKind: ApprovedCommandPayload["approvalKind"],
  edge: string,
  actor: ApprovedCommandPayload["actor"]
): ApprovedCommandPayload {
  return Object.freeze({
    approvalKind,
    edge,
    actor
  });
}

export function constructRevokedCommandPayload(
  approvalKind: RevokedCommandPayload["approvalKind"],
  edge: string,
  actor: string,
  reason: string
): RevokedCommandPayload {
  return Object.freeze({
    approvalKind,
    edge,
    actor,
    reason
  });
}

export function constructResetCommandPayload(
  scope: ResetCommandPayload["scope"],
  actor: string,
  reason: string,
  workKey: string | null,
  edge: string | null
): ResetCommandPayload {
  return Object.freeze({
    scope,
    actor,
    reason,
    workKey,
    edge
  });
}

export function constructApprovedEventIngressRequest(input: {
  readonly payload: ApprovedCommandPayload;
  readonly provenance: EventCommandProvenance;
}): PublicEventIngressRequest {
  return Object.freeze({
    kind: "approved",
    payload: input.payload,
    provenance: input.provenance
  });
}

export function constructRevokedEventIngressRequest(input: {
  readonly payload: RevokedCommandPayload;
  readonly provenance: EventCommandProvenance;
}): PublicEventIngressRequest {
  return Object.freeze({
    kind: "revoked",
    payload: input.payload,
    provenance: input.provenance
  });
}

export function constructResetEventIngressRequest(input: {
  readonly payload: ResetCommandPayload;
  readonly provenance: EventCommandProvenance;
}): PublicEventIngressRequest {
  return Object.freeze({
    kind: "reset",
    payload: input.payload,
    provenance: input.provenance
  });
}

function constructEventIngressTrace(
  request: PublicEventIngressRequest,
  emitted: readonly RuntimeEvent[]
): EventIngressTraceRef {
  return Object.freeze({
    workflowVersion: request.provenance.workflowVersion,
    runId: request.provenance.runId,
    workKey: request.provenance.workKey,
    emittedKinds: Object.freeze(emitted.map((event) => event.kind))
  });
}

function constructResetFollowupRef(
  request: PublicEventIngressRequest
): ResetFollowupRef | null {
  if (request.kind !== "reset") {
    return null;
  }
  return Object.freeze({
    kind: "canonical_reset_followups_owned_downstream"
  });
}

export function constructAcceptedPublicEventIngressOutcome(
  request: PublicEventIngressRequest,
  emitted: readonly RuntimeEvent[]
): PublicEventIngressAccepted {
  return Object.freeze({
    kind: "accepted",
    commandKind: request.kind,
    trace: constructEventIngressTrace(request, emitted),
    resetFollowup: constructResetFollowupRef(request)
  });
}

export function constructRejectedPublicEventIngressOutcome(
  reason: string,
  trace: EventIngressTraceRef | null = null
): PublicEventIngressRejected {
  return Object.freeze({
    kind: "rejected",
    reason,
    trace
  });
}

export function constructRuntimeEventsForEventIngress(
  request: PublicEventIngressRequest
): readonly RuntimeEvent[] {
  switch (request.kind) {
    case "approved":
      return Object.freeze([
        Object.freeze({
          kind: "approved",
          approvalKind: request.payload.approvalKind,
          edge: request.payload.edge,
          actor: request.payload.actor,
          workflowVersion: request.provenance.workflowVersion,
          runId: request.provenance.runId,
          workKey: request.provenance.workKey
        })
      ]);
    case "revoked":
      return Object.freeze([
        Object.freeze({
          kind: "revoked",
          approvalKind: request.payload.approvalKind,
          edge: request.payload.edge,
          actor: request.payload.actor,
          reason: request.payload.reason,
          workflowVersion: request.provenance.workflowVersion,
          runId: request.provenance.runId,
          workKey: request.provenance.workKey
        })
      ]);
    case "reset":
      return Object.freeze([
        Object.freeze({
          kind: "reset",
          scope: request.payload.scope,
          actor: request.payload.actor,
          reason: request.payload.reason,
          workflowVersion: request.provenance.workflowVersion,
          runId: request.provenance.runId,
          workKey: request.payload.workKey,
          edge: request.payload.edge
        })
      ]);
    default: {
      const exhaustive: never = request;
      throw new TypeError(
        `Unsupported event-ingress request ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

export function constructPublicEventIngressOutcome(
  request: PublicEventIngressRequest,
  emitted: readonly RuntimeEvent[]
): PublicEventIngressOutcome {
  return constructAcceptedPublicEventIngressOutcome(request, emitted);
}
