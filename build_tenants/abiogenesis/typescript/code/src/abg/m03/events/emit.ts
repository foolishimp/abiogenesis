import type {
  RuntimeEvent,
  TerminalKind
} from "../contracts/carriers.js";

export type RuntimeEventSink = (event: RuntimeEvent) => void;

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

function assertOneOf<T extends string>(
  value: unknown,
  label: string,
  allowed: readonly T[]
): asserts value is T {
  if (typeof value !== "string") {
    throw new TypeError(
      `${label} must be one of ${allowed.map((item) => JSON.stringify(item)).join(", ")}`
    );
  }
  for (const option of allowed) {
    if (value === option) {
      return;
    }
  }
  throw new TypeError(
    `${label} must be one of ${allowed.map((item) => JSON.stringify(item)).join(", ")}`
  );
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

function isRuntimeEventBatch(
  events: RuntimeEvent | readonly RuntimeEvent[]
): events is readonly RuntimeEvent[] {
  return Array.isArray(events);
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
    case "approved":
      assertOneOf(event["approvalKind"], "ApprovedRuntimeEvent.approvalKind", [
        "fh_review",
        "fh_intent"
      ]);
      assertNonEmptyString(event["edge"], "ApprovedRuntimeEvent.edge");
      assertOneOf(event["actor"], "ApprovedRuntimeEvent.actor", [
        "human",
        "human-proxy"
      ]);
      assertNonEmptyString(
        event["workflowVersion"],
        "ApprovedRuntimeEvent.workflowVersion"
      );
      assertNullableString(event["runId"], "ApprovedRuntimeEvent.runId");
      assertNullableString(event["workKey"], "ApprovedRuntimeEvent.workKey");
      return;
    case "revoked":
      assertOneOf(event["approvalKind"], "RevokedRuntimeEvent.approvalKind", [
        "fh_approval"
      ]);
      assertNonEmptyString(event["edge"], "RevokedRuntimeEvent.edge");
      assertNonEmptyString(event["actor"], "RevokedRuntimeEvent.actor");
      assertNonEmptyString(event["reason"], "RevokedRuntimeEvent.reason");
      assertNonEmptyString(
        event["workflowVersion"],
        "RevokedRuntimeEvent.workflowVersion"
      );
      assertNullableString(event["runId"], "RevokedRuntimeEvent.runId");
      assertNullableString(event["workKey"], "RevokedRuntimeEvent.workKey");
      return;
    case "reset":
      assertOneOf(event["scope"], "ResetRuntimeEvent.scope", [
        "workspace",
        "work_key",
        "edge"
      ]);
      assertNonEmptyString(event["actor"], "ResetRuntimeEvent.actor");
      assertNonEmptyString(event["reason"], "ResetRuntimeEvent.reason");
      assertNonEmptyString(
        event["workflowVersion"],
        "ResetRuntimeEvent.workflowVersion"
      );
      assertNullableString(event["runId"], "ResetRuntimeEvent.runId");
      assertNullableString(event["workKey"], "ResetRuntimeEvent.workKey");
      assertNullableString(event["edge"], "ResetRuntimeEvent.edge");
      if (
        (event["scope"] === "work_key" || event["scope"] === "edge") &&
        event["workKey"] === null
      ) {
        throw new TypeError(
          "ResetRuntimeEvent.workKey must be present for scope work_key or edge"
        );
      }
      if (event["scope"] === "edge" && event["edge"] === null) {
        throw new TypeError("ResetRuntimeEvent.edge must be present for scope edge");
      }
      return;
    case "assessed":
      assertOneOf(event["assessmentKind"], "AssessedRuntimeEvent.assessmentKind", [
        "fp"
      ]);
      assertNonEmptyString(event["edge"], "AssessedRuntimeEvent.edge");
      assertNonEmptyString(
        event["obligationId"],
        "AssessedRuntimeEvent.obligationId"
      );
      assertNonEmptyString(
        event["publishedLedgerRef"],
        "AssessedRuntimeEvent.publishedLedgerRef"
      );
      assertNonEmptyString(event["actor"], "AssessedRuntimeEvent.actor");
      assertNonEmptyString(event["specHash"], "AssessedRuntimeEvent.specHash");
      assertNonEmptyString(
        event["manifestId"],
        "AssessedRuntimeEvent.manifestId"
      );
      assertNonEmptyString(
        event["workflowVersion"],
        "AssessedRuntimeEvent.workflowVersion"
      );
      assertNullableString(event["runId"], "AssessedRuntimeEvent.runId");
      assertNullableString(event["workKey"], "AssessedRuntimeEvent.workKey");
      assertNullableString(
        event["selectedWorkerId"],
        "AssessedRuntimeEvent.selectedWorkerId"
      );
      assertNullableString(
        event["selectedBackend"],
        "AssessedRuntimeEvent.selectedBackend"
      );
      assertNullableString(event["roleId"], "AssessedRuntimeEvent.roleId");
      assertNullableString(
        event["authorityRef"],
        "AssessedRuntimeEvent.authorityRef"
      );
      assertNullableString(
        event["assignmentSource"],
        "AssessedRuntimeEvent.assignmentSource"
      );
      assertNullableString(
        event["resolvedRuntimeRef"],
        "AssessedRuntimeEvent.resolvedRuntimeRef"
      );
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
