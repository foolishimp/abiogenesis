import type {
  FakeLaneQualificationOutcome,
  FakeLaneQualificationRequest,
  FakeLaneQualificationRejected,
  FakeLaneQualificationPassed,
  FakeLaneStepKind,
  FakeLaneStepRef,
  MethodTraceGapKind,
  MethodTraceGapRef,
  MethodTraceQualificationOutcome,
  MethodTraceQualificationPassed,
  MethodTraceQualificationRejected,
  MethodTraceQualificationRequest,
  QualificationDesignAssetKind,
  QualificationDesignAssetRef,
  QualificationProofLaneKind,
  QualificationProofLaneRef,
  QualificationSourceAssetKind,
  QualificationSourceAssetRef
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeTrace(values: readonly FakeLaneStepRef[]): readonly FakeLaneStepRef[] {
  return Object.freeze([...values]);
}

function freezeGaps(
  values: readonly MethodTraceGapRef[]
): readonly MethodTraceGapRef[] {
  return Object.freeze([...values]);
}

export function constructQualificationDesignAssetRef(input: {
  readonly path: string;
  readonly kind: QualificationDesignAssetKind;
  readonly exists: boolean;
  readonly declared: boolean;
}): QualificationDesignAssetRef {
  return Object.freeze({
    path: input.path,
    kind: input.kind,
    exists: input.exists,
    declared: input.declared
  });
}

export function constructQualificationProofLaneRef(input: {
  readonly path: string;
  readonly kind: QualificationProofLaneKind;
  readonly exists: boolean;
  readonly declared: boolean;
  readonly validates: readonly string[];
}): QualificationProofLaneRef {
  return Object.freeze({
    path: input.path,
    kind: input.kind,
    exists: input.exists,
    declared: input.declared,
    validates: freezeStringArray(input.validates)
  });
}

export function constructQualificationSourceAssetRef(input: {
  readonly path: string;
  readonly kind: QualificationSourceAssetKind;
  readonly exists: boolean;
  readonly declared: boolean;
}): QualificationSourceAssetRef {
  return Object.freeze({
    path: input.path,
    kind: input.kind,
    exists: input.exists,
    declared: input.declared
  });
}

export function constructMethodTraceGapRef(
  kind: MethodTraceGapKind,
  ref: string
): MethodTraceGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructMethodTraceQualificationRequest(input: {
  readonly designAssets: readonly QualificationDesignAssetRef[];
  readonly proofLanes: readonly QualificationProofLaneRef[];
  readonly sourceAssets: readonly QualificationSourceAssetRef[];
}): MethodTraceQualificationRequest {
  return Object.freeze({
    moduleName: "M05-qualification-scenarios",
    designAssets: Object.freeze([...input.designAssets]),
    proofLanes: Object.freeze([...input.proofLanes]),
    sourceAssets: Object.freeze([...input.sourceAssets])
  });
}

export function constructPassedMethodTraceQualificationOutcome(input: {
  readonly moduleName: string;
  readonly designKinds: readonly QualificationDesignAssetKind[];
  readonly proofKinds: readonly QualificationProofLaneKind[];
}): MethodTraceQualificationPassed {
  return Object.freeze({
    kind: "passed",
    moduleName: input.moduleName,
    designKinds: Object.freeze([...input.designKinds]),
    proofKinds: Object.freeze([...input.proofKinds])
  });
}

export function constructRejectedMethodTraceQualificationOutcome(input: {
  readonly moduleName: string;
  readonly reason: string;
  readonly gaps: readonly MethodTraceGapRef[];
}): MethodTraceQualificationRejected {
  return Object.freeze({
    kind: "rejected",
    moduleName: input.moduleName,
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructMethodTraceQualificationOutcome(
  outcome: MethodTraceQualificationOutcome
): MethodTraceQualificationOutcome {
  return Object.freeze({
    ...outcome
  });
}

export function constructFakeLaneStepRef(
  kind: FakeLaneStepKind,
  valid: boolean,
  detail: string
): FakeLaneStepRef {
  return Object.freeze({
    kind,
    valid,
    detail
  });
}

export function constructFakeLaneQualificationRequest(
  input: FakeLaneQualificationRequest
): FakeLaneQualificationRequest {
  return Object.freeze({
    scenarioName: input.scenarioName,
    scenarioAuthorityRefs: freezeStringArray(input.scenarioAuthorityRefs),
    assetAddressingKind: input.assetAddressingKind,
    resolvedTargetKind: input.resolvedTargetKind,
    resolvedTargetHandle: input.resolvedTargetHandle,
    dispatchExpectedEdge: input.dispatchExpectedEdge,
    startOutcomeKind: input.startOutcomeKind,
    startStopPredicate: input.startStopPredicate,
    emittedEventKinds: freezeStringArray(input.emittedEventKinds),
    resultAssessmentKind: input.resultAssessmentKind,
    liveStatusKind: input.liveStatusKind,
    liveRunStatus: input.liveRunStatus
  });
}

export function constructPassedFakeLaneQualificationOutcome(input: {
  readonly scenarioName: string;
  readonly scenarioAuthorityRefs: readonly string[];
  readonly trace: readonly FakeLaneStepRef[];
}): FakeLaneQualificationPassed {
  return Object.freeze({
    kind: "passed",
    scenarioName: input.scenarioName,
    scenarioAuthorityRefs: freezeStringArray(input.scenarioAuthorityRefs),
    trace: freezeTrace(input.trace)
  });
}

export function constructRejectedFakeLaneQualificationOutcome(input: {
  readonly scenarioName: string;
  readonly reason: string;
  readonly trace: readonly FakeLaneStepRef[];
}): FakeLaneQualificationRejected {
  return Object.freeze({
    kind: "rejected",
    scenarioName: input.scenarioName,
    reason: input.reason,
    trace: freezeTrace(input.trace)
  });
}

export function constructFakeLaneQualificationOutcome(
  outcome: FakeLaneQualificationOutcome
): FakeLaneQualificationOutcome {
  return Object.freeze({
    ...outcome
  });
}
