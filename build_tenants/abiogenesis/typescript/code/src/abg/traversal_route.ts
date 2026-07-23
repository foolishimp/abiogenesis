import type {
  FanOutApplication,
  GtlGraph,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import {
  deriveCSourceContinuation,
  resolveEnclosingCBatchRef,
  resolveEnclosingCRetryContexts,
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
  type FanOutCompletionAdmission,
} from "./fan_out.js";
import {
  isAdmittedApplicationChildFoldback,
  isAdmittedApplicationChildPreparationRefusal,
  type ApplicationChildFoldbackAdmission,
  type ApplicationChildPreparationRefusalAdmission,
} from "./graph_application.js";
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
  isAdmittedRetryProgress,
  type RetryProgressAdmission,
} from "./retry.js";
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

export interface RetryRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly progress: RetryProgressAdmission;
}

export interface FanOutRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly application: Readonly<FanOutApplication>;
  readonly completion: FanOutCompletionAdmission;
}

export interface RouteAdmissionOptions {
  readonly terminalizeRun?: boolean;
}

export interface RecursionRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly foldback: ApplicationChildFoldbackAdmission | null;
  readonly preparationRefusal?:
    | ApplicationChildPreparationRefusalAdmission
    | null;
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
    target.position === "at_term";
}

function materializedMemberInput(
  graph: Readonly<GtlGraph>,
  batchRef: string,
  taskOrdinal: number | null,
): { readonly inputRef: string; readonly inputDigest: Sha256Digest } | null {
  if (taskOrdinal === null) return null;
  const member = graph.fanOutMaterializations.find(
    (candidate) => candidate.batchRef === batchRef,
  )?.members[taskOrdinal];
  return member === undefined
    ? null
    : {
        inputRef: member.memberRef,
        inputDigest: member.memberDigest,
      };
}

function isDeclaredStructuralTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  routeKind: TraversalRouteKind,
): boolean {
  if (
    !hasSameCursorLineage(source, target) ||
    target.currentNodeRef !== source.currentNodeRef
  ) return false;
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  if (term.kind === "c_source_path_refusal") return false;
  const structuralInput = term.kind === "c_batch"
    ? materializedMemberInput(graph, term.batchRef, target.taskOrdinal) ?? source
    : source;
  if (
    target.inputRef !== structuralInput.inputRef ||
    target.inputDigest !== structuralInput.inputDigest
  ) return false;
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

function hasRetryRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RetryRouteAdmissionEvidence | null,
): evidence is RetryRouteAdmissionEvidence {
  if (
    evidence === null ||
    !hasOpenedCCall(store, evidence.cCall) ||
    !isAdmittedRetryProgress(evidence.progress) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    !sameValues(
      evidence.cCall.retryPath.map(String),
      sourceCursor.retryPath.map(String),
    ) ||
    evidence.progress.cCallRef !== evidence.cCall.cCallRef ||
    evidence.progress.attempt !== sourceCursor.attempt ||
    evidence.progress.remainingBudget < 1 ||
    candidate.routeKind !== "retry" ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.progress.judgmentRef ||
    !sameValues(candidate.consumedAvailabilityRefs, [
      evidence.progress.judgmentRef,
      evidence.progress.progressRef,
    ]) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if ("kind" in contexts) return false;
  const context = contexts.at(-1);
  if (
    context === undefined ||
    context.retryDepth !== sourceCursor.retryPath.length ||
    context.retryDepth !== targetCursor.retryPath.length ||
    evidence.progress.retryBoundaryRef.length === 0
  ) return false;
  const nextAttempt = sourceCursor.attempt + 1;
  return hasSameCursorLineage(sourceCursor, targetCursor) &&
    targetCursor.currentNodeRef === sourceCursor.currentNodeRef &&
    sameValues(targetCursor.termPath, context.wrappedTermPath) &&
    targetCursor.taskOrdinal === context.taskOrdinal &&
    targetCursor.attempt === nextAttempt &&
    sameValues(
      targetCursor.retryPath.map(String),
      [...sourceCursor.retryPath.slice(0, -1), nextAttempt].map(String),
    ) &&
    targetCursor.inputRef === evidence.progress.inputRef &&
    targetCursor.inputDigest === evidence.progress.inputDigest;
}

function hasFanOutRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: FanOutRouteAdmissionEvidence | null,
): evidence is FanOutRouteAdmissionEvidence {
  const replayedCompletion = evidence === null
    ? undefined
    : replay(store, {
        runId: sourceCursor.runId,
      }).fanOutCompletions.find(
        (completion) =>
          completion.completionRef === evidence.completion.completionRef &&
          completion.admissionEventRef ===
            evidence.completion.admissionEventRef,
      );
  if (
    evidence === null ||
    !hasOpenedCCall(store, evidence.cCall) ||
    replayedCompletion === undefined ||
    sha256Canonical(evidence.completion as unknown as JsonValue) !==
      sha256Canonical(replayedCompletion as unknown as JsonValue) ||
    graph.template.applications.find(
      (application) =>
        application.applicationRef === evidence.application.applicationRef,
    ) !== evidence.application ||
    evidence.application.relationKind !== "fan_out" ||
    evidence.application.applicationRef !==
      graphFunctionApplicationRef(evidence.application) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.batchRef !== evidence.application.batchRef ||
    evidence.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.completion.applicationRef !== evidence.application.applicationRef ||
    evidence.completion.batchRef !== evidence.application.batchRef ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    !sameValues(candidate.consumedAvailabilityRefs, [
      evidence.completion.completionKind === "complete_vector"
        ? evidence.completion.taskRows.at(-1)?.judgmentRef ?? ""
        : evidence.completion.stoppingRow.judgmentRef,
      evidence.application.applicationRef,
    ]) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const completionEvent = store.readAll().find(
    (event) =>
      event.kind === "fan_out_completion_admitted" &&
      event.eventId === evidence.completion.admissionEventRef &&
      event.frameId === sourceCursor.frameId,
  );
  if (completionEvent === undefined) return false;
  if (evidence.completion.completionKind === "partial_stop") {
    return candidate.routeKind === "blocked" &&
      targetCursor === null &&
      candidate.targetCursorRef === null &&
      candidate.targetCursorDigest === null &&
      candidate.judgmentRef === evidence.completion.stoppingRow.judgmentRef &&
      evidence.completion.stoppingRow.cCallRef === evidence.cCall.cCallRef &&
      evidence.completion.stoppingRow.ordinal === sourceCursor.taskOrdinal;
  }
  const lastRow = evidence.completion.taskRows.at(-1);
  if (
    candidate.routeKind !== "advance" ||
    targetCursor === null ||
    lastRow === undefined ||
    lastRow.cCallRef !== evidence.cCall.cCallRef ||
    lastRow.ordinal !== sourceCursor.taskOrdinal ||
    candidate.judgmentRef !== lastRow.judgmentRef ||
    candidate.targetCursorRef !== targetCursor.cursorRef ||
    candidate.targetCursorDigest !== targetCursor.cursorDigest ||
    !hasSameCursorLineage(sourceCursor, targetCursor) ||
    targetCursor.inputRef !== evidence.completion.outputVectorRef ||
    targetCursor.inputDigest !== evidence.completion.outputVectorDigest
  ) return false;
  const continuation = deriveCSourceContinuation(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "advance" ||
    continuation.relation !== "compose_next" ||
    continuation.targetPath === null ||
    !sameValues(targetCursor.termPath, continuation.targetPath)
  ) return false;
  const targetTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    targetCursor.currentNodeRef,
    targetCursor.termPath,
  );
  const fanInApplication = graph.template.applications.find(
    (application) =>
      application.relationKind === "fan_in" &&
      application.inputVectorRef === evidence.application.outputVectorRef,
  );
  return targetTerm.kind === "c_workflow" &&
    fanInApplication?.relationKind === "fan_in" &&
    targetTerm.graphFunctionRef === fanInApplication.reducerGraphFunctionRef;
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
  let inputRef = result.resultRef;
  let inputDigest = result.valueDigest;
  if (continuation.relation === "batch_next") {
    const batchRef = resolveEnclosingCBatchRef(
      graph.template,
      source.currentNodeRef,
      source.termPath,
    );
    const memberInput = typeof batchRef === "string"
      ? materializedMemberInput(graph, batchRef, continuation.targetTaskOrdinal)
      : null;
    inputRef = memberInput?.inputRef ?? source.inputRef;
    inputDigest = memberInput?.inputDigest ?? source.inputDigest;
  }
  return target.currentNodeRef === continuation.targetPath[1] &&
    sameValues(target.termPath, continuation.targetPath) &&
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
  evidence:
    | RouteAdmissionEvidence
    | BlockedRouteAdmissionEvidence
    | FanOutRouteAdmissionEvidence
    | RetryRouteAdmissionEvidence
    | null = null,
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
    } else if ("completion" in evidence) {
      if (
        candidate.routeKind !== "advance" ||
        !hasFanOutRouteEvidence(
          store,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          evidence,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "fan-out route requires exact admitted complete-vector truth",
        );
      }
      causationEventRef = evidence.completion.admissionEventRef;
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
    } else if (
      "progress" in evidence &&
      candidate.routeKind === "retry" &&
      hasRetryRouteEvidence(
        store,
        executionBasis,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        evidence,
      )
    ) {
      causationEventRef = evidence.progress.admissionEventRef;
    } else {
      return refusal(
        "judgment_mismatch",
        "post-call route requires admitted judgment or retry-progress evidence",
      );
    }
  } else if (candidate.routeKind === "blocked") {
    if (evidence !== null && "completion" in evidence) {
      if (!hasFanOutRouteEvidence(
        store,
        executionBasis,
        graph,
        sourceCursor,
        null,
        candidate,
        evidence,
      )) {
        return refusal(
          "judgment_mismatch",
          "fan-out blocked route requires exact admitted partial-stop truth",
        );
      }
      causationEventRef = evidence.completion.admissionEventRef;
    } else {
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
    }
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
              : evidence !== null && "completion" in evidence &&
                  evidence.completion.completionKind === "partial_stop"
                ? "reason://abiogenesis/fan-out-partial-stop@5"
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

export function admitRecursionRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  replayState: ReplayState,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
  evidence: RecursionRouteAdmissionEvidence,
): RouteAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.basisRef !== sourceCursor.executionBasisRef ||
    executionBasis.graphRef !== graph.materializationRef ||
    !isMaterializedGtlGraph(graph) ||
    graph.template.applications.find(
      (row) => row.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application)
  ) {
    return refusal(
      "basis_mismatch",
      "recursion route requires one exact admitted Graph and recurse application",
    );
  }
  if (
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.executionBasisRef !== executionBasis.basisRef
  ) {
    return refusal(
      "cursor_mismatch",
      "recursion route source is not the admitted application cursor",
    );
  }
  const events = store.readAll();
  const frameEvents = events.filter(
    (event) =>
      event.runId === sourceCursor.runId &&
      event.frameId === sourceCursor.frameId,
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
    replay(store, { runId: sourceCursor.runId }).replayDigest !==
      replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    currentCursorRef !== sourceCursor.cursorRef ||
    events.some(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        isJsonRecord(event.payload) &&
        event.payload.sourceCursorRef === sourceCursor.cursorRef,
    )
  ) {
    return refusal(
      "replay_mismatch",
      "recursion route does not extend the current parent cursor exactly once",
    );
  }
  const applicationDigest = sha256Canonical(application as unknown as JsonValue);
  const body = candidateBody(candidate);
  const expectedDigest = sha256Canonical(body);
  if (
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.declarationRef !== application.applicationRef ||
    candidate.declarationDigest !== applicationDigest ||
    candidate.candidateDigest !== expectedDigest ||
    candidate.candidateRef !==
      `route-candidate://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return refusal(
      "candidate_mismatch",
      "recursion route candidate differs from the exact GTL application",
    );
  }
  const {
    cCall,
    result,
    judgment,
    foldback,
    preparationRefusal = null,
  } = evidence;
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    sourceTerm.kind === "c_source_path_refusal" ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== application.applicationRef ||
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallResult(result) ||
    !isAdmittedCCallJudgment(judgment) ||
    cCall.basisId !== executionBasis.basisRef ||
    cCall.frameId !== sourceCursor.frameId ||
    cCall.graphCallId !== sourceCursor.graphCallId ||
    cCall.attempt !== sourceCursor.attempt ||
    cCall.compositionRef !== application.applicationRef ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.judgment !== "advance" ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.judgmentRef !== judgment.judgmentRef ||
    candidate.contractRef !== cCall.transitionContractRef ||
    recursionTerminationDecision(application, result.value) !== false
  ) {
    return refusal(
      "judgment_mismatch",
      "recursion route requires one admitted non-terminal evaluator judgment",
    );
  }
  let causationEventRef: string;
  if (candidate.routeKind === "advance") {
    if (
      targetCursor === null ||
      !isTraversalCursorCandidate(targetCursor) ||
      hasAdmittedTraversalCursor(store, targetCursor) ||
      foldback === null ||
      preparationRefusal !== null ||
      !isAdmittedApplicationChildFoldback(foldback) ||
      foldback.applicationRef !== application.applicationRef ||
      foldback.parentCCallRef !== cCall.cCallRef ||
      foldback.parentJudgmentRef !== judgment.judgmentRef ||
      foldback.sourceCursorRef !== sourceCursor.cursorRef ||
      foldback.childDisposition !== "closed" ||
      sourceCursor.attempt >= application.bound ||
      !hasSameCursorLineage(sourceCursor, targetCursor) ||
      targetCursor.currentNodeRef !== sourceCursor.currentNodeRef ||
      !sameValues(targetCursor.termPath, sourceCursor.termPath) ||
      targetCursor.taskOrdinal !== sourceCursor.taskOrdinal ||
      targetCursor.attempt !== sourceCursor.attempt + 1 ||
      !sameValues(
        targetCursor.retryPath.map(String),
        sourceCursor.retryPath.map(String),
      ) ||
      targetCursor.inputRef !== foldback.childResultRef ||
      targetCursor.inputDigest !== foldback.outputDigest ||
      candidate.targetCursorRef !== targetCursor.cursorRef ||
      candidate.targetCursorDigest !== targetCursor.cursorDigest ||
      !sameValues(candidate.consumedAvailabilityRefs, [
        judgment.judgmentRef,
        foldback.foldbackRef,
      ])
    ) {
      return refusal(
        "candidate_mismatch",
        "recursion advance must consume one admitted child foldback into the next bounded parent attempt",
      );
    }
    causationEventRef = foldback.admissionEventRef;
  } else if (candidate.routeKind === "blocked") {
    const blockedByPreparation =
      preparationRefusal !== null &&
      isAdmittedApplicationChildPreparationRefusal(preparationRefusal) &&
      preparationRefusal.applicationRef === application.applicationRef &&
      preparationRefusal.parentCCallRef === cCall.cCallRef &&
      preparationRefusal.parentJudgmentRef === judgment.judgmentRef &&
      preparationRefusal.sourceCursorRef === sourceCursor.cursorRef;
    const blockedByChild =
      foldback !== null &&
      isAdmittedApplicationChildFoldback(foldback) &&
      foldback.applicationRef === application.applicationRef &&
      foldback.parentCCallRef === cCall.cCallRef &&
      foldback.parentJudgmentRef === judgment.judgmentRef &&
      foldback.sourceCursorRef === sourceCursor.cursorRef &&
      foldback.childDisposition === "blocked";
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      (
        blockedByChild
          ? preparationRefusal !== null ||
            !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
              foldback.foldbackRef,
            ])
          : blockedByPreparation
          ? !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
              preparationRefusal.refusalRef,
            ])
          : foldback !== null ||
            sourceCursor.attempt < application.bound ||
            !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
            ])
      )
    ) {
      return refusal(
        "candidate_mismatch",
        "recursion bound refusal must stop at the exact declared positive bound",
      );
    }
    causationEventRef = blockedByChild
      ? foldback.admissionEventRef
      : blockedByPreparation
        ? preparationRefusal.admissionEventRef
        : judgment.admissionEventRef;
  } else {
    return refusal(
      "route_kind_not_supported",
      "recursion application admits only advance or bounded blocked routes",
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
  const admittedEvents = candidate.routeKind === "blocked"
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
            cCallRef: cCall.cCallRef,
            judgmentRef: judgment.judgmentRef,
            reasonRef: foldback?.childReasonRef ??
              preparationRefusal?.diagnosticRef ??
              "reason://abiogenesis/recursion/bound-exhausted@5",
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
