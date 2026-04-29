import type {
  RuntimeEvent,
  RuntimeFailureClass,
  TerminalKind
} from "./carriers.js";
import {
  PAYLOAD_AMBIGUITY_STATUS_VALUES,
  PAYLOAD_CLOSURE_DECISION_KIND_VALUES,
  PAYLOAD_REJECTION_CLASS_VALUES,
  RUNTIME_EVENT_KIND_VALUES,
  RUNTIME_FAILURE_CLASS_VALUES,
  TERMINAL_KIND_VALUES
} from "./carriers.js";

type FieldRule =
  | "non_empty_string"
  | "nullable_string"
  | "non_negative_integer"
  | "boolean"
  | "string_array"
  | { readonly oneOf: readonly string[] };

type RuntimeEventRecord = Record<string, unknown>;
type RuntimeEventFieldRules = Readonly<Record<string, FieldRule>>;
type RuntimeEventAdmitter = (event: RuntimeEventRecord) => void;

function isPlainObject(input: unknown): input is RuntimeEventRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

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

function assertNonNegativeInteger(value: unknown, label: string): void {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
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

function assertStringArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    assertNonEmptyString(entry, `${label}[${index}]`);
  }
}

function applyFieldRule(value: unknown, label: string, rule: FieldRule): void {
  if (rule === "non_empty_string") {
    assertNonEmptyString(value, label);
    return;
  }
  if (rule === "nullable_string") {
    assertNullableString(value, label);
    return;
  }
  if (rule === "non_negative_integer") {
    assertNonNegativeInteger(value, label);
    return;
  }
  if (rule === "boolean") {
    if (typeof value !== "boolean") {
      throw new TypeError(`${label} must be boolean`);
    }
    return;
  }
  if (rule === "string_array") {
    assertStringArray(value, label);
    return;
  }
  assertOneOf(value, label, rule.oneOf);
}

function applyFieldRules(
  eventName: string,
  rules: RuntimeEventFieldRules
): RuntimeEventAdmitter {
  return (event) => {
    for (const [fieldName, rule] of Object.entries(rules)) {
      applyFieldRule(event[fieldName], `${eventName}.${fieldName}`, rule);
    }
  };
}

const retryStopReasons = Object.freeze([
  "retry_budget_exhausted",
  "stationary_retry"
] as const);

