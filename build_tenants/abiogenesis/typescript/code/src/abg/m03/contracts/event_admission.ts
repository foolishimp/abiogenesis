import type {
  RuntimeEvent,
  RuntimeFailureClass,
  TerminalKind
} from "./carriers.js";
import {
  GRAPH_CHANGE_CLASS_VALUES,
  GRAPH_REENTRY_POINT_VALUES,
  GRAPH_SPAN_CARRY_OBSERVATION_STATUS_VALUES,
  GRAPH_SPAN_OBLIGATION_ASSESSMENT_STATUS_VALUES,
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
  | "nullable_non_negative_integer"
  | "boolean"
  | "string_array"
  | "number_array"
  | { readonly oneOf: readonly string[] };

type RuntimeEventRecord = Record<string, unknown>;
type RuntimeEventFieldRules = Readonly<Record<string, FieldRule>>;
type RuntimeEventAdmitter = (event: RuntimeEventRecord) => void;

const SCHEDULED_SLICE_FINDING_CLASS_VALUES = Object.freeze([
  "fulfilled",
  "semantic_fulfillment_gap",
  "traceability_reference_gap"
] as const);

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

function assertNullableNonNegativeInteger(value: unknown, label: string): void {
  if (value === null) {
    return;
  }
  assertNonNegativeInteger(value, label);
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

function assertNumberArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    assertNonNegativeInteger(entry, `${label}[${index}]`);
  }
}

function assertNullableNonEmptyString(value: unknown, label: string): void {
  if (value === null) {
    return;
  }
  assertNonEmptyString(value, label);
}

