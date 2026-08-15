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
  replay,
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";
import {
  type AdmittedRoute,
} from "./traversal_route.js";
import { projectTraversalRouteBody } from "./traversal_transition.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";

export interface ScopeClosureAdmission {
  readonly kind: "scope_closure_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "closed";
  readonly scopeClass: "run" | "graph_call";
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
  readonly runClosedEventRef: string | null;
  readonly childGraphCallId: string | null;
  readonly childFrameId: string | null;
  readonly replayState: ReplayState;
}

export interface ScopeClosureAdmissionRefusal {
  readonly kind: "scope_closure_admission_refusal";
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

export type ScopeClosureAdmissionResult =
  | ScopeClosureAdmission
  | ScopeClosureAdmissionRefusal;

function refuseClosureWithoutEffects(
  code: ScopeClosureAdmissionRefusal["code"],
  message: string,
): ScopeClosureAdmissionRefusal {
  return deepFreeze({
    kind: "scope_closure_admission_refusal" as const,
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

export type ScopeClosureSubject =
  | Readonly<{
      kind: "run";
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: AdmittedCCallJudgment;
    }>
  | Readonly<{
      kind: "interaction";
      cCall: CCall;
      pendingResult: AdmittedCCallResult;
      pendingJudgment: AdmittedCCallJudgment;
      resume: FhInteractionResumeAdmission;
    }>
  | Readonly<{
      kind: "child";
      scope: OpenedTraversalScope;
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: AdmittedCCallJudgment;
    }>;

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
  const exactRouteBody = projectTraversalRouteBody(route);
  if (exactRouteBody === null) return null;
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

export function admitScopeClosure(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  subject: ScopeClosureSubject,
  route: AdmittedRoute,
  closureContract: Readonly<ClosureContract>,
  basis: RuntimeAdmissionBasis,
): ScopeClosureAdmissionResult {
  const sourceCCall = subject.cCall;
  const sourceResult = subject.kind === "interaction"
    ? subject.pendingResult
    : subject.result;
  const sourceJudgment = subject.kind === "interaction"
    ? subject.pendingJudgment
    : subject.judgment;
  const exactPrefix = selectExactClosurePrefix(
    store,
    predecessorPrefix,
    sourceCCall.runId,
  );
  if (exactPrefix === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "scope closure requires the exact held durable predecessor prefix",
    );
  }

  const projectedCCall = projectAdmittedCCallStateAtPrefix(
    exactPrefix.runPrefix,
    sourceCCall as unknown as Readonly<Record<string, JsonValue>>,
    sourceResult as unknown as Readonly<Record<string, JsonValue>>,
    sourceJudgment as unknown as Readonly<Record<string, JsonValue>>,
  );
  const childScope = subject.kind === "child"
    ? rehydrateOpenedTraversalScopeAtPrefix(
        exactPrefix.runPrefix,
        subject.scope as unknown as Readonly<Record<string, JsonValue>>,
      )
    : null;
  if (
    projectedCCall === null ||
    (subject.kind === "child" && childScope === null)
  ) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "scope closure requires its exact prefix-admitted scope and CCall outcome",
    );
  }
  const cCall = projectedCCall.cCall;
  const result = projectedCCall.result;
  const judgment = projectedCCall.judgment;
  const resume = subject.kind === "interaction" ? subject.resume : null;
  const resultRef = resume?.responseRef ?? result.resultRef;
  const closureContractDigest = sha256Canonical(
    closureContract as unknown as JsonValue,
  );

  const commonOutcomeIsExact =
    result.cCallRef === cCall.cCallRef &&
    judgment.cCallRef === cCall.cCallRef &&
    route.cCallRef === cCall.cCallRef &&
    judgment.resultRef === result.resultRef &&
    route.judgmentRef === judgment.judgmentRef &&
    route.routeKind === "terminal";
  const subjectOutcomeIsExact = subject.kind === "interaction"
    ? cCall.regime === "F_H" &&
      cCall.responseContractRef !== null &&
      cCall.continuationContractRef !== null &&
      result.resultClass === "pending" &&
      judgment.judgment === "pending" &&
      resume !== null &&
      resume.responseDigest === sha256Canonical(
        resume.responseValue as unknown as JsonValue,
      ) &&
      route.sourceCursorRef === resume.successorCursorRef &&
      route.sourceCursorDigest === resume.successorCursorDigest
    : judgment.judgment === "advance";
  if (!commonOutcomeIsExact || !subjectOutcomeIsExact) {
    return refuseClosureWithoutEffects(
      "runtime_basis_mismatch",
      "scope closure requires one exact terminal route over its current CCall outcome",
    );
  }

  let childParentFrameId: string | null = null;
  if (childScope !== null) {
    const childGraphCallOpen = runtimeEventsFromValidatedPrefix(
      exactPrefix.runPrefix,
    ).find((event) =>
      event.kind === "graph_call_opened" &&
      event.eventId === childScope.graphCallOpenEventRef &&
      event.graphCallId === childScope.graphCallId
    );
    const childGraphCallPayload =
      childGraphCallOpen !== undefined &&
        isRecord(childGraphCallOpen.payload)
        ? childGraphCallOpen.payload
        : null;
    childParentFrameId =
      typeof childGraphCallPayload?.parentFrameId === "string"
        ? childGraphCallPayload.parentFrameId
        : null;
    if (
      childParentFrameId === null ||
      cCall.runId !== childScope.runId ||
      cCall.graphCallId !== childScope.graphCallId ||
      cCall.frameId !== childScope.frameId
    ) {
      return refuseClosureWithoutEffects(
        "runtime_basis_mismatch",
        "child closure requires one exact active child GraphCall and Frame",
      );
    }
  }

  const currentTruth = projectCurrentClosureTruth(
    exactPrefix.runPrefix,
    exactPrefix.fullPrefix,
    cCall,
    result,
    judgment,
    route,
    resume,
  );
  if (currentTruth === null) {
    return refuseClosureWithoutEffects(
      "replay_mismatch",
      "scope closure basis is not current replay and Event Calculus truth",
    );
  }

  const expectedResultContractRef = subject.kind === "interaction"
    ? cCall.responseContractRef
    : result.contractRef;
  const expectedJudgmentContractRef = subject.kind === "interaction"
    ? cCall.continuationContractRef
    : judgment.contractRef;
  const expectedScope = subject.kind === "child" ? "graph_call" : "run";
  const expectedEventKinds = subject.kind === "child"
    ? ["terminal_reached", "frame_closed", "graph_call_closed"]
    : [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ];
  const alreadyClosed = subject.kind === "child"
    ? [
        `terminal_admitted(${cCall.frameId})`,
        `frame_closed(${cCall.frameId})`,
        `graph_call_closed(${cCall.graphCallId})`,
      ].some((fluent) => currentTruth.replay.activeFluents.includes(fluent))
    : currentTruth.replay.activeFluents.includes(
        `terminal_admitted(${cCall.frameId})`,
      );
  if (
    closureContract.closureContractRef !== cCall.closureContractRef ||
    closureContractDigest !== cCall.closureContractDigest ||
    closureContract.predicateRef !== cCall.terminalPredicateRef ||
    closureContract.replayProjectionRef !== cCall.replayProjectionRef ||
    closureContract.terminalKind !== cCall.terminalKind ||
    closureContract.terminalKind !== "completed" ||
    closureContract.evidenceContractRef !== cCall.evidenceContractRef ||
    closureContract.resultContractRef !== expectedResultContractRef ||
    closureContract.refusalContractRef !== cCall.refusalContractRef ||
    closureContract.judgmentContractRef !== expectedJudgmentContractRef ||
    closureContract.transitionContractRef !== route.contractRef ||
    closureContract.closureScope !== expectedScope ||
    closureContract.eventKindRefs.join("\0") !== expectedEventKinds.join("\0") ||
    alreadyClosed
  ) {
    return refuseClosureWithoutEffects(
      "closure_contract_mismatch",
      "scope closure contract or lifecycle uniqueness check failed",
    );
  }

  if (subject.kind !== "child") {
    const quiescence = projectExactPreClosureQuiescence(exactPrefix.runPrefix);
    if (!isExactPreClosureQuiescence(quiescence, cCall, route)) {
      return refuseClosureWithoutEffects(
        "runtime_basis_mismatch",
        `run closure requires the exact quiescent prefix: ${quiescence.disposition}; ${quiescence.blockingFluents.join(",")}`,
      );
    }
  }

  const closureBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    closureContractDigest,
    ...(childScope === null
      ? {}
      : {
          childGraphCallId: childScope.graphCallId,
          childFrameId: childScope.frameId,
        }),
    terminalKind: closureContract.terminalKind,
  };
  const closureDigest = sha256Canonical(closureBody as unknown as JsonValue);
  const closureRef =
    `closure://abiogenesis/${closureDigest.slice("sha256:".length)}`;
  const graphCallId = childScope?.graphCallId ?? cCall.graphCallId;
  const frameId = childScope?.frameId ?? cCall.frameId;
  const runId = childScope?.runId ?? cCall.runId;
  const factories: RuntimeEventCandidateFactory[] = [
    () => ({
      kind: "terminal_reached",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: frameId,
      parentAggregateId: graphCallId,
      causationEventRefs: [
        route.admissionEventRef,
        ...basis.causationEventRefs,
      ],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId,
      frameId,
      payload: { closureRef, closureDigest, ...closureBody },
    }),
    (batch) => ({
      kind: "frame_closed",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: frameId,
      parentAggregateId: graphCallId,
      causationEventRefs: [batch[0]!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId,
      frameId,
      payload: {
        frameId,
        terminalReachedEventRef: batch[0]!.eventId,
        closureContractRef: closureContract.closureContractRef,
      },
    }),
    (batch) => ({
      kind: "graph_call_closed",
      eventTime: basis.eventTime,
      aggregateType: "graph_call",
      aggregateId: graphCallId,
      parentAggregateId: runId,
      causationEventRefs: [batch[1]!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId,
      ...(childScope === null ? {} : { frameId }),
      payload: {
        graphCallId,
        frameClosedEventRef: batch[1]!.eventId,
        closureContractRef: closureContract.closureContractRef,
      },
    }),
  ];
  if (subject.kind !== "child") {
    factories.push((batch) => ({
      kind: "run_closed",
      eventTime: basis.eventTime,
      aggregateType: "run",
      aggregateId: runId,
      parentAggregateId: null,
      causationEventRefs: [batch[2]!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId,
      payload: {
        runId,
        graphCallClosedEventRef: batch[2]!.eventId,
        closureContractRef: closureContract.closureContractRef,
      },
    }));
  }
  const events = appendClosureBatchAtExpectedPrefix(
    store,
    predecessorPrefix,
    exactPrefix.expectedStorePrefixDigest,
    factories,
  );
  if (events === null) {
    return refuseClosureWithoutEffects(
      "stale_prefix",
      "scope closure predecessor became stale before its atomic append",
    );
  }
  return deepFreeze({
    kind: "scope_closure_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "closed" as const,
    scopeClass: expectedScope,
    closureRef,
    closureDigest,
    cCallRef: cCall.cCallRef,
    resultRef,
    judgmentRef: judgment.judgmentRef,
    routeRef: route.routeRef,
    closureContractRef: closureContract.closureContractRef,
    terminalReachedEventRef: events[0]!.eventId,
    frameClosedEventRef: events[1]!.eventId,
    graphCallClosedEventRef: events[2]!.eventId,
    runClosedEventRef: events[3]?.eventId ?? null,
    childGraphCallId: childScope?.graphCallId ?? null,
    childFrameId: childScope?.frameId ?? null,
    replayState: replay(store, { runId }),
  });
}
