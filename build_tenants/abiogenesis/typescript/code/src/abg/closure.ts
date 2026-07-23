import type { ClosureContract } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasOpenedCCall,
  isAdmittedCCallJudgment,
  isAdmittedCCallResult,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
} from "./c_call.js";
import type { RuntimeAdmissionBasis } from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
} from "./event_store.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";
import { replay, type ReplayState } from "./replay.js";
import {
  isAdmittedRoute,
  type AdmittedRoute,
} from "./traversal_route.js";

export interface ClosureAdmission {
  readonly kind: "closure_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "closed";
  readonly closureRef: string;
  readonly closureDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly routeRef: string;
  readonly closureContractRef: string;
  readonly terminalReachedEventRef: string;
  readonly frameClosedEventRef: string;
  readonly graphCallClosedEventRef: string;
  readonly runClosedEventRef: string;
}

export interface ClosureAdmissionRefusal {
  readonly kind: "closure_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "closure_contract_mismatch"
    | "replay_mismatch"
    | "runtime_basis_mismatch";
  readonly message: string;
  readonly failureEventRef: string | null;
}

export type ClosureAdmissionResult = ClosureAdmission | ClosureAdmissionRefusal;

export interface ChildClosureAdmission {
  readonly kind: "child_closure_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "closed";
  readonly closureRef: string;
  readonly closureDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly routeRef: string;
  readonly closureContractRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly terminalReachedEventRef: string;
  readonly frameClosedEventRef: string;
  readonly graphCallClosedEventRef: string;
}

export interface ChildClosureAdmissionRefusal {
  readonly kind: "child_closure_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "closure_contract_mismatch"
    | "replay_mismatch"
    | "runtime_basis_mismatch";
  readonly message: string;
}

export type ChildClosureAdmissionResult =
  | ChildClosureAdmission
  | ChildClosureAdmissionRefusal;

