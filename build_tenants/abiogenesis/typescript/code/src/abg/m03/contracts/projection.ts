import type {
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import {
  assertBasisEvent,
  assertVectorIndexInRange,
  freezeNumberArray,
  freezeStringArray,
  sortedNumbers
} from "./runtime_support.js";

export function sourceProjectionRef(projection: RuntimeAggregateProjection): string {
  return [
    "runtime_projection",
    projection.basisId,
    `closed=${projection.closedVectorIndexes.join(",")}`,
    `retry=${projection.retryAttemptRunIds.length}`,
    `leaf=${projection.leafTaskIds.length}`
  ].join(":");
}

export function countRetryAttemptsForVector(
  projection: RuntimeAggregateProjection,
  vectorIndex: number
): number {
  return projection.retryAttemptRefs.filter((attempt) => attempt.vectorIndex === vectorIndex).length;
}

export function manifestSeenInProjection(
  projection: RuntimeAggregateProjection,
  manifestId: string
): boolean {
  return projection.retryAttemptRefs.some(
    (attempt) => attempt.manifestId === manifestId
  );
}

export function deriveRuntimeAggregateProjection(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): RuntimeAggregateProjection {
  let graphCallId: string | null = null;
  let frameId: string | null = null;
  const planned = new Set<number>();
  const evaluated = new Set<number>();
  const closed = new Set<number>();
  const assessedEdges: string[] = [];
  const retryAttemptRunIds = new Set<string>();
  const retryAttemptManifestIds = new Set<string>();
  const retryAttemptRefs: RuntimeAggregateProjection["retryAttemptRefs"][number][] = [];
  const leafTaskIds = new Set<string>();
  const completedLeafTaskIds = new Set<string>();
  const failedLeafTaskIds = new Set<string>();

  for (const event of events) {
    assertBasisEvent(basis, event);
    switch (event.kind) {
      case "graph_call_opened":
        graphCallId = event.graphCallId;
        break;
      case "frame_opened":
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_traversal_planned":
        assertVectorIndexInRange(basis, event.vectorIndex);
        planned.add(event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_evaluated":
        assertVectorIndexInRange(basis, event.vectorIndex);
        evaluated.add(event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_closed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        for (let index = 0; index < event.vectorIndex; index += 1) {
          if (!closed.has(index)) {
            throw new TypeError(
              "Runtime aggregate projection rejects non-replay-derived vector closure order"
            );
          }
        }
        if (closed.has(event.vectorIndex)) {
          throw new TypeError(
            `Runtime aggregate projection rejects duplicate vector closure ${event.vectorIndex}`
          );
        }
        closed.add(event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_repair_planned":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        retryAttemptManifestIds.add(event.manifestId);
        retryAttemptRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            retryRunId: event.retryRunId,
            retryCallId: event.retryCallId,
            manifestId: event.manifestId,
            attemptIndex: event.attemptIndex,
            sourceProjectionRef: event.sourceProjectionRef
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_attempt_opened":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        retryAttemptManifestIds.add(event.manifestId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_attempt_stopped":
      case "retry_attempt_escalated":
        assertVectorIndexInRange(basis, event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_progress_recorded":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "continuation_terminated":
      case "continuation_reopened":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.causedByRetryRunId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_opened":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_completed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        completedLeafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_failed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        failedLeafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "assessed":
        assessedEdges.push(event.edge);
        break;
      case "basis_admitted":
      case "fd_advance_ready":
      case "fp_dispatch_requested":
      case "fh_escalated":
      case "terminal_reached":
      case "approved":
      case "revoked":
      case "reset":
        break;
      default: {
        const exhaustive: never = event;
        throw new TypeError(
          `Unsupported runtime event for aggregate projection ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  let nextVectorIndex: number | null = null;
  for (let index = 0; index < basis.graph.vectors.length; index += 1) {
    if (!closed.has(index)) {
      nextVectorIndex = index;
      break;
    }
  }

  const plannedVectorIndexes = freezeNumberArray(sortedNumbers(planned));
  const evaluatedVectorIndexes = freezeNumberArray(sortedNumbers(evaluated));
  const closedVectorIndexes = freezeNumberArray(sortedNumbers(closed));
  const frozenAssessedEdges = freezeStringArray(assessedEdges);
  const frozenRetryAttemptRunIds = freezeStringArray([...retryAttemptRunIds].sort());
  const frozenRetryAttemptManifestIds = freezeStringArray([...retryAttemptManifestIds].sort());
  const frozenRetryAttemptRefs = Object.freeze(
    [...retryAttemptRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.attemptIndex - right.attemptIndex;
    })
  );
  const frozenLeafTaskIds = freezeStringArray([...leafTaskIds].sort());
  const frozenCompletedLeafTaskIds = freezeStringArray([...completedLeafTaskIds].sort());
  const frozenFailedLeafTaskIds = freezeStringArray([...failedLeafTaskIds].sort());

  const run = Object.freeze({
    kind: "run_projection",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorCount: basis.graph.vectors.length,
    nextVectorIndex
  } as const);
  const graphCall = Object.freeze({
    kind: "graph_call_projection",
    graphCallId,
    graphFunctionId: basis.graphFunction.id
  } as const);
  const frame = Object.freeze({
    kind: "frame_projection",
    frameId,
    frameLineageId: basis.frameLineageId,
    plannedVectorIndexes,
    evaluatedVectorIndexes,
    closedVectorIndexes,
    assessedEdges: frozenAssessedEdges
  } as const);
  const continuation = Object.freeze({
    kind: "continuation_projection",
    retryAttemptRunIds: frozenRetryAttemptRunIds,
    retryAttemptManifestIds: frozenRetryAttemptManifestIds,
    retryAttemptRefs: frozenRetryAttemptRefs,
    leafTaskIds: frozenLeafTaskIds,
    completedLeafTaskIds: frozenCompletedLeafTaskIds,
    failedLeafTaskIds: frozenFailedLeafTaskIds
  } as const);

  return Object.freeze({
    kind: "runtime_aggregate_projection",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    run,
    graphCall,
    frame,
    continuation,
    graphCallId,
    frameId,
    vectorCount: basis.graph.vectors.length,
    plannedVectorIndexes,
    evaluatedVectorIndexes,
    closedVectorIndexes,
    assessedEdges: frozenAssessedEdges,
    retryAttemptRunIds: frozenRetryAttemptRunIds,
    retryAttemptManifestIds: frozenRetryAttemptManifestIds,
    retryAttemptRefs: frozenRetryAttemptRefs,
    leafTaskIds: frozenLeafTaskIds,
    completedLeafTaskIds: frozenCompletedLeafTaskIds,
    failedLeafTaskIds: frozenFailedLeafTaskIds,
    nextVectorIndex
  });
}
