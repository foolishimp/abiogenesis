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
import type { CWorkflowNode } from "../gtl/c_algebra.js";
import { graphFunctionApplicationRef } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import {
  deriveCContinuationTarget,
  deriveCSourceContinuation,
  resolveCProgramTermAtSourcePath,
} from "../gtl/source_path.js";
import { isTraversalCursorCandidate } from "../abg/traversal_cursor.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  type TraversalCursor,
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

function routeRefusal(
  code: RouteProposalRefusal["code"],
  message: string,
): RouteProposalRefusal {
  return {
    kind: "traversal_route_proposal_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

type RouteCandidateBody = Omit<
  RouteCandidate,
  "kind" | "schemaVersion" | "candidateRef" | "candidateDigest"
>;

function routeCandidate(body: RouteCandidateBody): RouteCandidate {
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

type GraphRouteExtras = Partial<Pick<
  RouteCandidateBody,
  | "graphSpanReentryProjection"
  | "graphSpanReentryProjectionDigest"
  | "graphSpanReentryProjectionRef"
  | "nextActionProjection"
  | "nextActionProjectionDigest"
  | "nextActionProjectionRef"
>>;

function graphRouteCandidate(input: Readonly<{
  graph: Readonly<GtlGraph>;
  routeKind: RouteCandidateBody["routeKind"];
  sourceCursor: TraversalCursor;
  targetCursor: TraversalCursor | null;
  cCallRef: string | null;
  judgmentRef: string | null;
  consumedAvailabilityRefs: readonly string[];
  contractRef: string | null;
  replayState: ReplayState;
  extras?: GraphRouteExtras;
}>): RouteCandidate {
  return routeCandidate({
    routeKind: input.routeKind,
    declarationRef: input.graph.materializationRef,
    declarationDigest: input.graph.materializationDigest,
    sourceCursorRef: input.sourceCursor.cursorRef,
    sourceCursorDigest: input.sourceCursor.cursorDigest,
    targetCursorRef: input.targetCursor?.cursorRef ?? null,
    targetCursorDigest: input.targetCursor?.cursorDigest ?? null,
    cCallRef: input.cCallRef,
    judgmentRef: input.judgmentRef,
    consumedAvailabilityRefs: input.consumedAvailabilityRefs,
    contractRef: input.contractRef,
    replayStateDigest: input.replayState.replayDigest,
    ...input.extras,
  });
}

function isDeclaredCompletion(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor | null,
  completedInput: Readonly<{ inputRef: string; inputDigest: `sha256:${string}` }>,
): boolean {
  const declared = deriveCContinuationTarget(
    graph,
    {
      nodeRef: sourceCursor.currentNodeRef,
      termPath: sourceCursor.termPath,
      taskOrdinal: sourceCursor.taskOrdinal,
      attempt: sourceCursor.attempt,
      retryPath: sourceCursor.retryPath,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    completedInput,
  );
  if (declared.kind === "c_source_path_refusal") return false;
  if (declared.disposition === "terminal") return targetCursor === null;
  return targetCursor !== null &&
    targetCursor.currentNodeRef === declared.nodeRef &&
    targetCursor.termPath.length === declared.termPath!.length &&
    targetCursor.termPath.every((part, index) => part === declared.termPath![index]) &&
    targetCursor.taskOrdinal === declared.taskOrdinal &&
    targetCursor.attempt === declared.attempt &&
    targetCursor.retryPath.length === declared.retryPath.length &&
    targetCursor.retryPath.every((attempt, index) =>
      attempt === declared.retryPath[index]
    ) &&
    targetCursor.inputRef === declared.inputRef &&
    targetCursor.inputDigest === declared.inputDigest;
}

export function proposeStructuralRoute(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  routeKind: "advance" | "retry",
  replayState: ReplayState,
  completedProgresses: readonly RetryCompletedProgressAdmission[] = [],
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    targetCursor.graphRef !== graph.materializationRef ||
    sourceCursor.executionBasisRef !== targetCursor.executionBasisRef ||
    sourceCursor.traversalScopeRef !== targetCursor.traversalScopeRef ||
    sourceCursor.frameId !== targetCursor.frameId ||
    (completedProgresses.length !== 0 && routeKind !== "advance")
  ) {
    return routeRefusal(
      "structural_step_missing",
      "structural route requires one HoG-derived target under the original GTL Graph",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind,
    sourceCursor,
    targetCursor,
    cCallRef: null,
    judgmentRef: null,
    consumedAvailabilityRefs: completedProgresses.map((progress) =>
      progress.progressRef
    ),
    contractRef: null,
    replayState,
  });
}

export function proposeRetryRoute(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  cCall: CCall,
  progress: RetryProgressAdmission,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    progress.progressClass !== "retry" ||
    !isMaterializedGtlGraph(graph) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    targetCursor.graphRef !== graph.materializationRef ||
    targetCursor.executionBasisRef !== sourceCursor.executionBasisRef ||
    targetCursor.traversalScopeRef !== sourceCursor.traversalScopeRef ||
    targetCursor.frameId !== sourceCursor.frameId ||
    targetCursor.attempt !== sourceCursor.attempt + 1 ||
    targetCursor.retryPath.length !== sourceCursor.retryPath.length ||
    progress.cCallRef !== cCall.cCallRef ||
    progress.judgmentRef.length === 0 ||
    progress.remainingBudget < 1
  ) {
    return routeRefusal(
      "retry_progress_missing",
      "retry route requires one admitted bounded progress row and HoG-derived target",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "retry" as const,
    sourceCursor,
    targetCursor,
    cCallRef: cCall.cCallRef,
    judgmentRef: progress.judgmentRef,
    consumedAvailabilityRefs: [
      progress.judgmentRef,
      progress.progressRef,
    ],
    contractRef,
    replayState,
  });
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
    return routeRefusal(
      "judgment_not_advance",
      "terminal route requires an admitted advance judgment",
    );
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
    return routeRefusal(
      "terminal_not_declared",
      "current GTL locus is not a declared terminal node",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "terminal" as const,
    sourceCursor: stop.cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef],
    contractRef,
    replayState,
  });
}

