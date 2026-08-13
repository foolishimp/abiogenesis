import type { ClosureContract } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  projectAdmittedCCallStateAtPrefix,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
} from "./c_call.js";
import type { RuntimeAdmissionBasis } from "./execution_basis.js";
import {
  assertHeldEventStoreAtDurablePrefix,
  compareAndAppendExpectedPrefix,
  isRuntimeEventTransactionActive,
  readRuntimeEventsAtDurablePrefix,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
  type RuntimeEventCandidateFactory,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  rehydrateOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  projectRunQuiescence,
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";
import {
  type AdmittedRoute,
} from "./traversal_route.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";

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
    | "runtime_basis_mismatch"
    | "stale_prefix";
  readonly message: string;
  readonly failureEventRef: string | null;
}

export type ClosureAdmissionResult = ClosureAdmission | ClosureAdmissionRefusal;

function refuseClosureWithoutEffects(
  code: ClosureAdmissionRefusal["code"],
  message: string,
): ClosureAdmissionRefusal {
  return deepFreeze({
    kind: "closure_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    failureEventRef: null,
  });
}

interface ExactClosurePrefix {
  readonly fullPrefix: ValidatedRuntimeEventPrefix;
  readonly runPrefix: ValidatedRuntimeEventPrefix;
  readonly expectedStorePrefixDigest: Sha256Digest;
}

function selectExactClosurePrefix(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  runId: string,
): ExactClosurePrefix | null {
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    const events = isRuntimeEventTransactionActive(store)
      ? store.readAll()
      : readRuntimeEventsAtDurablePrefix(predecessorPrefix);
    const fullPrefix = selectValidatedRuntimeEventPrefix(events);
    const runPrefix = selectValidatedRuntimeEventPrefix(events, { runId });
    return deepFreeze({
      fullPrefix,
      runPrefix,
      expectedStorePrefixDigest: sha256Canonical(events as unknown as JsonValue),
    });
  } catch {
    return null;
  }
}

function projectExactPreClosureQuiescence(
  prefix: ValidatedRuntimeEventPrefix,
) {
  return deepFreeze({
    ...projectRunQuiescence(prefix),
  });
}

function appendClosureBatchAtExpectedPrefix(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  expectedStorePrefixDigest: Sha256Digest,
  factories: readonly RuntimeEventCandidateFactory[],
): readonly RuntimeEvent[] | null {
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
  } catch {
    return null;
  }
  try {
    return compareAndAppendExpectedPrefix(
      store,
      expectedStorePrefixDigest,
      factories,
    );
  } catch (error) {
    try {
      assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    } catch {
      return null;
    }
    if (store.digest() !== expectedStorePrefixDigest) return null;
    throw error;
  }
}

function isExactPreClosureQuiescence(
  quiescence: ReturnType<typeof projectExactPreClosureQuiescence>,
  cCall: CCall,
  route: AdmittedRoute,
): boolean {
  return quiescence.disposition === "quiescent_for_close" &&
    quiescence.runId === cCall.runId &&
    quiescence.rootGraphCallId === cCall.graphCallId &&
    quiescence.rootFrameId === cCall.frameId &&
    quiescence.terminalRouteRef === route.routeRef &&
    quiescence.terminalCCallRef === cCall.cCallRef;
}

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
    | "runtime_basis_mismatch"
    | "stale_prefix";
  readonly message: string;
}

export type ChildClosureAdmissionResult =
  | ChildClosureAdmission
  | ChildClosureAdmissionRefusal;