function assertGraphConstitutionalReentry(
  value: unknown,
  label: string
): void {
  if (value === null) {
    return;
  }
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object or null`);
  }
  assertOneOf(value["kind"], `${label}.kind`, ["graph_constitutional_reentry"]);
  assertOneOf(value["changeClass"], `${label}.changeClass`, GRAPH_CHANGE_CLASS_VALUES);
  assertOneOf(value["reEntryPoint"], `${label}.reEntryPoint`, GRAPH_REENTRY_POINT_VALUES);
  assertNullableNonEmptyString(
    value["targetGraphFunctionRef"],
    `${label}.targetGraphFunctionRef`
  );
  assertNullableNonNegativeInteger(
    value["targetVectorIndex"],
    `${label}.targetVectorIndex`
  );
  assertStringArray(value["routeContractRefs"], `${label}.routeContractRefs`);
  assertStringArray(value["authorityRefs"], `${label}.authorityRefs`);
  assertNonEmptyString(value["rationale"], `${label}.rationale`);
}

function assertGraphConstitutionalReentryArray(
  value: unknown,
  label: string
): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    assertGraphConstitutionalReentry(entry, `${label}[${index}]`);
  }
}

function assertGraphSpanAssessmentRows(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    if (!isPlainObject(entry)) {
      throw new TypeError(`${label}[${index}] must be a plain object`);
    }
    const rowLabel = `${label}[${index}]`;
    assertNonEmptyString(entry["obligationId"], `${rowLabel}.obligationId`);
    assertNonEmptyString(
      entry["sourceAuthorityRef"],
      `${rowLabel}.sourceAuthorityRef`
    );
    assertOneOf(
      entry["status"],
      `${rowLabel}.status`,
      GRAPH_SPAN_OBLIGATION_ASSESSMENT_STATUS_VALUES
    );
    assertStringArray(
      entry["terminalEvidenceRefs"],
      `${rowLabel}.terminalEvidenceRefs`
    );
    if (!Array.isArray(entry["carryObservations"])) {
      throw new TypeError(`${rowLabel}.carryObservations must be a list`);
    }
    for (const [carryIndex, carry] of entry["carryObservations"].entries()) {
      if (!isPlainObject(carry)) {
        throw new TypeError(
          `${rowLabel}.carryObservations[${carryIndex}] must be a plain object`
        );
      }
      const carryLabel = `${rowLabel}.carryObservations[${carryIndex}]`;
      assertNonNegativeInteger(
        carry["fromVectorIndex"],
        `${carryLabel}.fromVectorIndex`
      );
      assertNonNegativeInteger(
        carry["toVectorIndex"],
        `${carryLabel}.toVectorIndex`
      );
      assertOneOf(
        carry["status"],
        `${carryLabel}.status`,
        GRAPH_SPAN_CARRY_OBSERVATION_STATUS_VALUES
      );
      assertStringArray(carry["evidenceRefs"], `${carryLabel}.evidenceRefs`);
    }
    assertNullableString(entry["detail"], `${rowLabel}.detail`);
  }
}

function assertGraphSpanAssessmentRegimeBoundary(
  event: RuntimeEventRecord,
  label: string
): void {
  const rows = event["obligationRows"];
  if (!Array.isArray(rows)) {
    return;
  }
  const hasNonFulfilledRow = rows.some(
    (row) => isPlainObject(row) && row["status"] !== "fulfilled"
  );
  if (hasNonFulfilledRow && event["assessmentRegime"] !== "F_P") {
    throw new TypeError(
      `${label}.assessmentRegime must be F_P when obligation rows are not fulfilled`
    );
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
  if (rule === "nullable_non_negative_integer") {
    assertNullableNonNegativeInteger(value, label);
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
  if (rule === "number_array") {
    assertNumberArray(value, label);
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
  actor_process_started: applyFieldRules("ActorProcessStartedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    command: "non_empty_string",
    args: "string_array",
    cwd: "non_empty_string",
    pid: "nullable_non_negative_integer",
    timeoutMs: "non_negative_integer",
    stdoutRef: "non_empty_string",
    stderrRef: "non_empty_string"
  }),
  actor_process_stream_observed: applyFieldRules(
    "ActorProcessStreamObservedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      actorInvocationId: "non_empty_string",
      streamName: { oneOf: ["stdout", "stderr"] },
      streamRef: "non_empty_string",
      chunkIndex: "non_negative_integer",
      byteLength: "non_negative_integer"
    }
  ),
  actor_process_heartbeat: applyFieldRules("ActorProcessHeartbeatEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    heartbeatIndex: "non_negative_integer",
    elapsedMs: "non_negative_integer"
  }),
  actor_process_timeout: applyFieldRules("ActorProcessTimeoutEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    timeoutMs: "non_negative_integer",
    elapsedMs: "non_negative_integer"
  }),
  actor_process_signal_sent: applyFieldRules("ActorProcessSignalSentEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    signal: { oneOf: ["SIGTERM", "SIGKILL"] },
    elapsedMs: "non_negative_integer"
  }),
  actor_process_exited: applyFieldRules("ActorProcessExitedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    status: "nullable_non_negative_integer",
    signal: "nullable_string",
    elapsedMs: "non_negative_integer",
    timedOut: "boolean",
    error: "nullable_string"
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
  reset: (event: RuntimeEventRecord) => {
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
  }),
  output_instance_allocated: applyFieldRules("OutputInstanceAllocatedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    allocationId: "non_empty_string",
    assetRef: "non_empty_string",
    assetType: "non_empty_string",
    outputName: "non_empty_string",
    materializationRoot: "non_empty_string",
    materializationUri: "non_empty_string",
    allowedWriteRoots: "string_array",
    inputWorkspaceRoot: "non_empty_string",
    outputWorkspaceRef: "non_empty_string",
    outputWorkspaceRoot: "non_empty_string",
    outputWorkspaceAuthorityRef: "nullable_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string"
  }),
  output_binding_admitted: applyFieldRules("OutputBindingAdmittedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    bindingRef: "non_empty_string",
    allocationId: "non_empty_string",
    assetRef: "non_empty_string",
    assetType: "non_empty_string",
    bindingRole: { oneOf: ["output"] },
    source: { oneOf: ["abg_allocation"] },
    allowedWriteRoots: "string_array",
    outputWorkspaceRef: "non_empty_string",
    outputWorkspaceRoot: "non_empty_string",
    outputWorkspaceAuthorityRef: "nullable_string"
  }),
  output_materialization_observed: applyFieldRules(
    "OutputMaterializationObservedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      allocationId: "non_empty_string",
      assetRef: "non_empty_string",
      materializedRef: "non_empty_string",
      materializedPath: "non_empty_string",
      digest: "non_empty_string",
      observerRef: "non_empty_string",
      artifactRefs: "string_array"
    }
  ),
  workspace_obligation_ledger_admitted: applyFieldRules(
    "WorkspaceObligationLedgerAdmittedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      ledgerRef: "non_empty_string",
      workspaceAssetRef: "non_empty_string",
      authorityDigest: "non_empty_string",
      obligationRefs: "string_array"
    }
  ),
  workspace_obligation_schedule_derived: applyFieldRules(
    "WorkspaceObligationScheduleDerivedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      scheduleRef: "non_empty_string",
      ledgerRef: "non_empty_string",
      scheduleItemRefs: "string_array"
    }
  ),
  zoom_frame_opened: applyFieldRules("ZoomFrameOpenedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    zoomFrameId: "non_empty_string",
    inputAssetRef: "non_empty_string",
    outputAssetRef: "non_empty_string",
    ledgerRef: "non_empty_string",
    scheduleRef: "non_empty_string"
  }),
  scheduled_slice_dispatched: applyFieldRules(
    "ScheduledSliceDispatchedRuntimeEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      zoomFrameId: "non_empty_string",
      scheduleItemId: "non_empty_string",
      obligationId: "non_empty_string",
      attemptIndex: "non_negative_integer",
      handoffRef: "non_empty_string",
      pluginRef: "non_empty_string",
      outputAssetRef: "non_empty_string"
    }
  ),
  scheduled_slice_assessed: (event: RuntimeEventRecord) => {
    applyFieldRules("ScheduledSliceAssessedRuntimeEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      zoomFrameId: "non_empty_string",
      assessmentId: "non_empty_string",
      scheduleItemId: "non_empty_string",
      obligationId: "non_empty_string",
      attemptIndex: "non_negative_integer",
      status: { oneOf: ["fulfilled", "partial", "blocked", "runtime_failed"] },
      assessmentRegime: { oneOf: ["F_D", "F_P", "F_H"] },
      findingClass: "nullable_string",
      evidenceRefs: "string_array",
      outputRefs: "string_array",
      runtimeFailureClass: "nullable_string",
      detail: "nullable_string"
    })(event);
    if (event["findingClass"] !== null) {
      assertOneOf(
        event["findingClass"],
        "ScheduledSliceAssessedRuntimeEvent.findingClass",
        SCHEDULED_SLICE_FINDING_CLASS_VALUES
      );
    }
    if (event["runtimeFailureClass"] !== null) {
      assertOneOf(
        event["runtimeFailureClass"],
        "ScheduledSliceAssessedRuntimeEvent.runtimeFailureClass",
        RUNTIME_FAILURE_CLASS_VALUES
      );
    }
    if (
      event["status"] === "runtime_failed" &&
      event["runtimeFailureClass"] === null
    ) {
      throw new TypeError(
        "ScheduledSliceAssessedRuntimeEvent.runtimeFailureClass must be present for runtime_failed status"
      );
    }
    if (
      event["status"] === "runtime_failed" &&
      event["findingClass"] !== null
    ) {
      throw new TypeError(
        "ScheduledSliceAssessedRuntimeEvent.findingClass must be null for runtime_failed status"
      );
    }
    if (
      event["status"] === "fulfilled" &&
      event["findingClass"] !== "fulfilled"
    ) {
      throw new TypeError(
        "ScheduledSliceAssessedRuntimeEvent.findingClass must be fulfilled for fulfilled status"
      );
    }
  },
  zoom_foldback_evaluated: applyFieldRules("ZoomFoldbackEvaluatedRuntimeEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    zoomFrameId: "non_empty_string",
    foldbackRef: "non_empty_string",
    decision: {
      oneOf: [
        "close",
        "retry_scheduled_slice",
        "carry_loopback_pressure",
        "blocked",
        "reprice_required"
      ]
    },
    fulfilledCount: "non_negative_integer",
    openCount: "non_negative_integer",
    blockedCount: "non_negative_integer",
    runtimeFailureCount: "non_negative_integer",
    missingAssessmentCount: "non_negative_integer",
    conflictingCount: "non_negative_integer"
  }),
  graph_span_evaluation_scheduled: applyFieldRules(
    "GraphSpanEvaluationScheduledEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      terminalVectorIndex: "non_negative_integer",
      terminalEdge: "non_empty_string",
      scheduleRef: "non_empty_string",
      spanIds: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      generation: "non_negative_integer"
    }
  ),
  graph_span_assessed: (event: RuntimeEventRecord) => {
    applyFieldRules("GraphSpanAssessedEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      terminalVectorIndex: "non_negative_integer",
      terminalEdge: "non_empty_string",
      sourceVectorIndex: "non_negative_integer",
      spanId: "non_empty_string",
      sourceNodeRef: "non_empty_string",
      terminalNodeRef: "non_empty_string",
      coveredVectorIndexes: "number_array",
      assessmentId: "non_empty_string",
      attemptIndex: "non_negative_integer",
      assessmentRegime: { oneOf: ["F_D", "F_P", "F_H"] },
      evidenceRefs: "string_array",
      edgeFoldbackRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      detail: "nullable_string",
      generation: "non_negative_integer"
    })(event);
    assertGraphSpanAssessmentRows(
      event["obligationRows"],
      "GraphSpanAssessedEvent.obligationRows"
    );
    assertGraphConstitutionalReentry(
      event["constitutionalReentry"],
      "GraphSpanAssessedEvent.constitutionalReentry"
    );
    assertGraphSpanAssessmentRegimeBoundary(event, "GraphSpanAssessedEvent");
  },
  graph_span_foldback_evaluated: (event: RuntimeEventRecord) => {
    applyFieldRules("GraphSpanFoldbackEvaluatedEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      terminalVectorIndex: "non_negative_integer",
      terminalEdge: "non_empty_string",
      foldbackRef: "non_empty_string",
      spanAssessmentRefs: "string_array",
      edgeFoldbackRefs: "string_array",
      causingEdgeFoldbackRefs: "string_array",
      decision: {
        oneOf: [
          "close",
          "retry_terminal_edge",
          "reenter_at_vector",
          "constitutional_reentry",
          "reprice_required",
          "blocked"
        ]
      },
      fulfilledCount: "non_negative_integer",
      gapCount: "non_negative_integer",
      staleInputCount: "non_negative_integer",
      blockedCount: "non_negative_integer",
      contradictoryCount: "non_negative_integer",
      causingObligationRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      generation: "non_negative_integer"
    })(event);
    assertNumberArray(
      event["reentryCandidateVectorIndexes"],
      "GraphSpanFoldbackEvaluatedEvent.reentryCandidateVectorIndexes"
    );
    assertNullableNonNegativeInteger(
      event["earliestReentryVectorIndex"],
      "GraphSpanFoldbackEvaluatedEvent.earliestReentryVectorIndex"
    );
    assertGraphConstitutionalReentryArray(
      event["constitutionalReentries"],
      "GraphSpanFoldbackEvaluatedEvent.constitutionalReentries"
    );
  },
  graph_reentry_planned: (event: RuntimeEventRecord) => {
    applyFieldRules("GraphReentryPlannedEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      planRef: "non_empty_string",
      fromTerminalVectorIndex: "non_negative_integer",
      targetVectorIndex: "nullable_non_negative_integer",
      changeClass: "nullable_string",
      reEntryPoint: "nullable_string",
      routeContractRefs: "string_array",
      causingFrontierRowRefs: "string_array",
      shadowedVectorIndexes: "number_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      reason: "non_empty_string",
      generation: "non_negative_integer"
    })(event);
    if (event["changeClass"] !== null) {
      assertOneOf(
        event["changeClass"],
        "GraphReentryPlannedEvent.changeClass",
        GRAPH_CHANGE_CLASS_VALUES
      );
    }
    if (event["reEntryPoint"] !== null) {
      assertOneOf(
        event["reEntryPoint"],
        "GraphReentryPlannedEvent.reEntryPoint",
        GRAPH_REENTRY_POINT_VALUES
      );
    }
  },
  graph_reentry_applied: (event: RuntimeEventRecord) => {
    applyFieldRules("GraphReentryAppliedEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      planRef: "non_empty_string",
      targetVectorIndex: "nullable_non_negative_integer",
      changeClass: "nullable_string",
      reEntryPoint: "nullable_string",
      routeContractRefs: "string_array",
      causingFrontierRowRefs: "string_array",
      shadowedVectorIndexes: "number_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      generation: "non_negative_integer"
    })(event);
    if (event["changeClass"] !== null) {
      assertOneOf(
        event["changeClass"],
        "GraphReentryAppliedEvent.changeClass",
        GRAPH_CHANGE_CLASS_VALUES
      );
    }
    if (event["reEntryPoint"] !== null) {
      assertOneOf(
        event["reEntryPoint"],
        "GraphReentryAppliedEvent.reEntryPoint",
        GRAPH_REENTRY_POINT_VALUES
      );
    }
  },
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
