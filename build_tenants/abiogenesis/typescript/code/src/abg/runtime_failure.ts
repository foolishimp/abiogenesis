import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";

export interface RuntimeFailureAdmission {
  readonly kind: "runtime_failure_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failed";
  readonly failureRef: string;
  readonly failureDigest: Sha256Digest;
  readonly basisId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly stage:
    | "c_call_open"
    | "hog_traversal"
    | "implementation_load"
    | "operation_application"
    | "output_contract"
    | "transition";
  readonly subjectDigest: Sha256Digest;
  readonly diagnosticRef: string;
  readonly admissionEventRef: string;
}

export function admitRuntimeFailure(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  stage: RuntimeFailureAdmission["stage"],
  subject: JsonValue,
  diagnosticRef: string,
  basis: RuntimeAdmissionBasis,
): RuntimeFailureAdmission {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    !hasOpenedTraversalScope(store, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    diagnosticRef.length === 0 ||
    store.readAll().some((event) =>
      event.runId === scope.runId &&
      (event.kind === "runtime_failure_observed" || event.kind === "run_closed"))
  ) {
    throw new TypeError("runtime failure requires one exact active admitted traversal scope");
  }
  const subjectDigest = sha256Canonical(subject);
  const body = {
    runId: scope.runId,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    basisId: executionBasis.basisRef,
    stage,
    subjectDigest,
    diagnosticRef,
  };
  const failureDigest = sha256Canonical(body as unknown as JsonValue);
  const failureRef = `runtime-failure://abiogenesis/${failureDigest.slice("sha256:".length)}`;
  const causationEventRefs = basis.causationEventRefs.length === 0
    ? [scope.frameOpenEventRef]
    : basis.causationEventRefs;
  const event = admitRuntimeEvent(store, {
    kind: "runtime_failure_observed",
    eventTime: basis.eventTime,
    aggregateType: "run",
    aggregateId: scope.runId,
    parentAggregateId: scope.frameId,
    causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    frameLineageId: scope.frameLineageId,
    payload: { failureRef, failureDigest, ...body },
  });
  return deepFreeze({
    kind: "runtime_failure_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failed" as const,
    failureRef,
    failureDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as RuntimeFailureAdmission;
}