function refuseChildClosureWithoutEffects(
  code: ChildClosureAdmissionRefusal["code"],
  message: string,
): ChildClosureAdmissionRefusal {
  return deepFreeze({
    kind: "child_closure_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

interface CurrentClosureTruth {
  readonly events: ReturnType<typeof runtimeEventsFromValidatedPrefix>;
  readonly replay: ReplayState;
}

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactAdmissionPayload(
  event: CurrentClosureTruth["events"][number] | undefined,
  eventKind: "c_call_result_admitted" | "c_call_judged",
  admission: AdmittedCCallResult | AdmittedCCallJudgment,
): boolean {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    admissionEventRef,
    ...payload
  } = admission;
  return event?.kind === eventKind &&
    event.eventId === admissionEventRef &&
    isRecord(event.payload) &&
    sha256Canonical(event.payload) ===
      sha256Canonical(payload as unknown as JsonValue);
}

function routeBody(route: AdmittedRoute): Readonly<Record<string, JsonValue>> {
  return {
    routeKind: route.routeKind,
    declarationRef: route.declarationRef,
    declarationDigest: route.declarationDigest,
    sourceCursorRef: route.sourceCursorRef,
    sourceCursorDigest: route.sourceCursorDigest,
    targetCursorRef: route.targetCursorRef,
    targetCursorDigest: route.targetCursorDigest,
    cCallRef: route.cCallRef,
    judgmentRef: route.judgmentRef,
    consumedAvailabilityRefs: route.consumedAvailabilityRefs,
    contractRef: route.contractRef,
    replayStateDigest: route.replayStateDigest,
  };
}

function projectCurrentClosureTruth(
  prefix: ValidatedRuntimeEventPrefix,
  authorityPrefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  route: AdmittedRoute,
  resume: FhInteractionResumeAdmission | null = null,
): CurrentClosureTruth | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const currentReplay = replayValidatedRuntimeEventPrefix(
    prefix,
    authorityPrefix,
  );
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const cCallTruth = currentReplay.cCalls.find(
    (candidate) => candidate.cCallRef === cCall.cCallRef,
  );
  const currentRoute = currentReplay.routes.find(
    (candidate) =>
      candidate.routeRef === route.routeRef &&
      candidate.cCallRef === cCall.cCallRef &&
      candidate.judgmentRef === judgment.judgmentRef &&
      candidate.sourceCursorRef === route.sourceCursorRef,
  );
  const resultEvent = events.find(
    (event) => event.eventId === result.admissionEventRef,
  );
  const judgmentEvent = events.find(
    (event) => event.eventId === judgment.admissionEventRef,
  );
  const routeEvent = events.find(
    (event) => event.eventId === route.admissionEventRef,
  );
  const resultBody = {
    cCallRef: result.cCallRef,
    resultClass: result.resultClass,
    contractRef: result.contractRef,
    valueKind: result.valueKind,
    valueDigest: result.valueDigest,
    value: result.value,
    evidenceRefs: result.evidenceRefs,
  };
  const judgmentBody = {
    cCallRef: judgment.cCallRef,
    resultRef: judgment.resultRef,
    resultDigest: judgment.resultDigest,
    judgment: judgment.judgment,
    reasonRef: judgment.reasonRef,
    contractRef: judgment.contractRef,
    predicateRef: judgment.predicateRef,
    replayStateDigest: judgment.replayStateDigest,
    retryAttemptRef: judgment.retryAttemptRef,
  };
  const exactRouteBody = routeBody(route);
  const resumeTruth = resume === null
    ? null
    : currentReplay.continuations.find(
        (candidate) =>
          candidate.continuationRef === resume.continuationRef &&
          candidate.status === "resolved" &&
          candidate.resumedEventRef === resume.admissionEventRef &&
          candidate.responseRef === resume.responseRef &&
          candidate.responseDigest === resume.responseDigest &&
          candidate.successorCursorRef === resume.successorCursorRef &&
          candidate.successorCursorDigest === resume.successorCursorDigest,
      );
  if (
    cCallTruth?.status !== "judged" ||
    cCallTruth.resultRef !== result.resultRef ||
    cCallTruth.resultDigest !== result.resultDigest ||
    cCallTruth.judgmentRef !== judgment.judgmentRef ||
    cCallTruth.judgment !== judgment.judgment ||
    result.resultDigest !== sha256Canonical(resultBody as unknown as JsonValue) ||
    result.resultRef !==
      `result://abiogenesis/${result.resultDigest.slice("sha256:".length)}` ||
    result.valueDigest !== sha256Canonical(result.value) ||
    judgment.judgmentDigest !==
      sha256Canonical(judgmentBody as unknown as JsonValue) ||
    judgment.judgmentRef !==
      `judgment://abiogenesis/${judgment.judgmentDigest.slice("sha256:".length)}` ||
    !exactAdmissionPayload(resultEvent, "c_call_result_admitted", result) ||
    !exactAdmissionPayload(judgmentEvent, "c_call_judged", judgment) ||
    route.routeDigest !== sha256Canonical(exactRouteBody as unknown as JsonValue) ||
    route.routeRef !==
      `traversal-route://abiogenesis/${route.routeDigest.slice("sha256:".length)}` ||
    routeEvent?.kind !== "traversal_route_admitted" ||
    routeEvent.runId !== cCall.runId ||
    routeEvent.graphCallId !== cCall.graphCallId ||
    routeEvent.frameId !== cCall.frameId ||
    !isRecord(routeEvent.payload) ||
    sha256Canonical(routeEvent.payload) !== sha256Canonical({
      routeRef: route.routeRef,
      routeDigest: route.routeDigest,
      ...exactRouteBody,
    } as unknown as JsonValue) ||
    currentRoute?.routeRef !== route.routeRef ||
    currentRoute.routeDigest !== route.routeDigest ||
    currentRoute.admissionEventRef !== route.admissionEventRef ||
    currentRoute.routeKind !== route.routeKind ||
    currentRoute.declarationRef !== route.declarationRef ||
    currentRoute.declarationDigest !== route.declarationDigest ||
    currentRoute.sourceCursorRef !== route.sourceCursorRef ||
    currentRoute.sourceCursorDigest !== route.sourceCursorDigest ||
    currentRoute.targetCursorRef !== route.targetCursorRef ||
    currentRoute.targetCursorDigest !== route.targetCursorDigest ||
    currentRoute.cCallRef !== route.cCallRef ||
    currentRoute.judgmentRef !== route.judgmentRef ||
    !holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "terminal_route_available",
        identity: route.routeRef,
      }),
    ) ||
    (resume !== null && resumeTruth === null)
  ) return null;
  return { events, replay: currentReplay };
}

