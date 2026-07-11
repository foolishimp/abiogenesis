import {
  constructAgentTransportContract,
  constructDispatchExpectation,
  projectDispatchAssessmentIds,
  projectDispatchExpectedEdge
} from "../../../shared/abg_library/index.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  constructDispatchRequest,
  constructResultArtifact
} from "./constructors.js";
import type {
  DispatchRequest,
  FulfillmentStatus,
  ResultArtifact,
  RuntimeFailureClass
} from "./carriers.js";
import { RUNTIME_FAILURE_CLASS_VALUES } from "../contracts/index.js";

const FULFILLMENT_STATUSES = Object.freeze([
  "fulfilled",
  "partial",
  "blocked",
  "unfulfilled"
] satisfies readonly FulfillmentStatus[]);

function assertClosedFields(
  input: Readonly<Record<string, unknown>>,
  allowedFields: readonly string[],
  label: string
): void {
  const allowed = new Set(allowedFields);
  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new TypeError(`${label}.${field}: unknown field`);
    }
  }
}

function parseNullableNonEmptyString(
  input: unknown,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseFulfillmentStatus(
  input: unknown,
  label: string
): FulfillmentStatus {
  const status = parseNonEmptyString(input, label);
  if (
    status === "fulfilled" ||
    status === "partial" ||
    status === "blocked" ||
    status === "unfulfilled"
  ) {
    return status;
  }
  throw new TypeError(
    `${label}: expected one of ${JSON.stringify(FULFILLMENT_STATUSES)}, got ${JSON.stringify(status)}`
  );
}

function parseRuntimeFailureClass(
  input: unknown,
  label: string
): RuntimeFailureClass {
  const failureClass = parseNonEmptyString(input, label);
  for (const value of RUNTIME_FAILURE_CLASS_VALUES) {
    if (failureClass === value) {
      return value;
    }
  }
  throw new TypeError(
    `${label}: expected one of ${JSON.stringify(RUNTIME_FAILURE_CLASS_VALUES)}, got ${JSON.stringify(failureClass)}`
  );
}

function parseOptionalStringArray(
  input: unknown,
  label: string
): readonly string[] {
  if (input === undefined || input === null) {
    return Object.freeze([]);
  }
  return parseStringArray(input, label);
}

function parseOptionalNonNegativeInteger(
  input: unknown,
  label: string
): number | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected a non-negative integer`);
  }
  return input;
}

function parseTransportContract(
  input: unknown,
  label: string
){
  const contract = parsePlainObject(input, label);
  const sanitizedEnvironmentPolicy = parsePlainObject(
    contract["sanitizedEnvironmentPolicy"],
    `${label}.sanitizedEnvironmentPolicy`
  );
  return constructAgentTransportContract({
    agentKey: parseNonEmptyString(contract["agentKey"], `${label}.agentKey`),
    command: parseNonEmptyString(contract["command"], `${label}.command`),
    argsTemplate: parseStringArray(contract["argsTemplate"], `${label}.argsTemplate`),
    sanitizedEnvironmentPolicy: {
      prefixes: parseOptionalStringArray(
        parseOptionalField(sanitizedEnvironmentPolicy, "prefixes"),
        `${label}.sanitizedEnvironmentPolicy.prefixes`
      )
    }
  });
}

function normalizeArtifactIdentityIssues(
  request: DispatchRequest,
  edge: string,
  observedAssessmentIds: readonly string[]
): readonly string[] {
  const issues: string[] = [];

  if (request.expectedEdge !== null && edge !== request.expectedEdge) {
    issues.push(
      `result edge ${JSON.stringify(edge)} does not match expected edge ${JSON.stringify(request.expectedEdge)}`
    );
  }

  if (request.expectedAssessmentIds.length > 0) {
    const observed = new Set(observedAssessmentIds);
    const expected = new Set(request.expectedAssessmentIds);
    const missing = [...expected].filter((value) => !observed.has(value)).sort();
    const extra = [...observed].filter((value) => !expected.has(value)).sort();
    if (missing.length > 0) {
      issues.push(
        `missing declared fulfillment assessments: ${missing.join(", ")}`
      );
    }
    if (extra.length > 0) {
      issues.push(`unexpected fulfillment assessments: ${extra.join(", ")}`);
    }
  }

  return Object.freeze(issues);
}

function parseArtifactAssessment(
  input: unknown,
  label: string
): {
  readonly id: string;
  readonly evaluator: string;
  readonly fulfillmentStatus: FulfillmentStatus;
  readonly fulfillmentDetail: string;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
} {
  const assessment = parsePlainObject(input, label);
  assertClosedFields(
    assessment,
    [
      "id",
      "evaluator",
      "fulfillment_status",
      "fulfillment_detail",
      "blocking_reasons",
      "evidence_refs"
    ],
    label
  );
  const id = parseNonEmptyString(assessment["id"], `${label}.id`);
  const evaluator = parseNullableNonEmptyString(
    parseOptionalField(assessment, "evaluator"),
    `${label}.evaluator`
  );
  const fulfillmentStatus = parseFulfillmentStatus(
    assessment["fulfillment_status"],
    `${label}.fulfillment_status`
  );
  const evidenceRefs = parseOptionalStringArray(
    parseOptionalField(assessment, "evidence_refs"),
    `${label}.evidence_refs`
  );
  if (fulfillmentStatus === "fulfilled" && evidenceRefs.length === 0) {
    throw new TypeError(
      `${label}.evidence_refs: fulfilled assessment requires non-empty evidence refs`
    );
  }
  const blockingReasons = parseOptionalStringArray(
    parseOptionalField(assessment, "blocking_reasons"),
    `${label}.blocking_reasons`
  );
  if (fulfillmentStatus === "fulfilled" && blockingReasons.length > 0) {
    throw new TypeError(
      `${label}.blocking_reasons: fulfilled assessment cannot carry blocking reasons`
    );
  }
  return Object.freeze({
    id,
    evaluator: evaluator ?? id,
    fulfillmentStatus,
    fulfillmentDetail:
      parseNullableNonEmptyString(
        parseOptionalField(assessment, "fulfillment_detail"),
        `${label}.fulfillment_detail`
      ) ?? "",
    blockingReasons,
    evidenceRefs
  });
}

function parseNormalizedArtifactPayload(
  request: DispatchRequest,
  input: unknown,
  label: string
): ResultArtifact {
  const payload = parsePlainObject(input, label);
  const edge = parseNonEmptyString(payload["edge"], `${label}.edge`);
  const rawAssessments = parseOptionalField(payload, "fulfillment_assessments");
  if (rawAssessments === undefined) {
    throw new TypeError(`${label}.fulfillment_assessments: required`);
  }
  if (!Array.isArray(rawAssessments) || rawAssessments.length === 0) {
    throw new TypeError(
      `${label}.fulfillment_assessments: expected a non-empty list`
    );
  }

  const fulfillmentAssessments = rawAssessments.map((entry, index) =>
    parseArtifactAssessment(
      entry,
      `${label}.fulfillment_assessments[${index}]`
    )
  );
  const assessmentIds = fulfillmentAssessments.map((entry) => entry.id);
  if (new Set(assessmentIds).size !== assessmentIds.length) {
    throw new TypeError(`${label}.fulfillment_assessments: duplicate id`);
  }

  return constructResultArtifact({
    basisId: request.basisId,
    dispatchRef: request.dispatchRef,
    resultRef: request.resultRef,
    artifactPayload: {
      edge,
      actor: parseNonEmptyString(payload["actor"], `${label}.actor`),
      fulfillmentAssessments,
      workerId:
        parseNullableNonEmptyString(
          parseOptionalField(payload, "selected_worker_id"),
          `${label}.selected_worker_id`
        ) ??
        parseNullableNonEmptyString(
          parseOptionalField(payload, "worker_id"),
          `${label}.worker_id`
        ),
      backendId:
        parseNullableNonEmptyString(
          parseOptionalField(payload, "selected_backend"),
          `${label}.selected_backend`
        ) ??
        parseNullableNonEmptyString(
          parseOptionalField(payload, "backend_id"),
          `${label}.backend_id`
        ),
      roleId: parseNullableNonEmptyString(
        parseOptionalField(payload, "role_id"),
        `${label}.role_id`
      ),
      assignmentSource: parseNullableNonEmptyString(
        parseOptionalField(payload, "assignment_source"),
        `${label}.assignment_source`
      ),
      resolvedRuntimeRef: parseNullableNonEmptyString(
        parseOptionalField(payload, "resolved_runtime_ref"),
        `${label}.resolved_runtime_ref`
      )
    },
    identityIssues: normalizeArtifactIdentityIssues(
      request,
      edge,
      assessmentIds
    ),
    runtimeFailure: null
  });
}

function parseRuntimeFailureArtifact(
  request: DispatchRequest,
  input: unknown,
  label: string
): ResultArtifact {
  const failure = parsePlainObject(input, label);
  assertClosedFields(failure, ["kind", "failureClass", "detail"], label);
  return constructResultArtifact({
    basisId: request.basisId,
    dispatchRef: request.dispatchRef,
    resultRef: request.resultRef,
    artifactPayload: null,
    identityIssues: [],
    runtimeFailure: {
      failureClass: parseRuntimeFailureClass(
        failure["failureClass"],
        `${label}.failureClass`
      ),
      detail: parseNonEmptyString(failure["detail"], `${label}.detail`)
    }
  });
}

export function admitDispatchRequest(
  input: unknown,
  label = "DispatchRequest"
): DispatchRequest {
  const request = parsePlainObject(input, label);
  const expectation = constructDispatchExpectation({
    expectedEdge: parseNullableNonEmptyString(
      parseOptionalField(request, "expectedEdge"),
      `${label}.expectedEdge`
    ),
    assessmentIds: parseOptionalStringArray(
      parseOptionalField(request, "expectedAssessmentIds"),
      `${label}.expectedAssessmentIds`
    )
  });
  if (request["kind"] !== "fp_dispatch_request") {
    throw new TypeError(`${label}.kind: expected "fp_dispatch_request"`);
  }
  const graphCallId = parseNullableNonEmptyString(
    parseOptionalField(request, "graphCallId"),
    `${label}.graphCallId`
  );
  const frameId = parseNullableNonEmptyString(
    parseOptionalField(request, "frameId"),
    `${label}.frameId`
  );
  const vectorIndex = parseOptionalNonNegativeInteger(
    parseOptionalField(request, "vectorIndex"),
    `${label}.vectorIndex`
  );
  const traversalAttemptEnvelopeRef = parseNullableNonEmptyString(
    parseOptionalField(request, "traversalAttemptEnvelopeRef"),
    `${label}.traversalAttemptEnvelopeRef`
  );
  return constructDispatchRequest({
    basisId: parseNonEmptyString(request["basisId"], `${label}.basisId`),
    graphFunctionId: parseNonEmptyString(
      request["graphFunctionId"],
      `${label}.graphFunctionId`
    ),
    ...(graphCallId === null ? {} : { graphCallId }),
    ...(frameId === null ? {} : { frameId }),
    ...(vectorIndex === undefined ? {} : { vectorIndex }),
    jobId: parseNonEmptyString(request["jobId"], `${label}.jobId`),
    dispatchRef: parseNonEmptyString(request["dispatchRef"], `${label}.dispatchRef`),
    workerId: parseNonEmptyString(request["workerId"], `${label}.workerId`),
    backendId: parseNonEmptyString(request["backendId"], `${label}.backendId`),
    resultRef: parseNonEmptyString(request["resultRef"], `${label}.resultRef`),
    expectedEdge: projectDispatchExpectedEdge(expectation),
    expectedAssessmentIds: projectDispatchAssessmentIds(expectation),
    traversalAttemptEnvelopeRef,
    selectedScheduleItemRefs: parseOptionalStringArray(
      parseOptionalField(request, "selectedScheduleItemRefs"),
      `${label}.selectedScheduleItemRefs`
    ),
    orderingConstraintRefs: parseOptionalStringArray(
      parseOptionalField(request, "orderingConstraintRefs"),
      `${label}.orderingConstraintRefs`
    ),
    phaseGateRefs: parseOptionalStringArray(
      parseOptionalField(request, "phaseGateRefs"),
      `${label}.phaseGateRefs`
    ),
    requiredProgressArtifactRefs: parseOptionalStringArray(
      parseOptionalField(request, "requiredProgressArtifactRefs"),
      `${label}.requiredProgressArtifactRefs`
    ),
    gapPressureRefs: parseOptionalStringArray(
      parseOptionalField(request, "gapPressureRefs"),
      `${label}.gapPressureRefs`
    ),
    affectRefs: parseOptionalStringArray(
      parseOptionalField(request, "affectRefs"),
      `${label}.affectRefs`
    ),
    transportContract: parseTransportContract(
      request["transportContract"],
      `${label}.transportContract`
    )
  });
}

export function admitResultArtifact(
  request: DispatchRequest,
  input: unknown,
  label = "ResultArtifact"
): ResultArtifact {
  const artifact = parsePlainObject(input, label);
  const kind = parseNullableNonEmptyString(
    parseOptionalField(artifact, "kind"),
    `${label}.kind`
  );
  if (kind === "runtime_failure") {
    return parseRuntimeFailureArtifact(request, artifact, label);
  }
  if (kind !== null) {
    throw new TypeError(
      `${label}.kind: expected "runtime_failure" for runtime failure envelopes or omit kind for payload artifacts`
    );
  }
  return parseNormalizedArtifactPayload(request, artifact, label);
}
