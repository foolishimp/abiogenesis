import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
} from "../abg/c_call.js";
import type { RetryProgressAdmission } from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type { RouteCandidate } from "../abg/traversal_route.js";
import type { GtlGraph } from "../gtl/contracts.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isTraversalStep,
  type TraversalStep,
  type TraversalStopRef,
} from "./traversal.js";

export interface RouteProposalRefusal {
  readonly kind: "traversal_route_proposal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "judgment_not_advance"
    | "retry_progress_missing"
    | "structural_step_missing"
    | "terminal_not_declared";
  readonly message: string;
}

export function proposeStructuralRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  replayState: ReplayState,
): RouteCandidate | RouteProposalRefusal {
  const targetCursor = step.targetCursor;
  const routeKind = step.directStep.stepKind === "retry"
    ? "retry" as const
    : step.directStep.stepKind === "enter_term" ||
        step.directStep.stepKind === "start_task"
      ? "advance" as const
      : null;
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    routeKind === null ||
    targetCursor === null ||
    step.sourceCursor.graphRef !== graph.materializationRef ||
    targetCursor.graphRef !== graph.materializationRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message: "structural route requires one HoG-derived target under the original GTL Graph",
    };
  }
  const body = {
    routeKind,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
    cCallRef: null,
    judgmentRef: null,
    consumedAvailabilityRefs: [] as const,
    contractRef: null,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}

export function proposeRetryRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  cCall: CCall,
  progress: RetryProgressAdmission,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    step.directStep.stepKind !== "continue_term" ||
    step.directStep.relation !== "retry_same_edge" ||
    step.targetCursor === null ||
    progress.cCallRef !== cCall.cCallRef ||
    progress.judgmentRef.length === 0 ||
    progress.remainingBudget < 1
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "retry_progress_missing",
      message: "retry route requires one admitted bounded progress row and HoG-derived target",
    };
  }
  const body = {
    routeKind: "retry" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: step.targetCursor.cursorRef,
    targetCursorDigest: step.targetCursor.cursorDigest,
    cCallRef: cCall.cCallRef,
    judgmentRef: progress.judgmentRef,
    consumedAvailabilityRefs: [progress.progressRef],
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}

export function proposeTerminalRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (judgment.judgment !== "advance") {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "judgment_not_advance",
      message: "terminal route requires an admitted advance judgment",
    };
  }
  const continuation = deriveCSourceContinuation(
    graph.template,
    stop.cursor.currentNodeRef,
    stop.cursor.termPath,
  );
  if (
    stop.programLocusRef !== cCall.programLocusRef ||
    !graph.template.terminalNodeRefs.includes(stop.nodeRef) ||
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "terminal"
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "terminal_not_declared",
      message: "current GTL locus is not a declared terminal node",
    };
  }
  const body = {
    routeKind: "terminal" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef],
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}

export function proposeJudgedRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (judgment.judgment !== "advance") {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "judgment_not_advance",
      message: "post-judgment route requires an admitted advance judgment",
    };
  }
  const targetCursor = step.targetCursor;
  const routeKind = step.directStep.stepKind === "continue_term"
    ? "advance" as const
    : step.directStep.stepKind === "complete_term"
      ? "terminal" as const
      : null;
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    routeKind === null ||
    (routeKind === "advance" && targetCursor === null) ||
    (routeKind === "terminal" && targetCursor !== null) ||
    step.sourceCursor.graphRef !== graph.materializationRef ||
    step.sourceCursor.frameId !== cCall.frameId ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.cCallRef !== cCall.cCallRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message: "judged route requires HoG's exact declared continuation step",
    };
  }
  const body = {
    routeKind,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: targetCursor?.cursorRef ?? null,
    targetCursorDigest: targetCursor?.cursorDigest ?? null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}

export function proposeBlockedRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgmentRef: string,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    stop.cursor.graphRef !== graph.materializationRef ||
    stop.cursor.frameId !== cCall.frameId ||
    stop.programLocusRef !== cCall.programLocusRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message: "blocked route requires the exact open CCall and source cursor",
    };
  }
  const body = {
    routeKind: "blocked" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef,
    consumedAvailabilityRefs: [judgmentRef] as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}

export function proposeWorkflowBlockedRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  cCall: CCall,
  judgmentRef: string,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    step.directStep.stepKind !== "enter_child" ||
    step.targetCursor !== null ||
    step.sourceCursor.graphRef !== graph.materializationRef ||
    step.sourceCursor.frameId !== cCall.frameId ||
    cCall.callClass !== "workflow" ||
    cCall.childGraphFunctionRef !== step.directStep.graphFunctionRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message: "blocked workflow route requires the exact transparent parent CCall",
    };
  }
  const body = {
    routeKind: "blocked" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef,
    consumedAvailabilityRefs: [judgmentRef] as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}