export function admitClosure(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  route: AdmittedRoute,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ClosureAdmissionResult {
  const exactPrefix = selectExactClosurePrefix(
    store,
    predecessorPrefix,
    cCall.runId,
  );
  if (exactPrefix === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "closure requires the exact held durable predecessor prefix",
    );
  }
  const projectedCCall = projectAdmittedCCallStateAtPrefix(
    exactPrefix.runPrefix,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
    judgment as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (projectedCCall === null) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "closure requires one exact prefix-admitted CCall, result, and judgment",
    );
  }
  cCall = projectedCCall.cCall;
  result = projectedCCall.result;
  judgment = projectedCCall.judgment;
  const closureContractDigest = sha256Canonical(closureContract as unknown as JsonValue);
  if (
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    route.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    route.judgmentRef !== judgment.judgmentRef ||
    judgment.judgment !== "advance" ||
    route.routeKind !== "terminal"
  ) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "closure requires one exact judged CCall and admitted terminal route",
    );
  }
  const currentTruth = projectCurrentClosureTruth(
    exactPrefix.runPrefix,
    exactPrefix.fullPrefix,
    cCall,
    result,
    judgment,
    route,
  );
  if (currentTruth === null) {
    return refuseClosureWithoutEffects(
      "replay_mismatch",
      "closure basis is not current replay truth",
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
    currentTruth.replay.activeFluents.includes(
      `terminal_admitted(${cCall.frameId})`,
    )
  ) {
    return refuseClosureWithoutEffects(
      "closure_contract_mismatch",
      "closure contract, result, judgment, route, or uniqueness check failed",
    );
  }

  const quiescence = projectExactPreClosureQuiescence(exactPrefix.runPrefix);
  if (!isExactPreClosureQuiescence(quiescence, cCall, route)) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      `closure requires the exact immutable quiescent pre-closure Run prefix: ${quiescence.disposition}; ${quiescence.blockingFluents.join(",")}`,
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
  const events = appendClosureBatchAtExpectedPrefix(
    store,
    predecessorPrefix,
    exactPrefix.expectedStorePrefixDigest,
    [
    () => ({
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
    }),
    (batch) => ({
    kind: "frame_closed",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [batch[0]!.eventId],
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
      terminalReachedEventRef: batch[0]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    (batch) => ({
    kind: "graph_call_closed",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: cCall.graphCallId,
    parentAggregateId: cCall.runId,
    causationEventRefs: [batch[1]!.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      graphCallId: cCall.graphCallId,
      frameClosedEventRef: batch[1]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    (batch) => ({
    kind: "run_closed",
    eventTime: basis.eventTime,
    aggregateType: "run",
    aggregateId: cCall.runId,
    parentAggregateId: null,
    causationEventRefs: [batch[2]!.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      runId: cCall.runId,
      graphCallClosedEventRef: batch[2]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    ],
  );
  if (events === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "closure predecessor became stale before its atomic append",
    );
  }
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
    terminalReachedEventRef: events[0]!.eventId,
    frameClosedEventRef: events[1]!.eventId,
    graphCallClosedEventRef: events[2]!.eventId,
    runClosedEventRef: events[3]!.eventId,
  }) as ClosureAdmission;
}

export function admitInteractionClosure(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  cCall: CCall,
  pendingResult: AdmittedCCallResult,
  pendingJudgment: AdmittedCCallJudgment,
  resume: FhInteractionResumeAdmission,
  route: AdmittedRoute,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ClosureAdmissionResult {
  const exactPrefix = selectExactClosurePrefix(
    store,
    predecessorPrefix,
    cCall.runId,
  );
  if (exactPrefix === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "F_H closure requires the exact held durable predecessor prefix",
    );
  }
  const projectedCCall = projectAdmittedCCallStateAtPrefix(
    exactPrefix.runPrefix,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    pendingResult as unknown as Readonly<Record<string, JsonValue>>,
    pendingJudgment as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (projectedCCall === null) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "F_H closure requires one exact prefix-admitted CCall, result, and judgment",
    );
  }
  cCall = projectedCCall.cCall;
  pendingResult = projectedCCall.result;
  pendingJudgment = projectedCCall.judgment;
  const closureContractDigest = sha256Canonical(
    closureContract as unknown as JsonValue,
  );
  if (
    cCall.regime !== "F_H" ||
    cCall.responseContractRef === null ||
    cCall.continuationContractRef === null ||
    pendingResult.cCallRef !== cCall.cCallRef ||
    pendingResult.resultClass !== "pending" ||
    pendingJudgment.cCallRef !== cCall.cCallRef ||
    pendingJudgment.resultRef !== pendingResult.resultRef ||
    pendingJudgment.judgment !== "pending" ||
    resume.responseDigest !== sha256Canonical(
      resume.responseValue as unknown as JsonValue,
    ) ||
    route.cCallRef !== cCall.cCallRef ||
    route.judgmentRef !== pendingJudgment.judgmentRef ||
    route.sourceCursorRef !== resume.successorCursorRef ||
    route.sourceCursorDigest !== resume.successorCursorDigest ||
    route.routeKind !== "terminal"
  ) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "F_H closure requires one exact pending CCall, admitted response, resume, and terminal route",
    );
  }
  const currentTruth = projectCurrentClosureTruth(
    exactPrefix.runPrefix,
    exactPrefix.fullPrefix,
    cCall,
    pendingResult,
    pendingJudgment,
    route,
    resume,
  );
  if (currentTruth === null) {
    return refuseClosureWithoutEffects(
      "replay_mismatch",
      "F_H closure basis is not the current resumed replay truth",
    );
  }
  if (
    closureContract.closureContractRef !== cCall.closureContractRef ||
    closureContractDigest !== cCall.closureContractDigest ||
    closureContract.predicateRef !== cCall.terminalPredicateRef ||
    closureContract.replayProjectionRef !== cCall.replayProjectionRef ||
    closureContract.terminalKind !== cCall.terminalKind ||
    closureContract.evidenceContractRef !== cCall.evidenceContractRef ||
    closureContract.resultContractRef !== cCall.responseContractRef ||
    closureContract.refusalContractRef !== cCall.refusalContractRef ||
    closureContract.judgmentContractRef !== cCall.continuationContractRef ||
    closureContract.transitionContractRef !== route.contractRef ||
    closureContract.terminalKind !== "completed" ||
    closureContract.closureScope !== "run" ||
    closureContract.eventKindRefs.join("\0") !==
      ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"]
        .join("\0") ||
    currentTruth.replay.activeFluents.includes(
      `terminal_admitted(${cCall.frameId})`,
    )
  ) {
    return refuseClosureWithoutEffects(
      "closure_contract_mismatch",
      "F_H closure contract, response, route, or uniqueness check failed",
    );
  }

  const quiescence = projectExactPreClosureQuiescence(exactPrefix.runPrefix);
  if (!isExactPreClosureQuiescence(quiescence, cCall, route)) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      `F_H closure requires the exact immutable quiescent pre-closure Run prefix: ${quiescence.disposition}; ${quiescence.blockingFluents.join(",")}`,
    );
  }

  const closureBody = {
    cCallRef: cCall.cCallRef,
    resultRef: resume.responseRef,
    judgmentRef: pendingJudgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    closureContractDigest,
    terminalKind: closureContract.terminalKind,
  };
  const closureDigest = sha256Canonical(closureBody as unknown as JsonValue);
  const closureRef =
    `closure://abiogenesis/${closureDigest.slice("sha256:".length)}`;
  const events = appendClosureBatchAtExpectedPrefix(
    store,
    predecessorPrefix,
    exactPrefix.expectedStorePrefixDigest,
    [
    () => ({
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
    }),
    (batch) => ({
    kind: "frame_closed",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [batch[0]!.eventId],
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
      terminalReachedEventRef: batch[0]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    (batch) => ({
    kind: "graph_call_closed",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: cCall.graphCallId,
    parentAggregateId: cCall.runId,
    causationEventRefs: [batch[1]!.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      graphCallId: cCall.graphCallId,
      frameClosedEventRef: batch[1]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    (batch) => ({
    kind: "run_closed",
    eventTime: basis.eventTime,
    aggregateType: "run",
    aggregateId: cCall.runId,
    parentAggregateId: null,
    causationEventRefs: [batch[2]!.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    payload: {
      runId: cCall.runId,
      graphCallClosedEventRef: batch[2]!.eventId,
      closureContractRef: closureContract.closureContractRef,
    },
    }),
    ],
  );
  if (events === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "F_H closure predecessor became stale before its atomic append",
    );
  }
  return deepFreeze({
    kind: "closure_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "closed" as const,
    closureRef,
    closureDigest,
    cCallRef: cCall.cCallRef,
    resultRef: resume.responseRef,
    judgmentRef: pendingJudgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    terminalReachedEventRef: events[0]!.eventId,
    frameClosedEventRef: events[1]!.eventId,
    graphCallClosedEventRef: events[2]!.eventId,
    runClosedEventRef: events[3]!.eventId,
  }) as ClosureAdmission;
}

export function admitChildClosure(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  childScope: OpenedTraversalScope,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  route: AdmittedRoute,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ChildClosureAdmissionResult {
  const exactPrefix = selectExactClosurePrefix(
    store,
    predecessorPrefix,
    childScope.runId,
  );
  if (exactPrefix === null) {
    return refuseChildClosureWithoutEffects(
      "stale_prefix",
      "child closure requires the exact held durable predecessor prefix",
    );
  }
  const projectedScope = rehydrateOpenedTraversalScopeAtPrefix(
    exactPrefix.runPrefix,
    childScope as unknown as Readonly<Record<string, JsonValue>>,
  );
  const projectedCCall = projectAdmittedCCallStateAtPrefix(
    exactPrefix.runPrefix,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
    judgment as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (projectedScope === null || projectedCCall === null) {
    return refuseChildClosureWithoutEffects(
      "runtime_basis_mismatch",
      "child closure requires one exact prefix-admitted scope, CCall, result, and judgment",
    );
  }
  childScope = projectedScope;
  cCall = projectedCCall.cCall;
  result = projectedCCall.result;
  judgment = projectedCCall.judgment;
  const closureContractDigest = sha256Canonical(
    closureContract as unknown as JsonValue,
  );
  const childEvents = runtimeEventsFromValidatedPrefix(exactPrefix.runPrefix);
  const childGraphCallOpen = childEvents.find(
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
    typeof childGraphCallPayload?.parentFrameId !== "string" ||
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
    return refuseChildClosureWithoutEffects(
      "runtime_basis_mismatch",
      "child closure requires one exact child scope, judged CCall, and terminal route",
    );
  }
  const currentTruth = projectCurrentClosureTruth(
    exactPrefix.runPrefix,
    exactPrefix.fullPrefix,
    cCall,
    result,
    judgment,
    route,
  );
  if (currentTruth === null) {
    return refuseChildClosureWithoutEffects(
      "replay_mismatch",
      "child closure basis is not current replay truth",
    );
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
    [
      `terminal_admitted(${childScope.frameId})`,
      `frame_closed(${childScope.frameId})`,
      `graph_call_closed(${childScope.graphCallId})`,
    ].some((fluent) => currentTruth.replay.activeFluents.includes(fluent))
  ) {
    return refuseChildClosureWithoutEffects(
      "closure_contract_mismatch",
      "child closure contract, lifecycle identity, or uniqueness check failed",
    );
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
  const events = appendClosureBatchAtExpectedPrefix(
    store,
    predecessorPrefix,
    exactPrefix.expectedStorePrefixDigest,
    [
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
    ],
  );
  if (events === null) {
    return refuseChildClosureWithoutEffects(
      "stale_prefix",
      "child closure predecessor became stale before its atomic append",
    );
  }
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