export function proposeJudgedRoute(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor | null,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
  completedProgresses: readonly RetryCompletedProgressAdmission[] = [],
): RouteCandidate | RouteProposalRefusal {
  if (judgment.judgment !== "advance") {
    return routeRefusal(
      "judgment_not_advance",
      "post-judgment route requires an admitted advance judgment",
    );
  }
  const routeKind = targetCursor === null ? "terminal" as const : "advance" as const;
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(sourceCursor) ||
    (targetCursor !== null && !isTraversalCursorCandidate(targetCursor)) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.frameId !== cCall.frameId ||
    !isDeclaredCompletion(graph, sourceCursor, targetCursor, {
      inputRef: result.resultRef,
      inputDigest: result.valueDigest,
    }) ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.cCallRef !== cCall.cCallRef
  ) {
    return routeRefusal(
      "structural_step_missing",
      "judged route requires HoG's exact declared continuation step",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind,
    sourceCursor,
    targetCursor,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ],
    contractRef,
    replayState,
  });
}

export function proposeGraphSpanReentryRoute(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
  projection: Readonly<GraphSpanReentryProjection>,
): RouteCandidate | RouteProposalRefusal {
  const application = graph.template.applications.find(
    (candidate) =>
      candidate.relationKind === "re_enter" &&
      candidate.applicationRef === projection.applicationRef,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(sourceCursor) ||
    !isTraversalCursorCandidate(targetCursor) ||
    judgment.judgment !== "advance" ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.frameId !== cCall.frameId ||
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
    return routeRefusal(
      "graph_span_reentry_not_declared",
      "graph-span re-entry requires one Product projection and HoG-derived target under the exact declared application",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "re_enter" as const,
    sourceCursor,
    targetCursor,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayState,
    extras: {
      graphSpanReentryProjectionRef: projection.projectionRef,
      graphSpanReentryProjectionDigest: projection.projectionDigest,
      graphSpanReentryProjection:
        projection as unknown as Readonly<Record<string, JsonValue>>,
    },
  });
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
    return routeRefusal(
      "gap_stop_not_declared",
      "gap_stop requires the exact judged Product no-action projection at the current cursor",
    );
  }
  const nextActionProjectionRef = projection.projectionRef;
  const nextActionProjectionDigest = projection.projectionDigest;
  if (
    typeof nextActionProjectionRef !== "string" ||
    typeof nextActionProjectionDigest !== "string"
  ) {
    return routeRefusal(
      "gap_stop_not_declared",
      "gap_stop projection lacks its exact Product identity",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "gap_stop" as const,
    sourceCursor: stop.cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayState,
    extras: {
      nextActionProjectionRef,
      nextActionProjectionDigest:
        nextActionProjectionDigest as `sha256:${string}`,
      nextActionProjection: projection,
    },
  });
}

export function proposeBlockedRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgmentRef: string,
  replayState: ReplayState,
  contractRef: string,
  stoppedProgressRefs: readonly string[] = [],
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    stop.cursor.graphRef !== graph.materializationRef ||
    stop.cursor.frameId !== cCall.frameId ||
    stop.programLocusRef !== cCall.programLocusRef
  ) {
    return routeRefusal(
      "structural_step_missing",
      "blocked route requires the exact open CCall and source cursor",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "blocked" as const,
    sourceCursor: stop.cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef,
    consumedAvailabilityRefs: [judgmentRef, ...stoppedProgressRefs],
    contractRef,
    replayState,
  });
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
    return routeRefusal(
      "structural_step_missing",
      "failed route requires the exact admitted failure result, judgment, and source cursor",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "failed" as const,
    sourceCursor: stop.cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayState,
  });
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
    return routeRefusal(
      "judgment_not_pending",
      "hold route requires the exact F_H locus and admitted pending judgment",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "hold" as const,
    sourceCursor: stop.cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef] as const,
    contractRef,
    replayState,
  });
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
    return routeRefusal(
      "resume_not_admitted",
      "F_H resume route requires the exact admitted response cursor at a declared terminal locus",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "terminal" as const,
    sourceCursor: cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      resume.admissionEventRef,
    ] as const,
    contractRef,
    replayState,
  });
}

