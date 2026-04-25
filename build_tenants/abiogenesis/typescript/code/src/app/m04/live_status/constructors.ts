import type { PublicRuntimeIdentityProjection } from "../contracts/carriers.js";
import type {
  ProjectionResultAssessmentRef,
  ProjectionTraceRef,
  PublicLiveStatusAttention,
  PublicLiveStatusIdle,
  PublicLiveStatusProjection,
  PublicLiveStatusReady,
  PublicLiveStatusRequest
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructProjectionTraceRef(
  sourceKinds: readonly string[]
): ProjectionTraceRef {
  return Object.freeze({
    sourceKinds: freezeStringArray(sourceKinds)
  });
}

export function constructProjectionResultAssessmentRef(input: {
  readonly status: ProjectionResultAssessmentRef["status"];
  readonly failureClass: ProjectionResultAssessmentRef["failureClass"];
  readonly valid: boolean | null;
  readonly publishedLedgerRef: string | null;
  readonly assessedCount: number | null;
}): ProjectionResultAssessmentRef {
  return Object.freeze({
    status: input.status,
    failureClass: input.failureClass,
    valid: input.valid,
    publishedLedgerRef: input.publishedLedgerRef,
    assessedCount: input.assessedCount
  });
}

export function constructPublicLiveStatusRequest(input: {
  readonly startRequest: PublicLiveStatusRequest["startRequest"];
  readonly startOutcome: PublicLiveStatusRequest["startOutcome"];
  readonly controlRequest: PublicLiveStatusRequest["controlRequest"];
  readonly controlOutcome: PublicLiveStatusRequest["controlOutcome"];
  readonly resultAssessmentRequest: PublicLiveStatusRequest["resultAssessmentRequest"];
  readonly resultAssessmentOutcome: PublicLiveStatusRequest["resultAssessmentOutcome"];
}): PublicLiveStatusRequest {
  return Object.freeze({
    startRequest: input.startRequest,
    startOutcome: input.startOutcome,
    controlRequest: input.controlRequest,
    controlOutcome: input.controlOutcome,
    resultAssessmentRequest: input.resultAssessmentRequest,
    resultAssessmentOutcome: input.resultAssessmentOutcome
  });
}

interface ProjectionBaseInput {
  readonly request: PublicLiveStatusRequest;
  readonly trace: ProjectionTraceRef;
  readonly runtimeIdentity: PublicRuntimeIdentityProjection | null;
  readonly resultAssessment: ProjectionResultAssessmentRef | null;
  readonly targetHandle: string | null;
  readonly activeEdge: string | null;
}

export function constructIdlePublicLiveStatusProjection(
  input: ProjectionBaseInput
): PublicLiveStatusIdle {
  return Object.freeze({
    kind: "idle",
    assetType: "run_status",
    runStatus: "not_started",
    targetHandle: input.targetHandle,
    activeEdge: input.activeEdge,
    runtimeIdentity: input.runtimeIdentity,
    resultAssessment: input.resultAssessment,
    trace: input.trace
  });
}

export function constructReadyPublicLiveStatusProjection(input: ProjectionBaseInput & {
  readonly runStatus: PublicLiveStatusReady["runStatus"];
}): PublicLiveStatusReady {
  return Object.freeze({
    kind: "ready",
    assetType: "run_status",
    runStatus: input.runStatus,
    targetHandle: input.targetHandle,
    activeEdge: input.activeEdge,
    runtimeIdentity: input.runtimeIdentity,
    resultAssessment: input.resultAssessment,
    trace: input.trace
  });
}

export function constructAttentionPublicLiveStatusProjection(input: ProjectionBaseInput & {
  readonly runStatus: PublicLiveStatusAttention["runStatus"];
  readonly reason: string;
}): PublicLiveStatusAttention {
  return Object.freeze({
    kind: "attention",
    assetType: "run_status",
    runStatus: input.runStatus,
    reason: input.reason,
    targetHandle: input.targetHandle,
    activeEdge: input.activeEdge,
    runtimeIdentity: input.runtimeIdentity,
    resultAssessment: input.resultAssessment,
    trace: input.trace
  });
}

export function constructPublicLiveStatusProjection(
  projection: PublicLiveStatusProjection
): PublicLiveStatusProjection {
  return projection;
}
