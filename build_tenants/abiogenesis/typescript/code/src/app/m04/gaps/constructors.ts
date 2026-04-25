// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-016
// Implements: REQ-P-POLICY-017

import type {
  PublicGapsDeltaSummary,
  PublicGapsEntry,
  PublicGapsProjection,
  PublicGapsRequest,
  PublicGapsScopeProjection
} from "./carriers.js";

function freezeNumberArray(values: readonly number[]): readonly number[] {
  return Object.freeze([...values]);
}

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeEntries(values: readonly PublicGapsEntry[]): readonly PublicGapsEntry[] {
  return Object.freeze([...values]);
}

export function constructPublicGapsRequest(
  scope: PublicGapsRequest["scope"]
): PublicGapsRequest {
  return Object.freeze({
    scope
  });
}

export function constructPublicGapsDeltaSummary(input: {
  readonly vectorCount: number;
  readonly closedVectorCount: number;
  readonly openVectorCount: number;
  readonly plannedVectorIndexes: readonly number[];
  readonly evaluatedVectorIndexes: readonly number[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
}): PublicGapsDeltaSummary {
  return Object.freeze({
    vectorCount: input.vectorCount,
    closedVectorCount: input.closedVectorCount,
    openVectorCount: input.openVectorCount,
    plannedVectorIndexes: freezeNumberArray(input.plannedVectorIndexes),
    evaluatedVectorIndexes: freezeNumberArray(input.evaluatedVectorIndexes),
    closedVectorIndexes: freezeNumberArray(input.closedVectorIndexes),
    assessedEdges: freezeStringArray(input.assessedEdges)
  });
}

export function constructPublicGapsEntry(
  input: Omit<PublicGapsEntry, "failing" | "passing" | "deltaSummary"> & {
    readonly failing: readonly string[];
    readonly passing: readonly string[];
    readonly deltaSummary: PublicGapsDeltaSummary;
  }
): PublicGapsEntry {
  return Object.freeze({
    graphFunctionId: input.graphFunctionId,
    graphFunctionHandle: input.graphFunctionHandle,
    jobId: input.jobId,
    jobName: input.jobName,
    edge: input.edge,
    vectorIndex: input.vectorIndex,
    vectorCount: input.vectorCount,
    closedVectorCount: input.closedVectorCount,
    openVectorCount: input.openVectorCount,
    delta: input.delta,
    failing: freezeStringArray(input.failing),
    passing: freezeStringArray(input.passing),
    deltaSummary: input.deltaSummary,
    environmentReady: input.environmentReady,
    status: input.status,
    stopPredicate: input.stopPredicate,
    dispatchRef: input.dispatchRef,
    approvalSubjectRef: input.approvalSubjectRef,
    terminalKind: input.terminalKind,
    nextStep: input.nextStep,
    dispatchRequested: input.dispatchRequested,
    projection: input.projection
  });
}

export function constructPublicGapsScopeProjection(
  input: PublicGapsScopeProjection
): PublicGapsScopeProjection {
  return Object.freeze({
    package: input.package,
    selector: Object.freeze({
      kind: input.selector.kind,
      workKey: input.selector.workKey
    }),
    build: input.build,
    runtimeIdentity: Object.freeze({
      workerId: input.runtimeIdentity.workerId,
      backendId: input.runtimeIdentity.backendId,
      buildId: input.runtimeIdentity.buildId,
      resolvedRuntimeRef: input.runtimeIdentity.resolvedRuntimeRef
    })
  });
}

export function constructPublicGapsProjection(
  input: Omit<PublicGapsProjection, "gaps" | "scope"> & {
    readonly scope: PublicGapsScopeProjection;
    readonly gaps: readonly PublicGapsEntry[];
  }
): PublicGapsProjection {
  return Object.freeze({
    kind: input.kind,
    status: input.status,
    scope: constructPublicGapsScopeProjection(input.scope),
    jobsConsidered: input.jobsConsidered,
    totalDelta: input.totalDelta,
    openFrames: input.openFrames,
    converged: input.converged,
    eventCount: input.eventCount,
    gaps: freezeEntries(input.gaps)
  });
}
