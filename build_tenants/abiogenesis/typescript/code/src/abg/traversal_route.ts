import type { GtlGraph } from "../gtl/contracts.js";
import {
  deriveCSourceContinuation,
  resolveCProgramTermAtSourcePath,
} from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
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
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
} from "./event_store.js";
import { replay, type ReplayState } from "./replay.js";
import {
  hasAdmittedTraversalCursor,
  isTraversalCursorCandidate,
  traversalCursorAdmissionEventRef,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export type TraversalRouteKind =
  | "advance"
  | "retry"
  | "hold"
  | "blocked"
  | "failed"
  | "terminal";

export interface RouteCandidate {
  readonly kind: "traversal_route_candidate";
  readonly schemaVersion: "5.0.0";
  readonly candidateRef: string;
  readonly candidateDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string | null;
  readonly replayStateDigest: Sha256Digest;
}

export interface AdmittedRoute {
  readonly kind: "admitted_traversal_route";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly routeRef: string;
  readonly routeDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string | null;
  readonly replayStateDigest: Sha256Digest;
  readonly admissionEventRef: string;
  readonly runStoppedEventRef: string | null;
}

export interface RouteAdmissionRefusal {
  readonly kind: "traversal_route_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "candidate_mismatch"
    | "cursor_mismatch"
    | "judgment_mismatch"
    | "replay_mismatch"
    | "route_already_admitted"
    | "route_kind_not_supported"
    | "terminal_not_declared";
  readonly message: string;
}

export type RouteAdmissionResult = AdmittedRoute | RouteAdmissionRefusal;

export interface RouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
}

export interface BlockedRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly judgmentRef: string;
  readonly judgmentEventRef: string;
  readonly reasonRef: string;
}

export interface RouteAdmissionOptions {
  readonly terminalizeRun?: boolean;
}

const admittedRoutes = new WeakSet<object>();

export function isAdmittedRoute(value: object): boolean {
  return admittedRoutes.has(value);
}

