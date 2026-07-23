import type {
  GtlGraph,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
} from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
} from "./event_store.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  hasOpenedCCall,
  isAdmittedCCallJudgment,
  isAdmittedCCallResult,
  isCCall,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
} from "./c_call.js";
import {
  hasAdmittedTraversalCursor,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface ApplicationChildFoldbackAdmission {
  readonly kind: "application_child_foldback_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly foldbackRef: string;
  readonly foldbackDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly applicationFoldbackRef: string;
  readonly parentCCallRef: string;
  readonly parentJudgmentRef: string;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly childExecutionBasisRef: string;
  readonly childExecutionBasisDigest: Sha256Digest;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly childDisposition: "blocked" | "closed";
  readonly childResultRef: string;
  readonly childResultDigest: Sha256Digest;
  readonly childJudgmentRef: string;
  readonly childTerminalEventRef: string;
  readonly outputDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface ApplicationChildFoldbackRefusal {
  readonly kind: "application_child_foldback_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "application_mismatch"
    | "child_truth_mismatch"
    | "parent_truth_mismatch";
  readonly message: string;
}

export type ApplicationChildFoldbackResult =
  | ApplicationChildFoldbackAdmission
  | ApplicationChildFoldbackRefusal;

export interface ApplicationChildPreparationRefusalAdmission {
  readonly kind: "application_child_preparation_refusal_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly refusalRef: string;
  readonly refusalDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly parentCCallRef: string;
  readonly parentJudgmentRef: string;
  readonly sourceCursorRef: string;
  readonly childGraphFunctionRef: string;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly stage:
    | "basis_admission"
    | "graph_materialization"
    | "graph_validation"
    | "membership"
    | "scope_open";
  readonly diagnosticRef: string;
  readonly admissionEventRef: string;
}

export interface ApplicationChildPreparationRefusalRefusal {
  readonly kind: "application_child_preparation_refusal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "application_mismatch" | "candidate_mismatch";
  readonly message: string;
}

export type ApplicationChildPreparationRefusalResult =
  | ApplicationChildPreparationRefusalAdmission
  | ApplicationChildPreparationRefusalRefusal;

const admittedApplicationFoldbacks = new WeakSet<object>();
const admittedApplicationPreparationRefusals = new WeakSet<object>();

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function refusal(
  code: ApplicationChildFoldbackRefusal["code"],
  message: string,
): ApplicationChildFoldbackRefusal {
  return {
    kind: "application_child_foldback_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function isAdmittedApplicationChildFoldback(
  value: object,
): value is ApplicationChildFoldbackAdmission {
  return admittedApplicationFoldbacks.has(value);
}

export function isAdmittedApplicationChildPreparationRefusal(
  value: object,
): value is ApplicationChildPreparationRefusalAdmission {
  return admittedApplicationPreparationRefusals.has(value);
}

export function admitApplicationChildPreparationRefusal(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  parentCCall: CCall,
  parentResult: AdmittedCCallResult,
  parentJudgment: AdmittedCCallJudgment,
  sourceCursor: TraversalCursorCandidate,
  candidate: {
    readonly childGraphFunctionRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly stage: ApplicationChildPreparationRefusalAdmission["stage"];
    readonly diagnosticRef: string;
    readonly message: string;
  },
  basis: RuntimeAdmissionBasis,
): ApplicationChildPreparationRefusalResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    !isMaterializedGtlGraph(graph) ||
    graph.materializationRef !== executionBasis.graphRef ||
    graph.template.applications.find(
      (row) => row.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    !hasOpenedCCall(store, parentCCall) ||
    !isAdmittedCCallResult(parentResult) ||
    !isAdmittedCCallJudgment(parentJudgment) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    parentCCall.basisId !== executionBasis.basisRef ||
    parentCCall.frameId !== sourceCursor.frameId ||
    parentCCall.compositionRef !== application.applicationRef ||
    parentResult.cCallRef !== parentCCall.cCallRef ||
    parentJudgment.cCallRef !== parentCCall.cCallRef ||
    parentJudgment.resultRef !== parentResult.resultRef ||
    parentJudgment.judgment !== "advance"
  ) {
    return {
      kind: "application_child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "application_mismatch",
      message:
        "application child preparation refusal requires exact admitted parent evaluation truth",
    };
  }
  if (
    candidate.childGraphFunctionRef !== application.graphFunctionRef ||
    candidate.inputRef !== parentResult.resultRef ||
    candidate.inputDigest !== parentResult.valueDigest ||
    ![
      "basis_admission",
      "graph_materialization",
      "graph_validation",
      "membership",
      "scope_open",
    ].includes(candidate.stage) ||
    !candidate.diagnosticRef.startsWith("diagnostic://abiogenesis/") ||
    candidate.message.length === 0
  ) {
    return {
      kind: "application_child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "candidate_mismatch",
      message:
        "application child preparation refusal differs from the declared child and parent output",
    };
  }
  const body = {
    applicationRef: application.applicationRef,
    parentCCallRef: parentCCall.cCallRef,
    parentJudgmentRef: parentJudgment.judgmentRef,
    sourceCursorRef: sourceCursor.cursorRef,
    ...candidate,
  };
  const refusalDigest = sha256Canonical(body as unknown as JsonValue);
  const refusalRef =
    `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "child_preparation_refused",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      parentJudgment.admissionEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { refusalRef, refusalDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "application_child_preparation_refusal_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    refusalRef,
    refusalDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as ApplicationChildPreparationRefusalAdmission;
  admittedApplicationPreparationRefusals.add(admitted);
  return admitted;
}

export function admitApplicationChildFoldback(
  store: AbgEventStore,
  parentExecutionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  parentCCall: CCall,
  parentJudgmentRef: string,
  sourceCursor: TraversalCursorCandidate,
  childExecutionBasis: ExecutionBasis,
  childScope: OpenedTraversalScope,
  child: {
    readonly resultRef: string;
    readonly judgmentRef: string;
  },
  basis: RuntimeAdmissionBasis,
): ApplicationChildFoldbackResult {
  if (
    !hasAdmittedExecutionBasis(store, parentExecutionBasis) ||
    !isMaterializedGtlGraph(graph) ||
    graph.materializationRef !== parentExecutionBasis.graphRef ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application)
  ) {
    return refusal(
      "application_mismatch",
      "child foldback requires one exact admitted recurse application",
    );
  }
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "leaf" ||
    parentCCall.basisId !== parentExecutionBasis.basisRef ||
    parentCCall.frameId !== sourceCursor.frameId ||
    parentCCall.graphCallId !== sourceCursor.graphCallId ||
    parentCCall.compositionRef !== application.applicationRef ||
    parentCCall.attempt !== sourceCursor.attempt ||
    !hasAdmittedTraversalCursor(store, sourceCursor)
  ) {
    return refusal(
      "parent_truth_mismatch",
      "application foldback requires the exact evaluated parent cursor and CCall",
    );
  }
  const events = store.readAll();
  const parentJudgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === parentCCall.cCallRef &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === parentJudgmentRef &&
      event.payload.judgment === "advance",
  );
  if (parentJudgmentEvent === undefined) {
    return refusal(
      "parent_truth_mismatch",
      "application foldback requires admitted parent re-evaluation truth",
    );
  }
  if (
    !hasAdmittedExecutionBasis(store, childExecutionBasis) ||
    childExecutionBasis.basisClass !== "child" ||
    childExecutionBasis.parentExecutionBasisRef !== parentExecutionBasis.basisRef ||
    childExecutionBasis.graphFunctionRef !== application.graphFunctionRef ||
    !hasOpenedTraversalScope(store, childScope) ||
    childScope.executionBasisRef !== childExecutionBasis.basisRef ||
    childScope.runId !== sourceCursor.runId
  ) {
    return refusal(
      "child_truth_mismatch",
      "application foldback requires one exact admitted child basis and scope",
    );
  }
  const childGraphCallEvent = events.find(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.aggregateId === childScope.graphCallId &&
      isRecord(event.payload) &&
      event.payload.parentFrameId === sourceCursor.frameId,
  );
  const resultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.resultRef === child.resultRef,
  );
  const judgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === child.judgmentRef &&
      event.payload.resultRef === child.resultRef,
  );
  const terminalEvent = events.slice().reverse().find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === child.judgmentRef &&
      (event.payload.routeKind === "terminal" ||
        event.payload.routeKind === "blocked"),
  );
  const resultDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
    ? resultEvent.payload.resultDigest
    : null;
  const outputDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
    ? resultEvent.payload.valueDigest
    : null;
  const routeKind = terminalEvent !== undefined && isRecord(terminalEvent.payload)
    ? terminalEvent.payload.routeKind
    : null;
  if (
    childGraphCallEvent === undefined ||
    resultEvent === undefined ||
    judgmentEvent === undefined ||
    terminalEvent === undefined ||
    !judgmentEvent.causationEventRefs.includes(resultEvent.eventId) ||
    !terminalEvent.causationEventRefs.includes(judgmentEvent.eventId) ||
    typeof resultDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(resultDigest) ||
    typeof outputDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(outputDigest) ||
    (routeKind !== "terminal" && routeKind !== "blocked")
  ) {
    return refusal(
      "child_truth_mismatch",
      "application foldback references incomplete or non-causal child truth",
    );
  }
  const body = {
    applicationRef: application.applicationRef,
    applicationFoldbackRef: application.foldbackRef,
    parentCCallRef: parentCCall.cCallRef,
    parentJudgmentRef,
    sourceCursorRef: sourceCursor.cursorRef,
    sourceCursorDigest: sourceCursor.cursorDigest,
    childExecutionBasisRef: childExecutionBasis.basisRef,
    childExecutionBasisDigest: childExecutionBasis.basisDigest,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    childDisposition: routeKind === "terminal" ? "closed" as const : "blocked" as const,
    childResultRef: child.resultRef,
    childResultDigest: resultDigest as Sha256Digest,
    childJudgmentRef: child.judgmentRef,
    childTerminalEventRef: terminalEvent.eventId,
    outputDigest: outputDigest as Sha256Digest,
  };
  const foldbackDigest = sha256Canonical(body as unknown as JsonValue);
  const foldbackRef =
    `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "child_foldback_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      terminalEvent.eventId,
      parentJudgmentEvent.eventId,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: parentExecutionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: parentExecutionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { foldbackRef, foldbackDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "application_child_foldback_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    foldbackRef,
    foldbackDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as ApplicationChildFoldbackAdmission;
  admittedApplicationFoldbacks.add(admitted);
  return admitted;
}
