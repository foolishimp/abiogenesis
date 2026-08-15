import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  constructRunActiveFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import { selectValidatedRuntimeEventPrefix } from "./event_prefix.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  hasOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";

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
    | "route";
  readonly subjectDigest: Sha256Digest;
  readonly diagnosticRef: string;
  readonly admissionEventRef: string;
}

export interface RuntimeFailureAdmissionReceipt {
  readonly kind: "runtime_failure_admission_receipt";
  readonly schemaVersion: "5.0.0";
  readonly admission: RuntimeFailureAdmission;
  readonly replayState: ReplayState;
  readonly successorPrefix: DurablePrefixCoordinate;
}

export interface AdmitRuntimeFailureInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly stage: RuntimeFailureAdmission["stage"];
  readonly subject: JsonValue;
  readonly diagnosticRef: string;
  readonly basis: RuntimeAdmissionBasis;
}

export function admitRuntimeFailure(
  input: Readonly<AdmitRuntimeFailureInput>,
): RuntimeFailureAdmissionReceipt {
  const {
    store,
    predecessorPrefix,
    executionBasis,
    scope,
    stage,
    subject,
    diagnosticRef,
    basis,
  } = input;
  const predecessorEvents = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
  const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
  const runPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents, {
    runId: scope.runId,
  });
  if (
    !hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionBasis) ||
    !hasOpenedTraversalScopeAtPrefix(authorityPrefix, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    diagnosticRef.length === 0 ||
    !holdsAt(
      deriveRuntimeEventCalculusProjection(runPrefix),
      constructRunActiveFluent(scope.runId),
    )
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
  const transaction = admitRuntimeEventTransactionAtDurablePrefix(
    store,
    predecessorPrefix,
    () => admitRuntimeEvent(store, {
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
    }),
  );
  if (transaction.successorPrefix === null) {
    throw new TypeError("runtime failure admission did not produce a durable successor");
  }
  const admission = deepFreeze({
    kind: "runtime_failure_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failed" as const,
    failureRef,
    failureDigest,
    ...body,
    admissionEventRef: transaction.value.eventId,
  }) as RuntimeFailureAdmission;
  const successorEvents = readRuntimeEventsAtDurablePrefix(
    transaction.successorPrefix,
  );
  return deepFreeze({
    kind: "runtime_failure_admission_receipt" as const,
    schemaVersion: "5.0.0" as const,
    admission,
    replayState: replayValidatedRuntimeEventPrefix(
      selectValidatedRuntimeEventPrefix(successorEvents, { runId: scope.runId }),
      selectValidatedRuntimeEventPrefix(successorEvents),
    ),
    successorPrefix: transaction.successorPrefix,
  });
}