function refuseClosure(
  store: AbgEventStore,
  cCall: CCall,
  code: ClosureAdmissionRefusal["code"],
  message: string,
  subjectDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
): ClosureAdmissionRefusal {
  if (
    !hasOpenedCCall(store, cCall) ||
    store.readAll().some((event) =>
      event.runId === cCall.runId &&
      (event.kind === "run_closed" || event.kind === "runtime_failure_observed"))
  ) {
    return {
      kind: "closure_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code,
      message,
      failureEventRef: null,
    };
  }
  const prior = store.readAll().at(-1)!;
  const event = admitRuntimeEvent(store, {
    kind: "runtime_failure_observed",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [prior.eventId, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: {
      failureClass: "closure_refused",
      code,
      subjectDigest,
      cCallRef: cCall.cCallRef,
    },
  });
  return {
    kind: "closure_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
    failureEventRef: event.eventId,
  };
}

export function admitClosure(
  store: AbgEventStore,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  route: AdmittedRoute,
  replayState: ReplayState,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ClosureAdmissionResult {
  const closureContractDigest = sha256Canonical(closureContract as unknown as JsonValue);
  if (
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallResult(result) ||
    !isAdmittedCCallJudgment(judgment) ||
    !isAdmittedRoute(route) ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    route.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    route.judgmentRef !== judgment.judgmentRef ||
    judgment.judgment !== "advance" ||
    route.routeKind !== "terminal"
  ) {
    return refuseClosure(
      store,
      cCall,
      "runtime_basis_mismatch",
      "closure requires one exact judged CCall and admitted terminal route",
      closureContractDigest,
      basis,
    );
  }
  const currentReplay = replay(store, { runId: cCall.runId });
  const currentRoute = currentReplay.routes.at(-1);
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    currentRoute?.routeRef !== route.routeRef ||
    currentRoute?.admissionEventRef !== route.admissionEventRef ||
    store.readAll().at(-1)?.eventId !== route.admissionEventRef
  ) {
    return refuseClosure(
      store,
      cCall,
      "replay_mismatch",
      "closure basis is not current replay truth",
      replayState.replayDigest,
      basis,
    );
  }
  if (
    closureContract.closureContractRef !== cCall.closureContractRef ||
    closureContractDigest !== cCall.closureContractDigest ||
    closureContract.predicateRef !== cCall.terminalPredicateRef ||
    closureContract.replayProjectionRef !== cCall.replayProjectionRef ||
    closureContract.terminalKind !== cCall.terminalKind ||
    closureContract.evidenceContractRef !== cCall.evidenceContractRef ||
    closureContract.resultContractRef !== result.contractRef ||
    closureContract.refusalContractRef !== cCall.refusalContractRef ||
    closureContract.judgmentContractRef !== judgment.contractRef ||
    closureContract.transitionContractRef !== route.contractRef ||
    closureContract.terminalKind !== "completed" ||
    closureContract.closureScope !== "run" ||
    closureContract.eventKindRefs.join("\0") !==
      ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"].join("\0") ||
    store.readAll().some(
      (event) =>
        event.kind === "terminal_reached" &&
        event.runId === cCall.runId &&
        event.frameId === cCall.frameId,
    )
  ) {
    return refuseClosure(
      store,
      cCall,
      "closure_contract_mismatch",
      "closure contract, result, judgment, route, or uniqueness check failed",
      closureContractDigest,
      basis,
    );
  }

  const closureBody = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    closureContractDigest,
    terminalKind: closureContract.terminalKind,
  };
  const closureDigest = sha256Canonical(closureBody as unknown as JsonValue);
  const closureRef = `closure://abiogenesis/${closureDigest.slice("sha256:".length)}`;
  const terminalEvent = admitRuntimeEvent(store, {
    kind: "terminal_reached",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [route.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { closureRef, closureDigest, ...closureBody },
  });
  const frameEvent = admitRuntimeEvent(store, {
    kind: "frame_closed",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [terminalEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: {
      frameId: cCall.frameId,
      terminalReachedEventRef: terminalEvent.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
  });
  const graphCallEvent = admitRuntimeEvent(store, {
    kind: "graph_call_closed",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: cCall.graphCallId,
    parentAggregateId: cCall.runId,
    causationEventRefs: [frameEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      graphCallId: cCall.graphCallId,
      frameClosedEventRef: frameEvent.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
  });
  const runEvent = admitRuntimeEvent(store, {
    kind: "run_closed",
    eventTime: basis.eventTime,
    aggregateType: "run",
    aggregateId: cCall.runId,
    parentAggregateId: null,
    causationEventRefs: [graphCallEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      runId: cCall.runId,
      graphCallClosedEventRef: graphCallEvent.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
  });
  return deepFreeze({
    kind: "closure_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "closed" as const,
    closureRef,
    closureDigest,
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    terminalReachedEventRef: terminalEvent.eventId,
    frameClosedEventRef: frameEvent.eventId,
    graphCallClosedEventRef: graphCallEvent.eventId,
    runClosedEventRef: runEvent.eventId,
  }) as ClosureAdmission;
}

export function admitChildClosure(
  store: AbgEventStore,
  childScope: OpenedTraversalScope,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  route: AdmittedRoute,
  replayState: ReplayState,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ChildClosureAdmissionResult {
  const closureContractDigest = sha256Canonical(
    closureContract as unknown as JsonValue,
  );
  const childGraphCallOpen = store.readAll().find(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.eventId === childScope.graphCallOpenEventRef &&
      event.graphCallId === childScope.graphCallId,
  );
  const childGraphCallPayload =
    childGraphCallOpen !== undefined &&
      typeof childGraphCallOpen.payload === "object" &&
      childGraphCallOpen.payload !== null &&
      !Array.isArray(childGraphCallOpen.payload)
      ? childGraphCallOpen.payload as Readonly<Record<string, JsonValue>>
      : null;
  if (
    !hasOpenedTraversalScope(store, childScope) ||
    typeof childGraphCallPayload?.parentFrameId !== "string" ||
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallResult(result) ||
    !isAdmittedCCallJudgment(judgment) ||
    !isAdmittedRoute(route) ||
    cCall.runId !== childScope.runId ||
    cCall.graphCallId !== childScope.graphCallId ||
    cCall.frameId !== childScope.frameId ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    route.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    route.judgmentRef !== judgment.judgmentRef ||
    judgment.judgment !== "advance" ||
    route.routeKind !== "terminal"
  ) {
    return {
      kind: "child_closure_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "runtime_basis_mismatch",
      message:
        "child closure requires one exact child scope, judged CCall, and terminal route",
    };
  }
  const currentReplay = replay(store, { runId: childScope.runId });
  const currentRoute = currentReplay.routes.at(-1);
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    currentRoute?.routeRef !== route.routeRef ||
    currentRoute?.admissionEventRef !== route.admissionEventRef ||
    store.readAll().at(-1)?.eventId !== route.admissionEventRef
  ) {
    return {
      kind: "child_closure_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "replay_mismatch",
      message: "child closure basis is not current replay truth",
    };
  }
  if (
    closureContract.closureContractRef !== cCall.closureContractRef ||
    closureContractDigest !== cCall.closureContractDigest ||
    closureContract.predicateRef !== cCall.terminalPredicateRef ||
    closureContract.replayProjectionRef !== cCall.replayProjectionRef ||
    closureContract.terminalKind !== "completed" ||
    closureContract.evidenceContractRef !== cCall.evidenceContractRef ||
    closureContract.resultContractRef !== result.contractRef ||
    closureContract.refusalContractRef !== cCall.refusalContractRef ||
    closureContract.judgmentContractRef !== judgment.contractRef ||
    closureContract.transitionContractRef !== route.contractRef ||
    closureContract.closureScope !== "graph_call" ||
    closureContract.eventKindRefs.join("\0") !==
      ["terminal_reached", "frame_closed", "graph_call_closed"]
        .join("\0") ||
    store.readAll().some(
      (event) =>
        event.runId === childScope.runId &&
        (
          (event.kind === "terminal_reached" &&
            event.frameId === childScope.frameId) ||
          (event.kind === "frame_closed" &&
            event.frameId === childScope.frameId) ||
          (event.kind === "graph_call_closed" &&
            event.graphCallId === childScope.graphCallId)
        ),
    )
  ) {
    return {
      kind: "child_closure_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "closure_contract_mismatch",
      message:
        "child closure contract, lifecycle identity, or uniqueness check failed",
    };
  }

  const closureBody = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    closureContractDigest,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    terminalKind: closureContract.terminalKind,
  };
  const closureDigest = sha256Canonical(closureBody as unknown as JsonValue);
  const closureRef =
    `closure://abiogenesis/${closureDigest.slice("sha256:".length)}`;
  const events = admitRuntimeEventBatch(store, [
    () => ({
      kind: "terminal_reached",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: childScope.frameId,
      parentAggregateId: childScope.graphCallId,
      causationEventRefs: [
        route.admissionEventRef,
        ...basis.causationEventRefs,
      ],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: childScope.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: childScope.graphCallId,
      frameId: childScope.frameId,
      payload: { closureRef, closureDigest, ...closureBody },
    }),
    (batch) => ({
      kind: "frame_closed",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: childScope.frameId,
      parentAggregateId: childScope.graphCallId,
      causationEventRefs: [batch[0]!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: childScope.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: childScope.graphCallId,
      frameId: childScope.frameId,
      payload: {
        frameId: childScope.frameId,
        terminalReachedEventRef: batch[0]!.eventId,
        closureContractRef: closureContract.closureContractRef,
      },
    }),
    (batch) => ({
      kind: "graph_call_closed",
      eventTime: basis.eventTime,
      aggregateType: "graph_call",
      aggregateId: childScope.graphCallId,
      parentAggregateId: childScope.runId,
      causationEventRefs: [batch[1]!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: childScope.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: childScope.graphCallId,
      frameId: childScope.frameId,
      payload: {
        graphCallId: childScope.graphCallId,
        frameClosedEventRef: batch[1]!.eventId,
        closureContractRef: closureContract.closureContractRef,
      },
    }),
  ]);
  return deepFreeze({
    kind: "child_closure_admission",
    schemaVersion: "5.0.0",
    disposition: "closed",
    closureRef,
    closureDigest,
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    terminalReachedEventRef: events[0]!.eventId,
    frameClosedEventRef: events[1]!.eventId,
    graphCallClosedEventRef: events[2]!.eventId,
  }) as ChildClosureAdmission;
}
