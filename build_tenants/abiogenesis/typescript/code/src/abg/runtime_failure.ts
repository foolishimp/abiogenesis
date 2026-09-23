import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isRecord } from "../shared/admission_predicates.js";
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
import {
  indexedRuntimeEvents,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
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

const JSON_DIAGNOSTIC_URI_PREFIX = "data:application/json;charset=utf-8,";

/** Only the caught exception's small diagnostic subject uses inline retention. */
export function constructRuntimeFailureDiagnosticRef(subject: JsonValue): string {
  return JSON_DIAGNOSTIC_URI_PREFIX + encodeURIComponent(canonicalJson(subject));
}

function retainedDiagnosticSubject(diagnosticRef: string, subjectDigest: Sha256Digest): JsonValue {
  const subject = JSON.parse(decodeURIComponent(
    diagnosticRef.slice(JSON_DIAGNOSTIC_URI_PREFIX.length),
  )) as JsonValue;
  if (constructRuntimeFailureDiagnosticRef(subject) !== diagnosticRef ||
      sha256Canonical(subject) !== subjectDigest) {
    throw new TypeError("runtime failure diagnostic does not match its retained subject digest");
  }
  return subject;
}

/** Diagnostic prose is evidence only; the admitted event owns failed truth. */
export function projectRuntimeFailureEvidenceAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
): readonly JsonValue[] {
  return indexedRuntimeEvents(prefix, "kind:runtime_failure_observed")
    .filter(event => event.aggregateType === "run")
    .map(event => {
      const payload = event.payload;
      if (!isRecord(payload)) throw new TypeError("runtime failure lacks its admitted payload");
      const diagnosticRef = typeof payload.diagnosticRef === "string" ? payload.diagnosticRef : null;
      const retained = diagnosticRef?.startsWith(JSON_DIAGNOSTIC_URI_PREFIX) === true;
      const subject = retained
        ? retainedDiagnosticSubject(diagnosticRef!, payload.subjectDigest as Sha256Digest)
        : null;
      if (retained) {
        const body = {
          runId: event.runId!, graphCallId: event.graphCallId!, frameId: event.frameId!,
          basisId: event.basisId, stage: payload.stage!, subjectDigest: payload.subjectDigest!, diagnosticRef,
        };
        const digest = sha256Canonical(body);
        if (payload.runId !== event.runId || payload.graphCallId !== event.graphCallId ||
            payload.frameId !== event.frameId || payload.basisId !== event.basisId ||
            payload.failureDigest !== digest ||
            payload.failureRef !== `runtime-failure://abiogenesis/${digest.slice("sha256:".length)}`) {
          throw new TypeError("runtime failure diagnostic differs from its admitted failure identity or scope");
        }
      }
      return deepFreeze({
        kind: "runtime_failure_evidence", schemaVersion: "5.0.0",
        availability: retained ? "retained" : "not_retained",
        failureRef: payload.failureRef ?? null, failureDigest: payload.failureDigest ?? null,
        admissionEventRef: event.eventId, admissionEventDigest: event.payloadDigest,
        runId: event.runId!, graphCallId: event.graphCallId!, frameId: event.frameId!, basisId: event.basisId,
        stage: payload.stage ?? null, subjectDigest: payload.subjectDigest ?? null,
        diagnosticClassRef: retained && isRecord(subject) ? subject.diagnosticClassRef ?? null : diagnosticRef,
        subject,
        causationEventRefs: event.causationEventRefs,
      }) as JsonValue;
    });
}

// The last material admission in this exact traversal scope is the implicated
// frontier. Probe/transport telemetry and other frames cannot displace it.
const FAILURE_FRONTIER_KINDS = new Set<RuntimeEvent["kind"]>([
  "frame_opened", "traversal_cursor_entered", "c_call_opened", "c_call_fibre_selected",
  "c_call_evidenced", "c_call_result_admitted", "c_call_judged", "retry_attempt_opened",
  "retry_progress_recorded", "child_foldback_admitted", "child_preparation_refused",
  "fan_out_completion_admitted", "traversal_route_admitted", "fh_interaction_resume_admitted",
]);

function failureFrontierEventRef(prefix: ValidatedRuntimeEventPrefix, scope: OpenedTraversalScope): string {
  let frontier: RuntimeEvent | undefined;
  for (const event of indexedRuntimeEvents(prefix, "graph-call:" + scope.graphCallId)) {
    if (event.runId === scope.runId && event.graphCallId === scope.graphCallId && event.frameId === scope.frameId &&
        event.basisId === scope.executionBasisRef && FAILURE_FRONTIER_KINDS.has(event.kind) &&
        (frontier === undefined || event.admissionOrdinal > frontier.admissionOrdinal)) frontier = event;
  }
  return frontier?.eventId ?? scope.frameOpenEventRef;
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
  if (diagnosticRef.startsWith(JSON_DIAGNOSTIC_URI_PREFIX)) {
    retainedDiagnosticSubject(diagnosticRef, subjectDigest);
  }
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
    ? [failureFrontierEventRef(runPrefix, scope)]
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
