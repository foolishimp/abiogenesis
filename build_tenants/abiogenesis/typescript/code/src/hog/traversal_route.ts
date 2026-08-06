import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
} from "../abg/c_call.js";
import type { FanOutCompletionAdmission } from "../abg/fan_out.js";
import type { FhInteractionResumeAdmission } from "../abg/continuation.js";
import type {
  RetryCompletedProgressAdmission,
  RetryProgressAdmission,
} from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type {
  GraphSpanReentryProjection,
  RouteCandidate,
} from "../abg/traversal_route.js";
import {
  type ApplicationChildFoldbackAdmission,
  type ApplicationChildPreparationRefusalAdmission,
} from "../abg/graph_application.js";
import type {
  FanOutApplication,
  GtlGraph,
  RecurseApplication,
} from "../gtl/contracts.js";
import { graphFunctionApplicationRef } from "../gtl/graph_applications.js";
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
    | "gap_stop_not_declared"
    | "graph_span_reentry_not_declared"
    | "judgment_not_advance"
    | "judgment_not_pending"
    | "resume_not_admitted"
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
        step.directStep.stepKind === "start_task" ||
        (
          step.directStep.stepKind === "continue_term" &&
          step.directStep.termKind === "c_identity"
        )
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
    progress.progressClass !== "retry" ||
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
    consumedAvailabilityRefs: [
      progress.judgmentRef,
      progress.progressRef,
    ],
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
  completedProgresses: readonly RetryCompletedProgressAdmission[] = [],
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
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ],
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

export function proposeGraphSpanReentryRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
  projection: Readonly<GraphSpanReentryProjection>,
): RouteCandidate | RouteProposalRefusal {
  const targetCursor = step.targetCursor;
  const application = graph.template.applications.find(
    (candidate) =>
      candidate.relationKind === "re_enter" &&
      candidate.applicationRef === projection.applicationRef,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    step.directStep.stepKind !== "continue_term" ||
    step.directStep.relation !== "graph_span_reentry" ||
    targetCursor === null ||
    judgment.judgment !== "advance" ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    step.sourceCursor.graphRef !== graph.materializationRef ||
    step.sourceCursor.frameId !== cCall.frameId ||
    application?.relationKind !== "re_enter" ||
    application.graphFunctionRef !== graph.graphFunctionRef ||
    application.sourceProgramLocusRef !== cCall.programLocusRef ||
    application.targetProgramLocusRef !==
      projection.targetProgramLocusRef ||
    projection.graphFunctionRef !== graph.graphFunctionRef ||
    projection.sourceProgramLocusRef !== cCall.programLocusRef ||
    targetCursor.inputRef !== projection.targetInputRef ||
    targetCursor.inputDigest !== projection.targetInputDigest
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "graph_span_reentry_not_declared",
      message:
        "graph-span re-entry requires one Product projection and HoG-derived target under the exact declared application",
    };
  }
  const body = {
    routeKind: "re_enter" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
    graphSpanReentryProjectionRef: projection.projectionRef,
    graphSpanReentryProjectionDigest: projection.projectionDigest,
    graphSpanReentryProjection:
      projection as unknown as Readonly<Record<string, JsonValue>>,
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

export function proposeGapStopRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  const projection =
    typeof result.value === "object" &&
      result.value !== null &&
      !Array.isArray(result.value)
      ? result.value as Readonly<Record<string, JsonValue>>
      : null;
  if (
    !isMaterializedGtlGraph(graph) ||
    stop.cursor.graphRef !== graph.materializationRef ||
    stop.cursor.frameId !== cCall.frameId ||
    stop.programLocusRef !== cCall.programLocusRef ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.judgment !== "advance" ||
    projection === null ||
    projection.kind !== "next_action_projection" ||
    projection.disposition !== "no_action" ||
    ![
      "gap_stop",
      "reprice_required",
      "repair",
      "inspect_runtime_archive",
      "reprice",
      "escalate",
    ].includes(String(projection.noActionDisposition))
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "gap_stop_not_declared",
      message:
        "gap_stop requires the exact judged Product no-action projection at the current cursor",
    };
  }
  const nextActionProjectionRef = projection.projectionRef;
  const nextActionProjectionDigest = projection.projectionDigest;
  if (
    typeof nextActionProjectionRef !== "string" ||
    typeof nextActionProjectionDigest !== "string"
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "gap_stop_not_declared",
      message: "gap_stop projection lacks its exact Product identity",
    };
  }
  const body = {
    routeKind: "gap_stop" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
    nextActionProjectionRef,
    nextActionProjectionDigest,
    nextActionProjection: projection,
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

export function proposeFailedRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    stop.cursor.graphRef !== graph.materializationRef ||
    stop.cursor.frameId !== cCall.frameId ||
    stop.programLocusRef !== cCall.programLocusRef ||
    result.cCallRef !== cCall.cCallRef ||
    result.resultClass !== "failure" ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.resultDigest !== result.resultDigest ||
    judgment.judgment !== "blocked"
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message:
        "failed route requires the exact admitted failure result, judgment, and source cursor",
    };
  }
  const body = {
    routeKind: "failed" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
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

export function proposeHoldRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    stop.stopClass !== "interaction" ||
    stop.cursor.graphRef !== graph.materializationRef ||
    stop.cursor.frameId !== cCall.frameId ||
    stop.programLocusRef !== cCall.programLocusRef ||
    cCall.regime !== "F_H" ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "pending" ||
    contractRef !== cCall.continuationContractRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "judgment_not_pending",
      message:
        "hold route requires the exact F_H locus and admitted pending judgment",
    };
  }
  const body = {
    routeKind: "hold" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
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

export function proposeInteractionResumeTerminalRoute(
  graph: Readonly<GtlGraph>,
  cursor: TraversalStopRef["cursor"],
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  resume: FhInteractionResumeAdmission,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  const continuation = deriveCSourceContinuation(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    cursor.graphRef !== graph.materializationRef ||
    cursor.frameId !== cCall.frameId ||
    cursor.graphCallId !== cCall.graphCallId ||
    cursor.cursorRef !== resume.successorCursorRef ||
    cursor.cursorDigest !== resume.successorCursorDigest ||
    cursor.inputRef !== resume.successorInputRef ||
    cursor.inputDigest !== resume.successorInputDigest ||
    cCall.regime !== "F_H" ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "pending" ||
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "terminal" ||
    !graph.template.terminalNodeRefs.includes(cursor.currentNodeRef) ||
    contractRef !== cCall.transitionContractRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "resume_not_admitted",
      message:
        "F_H resume route requires the exact admitted response cursor at a declared terminal locus",
    };
  }
  const body = {
    routeKind: "terminal" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: cursor.cursorRef,
    sourceCursorDigest: cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      resume.admissionEventRef,
    ] as const,
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

export function proposeInteractionResumeRoute(
  graph: Readonly<GtlGraph>,
  step: TraversalStep,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  resume: FhInteractionResumeAdmission,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  const cursor = step.sourceCursor;
  const continuation = deriveCSourceContinuation(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  const terminal =
    continuation.kind === "c_source_continuation" &&
    continuation.disposition === "terminal" &&
    continuation.targetPath === null &&
    step.directStep.stepKind === "complete_term" &&
    step.targetCursor === null &&
    graph.template.terminalNodeRefs.includes(cursor.currentNodeRef);
  const advancing =
    continuation.kind === "c_source_continuation" &&
    continuation.disposition === "advance" &&
    continuation.targetPath !== null &&
    step.directStep.stepKind === "continue_term" &&
    step.targetCursor !== null;
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalStep(step) ||
    cursor.graphRef !== graph.materializationRef ||
    cursor.frameId !== cCall.frameId ||
    cursor.graphCallId !== cCall.graphCallId ||
    cursor.cursorRef !== resume.successorCursorRef ||
    cursor.cursorDigest !== resume.successorCursorDigest ||
    cursor.inputRef !== resume.successorInputRef ||
    cursor.inputDigest !== resume.successorInputDigest ||
    cCall.regime !== "F_H" ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "pending" ||
    (!terminal && !advancing) ||
    contractRef !== cCall.transitionContractRef
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "resume_not_admitted",
      message:
        "F_H resume route requires the exact admitted response and GTL-declared continuation",
    };
  }
  const body = {
    routeKind: terminal ? "terminal" as const : "advance" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: cursor.cursorRef,
    sourceCursorDigest: cursor.cursorDigest,
    targetCursorRef: step.targetCursor?.cursorRef ?? null,
    targetCursorDigest: step.targetCursor?.cursorDigest ?? null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      resume.admissionEventRef,
    ] as const,
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

export function proposeFanOutRoute(
  graph: Readonly<GtlGraph>,
  application: Readonly<FanOutApplication>,
  step: TraversalStep,
  cCall: CCall,
  completion: FanOutCompletionAdmission,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  const complete = completion.completionKind === "complete_vector";
  const taskRow = complete
    ? completion.taskRows.at(-1)
    : completion.stoppingRow;
  if (
    !isMaterializedGtlGraph(graph) ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "fan_out" ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    !isTraversalStep(step) ||
    step.sourceCursor.graphRef !== graph.materializationRef ||
    step.sourceCursor.frameId !== cCall.frameId ||
    cCall.batchRef !== application.batchRef ||
    taskRow === undefined ||
    taskRow.cCallRef !== cCall.cCallRef ||
    taskRow.ordinal !== step.sourceCursor.taskOrdinal ||
    completion.applicationRef !== application.applicationRef ||
    (
      complete
        ? step.directStep.stepKind !== "continue_term" ||
          step.directStep.relation !== "compose_next" ||
          step.targetCursor === null ||
          step.targetCursor.inputRef !== completion.outputVectorRef ||
          step.targetCursor.inputDigest !== completion.outputVectorDigest
        : step.targetCursor !== null
    )
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message:
        "fan-out route requires the exact terminal task cursor and admitted completion variant",
    };
  }
  const body = {
    routeKind: complete ? "advance" as const : "blocked" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: step.sourceCursor.cursorRef,
    sourceCursorDigest: step.sourceCursor.cursorDigest,
    targetCursorRef: step.targetCursor?.cursorRef ?? null,
    targetCursorDigest: step.targetCursor?.cursorDigest ?? null,
    cCallRef: cCall.cCallRef,
    judgmentRef: taskRow.judgmentRef,
    consumedAvailabilityRefs: [
      taskRow.judgmentRef,
      application.applicationRef,
    ] as const,
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

export function proposeRecursionRoute(
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  sourceCursor: TraversalStopRef["cursor"],
  targetCursor: TraversalStopRef["cursor"] | null,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  foldback: ApplicationChildFoldbackAdmission | null,
  replayState: ReplayState,
  contractRef: string,
  routeKind: "advance" | "blocked",
  preparationRefusal:
    | ApplicationChildPreparationRefusalAdmission
    | null = null,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    cCall.frameId !== sourceCursor.frameId ||
    cCall.compositionRef !== application.applicationRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "advance" ||
    (
      routeKind === "advance"
        ? targetCursor === null ||
          foldback === null ||
          preparationRefusal !== null ||
          foldback.parentCCallRef !== cCall.cCallRef ||
          foldback.parentJudgmentRef !== judgment.judgmentRef
        : targetCursor !== null ||
          (
            foldback !== null
              ? preparationRefusal !== null ||
                foldback.parentCCallRef !== cCall.cCallRef ||
                foldback.parentJudgmentRef !== judgment.judgmentRef ||
                foldback.childDisposition !== "blocked"
              : preparationRefusal === null
                ? sourceCursor.attempt < application.bound
                : preparationRefusal.applicationRef !==
                    application.applicationRef ||
                  preparationRefusal.parentCCallRef !== cCall.cCallRef ||
                  preparationRefusal.parentJudgmentRef !== judgment.judgmentRef
          )
    )
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "structural_step_missing",
      message: "recursion route requires one exact declared application, parent judgment, and bounded foldback",
    };
  }
  const body = {
    routeKind,
    declarationRef: application.applicationRef,
    declarationDigest: sha256Canonical(application as unknown as JsonValue),
    sourceCursorRef: sourceCursor.cursorRef,
    sourceCursorDigest: sourceCursor.cursorDigest,
    targetCursorRef: targetCursor?.cursorRef ?? null,
    targetCursorDigest: targetCursor?.cursorDigest ?? null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: routeKind === "advance"
      ? [judgment.judgmentRef, foldback!.foldbackRef]
      : foldback !== null
        ? [judgment.judgmentRef, foldback.foldbackRef]
        : preparationRefusal === null
          ? [judgment.judgmentRef]
          : [judgment.judgmentRef, preparationRefusal.refusalRef],
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
