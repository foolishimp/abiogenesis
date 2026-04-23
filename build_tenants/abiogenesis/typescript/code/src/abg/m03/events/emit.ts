import type {
  AdvancementTransition,
  RuntimeEvent,
  TerminalKind
} from "../contracts/carriers.js";

export type RuntimeEventSink = (event: RuntimeEvent) => void;
type DispatchRequest = {
  readonly kind: "fp_dispatch_request";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
};
export type DispatchRequestSink = (request: DispatchRequest) => void;

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function assertNullableString(value: unknown, label: string): void {
  if (value !== null && typeof value !== "string") {
    throw new TypeError(`${label} must be a string or null`);
  }
}

function assertTerminalKind(value: unknown, label: string): asserts value is TerminalKind {
  if (
    value === "converged" ||
    value === "nothing_to_do" ||
    value === "gap_stop" ||
    value === "yielded" ||
    value === "dispatch_required" ||
    value === "human_gate_required" ||
    value === "traversal_applied"
  ) {
    return;
  }
  throw new TypeError(`${label} must be a supported terminal kind`);
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function deriveDispatchResultRef(
  basisId: string,
  dispatchRef: string
): string {
  return `result:fp_dispatch:${JSON.stringify({ basisId, dispatchRef })}`;
}

function isRuntimeEventBatch(
  events: RuntimeEvent | readonly RuntimeEvent[]
): events is readonly RuntimeEvent[] {
  return Array.isArray(events);
}

function isDispatchRequestBatch(
  requests: DispatchRequest | readonly DispatchRequest[]
): requests is readonly DispatchRequest[] {
  return Array.isArray(requests);
}

function assertDispatchRequest(request: unknown): asserts request is DispatchRequest {
  if (!isPlainObject(request) || request["kind"] !== "fp_dispatch_request") {
    throw new TypeError("dispatch request must be an fp_dispatch_request object");
  }
  assertNonEmptyString(request["basisId"], "DispatchRequest.basisId");
  assertNonEmptyString(request["graphFunctionId"], "DispatchRequest.graphFunctionId");
  assertNonEmptyString(request["jobId"], "DispatchRequest.jobId");
  assertNonEmptyString(request["dispatchRef"], "DispatchRequest.dispatchRef");
  assertNonEmptyString(request["workerId"], "DispatchRequest.workerId");
  assertNonEmptyString(request["backendId"], "DispatchRequest.backendId");
  assertNonEmptyString(request["resultRef"], "DispatchRequest.resultRef");
}

function assertRuntimeEvent(event: unknown): asserts event is RuntimeEvent {
  if (!isPlainObject(event)) {
    throw new TypeError("RuntimeEvent must be a plain object");
  }
  switch (event["kind"]) {
    case "basis_admitted":
      assertNonEmptyString(event["basisId"], "BasisAdmittedEvent.basisId");
      assertNonEmptyString(
        event["graphFunctionId"],
        "BasisAdmittedEvent.graphFunctionId"
      );
      assertNonEmptyString(event["jobId"], "BasisAdmittedEvent.jobId");
      assertNonEmptyString(
        event["resolvedRuntimeRef"],
        "BasisAdmittedEvent.resolvedRuntimeRef"
      );
      assertNonEmptyString(
        event["resolvedPolicyBundleRef"],
        "BasisAdmittedEvent.resolvedPolicyBundleRef"
      );
      assertNullableString(event["runId"], "BasisAdmittedEvent.runId");
      assertNullableString(event["workKey"], "BasisAdmittedEvent.workKey");
      return;
    case "fd_advance_ready":
      assertNonEmptyString(event["basisId"], "FdAdvanceReadyEvent.basisId");
      assertNonEmptyString(
        event["graphFunctionId"],
        "FdAdvanceReadyEvent.graphFunctionId"
      );
      if (event["status"] !== "ready") {
        throw new TypeError("FdAdvanceReadyEvent.status must be \"ready\"");
      }
      return;
    case "fp_dispatch_requested":
      assertNonEmptyString(event["basisId"], "FpDispatchRequestedEvent.basisId");
      assertNonEmptyString(
        event["dispatchRef"],
        "FpDispatchRequestedEvent.dispatchRef"
      );
      return;
    case "fh_escalated":
      assertNonEmptyString(event["basisId"], "FhEscalatedEvent.basisId");
      assertNonEmptyString(
        event["approvalSubjectRef"],
        "FhEscalatedEvent.approvalSubjectRef"
      );
      assertNonEmptyString(event["gateReason"], "FhEscalatedEvent.gateReason");
      return;
    case "terminal_reached":
      assertNonEmptyString(event["basisId"], "TerminalReachedEvent.basisId");
      assertTerminalKind(event["terminalKind"], "TerminalReachedEvent.terminalKind");
      assertNullableString(event["reason"], "TerminalReachedEvent.reason");
      return;
    default:
      throw new TypeError("RuntimeEvent.kind is not a supported closed variant");
  }
}

function normalizeEvents(
  events: RuntimeEvent | readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  const batch: RuntimeEvent[] = [];
  if (isRuntimeEventBatch(events)) {
    for (const event of events) {
      batch.push(event);
    }
  } else {
    batch.push(events);
  }
  for (const event of batch) {
    assertRuntimeEvent(event);
  }
  return Object.freeze(batch);
}

function normalizeDispatchRequests(
  requests: DispatchRequest | readonly DispatchRequest[]
): readonly DispatchRequest[] {
  const batch: DispatchRequest[] = [];
  if (isDispatchRequestBatch(requests)) {
    for (const request of requests) {
      batch.push(request);
    }
  } else {
    batch.push(requests);
  }
  for (const request of batch) {
    assertDispatchRequest(request);
  }
  return Object.freeze(batch);
}

export function dispatchRequestsForTransition(
  transition: AdvancementTransition
): readonly DispatchRequest[] {
  if (transition.kind !== "fp_dispatch") {
    return Object.freeze([]);
  }
  const dispatchRef = transition.dispatchRef;
  const basis = transition.basis;
  const request: DispatchRequest = Object.freeze({
    kind: "fp_dispatch_request",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    jobId: basis.job.id,
    dispatchRef,
    workerId: basis.runtimeIdentity.workerId,
    backendId: basis.runtimeIdentity.backendId,
    resultRef: deriveDispatchResultRef(basis.id, dispatchRef)
  });
  return Object.freeze([request]);
}

export function emit(
  events: RuntimeEvent | readonly RuntimeEvent[],
  sink: RuntimeEventSink
): readonly RuntimeEvent[] {
  const normalized = normalizeEvents(events);
  for (const event of normalized) {
    sink(event);
  }
  return normalized;
}

export function dispatch(
  requests: DispatchRequest | readonly DispatchRequest[],
  sink: DispatchRequestSink
): readonly DispatchRequest[] {
  const normalized = normalizeDispatchRequests(requests);
  for (const request of normalized) {
    sink(request);
  }
  return normalized;
}
