import { parsePlainObject } from "../../../shared/validation/primitives.js";
import type { DispatchRequest, DispatchRequestSink } from "./carriers.js";

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

function assertStringArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be a string array`);
  }
  for (const entry of value) {
    assertNonEmptyString(entry, `${label}[]`);
  }
}

function assertTransportContract(value: unknown, label: string): void {
  const contract = parsePlainObject(value, label);
  assertNonEmptyString(contract["agentKey"], `${label}.agentKey`);
  assertNonEmptyString(contract["command"], `${label}.command`);
  assertStringArray(contract["argsTemplate"], `${label}.argsTemplate`);
  const policy = parsePlainObject(
    contract["sanitizedEnvironmentPolicy"],
    `${label}.sanitizedEnvironmentPolicy`
  );
  assertStringArray(
    policy["prefixes"],
    `${label}.sanitizedEnvironmentPolicy.prefixes`
  );
}

function isDispatchRequestBatch(
  requests: DispatchRequest | readonly DispatchRequest[]
): requests is readonly DispatchRequest[] {
  return Array.isArray(requests);
}

function assertDispatchRequest(request: unknown): asserts request is DispatchRequest {
  let requestObject;
  try {
    requestObject = parsePlainObject(request, "DispatchRequest");
  } catch {
    throw new TypeError("dispatch request must be an fp_dispatch_request object");
  }
  if (requestObject["kind"] !== "fp_dispatch_request") {
    throw new TypeError("dispatch request must be an fp_dispatch_request object");
  }
  assertNonEmptyString(requestObject["basisId"], "DispatchRequest.basisId");
  assertNonEmptyString(requestObject["graphFunctionId"], "DispatchRequest.graphFunctionId");
  assertNonEmptyString(requestObject["jobId"], "DispatchRequest.jobId");
  assertNonEmptyString(requestObject["dispatchRef"], "DispatchRequest.dispatchRef");
  assertNonEmptyString(requestObject["workerId"], "DispatchRequest.workerId");
  assertNonEmptyString(requestObject["backendId"], "DispatchRequest.backendId");
  assertNonEmptyString(requestObject["resultRef"], "DispatchRequest.resultRef");
  assertNullableString(requestObject["expectedEdge"], "DispatchRequest.expectedEdge");
  assertStringArray(
    requestObject["expectedAssessmentIds"],
    "DispatchRequest.expectedAssessmentIds"
  );
  assertTransportContract(
    requestObject["transportContract"],
    "DispatchRequest.transportContract"
  );
}

function normalizeDispatchRequests(
  requests: DispatchRequest | readonly DispatchRequest[]
): readonly DispatchRequest[] {
  const batch = isDispatchRequestBatch(requests) ? [...requests] : [requests];
  for (const request of batch) {
    assertDispatchRequest(request);
  }
  return Object.freeze(batch);
}

export function sanitizeEnvironment(
  request: DispatchRequest,
  environment: Readonly<Record<string, string>>
): Readonly<Record<string, string>> {
  const normalizedPrefixes = Object.freeze(
    request.transportContract.sanitizedEnvironmentPolicy.prefixes.filter(
      (prefix) => prefix.length > 0
    )
  );
  const sanitized: Record<string, string> = {};
  outer: for (const [key, value] of Object.entries(environment)) {
    for (const prefix of normalizedPrefixes) {
      if (key.startsWith(prefix)) {
        continue outer;
      }
    }
    sanitized[key] = value;
  }
  return Object.freeze(sanitized);
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
