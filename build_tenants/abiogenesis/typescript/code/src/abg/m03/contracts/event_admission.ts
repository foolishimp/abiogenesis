import type {
  CanonicalRuntimeEvent,
  RuntimeEvent,
  RuntimeFailureClass,
  TerminalKind
} from "./carriers.js";
import {
  BRANCH_EXECUTION_DISPOSITION_VALUES,
  FD_AUTHORITY_SEVERITY_CLASS_VALUES,
  FD_PRESSURE_ROUTING_DECISION_VALUES,
  GRAPH_CHANGE_CLASS_VALUES,
  GRAPH_REENTRY_POINT_VALUES,
  GRAPH_SPAN_CARRY_OBSERVATION_STATUS_VALUES,
  GRAPH_SPAN_OBLIGATION_ASSESSMENT_STATUS_VALUES,
  OBSERVED_STATE_SOURCE_KIND_VALUES,
  OVERLAY_FRAME_PREDICATE_ROLE_VALUES,
  OVERLAY_FRAME_PRESSURE_DECISION_VALUES,
  OVERLAY_FRAME_SCOPE_KIND_VALUES,
  PAYLOAD_AMBIGUITY_STATUS_VALUES,
  PAYLOAD_CLOSURE_DECISION_KIND_VALUES,
  PAYLOAD_REJECTION_CLASS_VALUES,
  RUNTIME_ACTIVITY_PROBE_SOURCE_VALUES,
  RUNTIME_EVENT_KIND_VALUES,
  RUNTIME_EXTERNAL_INTERRUPTION_SOURCE_VALUES,
  RUNTIME_FAILURE_CLASS_VALUES,
  TERMINAL_KIND_VALUES
} from "./carriers.js";
import { PLUGIN_TRAVERSAL_KIND_VALUES } from "./plugin_traversal_observer.js";
import {
  REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES
} from "./requirements_algebra.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

type FieldRule =
  | "non_empty_string"
  | "nullable_string"
  | "non_negative_integer"
  | "optional_non_negative_integer"
  | "nullable_non_negative_integer"
  | "boolean"
  | "string_array"
  | "number_array"
  | {
      readonly oneOf: readonly string[];
      readonly nullable?: boolean;
      readonly optional?: boolean;
    }
  | { readonly equalsArray: readonly string[] }
  | { readonly equalsOneOfArrays: readonly (readonly string[])[] };

type RuntimeEventRecord = Record<string, unknown>;
type RuntimeEventFieldRules = Readonly<Record<string, FieldRule>>;
type RuntimeEventAdmitter = (event: RuntimeEventRecord) => void;

const SCHEDULED_SLICE_FINDING_CLASS_VALUES = Object.freeze([
  "fulfilled",
  "semantic_fulfillment_gap",
  "traceability_reference_gap"
] as const);