function refusal(
  code: RouteAdmissionRefusal["code"],
  message: string,
): RouteAdmissionRefusal {
  return {
    kind: "traversal_route_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function candidateBody(
  candidate: RouteCandidate,
): Readonly<Record<string, JsonValue>> {
  return {
    routeKind: candidate.routeKind,
    declarationRef: candidate.declarationRef,
    declarationDigest: candidate.declarationDigest,
    sourceCursorRef: candidate.sourceCursorRef,
    sourceCursorDigest: candidate.sourceCursorDigest,
    targetCursorRef: candidate.targetCursorRef,
    targetCursorDigest: candidate.targetCursorDigest,
    cCallRef: candidate.cCallRef,
    judgmentRef: candidate.judgmentRef,
    consumedAvailabilityRefs: candidate.consumedAvailabilityRefs,
    contractRef: candidate.contractRef,
    replayStateDigest: candidate.replayStateDigest,
  };
}

function isJsonRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameValues(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.join("\0") === right.join("\0");
}

function hasSameCursorLineage(
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
): boolean {
  return target.programRef === source.programRef &&
    target.executionBasisRef === source.executionBasisRef &&
    target.traversalScopeRef === source.traversalScopeRef &&
    target.runId === source.runId &&
    target.graphCallId === source.graphCallId &&
    target.frameId === source.frameId &&
    target.graphRef === source.graphRef &&
    target.currentNodeRef === source.currentNodeRef &&
    target.position === "at_term";
}

function isDeclaredStructuralTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  routeKind: TraversalRouteKind,
): boolean {
  if (
    !hasSameCursorLineage(source, target) ||
    target.inputRef !== source.inputRef ||
    target.inputDigest !== source.inputDigest
  ) return false;
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  if (term.kind === "c_source_path_refusal") return false;
  const unchangedAttempt = target.attempt === source.attempt &&
    sameValues(target.retryPath.map(String), source.retryPath.map(String));
  switch (term.kind) {
    case "c_compose":
      return routeKind === "advance" &&
        sameValues(target.termPath, [...source.termPath, "terms", "0"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        unchangedAttempt;
    case "c_edge":
      return routeKind === "advance" &&
        sameValues(target.termPath, [...source.termPath, "transform"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        unchangedAttempt;
    case "c_batch":
      return routeKind === "advance" &&
        sameValues(target.termPath, [...source.termPath, "tasks", "0"]) &&
        target.taskOrdinal === 0 &&
        unchangedAttempt;
    case "c_retry":
      return routeKind === "retry" &&
        sameValues(target.termPath, [...source.termPath, "term"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        target.attempt === 1 &&
        sameValues(
          target.retryPath.map(String),
          [...source.retryPath, 1].map(String),
        );
    case "c_of":
    case "c_identity":
    case "c_workflow":
      return false;
  }
}

function hasJudgedRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
): evidence is RouteAdmissionEvidence {
  const cCall = evidence?.cCall;
  const result = evidence?.result;
  const judgment = evidence?.judgment;
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const locusMatches = term.kind === "c_of"
    ? cCall?.callClass === "leaf" && cCall.programLocusRef === term.programLocusRef
    : term.kind === "c_workflow"
      ? cCall?.callClass === "workflow" &&
        cCall.childGraphFunctionRef === term.graphFunctionRef &&
        cCall.inputContractRef === term.inputCarrierRef &&
        cCall.outputContractRef === term.outputCarrierRef
      : false;
  return cCall !== undefined &&
    result !== undefined &&
    judgment !== undefined &&
    locusMatches &&
    hasOpenedCCall(store, cCall) &&
    isAdmittedCCallResult(result) &&
    isAdmittedCCallJudgment(judgment) &&
    result.cCallRef === cCall.cCallRef &&
    judgment.cCallRef === cCall.cCallRef &&
    judgment.resultRef === result.resultRef &&
    judgment.resultDigest === result.resultDigest &&
    judgment.judgment === "advance" &&
    cCall.basisId === executionBasis.basisRef &&
    cCall.frameId === sourceCursor.frameId &&
    cCall.graphCallId === sourceCursor.graphCallId &&
    cCall.taskOrdinal === sourceCursor.taskOrdinal &&
    cCall.attempt === sourceCursor.attempt &&
    sameValues(cCall.retryPath.map(String), sourceCursor.retryPath.map(String)) &&
    candidate.cCallRef === cCall.cCallRef &&
    candidate.judgmentRef === judgment.judgmentRef &&
    candidate.consumedAvailabilityRefs.length === 1 &&
    candidate.consumedAvailabilityRefs[0] === judgment.judgmentRef &&
    candidate.contractRef === cCall.transitionContractRef;
}

function hasBlockedRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: BlockedRouteAdmissionEvidence | null,
): evidence is BlockedRouteAdmissionEvidence {
  if (
    evidence === null ||
    !hasOpenedCCall(store, evidence.cCall) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.judgmentRef ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    candidate.consumedAvailabilityRefs.length !== 1 ||
    candidate.consumedAvailabilityRefs[0] !== evidence.judgmentRef ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const judgmentEvent = store.readAll().find(
    (event) => event.eventId === evidence.judgmentEventRef,
  );
  return judgmentEvent?.kind === "c_call_judged" &&
    judgmentEvent.aggregateId === evidence.cCall.cCallRef &&
    isJsonRecord(judgmentEvent.payload) &&
    judgmentEvent.payload.judgmentRef === evidence.judgmentRef &&
    judgmentEvent.payload.judgment === "blocked" &&
    judgmentEvent.payload.reasonRef === evidence.reasonRef;
}

function isDeclaredJudgedTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  result: AdmittedCCallResult,
): boolean {
  if (!hasSameCursorLineage(source, target)) return false;
  const continuation = deriveCSourceContinuation(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  if (
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "advance" ||
    continuation.targetPath === null ||
    continuation.targetRetryDepth > source.retryPath.length
  ) {
    return false;
  }
  const retryPath = source.retryPath.slice(0, continuation.targetRetryDepth);
  const inputRef = continuation.relation === "batch_next"
    ? source.inputRef
    : result.resultRef;
  const inputDigest = continuation.relation === "batch_next"
    ? source.inputDigest
    : result.valueDigest;
  return sameValues(target.termPath, continuation.targetPath) &&
    target.inputRef === inputRef &&
    target.inputDigest === inputDigest &&
    target.taskOrdinal === continuation.targetTaskOrdinal &&
    target.attempt === (retryPath.at(-1) ?? 1) &&
    sameValues(target.retryPath.map(String), retryPath.map(String));
}

function isDeclaredTerminalSource(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
): boolean {
  const continuation = deriveCSourceContinuation(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  return continuation.kind === "c_source_continuation" &&
    continuation.disposition === "terminal" &&
    continuation.targetPath === null &&
    graph.template.terminalNodeRefs.includes(source.currentNodeRef);
}

export function admitRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  replayState: ReplayState,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
  evidence: RouteAdmissionEvidence | BlockedRouteAdmissionEvidence | null = null,
  options: RouteAdmissionOptions = {},
): RouteAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.basisRef !== sourceCursor.executionBasisRef ||
    executionBasis.programRef !== sourceCursor.programRef ||
    executionBasis.graphRef !== sourceCursor.graphRef ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.graphDigest !== graph.materializationDigest
  ) {
    return refusal(
      "basis_mismatch",
      "route admission requires the exact admitted ExecutionBasis and original Graph",
    );
  }
  if (
    !isMaterializedGtlGraph(graph) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.cursorRef !== candidate.sourceCursorRef ||
    sourceCursor.cursorDigest !== candidate.sourceCursorDigest
  ) {
    return refusal(
      "cursor_mismatch",
      "route source is not an admitted cursor under the exact original Graph",
    );
  }
  const currentReplay = replay(store, { runId: sourceCursor.runId });
  const frameEvents = store.readAll().filter(
    (event) => event.runId === sourceCursor.runId && event.frameId === sourceCursor.frameId,
  );
  const latestRouteEvent = frameEvents.slice().reverse().find(
    (event) => event.kind === "traversal_route_admitted",
  );
  const initialCursorEvent = frameEvents.slice().reverse().find(
    (event) => event.kind === "traversal_cursor_entered",
  );
  const currentCursorRef = latestRouteEvent !== undefined &&
      isJsonRecord(latestRouteEvent.payload)
    ? latestRouteEvent.payload.targetCursorRef
    : initialCursorEvent !== undefined && isJsonRecord(initialCursorEvent.payload)
      ? initialCursorEvent.payload.cursorRef
      : null;
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    currentCursorRef !== sourceCursor.cursorRef
  ) {
    return refusal(
      "replay_mismatch",
      "route candidate is not based on the current replay cursor and truth",
    );
  }
  const body = candidateBody(candidate);
  const expectedDigest = sha256Canonical(body);
  if (
    candidate.declarationRef !== graph.materializationRef ||
    candidate.declarationDigest !== graph.materializationDigest ||
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.candidateDigest !== expectedDigest ||
    candidate.candidateRef !==
      `route-candidate://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return refusal(
      "candidate_mismatch",
      "route candidate identity or transition contract differs from admitted truth",
    );
  }
  if (
    store.readAll().some(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.sourceCursorRef === sourceCursor.cursorRef,
    )
  ) {
    return refusal(
      "route_already_admitted",
      "one traversal cursor cannot admit a second outgoing route",
    );
  }

  let causationEventRef = traversalCursorAdmissionEventRef(store, sourceCursor);
  if (candidate.routeKind === "terminal") {
    const judgedEvidence = evidence !== null && "result" in evidence ? evidence : null;
    if (!hasJudgedRouteEvidence(
      store,
      executionBasis,
      graph,
      sourceCursor,
      candidate,
      judgedEvidence,
    )) {
      return refusal(
        "judgment_mismatch",
        "terminal route requires this cursor's admitted CCall advance judgment",
      );
    }
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      !isDeclaredTerminalSource(graph, sourceCursor)
    ) {
      return refusal(
        "terminal_not_declared",
        "terminal route differs from the exact GTL declaration or carries a target cursor",
      );
    }
    causationEventRef = judgedEvidence.judgment.admissionEventRef;
  } else if (candidate.routeKind === "advance" || candidate.routeKind === "retry") {
    if (
      targetCursor === null ||
      !isTraversalCursorCandidate(targetCursor) ||
      hasAdmittedTraversalCursor(store, targetCursor) ||
      candidate.targetCursorRef !== targetCursor.cursorRef ||
      candidate.targetCursorDigest !== targetCursor.cursorDigest
    ) {
      return refusal(
        "candidate_mismatch",
        "route target is not one exact new cursor under the admitted GTL Graph",
      );
    }
    if (evidence === null) {
      if (
        candidate.cCallRef !== null ||
        candidate.judgmentRef !== null ||
        candidate.consumedAvailabilityRefs.length !== 0 ||
        candidate.contractRef !== null ||
        !isDeclaredStructuralTarget(
          graph,
          sourceCursor,
          targetCursor,
          candidate.routeKind,
        )
      ) {
        return refusal(
          "candidate_mismatch",
          "structural route is not the exact next cursor declared by the original GTL term",
        );
      }
    } else if ("result" in evidence) {
      if (
        candidate.routeKind !== "advance" ||
        !hasJudgedRouteEvidence(
          store,
          executionBasis,
          graph,
          sourceCursor,
          candidate,
          evidence,
        ) ||
        !isDeclaredJudgedTarget(graph, sourceCursor, targetCursor, evidence.result)
      ) {
        return refusal(
          "judgment_mismatch",
          "post-judgment route is not the exact declared GTL continuation",
        );
      }
      causationEventRef = evidence.judgment.admissionEventRef;
    } else {
      return refusal(
        "judgment_mismatch",
        "advance route requires admitted result and judgment evidence",
      );
    }
  } else if (candidate.routeKind === "blocked") {
    const blockedEvidence = evidence !== null && "judgmentEventRef" in evidence
      ? evidence
      : null;
    if (!hasBlockedRouteEvidence(
      store,
      executionBasis,
      sourceCursor,
      candidate,
      blockedEvidence,
    )) {
      return refusal(
        "judgment_mismatch",
        "blocked route requires this cursor's admitted blocked CCall judgment",
      );
    }
    causationEventRef = blockedEvidence.judgmentEventRef;
  } else {
    return refusal(
      "route_kind_not_supported",
      "hold and failed routes require their declared runtime evidence",
    );
  }
  if (causationEventRef === null) {
    return refusal(
      "cursor_mismatch",
      "route source has no admitted cursor event",
    );
  }

  const routeDigest = sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const routeEventCandidate = {
    kind: "traversal_route_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [causationEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { routeRef, routeDigest, ...body },
  } as const;
  const admittedEvents = candidate.routeKind === "blocked" && options.terminalizeRun !== false
    ? admitRuntimeEventBatch(store, [
        () => routeEventCandidate,
        (batch) => ({
          kind: "run_stopped",
          eventTime: basis.eventTime,
          aggregateType: "run",
          aggregateId: sourceCursor.runId,
          parentAggregateId: null,
          causationEventRefs: [batch[0]!.eventId],
          correlationId: `${basis.correlationId}/run-stopped`,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: executionBasis.basisRef,
          runId: sourceCursor.runId,
          graphFunctionRef: executionBasis.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          payload: {
            disposition: "blocked",
            routeRef,
            cCallRef: candidate.cCallRef,
            judgmentRef: candidate.judgmentRef,
            reasonRef: evidence !== null && "reasonRef" in evidence
              ? evidence.reasonRef
              : "reason://abiogenesis/blocked@5",
          },
        }),
      ])
    : [admitRuntimeEvent(store, routeEventCandidate)];
  const event = admittedEvents[0]!;
  const admitted = deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef,
    routeDigest,
    ...body,
    admissionEventRef: event.eventId,
    runStoppedEventRef: admittedEvents[1]?.eventId ?? null,
  }) as AdmittedRoute;
  admittedRoutes.add(admitted);
  return admitted;
}
