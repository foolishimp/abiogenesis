// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-016
// Implements: REQ-P-POLICY-017

import {
  admitExecutionBasis,
  deriveAdvancementTransition,
  deriveRuntimeAggregateProjection
} from "../../../abg/m03/index.js";
import type {
  AdvancementTransition,
  AssessedRuntimeEvent,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../../../abg/m03/contracts/carriers.js";
import type { GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { Job } from "../../../gtl/m02/contracts/carriers.js";
import { constructModuleLookupAuthority } from "../../../gtl/m02/contracts/lookup.js";
import { admitPublicGapsRequest } from "./admission.js";
import {
  constructPublicGapsDeltaSummary,
  constructPublicGapsEntry,
  constructPublicGapsProjection
} from "./constructors.js";
import type {
  PublicGapsContext,
  PublicGapsEntry,
  PublicGapsEntryStatus,
  PublicGapsNextStep,
  PublicGapsProjection,
  PublicGapsRequest,
  PublicGapsStatus
} from "./carriers.js";

interface GapsJobBinding {
  readonly graphFunction: GraphFunction;
  readonly job: Job;
}

function runtimeIdentityProjection(
  context: PublicGapsContext
): PublicGapsProjection["scope"]["runtimeIdentity"] {
  return Object.freeze({
    workerId: context.runtimeIdentity.workerId,
    backendId: context.runtimeIdentity.backendId,
    buildId: context.runtimeIdentity.buildId,
    resolvedRuntimeRef: context.runtimeIdentity.resolvedRuntimeRef
  });
}

function graphFunctionForId(
  context: PublicGapsContext,
  graphFunctionId: string
): GraphFunction {
  const graphFunction = context.module.graphFunctions.find(
    (candidate) => candidate.id === graphFunctionId
  );
  if (graphFunction === undefined) {
    throw new TypeError(
      `Public gaps projection found job for unknown graph function ${JSON.stringify(graphFunctionId)}`
    );
  }
  return graphFunction;
}

function collectGapsJobBindings(
  context: PublicGapsContext
): readonly GapsJobBinding[] {
  const authority = constructModuleLookupAuthority(context.module);
  const bindings: GapsJobBinding[] = [];

  for (const semantic of authority.semanticJobs) {
    if (semantic.jobs.length === 0) {
      continue;
    }
    if (semantic.jobs.length > 1) {
      throw new TypeError(
        `Public gaps projection rejects multiple semantic jobs for graph function ${JSON.stringify(semantic.graphFunctionId)}`
      );
    }
    const job = semantic.jobs[0];
    if (job === undefined) {
      continue;
    }
    bindings.push(
      Object.freeze({
        graphFunction: graphFunctionForId(context, semantic.graphFunctionId),
        job
      })
    );
  }

  return Object.freeze(
    bindings.sort((left, right) => left.job.id.localeCompare(right.job.id))
  );
}

function executionBasisForBinding(
  request: PublicGapsRequest,
  context: PublicGapsContext,
  binding: GapsJobBinding
): ExecutionBasis {
  return admitExecutionBasis({
    startIntent: {
      scope: request.scope,
      target: {
        kind: "graph_function",
        handle: binding.graphFunction.id
      },
      until: "converged"
    },
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId ?? null,
    workKey: context.workKey ?? null,
    frameId: context.frameId ?? null,
    frameLineageId: context.frameLineageId ?? null
  });
}

function eventBasisId(event: RuntimeEvent): string | null {
  if ("basisId" in event) {
    return event.basisId;
  }
  return null;
}

function assessedEventMatchesBasis(
  basis: ExecutionBasis,
  event: AssessedRuntimeEvent
): boolean {
  if (event.runId !== basis.runId || event.workKey !== basis.workKey) {
    return false;
  }
  return basis.graph.vectors.some((vector) => vector.name === event.edge);
}

function eventsForBasis(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze(
    events.filter((event) => {
      const basisId = eventBasisId(event);
      if (basisId !== null) {
        return basisId === basis.id;
      }
      if (event.kind === "assessed") {
        return assessedEventMatchesBasis(basis, event);
      }
      return false;
    })
  );
}

function assessedObligationIdsForEdge(
  events: readonly RuntimeEvent[],
  edge: string | null
): readonly string[] {
  if (edge === null) {
    return Object.freeze([]);
  }
  const ids = events.flatMap((event) =>
    event.kind === "assessed" && event.edge === edge
      ? [event.obligationId]
      : []
  );
  return Object.freeze([...new Set(ids)].sort());
}

function transitionStatus(
  transition: AdvancementTransition,
  projection: RuntimeAggregateProjection
): PublicGapsEntryStatus {
  if (transition.kind === "terminal") {
    if (transition.terminalKind === "nothing_to_do") {
      return "nothing_to_do";
    }
    return "converged";
  }
  if (projection.nextVectorIndex === null) {
    return projection.vectorCount === 0 ? "nothing_to_do" : "converged";
  }
  if (transition.kind === "fp_dispatch") {
    return "dispatch_required";
  }
  if (transition.kind === "fh_escalation") {
    return "human_gate_required";
  }
  return "open";
}

function dispatchAlreadyRequested(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): boolean {
  return events.some(
    (event) =>
      event.kind === "fp_dispatch_requested" && event.basisId === basis.id
  );
}

function nextStepForEntry(input: {
  readonly status: PublicGapsEntryStatus;
  readonly dispatchRequested: boolean;
}): PublicGapsNextStep {
  switch (input.status) {
    case "dispatch_required":
      return input.dispatchRequested ? "assess-result" : "start";
    case "human_gate_required":
      return "human-decision";
    case "open":
      return "start";
    case "converged":
    case "nothing_to_do":
      return "none";
    default: {
      const exhaustive: never = input.status;
      throw new TypeError(`Unsupported gaps entry status ${JSON.stringify(exhaustive)}`);
    }
  }
}

function transitionStopDetail(transition: AdvancementTransition): Pick<
  PublicGapsEntry,
  "stopPredicate" | "dispatchRef" | "approvalSubjectRef" | "terminalKind"
> {
  switch (transition.kind) {
    case "fp_dispatch":
      return Object.freeze({
        stopPredicate: "dispatch_required",
        dispatchRef: transition.dispatchRef,
        approvalSubjectRef: null,
        terminalKind: null
      });
    case "fh_escalation":
      return Object.freeze({
        stopPredicate: "human_gate_required",
        dispatchRef: null,
        approvalSubjectRef: transition.approvalSubjectRef,
        terminalKind: null
      });
    case "terminal":
      return Object.freeze({
        stopPredicate: null,
        dispatchRef: null,
        approvalSubjectRef: null,
        terminalKind: transition.terminalKind
      });
    case "fd_advance":
      return Object.freeze({
        stopPredicate: null,
        dispatchRef: null,
        approvalSubjectRef: null,
        terminalKind: null
      });
    default: {
      const exhaustive: never = transition;
      throw new TypeError(`Unsupported gaps transition ${JSON.stringify(exhaustive)}`);
    }
  }
}

function constructEntry(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: AdvancementTransition;
  readonly events: readonly RuntimeEvent[];
}): PublicGapsEntry {
  const vectorIndex = input.projection.nextVectorIndex;
  const vector =
    vectorIndex === null ? undefined : input.basis.graph.vectors[vectorIndex];
  const edge = vector?.name ?? null;
  const expectedEvaluatorIds = Object.freeze(
    vector?.evaluators.map((evaluator) => evaluator.name) ?? []
  );
  const assessedIds = assessedObligationIdsForEdge(input.events, edge);
  const assessed = new Set(assessedIds);
  const passing = expectedEvaluatorIds.filter((id) => assessed.has(id));
  const failing = expectedEvaluatorIds.filter((id) => !assessed.has(id));
  const closedVectorCount = input.projection.closedVectorIndexes.length;
  const openVectorCount = input.projection.vectorCount - closedVectorCount;
  const status = transitionStatus(input.transition, input.projection);
  const dispatchRequested = dispatchAlreadyRequested(input.basis, input.events);
  const stopDetail = transitionStopDetail(input.transition);

  return constructPublicGapsEntry({
    graphFunctionId: input.basis.graphFunction.id,
    graphFunctionHandle: input.basis.graphFunction.name,
    jobId: input.basis.job.id,
    jobName: input.basis.job.name,
    edge,
    vectorIndex,
    vectorCount: input.projection.vectorCount,
    closedVectorCount,
    openVectorCount,
    delta:
      input.projection.vectorCount === 0
        ? 0
        : openVectorCount / input.projection.vectorCount,
    failing,
    passing,
    deltaSummary: constructPublicGapsDeltaSummary({
      vectorCount: input.projection.vectorCount,
      closedVectorCount,
      openVectorCount,
      plannedVectorIndexes: input.projection.plannedVectorIndexes,
      evaluatedVectorIndexes: input.projection.evaluatedVectorIndexes,
      closedVectorIndexes: input.projection.closedVectorIndexes,
      assessedEdges: input.projection.assessedEdges
    }),
    environmentReady: input.projection.failedLeafTaskIds.length === 0,
    status,
    stopPredicate: stopDetail.stopPredicate,
    dispatchRef: stopDetail.dispatchRef,
    approvalSubjectRef: stopDetail.approvalSubjectRef,
    terminalKind: stopDetail.terminalKind,
    nextStep: nextStepForEntry({ status, dispatchRequested }),
    dispatchRequested,
    projection: input.projection
  });
}

function overallStatus(entries: readonly PublicGapsEntry[]): PublicGapsStatus {
  if (entries.length === 0) {
    throw new TypeError(
      "Public gaps projection requires at least one semantic job in scope"
    );
  }
  if (entries.every((entry) => entry.status === "nothing_to_do")) {
    return "nothing_to_do";
  }
  if (
    entries.every(
      (entry) => entry.status === "converged" || entry.status === "nothing_to_do"
    )
  ) {
    return "converged";
  }
  if (
    entries.some(
      (entry) =>
        entry.status === "dispatch_required" ||
        entry.status === "human_gate_required"
    )
  ) {
    return "blocked";
  }
  return "open";
}

export function projectPublicGapsFromRequest(
  request: PublicGapsRequest,
  context: PublicGapsContext
): PublicGapsProjection {
  if (request.scope.moduleName !== context.module.name) {
    throw new TypeError(
      `Public gaps scope moduleName ${JSON.stringify(request.scope.moduleName)} does not match context module ${JSON.stringify(context.module.name)}`
    );
  }

  const runtimeEvents = context.runtimeEvents ?? Object.freeze([]);
  const entries = collectGapsJobBindings(context).map((binding) => {
    const basis = executionBasisForBinding(request, context, binding);
    const scopedEvents = eventsForBasis(basis, runtimeEvents);
    const projection = deriveRuntimeAggregateProjection(basis, scopedEvents);
    const transition = deriveAdvancementTransition(basis, scopedEvents);
    return constructEntry({
      basis,
      projection,
      transition,
      events: scopedEvents
    });
  });
  const status = overallStatus(entries);
  const totalDelta = entries.reduce((total, entry) => total + entry.delta, 0);
  const openFrames = entries.filter(
    (entry) => entry.projection.frameId !== null && entry.status !== "converged"
  ).length;

  return constructPublicGapsProjection({
    kind: "public_gaps_projection",
    status,
    scope: {
      package: context.module.name,
      selector: {
        kind: "workspace",
        workKey: context.workKey ?? null
      },
      build: context.runtimeIdentity.buildId,
      runtimeIdentity: runtimeIdentityProjection(context)
    },
    jobsConsidered: entries.length,
    totalDelta,
    openFrames,
    converged: status === "converged" || status === "nothing_to_do",
    eventCount: runtimeEvents.length,
    gaps: entries
  });
}

export function publicGaps(
  input: unknown,
  context: PublicGapsContext
): PublicGapsProjection {
  return projectPublicGapsFromRequest(admitPublicGapsRequest(input), context);
}