const LEVER_OVERRIDE_RESOLUTION_SOURCE_VALUES = Object.freeze([
  "request",
  "override",
  "registry_default"
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

function assertStringArray(
  value: unknown,
  label: string
): asserts value is readonly string[] {
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

const ISO_UTC_MILLISECOND_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

function assertIsoUtcMillisecondDateTime(value: unknown, label: string): void {
  assertNonEmptyString(value, label);
  if (
    typeof value !== "string" ||
    !ISO_UTC_MILLISECOND_DATETIME.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new TypeError(`${label} must be an ISO UTC datetime with milliseconds`);
  }
}

function hasCanonicalRuntimeEventEnvelope(event: RuntimeEventRecord): boolean {
  return (
    "eventId" in event ||
    "eventTime" in event ||
    "eventTimeUnixMs" in event ||
    "eventAdmissionOrdinal" in event
  );
}

function assertCanonicalRuntimeEventEnvelope(
  event: RuntimeEventRecord,
  label: string
): void {
  assertNonEmptyString(event["eventId"], `${label}.eventId`);
  assertIsoUtcMillisecondDateTime(event["eventTime"], `${label}.eventTime`);
  assertNonNegativeInteger(event["eventTimeUnixMs"], `${label}.eventTimeUnixMs`);
  assertNonNegativeInteger(
    event["eventAdmissionOrdinal"],
    `${label}.eventAdmissionOrdinal`
  );
  const eventTime = event["eventTime"];
  const eventTimeUnixMs = event["eventTimeUnixMs"];
  if (typeof eventTime !== "string" || typeof eventTimeUnixMs !== "number") {
    throw new TypeError(`${label}.eventTime envelope must be typed`);
  }
  if (Date.parse(eventTime) !== eventTimeUnixMs) {
    throw new TypeError(`${label}.eventTime must match eventTimeUnixMs`);
  }
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

function assertOverlayFrameScopeRows(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    if (!isPlainObject(entry)) {
      throw new TypeError(`${label}[${index}] must be a plain object`);
    }
    const rowLabel = `${label}[${index}]`;
    assertOneOf(
      entry["scopeKind"],
      `${rowLabel}.scopeKind`,
      OVERLAY_FRAME_SCOPE_KIND_VALUES
    );
    assertNonEmptyString(entry["scopeRef"], `${rowLabel}.scopeRef`);
    assertNonEmptyString(entry["anchorRef"], `${rowLabel}.anchorRef`);
    assertNullableNonNegativeInteger(
      entry["vectorIndex"],
      `${rowLabel}.vectorIndex`
    );
    assertNullableString(entry["spanId"], `${rowLabel}.spanId`);
  }
}

function assertOverlayFramePredicateRow(
  value: unknown,
  label: string
): void {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  assertNonEmptyString(value["predicateRef"], `${label}.predicateRef`);
  assertOneOf(value["role"], `${label}.role`, OVERLAY_FRAME_PREDICATE_ROLE_VALUES);
  assertNonEmptyString(value["expressionRef"], `${label}.expressionRef`);
  assertStringArray(value["observedStateRefs"], `${label}.observedStateRefs`);
  if (Array.isArray(value["observedStateRefs"]) && value["observedStateRefs"].length === 0) {
    throw new TypeError(`${label}.observedStateRefs must not be empty`);
  }
}

function assertOverlayFramePredicateEvaluationRows(
  value: unknown,
  label: string
): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a list`);
  }
  for (const [index, entry] of value.entries()) {
    if (!isPlainObject(entry)) {
      throw new TypeError(`${label}[${index}] must be a plain object`);
    }
    const rowLabel = `${label}[${index}]`;
    assertNonEmptyString(entry["predicateRef"], `${rowLabel}.predicateRef`);
    assertOneOf(
      entry["role"],
      `${rowLabel}.role`,
      OVERLAY_FRAME_PREDICATE_ROLE_VALUES
    );
    if (typeof entry["satisfied"] !== "boolean") {
      throw new TypeError(`${rowLabel}.satisfied must be boolean`);
    }
    assertStringArray(
      entry["observedStateRefs"],
      `${rowLabel}.observedStateRefs`
    );
    assertStringArray(
      entry["missingObservedStateRefs"],
      `${rowLabel}.missingObservedStateRefs`
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
  if (rule === "optional_non_negative_integer") {
    if (value === undefined) {
      return;
    }
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
  if ("equalsArray" in rule) {
    assertStringArray(value, label);
    const expected = rule.equalsArray;
    const actual = value;
    if (
      actual.length !== expected.length ||
      expected.some((entry, index) => actual[index] !== entry)
    ) {
      throw new TypeError(
        `${label} must equal ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
    return;
  }
  if ("equalsOneOfArrays" in rule) {
    assertStringArray(value, label);
    const actual = value;
    const matched = rule.equalsOneOfArrays.some(
      (expected) =>
        actual.length === expected.length &&
        expected.every((entry, index) => actual[index] === entry)
    );
    if (!matched) {
      throw new TypeError(
        `${label} must equal one of ${JSON.stringify(rule.equalsOneOfArrays)}, got ${JSON.stringify(actual)}`
      );
    }
    return;
  }
  if (rule.optional === true && value === undefined) {
    return;
  }
  if (rule.nullable === true && value === null) {
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

const constructionRuntimeEventRules = Object.freeze({
  constructionEventRef: "non_empty_string",
  basisId: "non_empty_string",
  graphFunctionId: "non_empty_string",
  runId: "nullable_string",
  workKey: "nullable_string",
  episodeId: "non_empty_string",
  iterationOrdinal: "non_negative_integer",
  eventSequence: "non_negative_integer",
  basisProjectionRef: "non_empty_string",
  priorIntentId: "nullable_string",
  causationEventRefs: "string_array",
  correlationId: "non_empty_string"
} satisfies RuntimeEventFieldRules);

const constructionTerminalPublicStateValues = Object.freeze([
  "construction_closed",
  "construction_blocked",
  "construction_review_required",
  "construction_escalated",
  "fh_input_required",
  "ticket_created",
  "reprice_required"
] as const);

const REQUIREMENT_ROUTE_PAYLOAD_KIND_VALUES = Object.freeze([
  ...REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES,
  "requirement_lifecycle_disposition"
] as const);

function assertRequirementRoutePayload(event: RuntimeEventRecord): void {
  applyFieldRules("RequirementRouteFactProjectedRuntimeEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    routeEventRef: "non_empty_string",
    routePayloadKind: { oneOf: REQUIREMENT_ROUTE_PAYLOAD_KIND_VALUES },
    routePayloadRef: "non_empty_string",
    routePayloadDigest: "non_empty_string",
    sourceEventRefs: "string_array",
    sourceProjectionRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  })(event);
  const payload = event["requirementPayload"];
  if (!isPlainObject(payload)) {
    throw new TypeError(
      "RequirementRouteFactProjectedRuntimeEvent.requirementPayload must be a plain object"
    );
  }
  if (payload["kind"] !== event["routePayloadKind"]) {
    throw new TypeError(
      "RequirementRouteFactProjectedRuntimeEvent.requirementPayload.kind must match routePayloadKind"
    );
  }
  const payloadRef =
    event["routePayloadKind"] === "requirement_lifecycle_disposition"
      ? payload["dispositionRef"]
      : payload["eventRef"];
  if (payloadRef !== event["routePayloadRef"]) {
    throw new TypeError(
      "RequirementRouteFactProjectedRuntimeEvent requirement payload ref must match routePayloadRef"
    );
  }
  if (stableSha256Digest(payload) !== event["routePayloadDigest"]) {
    throw new TypeError(
      "RequirementRouteFactProjectedRuntimeEvent.routePayloadDigest must match requirementPayload"
    );
  }
}

function assertExecutivePressureFactPayload(event: RuntimeEventRecord): void {
  applyFieldRules("ExecutivePressureFactProjectedRuntimeEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    eventRef: "non_empty_string",
    observationRef: "non_empty_string",
    pressureFactRef: "non_empty_string",
    pressureFactDigest: "non_empty_string",
    sourceEventRefs: "string_array",
    sourceProjectionRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  })(event);
  const payload = event["executivePressureFact"];
  if (!isPlainObject(payload)) {
    throw new TypeError(
      "ExecutivePressureFactProjectedRuntimeEvent.executivePressureFact must be a plain object"
    );
  }
  if (payload["kind"] !== "abg_executive_pressure_fact_projection") {
    throw new TypeError(
      "ExecutivePressureFactProjectedRuntimeEvent.executivePressureFact.kind must be abg_executive_pressure_fact_projection"
    );
  }
  if (payload["pressureFactRef"] !== event["pressureFactRef"]) {
    throw new TypeError(
      "ExecutivePressureFactProjectedRuntimeEvent pressure fact ref must match pressureFactRef"
    );
  }
  if (payload["observationRef"] !== event["observationRef"]) {
    throw new TypeError(
      "ExecutivePressureFactProjectedRuntimeEvent observation ref must match observationRef"
    );
  }
  if (stableSha256Digest(payload) !== event["pressureFactDigest"]) {
    throw new TypeError(
      "ExecutivePressureFactProjectedRuntimeEvent.pressureFactDigest must match executivePressureFact"
    );
  }
}

function assertNodeTypeSatisfactionPayload(event: RuntimeEventRecord): void {
  applyFieldRules("NodeTypeSatisfactionProjectedRuntimeEvent", {
    satisfactionRef: "non_empty_string",
    nodeRef: "non_empty_string",
    targetTypeRef: "non_empty_string",
    sourceNodeTypeRef: "nullable_string",
    satisfied: "boolean",
    rejectionReason: "nullable_string",
    typeNodeRef: "nullable_string",
    nodeTypeGraphFunctionRefs: "string_array",
    satisfactionDigest: "non_empty_string",
    sourceEventRefs: "string_array",
    sourceProjectionRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  })(event);
  const payload = event["satisfactionPayload"];
  if (!isPlainObject(payload)) {
    throw new TypeError(
      "NodeTypeSatisfactionProjectedRuntimeEvent.satisfactionPayload must be a plain object"
    );
  }
  if (payload["kind"] !== "node_type_satisfaction") {
    throw new TypeError(
      "NodeTypeSatisfactionProjectedRuntimeEvent.satisfactionPayload.kind must be node_type_satisfaction"
    );
  }
  if (payload["nodeRef"] !== event["nodeRef"]) {
    throw new TypeError(
      "NodeTypeSatisfactionProjectedRuntimeEvent.satisfactionPayload.nodeRef must match nodeRef"
    );
  }
  if (payload["targetTypeRef"] !== event["targetTypeRef"]) {
    throw new TypeError(
      "NodeTypeSatisfactionProjectedRuntimeEvent.satisfactionPayload.targetTypeRef must match targetTypeRef"
    );
  }
  if (stableSha256Digest(payload) !== event["satisfactionDigest"]) {
    throw new TypeError(
      "NodeTypeSatisfactionProjectedRuntimeEvent.satisfactionDigest must match satisfactionPayload"
    );
  }
}

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
  lever_resolution_admitted: applyFieldRules("LeverResolutionAdmittedEvent", {
    workspaceRoot: "non_empty_string",
    moduleName: "non_empty_string",
    targetHandle: "non_empty_string",
    until: { oneOf: ["first_traversal", "blocked", "converged"] },
    fhMode: { oneOf: ["direct", "human-proxy"] },
    rootMode: { oneOf: ["direct", "supervised"] },
    resolvedRuntimeRef: "non_empty_string",
    resolvedPolicyBundleRef: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    resolutionRef: "non_empty_string",
    bundleRef: "nullable_string",
    bundleDigest: "nullable_string",
    bundlePath: "nullable_string",
    untilLeverKey: { oneOf: ["abg.m04.until"] },
    untilSource: { oneOf: LEVER_OVERRIDE_RESOLUTION_SOURCE_VALUES },
    fhModeLeverKey: { oneOf: ["abg.m04.fh_mode"] },
    fhModeSource: { oneOf: LEVER_OVERRIDE_RESOLUTION_SOURCE_VALUES },
    runnerRetryMaxAttempts: "optional_non_negative_integer",
    runnerRetryMaxAttemptsLeverKey: {
      oneOf: ["abg.runner.retry.max_attempts"],
      optional: true
    },
    runnerRetryMaxAttemptsSource: {
      oneOf: LEVER_OVERRIDE_RESOLUTION_SOURCE_VALUES,
      optional: true
    },
    selectedLeverKeys: {
      equalsOneOfArrays: [
        ["abg.m04.until", "abg.m04.fh_mode"],
        [
          "abg.m04.until",
          "abg.m04.fh_mode",
          "abg.runner.retry.max_attempts"
        ]
      ]
    },
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
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
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    attemptIndex: "non_negative_integer",
    dispatchRef: "non_empty_string",
    resultRef: "non_empty_string"
  }),
  actor_result_artifact_observed: applyFieldRules(
    "ActorResultArtifactObservedEvent",
    {
      basisId: "non_empty_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      actorInvocationId: "non_empty_string",
      workerId: "non_empty_string",
      backendId: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      resultRef: "non_empty_string",
      artifactRef: "non_empty_string"
    }
  ),
  actor_invocation_closed: applyFieldRules("ActorInvocationClosedEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    closureStatus: {
      oneOf: ["completed", "blocked", "blocked_with_artifact"]
    },
    resultRef: "nullable_string",
    detail: "nullable_string"
  }),
  actor_process_started: applyFieldRules("ActorProcessStartedEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    command: "non_empty_string",
    args: "string_array",
    cwd: "non_empty_string",
    pid: "nullable_non_negative_integer",
    terminalSessionId: "nullable_string",
    timeoutMs: "non_negative_integer",
    stdoutRef: "non_empty_string",
    stderrRef: "non_empty_string"
  }),
  actor_process_start_failed: applyFieldRules("ActorProcessStartFailedEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    command: "non_empty_string",
    args: "string_array",
    cwd: "non_empty_string",
    timeoutMs: "non_negative_integer",
    stdoutRef: "non_empty_string",
    stderrRef: "non_empty_string",
    terminalSessionId: "nullable_string",
    failureKind: {
      oneOf: ["executor_unavailable", "launch_failed", "process_error"]
    },
    detail: "non_empty_string"
  }),
  actor_process_stream_observed: applyFieldRules(
    "ActorProcessStreamObservedEvent",
    {
      basisId: "non_empty_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      actorInvocationId: "non_empty_string",
      workerId: "non_empty_string",
      backendId: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string",
      streamName: { oneOf: ["stdout", "stderr"] },
      streamRef: "non_empty_string",
      chunkIndex: "non_negative_integer",
      byteLength: "non_negative_integer"
    }
  ),
  actor_process_heartbeat: applyFieldRules("ActorProcessHeartbeatEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    heartbeatIndex: "non_negative_integer",
    elapsedMs: "non_negative_integer"
  }),
  actor_process_timeout: applyFieldRules("ActorProcessTimeoutEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    timeoutMs: "non_negative_integer",
    elapsedMs: "non_negative_integer"
  }),
  actor_process_signal_sent: applyFieldRules("ActorProcessSignalSentEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    signal: { oneOf: ["SIGTERM", "SIGKILL"] },
    elapsedMs: "non_negative_integer"
  }),
  actor_process_exited: applyFieldRules("ActorProcessExitedEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    actorInvocationId: "non_empty_string",
    workerId: "non_empty_string",
    backendId: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string",
    status: "nullable_non_negative_integer",
    signal: "nullable_string",
    elapsedMs: "non_negative_integer",
    timedOut: "boolean",
    error: "nullable_string"
  }),
  runtime_activity_probe_observed: applyFieldRules(
    "RuntimeActivityProbeObservedEvent",
    {
      basisId: "non_empty_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      graphCallId: "nullable_string",
      frameId: "nullable_string",
      vectorIndex: "nullable_non_negative_integer",
      edge: "nullable_string",
      actorInvocationId: "nullable_string",
      workerId: "nullable_string",
      backendId: "nullable_string",
      systemRef: "non_empty_string",
      probeRef: "non_empty_string",
      probeSource: { oneOf: RUNTIME_ACTIVITY_PROBE_SOURCE_VALUES },
      activityRef: "non_empty_string",
      elapsedMs: "non_negative_integer",
      observedAtMs: "non_negative_integer",
      evidenceRefs: "string_array",
      detail: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  runtime_external_interruption_observed: applyFieldRules(
    "RuntimeExternalInterruptionObservedEvent",
    {
      basisId: "non_empty_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      graphCallId: "nullable_string",
      frameId: "nullable_string",
      vectorIndex: "nullable_non_negative_integer",
      edge: "nullable_string",
      actorInvocationId: "nullable_string",
      workerId: "nullable_string",
      backendId: "nullable_string",
      systemRef: "non_empty_string",
      interruptionRef: "non_empty_string",
      interruptionSource: {
        oneOf: RUNTIME_EXTERNAL_INTERRUPTION_SOURCE_VALUES
      },
      signal: "nullable_string",
      elapsedMs: "non_negative_integer",
      observedAtMs: "non_negative_integer",
      evidenceRefs: "string_array",
      detail: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  plugin_traversal_prompt_materialized: applyFieldRules(
    "PluginTraversalPromptMaterializedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      traversalKind: { oneOf: PLUGIN_TRAVERSAL_KIND_VALUES },
      materializationRef: "non_empty_string",
      selectionRef: "non_empty_string",
      selectionSource: {
        oneOf: [
          "graph_vector_declarations",
          "graph_function_declarations",
          "role_policy_hooks",
          "abg_defaults"
        ]
      },
      sourceRef: "non_empty_string",
      attrKey: "nullable_string",
      hookRef: "non_empty_string",
      actorInvocationId: "nullable_string",
      workerId: "nullable_string",
      backendId: "nullable_string",
      observerPromptRef: "non_empty_string",
      renderedPromptRef: "non_empty_string",
      promptInputDigest: "non_empty_string",
      promptTemplateRef: "non_empty_string",
      promptInputContractRef: "non_empty_string",
      expectedOutputContractRef: "non_empty_string",
      progressSignalRefs: "string_array",
      continuationRequestRefs: "string_array",
      policyRefs: "string_array",
      configDigest: "non_empty_string",
      defaultsBundleRef: "nullable_string",
      defaultsBundleDigest: "nullable_string",
      defaultsPath: "nullable_string",
      defaultKey: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
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
    edge: "non_empty_string",
    regime: "non_empty_string",
    regimeSource: "non_empty_string",
    regimeSourceRef: "non_empty_string",
    regimeDiagnosticRefs: "string_array"
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
  graph_vector_resume_cursor_applied: applyFieldRules(
    "GraphVectorResumeCursorAppliedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      targetVectorIndex: "non_negative_integer",
      targetEdge: "non_empty_string",
      resumeCursorRef: "non_empty_string",
      reason: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
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
    contractDigest: "nullable_string",
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
    contractDigest: "nullable_string",
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
  traversal_modulation_resolved: applyFieldRules(
    "TraversalModulationResolvedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      profileRef: "non_empty_string",
      strategySelectionRef: "non_empty_string",
      strategySelectionSource: {
        oneOf: [
          "graph_vector",
          "graph_function",
          "role_policy",
          "runtime_start",
          "runtime_default"
        ]
      },
      strategySelectionSourceRef: "non_empty_string",
      strategySelectionAttrKey: "nullable_string",
      strategySelectionHookRef: "nullable_string",
      strategyConfigDigest: "non_empty_string",
      strategyDirectiveRef: "non_empty_string",
      strategyOwnerRef: "non_empty_string",
      strategyLabel: "non_empty_string",
      enforcementPrimitives: "string_array",
      obligationScheduleRefs: "string_array",
      orderingConstraintRefs: "string_array",
      phaseGateRefs: "string_array",
      backendProfileRef: "non_empty_string",
      policyRefs: "string_array",
      gapPressureRefs: "string_array",
      affectRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_attempt_envelope_derived: applyFieldRules(
    "TraversalAttemptEnvelopeDerivedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      profileRef: "non_empty_string",
      strategySelectionRef: "non_empty_string",
      strategySelectionSource: {
        oneOf: [
          "graph_vector",
          "graph_function",
          "role_policy",
          "runtime_start",
          "runtime_default"
        ]
      },
      strategyConfigDigest: "non_empty_string",
      strategyDirectiveRef: "non_empty_string",
      backendProfileRef: "non_empty_string",
      actorInvocationId: "non_empty_string",
      selectedScheduleItemRefs: "string_array",
      orderingConstraintRefs: "string_array",
      phaseGateRefs: "string_array",
      requiredProgressArtifactRefs: "string_array",
      gapPressureRefs: "string_array",
      affectRefs: "string_array",
      retryBudgetRemaining: "non_negative_integer",
      mustExitAfterBoundedAttempt: "boolean",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_attempt_dispatched: applyFieldRules("TraversalAttemptDispatchedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    frameLineageId: "nullable_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    envelopeRef: "non_empty_string",
    actorInvocationId: "non_empty_string",
    dispatchRef: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  traversal_attempt_progress_observed: applyFieldRules(
    "TraversalAttemptProgressObservedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      rowRef: "non_empty_string",
      scheduleItemRef: "non_empty_string",
      declaredOutcome: {
        oneOf: ["fulfilled", "partial", "blocked", "not_attempted"]
      },
      artifactRefs: "string_array",
      evidenceRefs: "string_array",
      remainingWorkRefs: "string_array",
      reviewRequired: "boolean",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_attempt_non_progress_classified: applyFieldRules(
    "TraversalAttemptNonProgressClassifiedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      sourceCarrierRef: "non_empty_string",
      actionProjectionRef: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_forced_review_projected: applyFieldRules(
    "TraversalForcedReviewProjectedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      gateRef: "non_empty_string",
      trigger: "non_empty_string",
      triggeredScheduleItemRefs: "string_array",
      evidenceRefs: "string_array",
      requiredRegime: { oneOf: ["F_P", "F_H"] },
      publicAction: { oneOf: ["forced_review"] },
      blocksPrivateContinuation: "boolean",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_same_edge_continuation_planned: applyFieldRules(
    "TraversalSameEdgeContinuationPlannedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      remainingScheduleItemRefs: "string_array",
      evidenceRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  traversal_modulation_exhausted: applyFieldRules(
    "TraversalModulationExhaustedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      envelopeRef: "non_empty_string",
      reason: "non_empty_string",
      evidenceRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
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
  timer_intent_admitted: applyFieldRules("TimerIntentAdmittedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    frameLineageId: "nullable_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    constraintRef: "non_empty_string",
    timerIntentRef: "non_empty_string",
    providerRef: "non_empty_string",
    notBeforeRef: "non_empty_string",
    schedulePolicyRef: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  timer_outcome_admitted: applyFieldRules("TimerOutcomeAdmittedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    frameLineageId: "nullable_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    constraintRef: "non_empty_string",
    schedulePolicyRef: "non_empty_string",
    timerIntentRef: "non_empty_string",
    timerOutcomeRef: "non_empty_string",
    outcome: { oneOf: ["timer_fired", "timer_cancelled", "timer_missed"] },
    providerRef: "non_empty_string",
    providerReceiptRef: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  deadline_breach_admitted: applyFieldRules("DeadlineBreachAdmittedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    frameLineageId: "nullable_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    vectorIndex: "non_negative_integer",
    edge: "non_empty_string",
    deadlineBreachRef: "non_empty_string",
    constraintRef: "non_empty_string",
    schedulePolicyRef: "non_empty_string",
    deadlineRef: "non_empty_string",
    deadlineBreachAction: {
      oneOf: ["observe_drift", "block", "retry", "human_gate", "reprice"]
    },
    providerRef: "non_empty_string",
    providerReceiptRef: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  scheduled_continuation_reopened: applyFieldRules(
    "ScheduledContinuationReopenedEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      scheduledContinuationRef: "non_empty_string",
      constraintRef: "non_empty_string",
      schedulePolicyRef: "non_empty_string",
      timerIntentRef: "non_empty_string",
      timerOutcomeRef: "non_empty_string",
      providerRef: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  construction_episode_started: applyFieldRules("ConstructionEpisodeStartedEvent", {
    ...constructionRuntimeEventRules,
    startProjectionRef: "non_empty_string"
  }),
  construction_observation_snapshot_materialized: applyFieldRules(
    "ConstructionObservationSnapshotMaterializedEvent",
    {
      ...constructionRuntimeEventRules,
      observationId: "non_empty_string",
      currentProjectionRef: "non_empty_string",
      observedStateRefs: "string_array",
      linkedAssetRefs: "string_array",
      authorityDigest: "non_empty_string"
    }
  ),
  construction_action_catalog_projected: applyFieldRules(
    "ConstructionActionCatalogProjectedEvent",
    {
      ...constructionRuntimeEventRules,
      catalogRef: "non_empty_string",
      hookResolutionRef: "non_empty_string",
      fallbackConfigDigest: "non_empty_string",
      traversalPublicationRefs: "string_array"
    }
  ),
  construction_evaluator_invoked: applyFieldRules("ConstructionEvaluatorInvokedEvent", {
    ...constructionRuntimeEventRules,
    observationId: "non_empty_string",
    catalogRef: "non_empty_string",
    evaluatorPluginRef: "non_empty_string",
    inputDigest: "non_empty_string"
  }),
  construction_intent_candidate_returned: applyFieldRules(
    "ConstructionIntentCandidateReturnedEvent",
    {
      ...constructionRuntimeEventRules,
      evaluatorPluginRef: "non_empty_string",
      evaluatorOutcomeRef: "non_empty_string",
      candidateSetDigest: "non_empty_string",
      candidateRefs: "string_array"
    }
  ),
  construction_intent_candidate_admitted: applyFieldRules(
    "ConstructionIntentCandidateAdmittedEvent",
    {
      ...constructionRuntimeEventRules,
      candidateId: "non_empty_string",
      admissionRef: "non_empty_string",
      intentId: "non_empty_string",
      authorityRefs: "string_array"
    }
  ),
  construction_intent_candidate_rejected: applyFieldRules(
    "ConstructionIntentCandidateRejectedEvent",
    {
      ...constructionRuntimeEventRules,
      candidateId: "non_empty_string",
      admissionRef: "non_empty_string",
      rejectionReasonRefs: "string_array",
      authorityRefs: "string_array"
    }
  ),
  construction_intent_selected: applyFieldRules("ConstructionIntentSelectedEvent", {
    ...constructionRuntimeEventRules,
    intentId: "non_empty_string",
    selectedActionRef: "non_empty_string",
    selectedBindingRef: "non_empty_string",
    selectionPolicyRef: "non_empty_string"
  }),
  construction_graph_action_invoked: applyFieldRules(
    "ConstructionGraphActionInvokedEvent",
    {
      ...constructionRuntimeEventRules,
      intentId: "non_empty_string",
      selectedActionRef: "non_empty_string",
      runtimeInvocationPlanRef: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      continuationId: "nullable_string",
      selectedGraphFunctionRef: "nullable_string",
      selectedVectorRef: "nullable_string"
    }
  ),
  construction_pressure_package_materialized: applyFieldRules(
    "ConstructionPressurePackageMaterializedEvent",
    {
      ...constructionRuntimeEventRules,
      packageRef: "non_empty_string",
      packageDigest: "non_empty_string",
      observationId: "non_empty_string",
      selectedIntentId: "non_empty_string",
      selectedActionRef: "non_empty_string",
      selectedOutcomeRef: "non_empty_string",
      executionTargetRef: "non_empty_string",
      runtimeProjectionRef: "non_empty_string",
      constructionProjectionRef: "non_empty_string",
      overlayFrameProjectionRef: "non_empty_string",
      observedStateRefs: "string_array",
      pressureRefs: "string_array",
      fdOutcomeRefs: "string_array",
      overlayFrameRefs: "string_array",
      intentLineageRefs: "string_array",
      expectedOutputAssetRefs: "string_array",
      carriedObligationRefs: "string_array",
      gapRefs: "string_array",
      targetStateRefs: "string_array",
      priorEvidenceRefs: "string_array",
      lawfulBasisRefs: "string_array",
      obligationPolicyRefs: "string_array"
    }
  ),
  construction_delta_observed: applyFieldRules("ConstructionDeltaObservedEvent", {
    ...constructionRuntimeEventRules,
    intentId: "non_empty_string",
    attemptOrdinal: "non_negative_integer",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    continuationId: "nullable_string",
    deltaRef: "non_empty_string",
    assetDeltaRefs: "string_array",
    runtimeEventRefs: "string_array",
    beforeProjectionRef: "non_empty_string",
    afterProjectionRef: "non_empty_string",
    artifactDigestBefore: "nullable_string",
    artifactDigestAfter: "nullable_string",
    blockerBefore: "nullable_string",
    blockerAfter: "nullable_string",
    fulfilledObligationRefs: "string_array",
    remainingObligationRefs: "string_array",
    newEvidenceRefs: "string_array",
    fhDecisionAccepted: "boolean",
    reentryMoved: "boolean",
    closed: "boolean"
  }),
  construction_terminal_disposition_projected: applyFieldRules(
    "ConstructionTerminalDispositionProjectedEvent",
    {
      ...constructionRuntimeEventRules,
      terminalProjectionRef: "non_empty_string",
      publicState: { oneOf: constructionTerminalPublicStateValues },
      selectedActionRef: "nullable_string",
      selectedIntentId: "nullable_string",
      terminalRouteRefs: "string_array",
      reviewReasonRefs: "string_array"
    }
  ),
  branch_lease_acquired: applyFieldRules("BranchLeaseAcquiredEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    branchRef: "non_empty_string",
    branchAttemptRef: "non_empty_string",
    leaseRef: "non_empty_string",
    leasedWriteTerritoryRefs: "string_array",
    leasedOutputAllocationRefs: "string_array",
    leasedAtMs: "non_negative_integer",
    expiresAtMs: "nullable_non_negative_integer",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  branch_lease_released: applyFieldRules("BranchLeaseReleasedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    branchRef: "non_empty_string",
    branchAttemptRef: "non_empty_string",
    leaseRef: "non_empty_string",
    releasedAtMs: "non_negative_integer",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  branch_lease_superseded: applyFieldRules("BranchLeaseSupersededEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    branchRef: "non_empty_string",
    branchAttemptRef: "non_empty_string",
    leaseRef: "non_empty_string",
    supersededByLeaseRef: "non_empty_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  branch_task_failed: applyFieldRules("BranchTaskFailedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    branchRef: "non_empty_string",
    branchAttemptRef: "non_empty_string",
    leaseRef: "non_empty_string",
    failureRef: "non_empty_string",
    failureClass: { oneOf: RUNTIME_FAILURE_CLASS_VALUES },
    failureDigest: "non_empty_string",
    disposition: { oneOf: BRANCH_EXECUTION_DISPOSITION_VALUES },
    preserveEvidence: "boolean",
    evidenceRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  branch_payload_admitted: applyFieldRules("BranchPayloadAdmittedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    branchRef: "non_empty_string",
    branchAttemptRef: "non_empty_string",
    fanInScopeRef: "non_empty_string",
    idempotencyKey: "non_empty_string",
    payloadDigest: "non_empty_string",
    evidenceRefs: "string_array",
    sourceEventRef: "nullable_string",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  branch_fan_in_projected: applyFieldRules("BranchFanInProjectedEvent", {
    basisId: "non_empty_string",
    graphCallId: "non_empty_string",
    frameId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    frontierRef: "non_empty_string",
    fanInRef: "non_empty_string",
    fanInDigest: "non_empty_string",
    orderedBranchRefs: "string_array",
    payloadDigests: "string_array",
    evidenceRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  requirement_route_fact_projected: assertRequirementRoutePayload,
  executive_pressure_fact_projected: assertExecutivePressureFactPayload,
  node_type_satisfaction_projected: assertNodeTypeSatisfactionPayload,
  registry_entry_admitted: applyFieldRules(
    "RegistryEntryAdmittedRuntimeEvent",
    {
      entryRef: "non_empty_string",
      declarationRef: "non_empty_string",
      declarationDigest: "non_empty_string",
      libraryScope: { oneOf: ["system", "product"] },
      entryKind: {
        oneOf: [
          "graph_function",
          "overlay",
          "candidate_family",
          "node_type",
          "public_start",
          "plugin"
        ]
      },
      namespace: "non_empty_string",
      ownerRef: "non_empty_string",
      version: "non_empty_string",
      graphFunctionRef: "non_empty_string",
      interfaceRef: "non_empty_string",
      sourceContractRef: "non_empty_string",
      targetContractRef: "non_empty_string",
      contextRefs: "string_array",
      authorityRefs: "string_array",
      overlayRefs: "string_array",
      provenanceRefs: "string_array",
      readinessRefs: "string_array",
      proofRefs: "string_array",
      policyRefs: "string_array",
      refinementOfEntryRef: "nullable_string",
      overrideOfEntryRef: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  registry_entry_rejected: applyFieldRules(
    "RegistryEntryRejectedRuntimeEvent",
    {
      declarationRef: "non_empty_string",
      declarationDigest: "non_empty_string",
      libraryScope: { oneOf: ["system", "product"] },
      entryKind: {
        oneOf: [
          "graph_function",
          "overlay",
          "candidate_family",
          "node_type",
          "public_start",
          "plugin"
        ]
      },
      namespace: "non_empty_string",
      ownerRef: "non_empty_string",
      rejectionReason: "non_empty_string",
      conflictingEntryRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  registry_plugin_advice_admitted: applyFieldRules(
    "RegistryPluginAdviceAdmittedRuntimeEvent",
    {
      adviceRef: "non_empty_string",
      adviceDigest: "non_empty_string",
      pluginRef: "non_empty_string",
      lookupResultRef: "non_empty_string",
      preferredCandidateRef: "nullable_string",
      rankedCandidateRefs: "string_array",
      constraintRefs: "string_array",
      rationaleRef: "non_empty_string",
      policyRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  registry_plugin_advice_rejected: applyFieldRules(
    "RegistryPluginAdviceRejectedRuntimeEvent",
    {
      pluginRef: "non_empty_string",
      lookupResultRef: "non_empty_string",
      rejectionReason: "non_empty_string",
      invalidCandidateRefs: "string_array",
      authorityViolationRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  graph_function_selected: applyFieldRules(
    "GraphFunctionSelectedRuntimeEvent",
    {
      selectionRef: "non_empty_string",
      selectedEntryRef: "non_empty_string",
      selectedEntryKind: { oneOf: ["graph_function"] },
      selectedGraphFunctionRef: "non_empty_string",
      lookupResultRef: "non_empty_string",
      eligibilityDecisionRefs: "string_array",
      adviceRefs: "string_array",
      fhResponseRefs: "string_array",
      rationaleRef: "non_empty_string",
      runtimeBasisRef: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  graph_function_selection_rejected: applyFieldRules(
    "GraphFunctionSelectionRejectedRuntimeEvent",
    {
      lookupResultRef: "non_empty_string",
      rejectionReason: "non_empty_string",
      rejectedCandidateRefs: "string_array",
      pressureDispositionRef: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  workspace_installation_admitted: applyFieldRules(
    "WorkspaceInstallationAdmittedRuntimeEvent",
    {
      installResult: { oneOf: ["installed"] },
      targetRoot: "non_empty_string",
      packageName: "non_empty_string",
      packageVersion: "non_empty_string",
      resolvedRuntimeRef: "non_empty_string",
      installManifestPath: "non_empty_string",
      installerEcosystem: "non_empty_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  observed_state_admitted: applyFieldRules("ObservedStateAdmittedRuntimeEvent", {
    basisId: "non_empty_string",
    graphFunctionId: "non_empty_string",
    runId: "nullable_string",
    workKey: "nullable_string",
    observedStateRef: "non_empty_string",
    sourceKind: { oneOf: OBSERVED_STATE_SOURCE_KIND_VALUES },
    scopeRef: "non_empty_string",
    sourceRef: "non_empty_string",
    digest: "non_empty_string",
    version: "nullable_string",
    eventWatermark: "non_negative_integer",
    freshnessPolicyRef: "non_empty_string",
    derivationBasisRef: "non_empty_string",
    basisProjectionRef: "non_empty_string",
    derivedFromRefs: "string_array",
    causationEventRefs: "string_array",
    correlationId: "non_empty_string"
  }),
  fd_authority_outcome_admitted: applyFieldRules(
    "FdAuthorityOutcomeAdmittedRuntimeEvent",
    {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      vectorIndex: "non_negative_integer",
      edge: "non_empty_string",
      outcomeRef: "non_empty_string",
      status: { oneOf: ["accepted", "blocked"] },
      severityClass: {
        oneOf: FD_AUTHORITY_SEVERITY_CLASS_VALUES,
        nullable: true
      },
      routingDecision: { oneOf: FD_PRESSURE_ROUTING_DECISION_VALUES },
      affectedFieldRefs: "string_array",
      consumedFieldRefs: "string_array",
      pressureRefs: "string_array",
      diagnosticRefs: "string_array",
      evidenceRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    }
  ),
  overlay_frame_declared: (event: RuntimeEventRecord) => {
    applyFieldRules("OverlayFrameDeclaredEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      overlayFrameRef: "non_empty_string",
      contractRef: "non_empty_string",
      pressureRefs: "string_array",
      foldbackTargetRef: "nullable_string",
      reentryTargetVectorIndex: "nullable_non_negative_integer",
      noClosePolicyRef: "nullable_string",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    })(event);
    assertOverlayFrameScopeRows(
      event["scopeRefs"],
      "OverlayFrameDeclaredEvent.scopeRefs"
    );
    assertOverlayFramePredicateRow(
      event["fireWhen"],
      "OverlayFrameDeclaredEvent.fireWhen"
    );
    assertOverlayFramePredicateRow(
      event["terminateWhen"],
      "OverlayFrameDeclaredEvent.terminateWhen"
    );
  },
  overlay_frame_evaluated: (event: RuntimeEventRecord) => {
    applyFieldRules("OverlayFrameEvaluatedEvent", {
      basisId: "non_empty_string",
      graphCallId: "non_empty_string",
      frameId: "non_empty_string",
      frameLineageId: "nullable_string",
      graphFunctionId: "non_empty_string",
      runId: "nullable_string",
      workKey: "nullable_string",
      overlayFrameRef: "non_empty_string",
      contractRef: "non_empty_string",
      outcomeRef: "non_empty_string",
      fireSatisfied: "boolean",
      terminateSatisfied: "boolean",
      pressureDecision: { oneOf: OVERLAY_FRAME_PRESSURE_DECISION_VALUES },
      pressureRefs: "string_array",
      carriedPressureRefs: "string_array",
      clearedPressureRefs: "string_array",
      clearingEvidenceRefs: "string_array",
      foldbackTargetRef: "nullable_string",
      reentryTargetVectorIndex: "nullable_non_negative_integer",
      diagnosticRefs: "string_array",
      causationEventRefs: "string_array",
      correlationId: "non_empty_string"
    })(event);
    assertOverlayFramePredicateEvaluationRows(
      event["predicateEvaluations"],
      "OverlayFrameEvaluatedEvent.predicateEvaluations"
    );
  }
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
  if (hasCanonicalRuntimeEventEnvelope(event)) {
    assertCanonicalRuntimeEventEnvelope(event, "RuntimeEvent");
  }
}

export function assertCanonicalRuntimeEvent(
  event: unknown
): asserts event is CanonicalRuntimeEvent {
  assertRuntimeEvent(event);
  if (!isPlainObject(event)) {
    throw new TypeError("RuntimeEvent must be a plain object");
  }
  assertCanonicalRuntimeEventEnvelope(event, "RuntimeEvent");
}

export function assertCanonicalRuntimeEventSequence(
  events: readonly unknown[],
  label = "RuntimeEventSequence"
): asserts events is readonly CanonicalRuntimeEvent[] {
  const eventIds = new Set<string>();
  events.forEach((event, index) => {
    assertCanonicalRuntimeEvent(event);
    if (eventIds.has(event.eventId)) {
      throw new TypeError(`${label}[${String(index)}].eventId must be unique`);
    }
    eventIds.add(event.eventId);
  });
}