const RUNTIME_EVENT_ADMITTERS = Object.freeze({
  basis_admitted: applyFieldRules("BasisAdmittedEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    jobId: "non_empty_string",
    resolvedRuntimeRef: "non_empty_string",
    resolvedPolicyBundleRef: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string"
  }),
  fd_advance_ready: applyFieldRules("FdAdvanceReadyEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    status: { oneOf: ["ready"] }
  }),
  fp_dispatch_requested: applyFieldRules("FpDispatchRequestedEvent", {
    basisId: "non_empty_string",
    dispatchRef: "non_empty_string"
  }),
  actor_invocation_started: applyFieldRules("ActorInvocationStartedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    attemptIndex: "non_negative_integer",
    dispatchRef: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    resultRef: "non_empty_string"
  }),
  actor_result_artifact_observed: applyFieldRules(
    "ActorResultArtifactObservedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      actorInvocationId: "non_empty_string",
      resultRef: "non_empty_string",
      artifactRef: "non_empty_string"
    }
  ),
  actor_invocation_closed: applyFieldRules("ActorInvocationClosedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    closureStatus: {
      oneOf: ["completed", "blocked", "blocked_with_artifact"]
    },
    resultRef: "nullable_string",
    detail: "nullable_string"
  }),
  fh_escalated: applyFieldRules("FhEscalatedEvent", {
    basisId: "non_empty_string",
    approvalSubjectRef: "non_empty_string",
    gateReason: "non_empty_string"
  }),
  terminal_reached: applyFieldRules("TerminalReachedEvent", {
    basisId: "non_empty_string",
    terminalKind: { oneOf: TERMINAL_KIND_VALUES },
    reason: "nullable_string"
  }),
  graph_call_opened: applyFieldRules("GraphCallOpenedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    jobId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string"
  }),
  frame_opened: applyFieldRules("FrameOpenedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    frameLineageId: "nullable_string",
    vectorCount: "non_negative_integer"
  }),
  vector_traversal_planned: applyFieldRules("VectorTraversalPlannedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string"
  }),
  vector_evaluated: applyFieldRules("VectorEvaluatedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    evaluatorIds: "string_array",
    status: { oneOf: ["accepted", "blocked"] }
  }),
  vector_closed: applyFieldRules("VectorClosedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    closureKind: { oneOf: ["advanced", "assessed"] }
  }),
  retry_repair_planned: applyFieldRules("RetryRepairPlannedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    retryRunId: "non_empty_string",
    retryCallId: "non_empty_string",
    manifestId: "non_empty_string",
    priorManifestId: "non_empty_string",
    sourceProjectionRef: "non_empty_string",
    attemptIndex: "non_negative_integer",
    maxAttempts: "non_negative_integer"
  }),
  retry_attempt_opened: applyFieldRules("RetryAttemptOpenedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    retryRunId: "non_empty_string",
    retryCallId: "non_empty_string",
    manifestId: "non_empty_string"
  }),
  retry_attempt_stopped: applyFieldRules("RetryAttemptStoppedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    reason: { oneOf: retryStopReasons },
    observedAttemptCount: "non_negative_integer",
    maxAttempts: "non_negative_integer"
  }),
  retry_attempt_escalated: applyFieldRules("RetryAttemptEscalatedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    approvalSubjectRef: "non_empty_string",
    gateReason: { oneOf: retryStopReasons },
    observedAttemptCount: "non_negative_integer",
    maxAttempts: "non_negative_integer"
  }),
  retry_progress_recorded: applyFieldRules("RetryProgressRecordedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    retryRunId: "non_empty_string",
    progressSignalRefs: "string_array",
    stationary: "boolean"
  }),
  continuation_terminated: applyFieldRules("ContinuationTerminatedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    continuationId: "non_empty_string",
    causedByRetryRunId: "non_empty_string",
    reason: { oneOf: ["retry_repair"] }
  }),
  continuation_reopened: applyFieldRules("ContinuationReopenedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    continuationId: "non_empty_string",
    closedContinuationId: "non_empty_string",
    causedByRetryRunId: "non_empty_string"
  }),
  leaf_task_opened: applyFieldRules("LeafTaskOpenedEvent", {
    basisId: "non_empty_string",
    leafTaskId: "non_empty_string",
    runId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    inputSchemaRef: "non_empty_string",
    outputSchemaRef: "non_empty_string",
    workerRef: "non_empty_string"
  }),
  leaf_task_completed: applyFieldRules("LeafTaskCompletedEvent", {
    basisId: "non_empty_string",
    leafTaskId: "non_empty_string",
    runId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    outputSchemaRef: "non_empty_string",
    resultRef: "non_empty_string",
    outputPayloadRef: "non_empty_string"
  }),
  leaf_task_failed: applyFieldRules("LeafTaskFailedEvent", {
    basisId: "non_empty_string",
    leafTaskId: "non_empty_string",
    runId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    failureClass: { oneOf: RUNTIME_FAILURE_CLASS_VALUES },
    detail: "non_empty_string",
    evidenceRefs: "string_array"
  }),
  approved: applyFieldRules("ApprovedRuntimeEvent", {
    approvalKind: { oneOf: ["fh_review", "fh_intent"] },
    edge: "non_empty_string",
    actor: { oneOf: ["human", "human-proxy"] },
    workflowVersion: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string"
  }),
  revoked: applyFieldRules("RevokedRuntimeEvent", {
    approvalKind: { oneOf: ["fh_approval"] },
    edge: "non_empty_string",
    actor: "non_empty_string",
    reason: "non_empty_string",
    workflowVersion: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string"
  }),
  reset: (event) => {
    applyFieldRules("ResetRuntimeEvent", {
      scope: { oneOf: ["workspace", "work_key", "edge"] },
      actor: "non_empty_string",
      reason: "non_empty_string",
      workflowVersion: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      edge: "nullable_string"
    })(event);
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
  },
  assessed: applyFieldRules("AssessedRuntimeEvent", {
    assessmentKind: { oneOf: ["fp"] },
    edge: "non_empty_string",
    obligationId: "non_empty_string",
    publishedLedgerRef: "non_empty_string",
    actor: "non_empty_string",
    specHash: "non_empty_string",
    manifestId: "non_empty_string",
    workflowVersion: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    selectedWorkerId: "nullable_string",
    selectedBackend: "nullable_string",
    roleId: "nullable_string",
    authorityRef: "nullable_string",
    assignmentSource: "nullable_string",
    resolvedRuntimeRef: "nullable_string"
  }),
  payload_observed: applyFieldRules("PayloadObservedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    payloadRef: "non_empty_string",
    payloadClass: "non_empty_string",
    schemaRef: "nullable_string",
    contractRef: "nullable_string",
    digest: "non_empty_string",
    producerRef: "non_empty_string",
    sourceEventRef: "nullable_string",
    actorInvocationId: "nullable_string",
    authorityRef: "nullable_string",
    inputDigest: "nullable_string",
    policyRefs: "string_array"
  }),
  payload_validated: applyFieldRules("PayloadValidatedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    payloadRef: "non_empty_string",
    schemaRef: "nullable_string",
    contractRef: "nullable_string",
    digest: "non_empty_string",
    validationRef: "non_empty_string",
    evidenceRef: "nullable_string",
    policyRefs: "string_array"
  }),
  payload_rejected: applyFieldRules("PayloadRejectedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    payloadRef: "non_empty_string",
    rejectionClass: { oneOf: PAYLOAD_REJECTION_CLASS_VALUES },
    schemaRef: "nullable_string",
    contractRef: "nullable_string",
    digest: "nullable_string",
    reason: "non_empty_string",
    policyRefs: "string_array"
  }),
  authority_snapshot_admitted: applyFieldRules(
    "AuthoritySnapshotAdmittedRuntimeEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      authoritySnapshotRef: "non_empty_string",
      authorityRefs: "string_array",
      inputRefs: "string_array",
      authorityDigest: "non_empty_string",
      inputDigest: "non_empty_string",
      closureCapable: "boolean",
      contradictoryAuthority: "boolean",
      deferredAuthorityRefs: "string_array",
      providerRefs: "string_array",
      policyRefs: "string_array"
    }
  ),
  evidence_admitted: applyFieldRules("EvidenceAdmittedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    evidenceRef: "non_empty_string",
    payloadRef: "non_empty_string",
    authorityRef: "nullable_string",
    authorityDigest: "nullable_string",
    inputDigest: "nullable_string",
    providerRefs: "string_array",
    policyRefs: "string_array",
    complete: "boolean",
    shallow: "boolean",
    contradictsAuthority: "boolean",
    deferred: "boolean"
  }),
  ambiguity_observation_admitted: applyFieldRules(
    "AmbiguityObservationAdmittedRuntimeEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      ambiguityRef: "non_empty_string",
      ambiguityStatus: { oneOf: PAYLOAD_AMBIGUITY_STATUS_VALUES },
      authorityRef: "nullable_string",
      evidenceRef: "nullable_string",
      payloadRef: "nullable_string",
      reason: "non_empty_string",
      providerRefs: "string_array",
      policyRefs: "string_array"
    }
  ),
  closure_input_published: applyFieldRules("ClosureInputPublishedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    closureInputRef: "non_empty_string",
    projectionRef: "non_empty_string",
    closureDecision: { oneOf: PAYLOAD_CLOSURE_DECISION_KIND_VALUES },
    rowRefs: "string_array",
    sourceProjectionRefs: "string_array",
    policyRefs: "string_array"
  })
} satisfies Record<RuntimeEvent["kind"], RuntimeEventAdmitter>);

export function parseRuntimeEventKind(
  input: unknown,
  label: string
): RuntimeEvent["kind"] {
  assertOneOf(input, label, RUNTIME_EVENT_KIND_VALUES);
  return input;
}

export function parseRuntimeFailureClass(
  input: unknown,
  label: string
): RuntimeFailureClass {
  assertOneOf(input, label, RUNTIME_FAILURE_CLASS_VALUES);
  return input;
}

export function parseTerminalKind(
  input: unknown,
  label: string
): TerminalKind {
  assertOneOf(input, label, TERMINAL_KIND_VALUES);
  return input;
}

export function assertRuntimeEvent(event: unknown): asserts event is RuntimeEvent {
  if (!isPlainObject(event)) {
    throw new TypeError("RuntimeEvent must be a plain object");
  }
  const kind = parseRuntimeEventKind(event["kind"], "RuntimeEvent.kind");
  RUNTIME_EVENT_ADMITTERS[kind](event);
}