export function proposeInteractionResumeRoute(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor,
  targetCursor: TraversalCursor | null,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  resume: FhInteractionResumeAdmission,
  replayState: ReplayState,
  contractRef: string,
  completedProgresses: readonly RetryCompletedProgressAdmission[] = [],
): RouteCandidate | RouteProposalRefusal {
  const continuation = deriveCSourceContinuation(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  const terminal =
    continuation.kind === "c_source_continuation" &&
    continuation.disposition === "terminal" &&
    continuation.targetPath === null &&
    targetCursor === null &&
    graph.template.terminalNodeRefs.includes(cursor.currentNodeRef);
  const advancing =
    continuation.kind === "c_source_continuation" &&
    continuation.disposition === "advance" &&
    continuation.targetPath !== null &&
    targetCursor !== null;
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(cursor) ||
    (targetCursor !== null && !isTraversalCursorCandidate(targetCursor)) ||
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
    !isDeclaredCompletion(graph, cursor, targetCursor, {
      inputRef: cursor.inputRef,
      inputDigest: cursor.inputDigest,
    }) ||
    contractRef !== cCall.transitionContractRef
  ) {
    return routeRefusal(
      "resume_not_admitted",
      "F_H resume route requires the exact admitted response and GTL-declared continuation",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: terminal ? "terminal" as const : "advance" as const,
    sourceCursor: cursor,
    targetCursor,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [
      judgment.judgmentRef,
      resume.admissionEventRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ],
    contractRef,
    replayState,
  });
}

export function proposeWorkflowBlockedRoute(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor,
  workflow: Readonly<CWorkflowNode>,
  cCall: CCall,
  judgmentRef: string,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(cursor) ||
    cursor.graphRef !== graph.materializationRef ||
    cursor.frameId !== cCall.frameId ||
    resolveCProgramTermAtSourcePath(
      graph.template,
      cursor.currentNodeRef,
      cursor.termPath,
    ) !== workflow ||
    cCall.callClass !== "workflow" ||
    cCall.childGraphFunctionRef !== workflow.graphFunctionRef
  ) {
    return routeRefusal(
      "structural_step_missing",
      "blocked workflow route requires the exact transparent parent CCall",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: "blocked" as const,
    sourceCursor: cursor,
    targetCursor: null,
    cCallRef: cCall.cCallRef,
    judgmentRef,
    consumedAvailabilityRefs: [judgmentRef] as const,
    contractRef,
    replayState,
  });
}

export function proposeFanOutRoute(
  graph: Readonly<GtlGraph>,
  application: Readonly<FanOutApplication>,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor | null,
  cCall: CCall,
  completion: FanOutCompletionAdmission,
  replayState: ReplayState,
  contractRef: string,
  completedProgresses: readonly RetryCompletedProgressAdmission[] = [],
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
    !isTraversalCursorCandidate(sourceCursor) ||
    (targetCursor !== null && !isTraversalCursorCandidate(targetCursor)) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.frameId !== cCall.frameId ||
    cCall.batchRef !== application.batchRef ||
    taskRow === undefined ||
    taskRow.cCallRef !== cCall.cCallRef ||
    taskRow.ordinal !== sourceCursor.taskOrdinal ||
    completion.applicationRef !== application.applicationRef ||
    (!complete && completedProgresses.length !== 0) ||
    (
      complete
        ? targetCursor === null ||
          !isDeclaredCompletion(graph, sourceCursor, targetCursor, {
            inputRef: completion.outputVectorRef,
            inputDigest: completion.outputVectorDigest,
          })
        : targetCursor !== null
    )
  ) {
    return routeRefusal(
      "structural_step_missing",
      "fan-out route requires the exact terminal task cursor and admitted completion variant",
    );
  }
  return graphRouteCandidate({
    graph,
    routeKind: complete ? "advance" as const : "blocked" as const,
    sourceCursor,
    targetCursor,
    cCallRef: cCall.cCallRef,
    judgmentRef: taskRow.judgmentRef,
    consumedAvailabilityRefs: [
      taskRow.judgmentRef,
      application.applicationRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ],
    contractRef,
    replayState,
  });
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
    return routeRefusal(
      "structural_step_missing",
      "recursion route requires one exact declared application, parent judgment, and bounded foldback",
    );
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
  return routeCandidate(body);
}
