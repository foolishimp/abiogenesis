export type QualificationDesignAssetKind =
  | "derivation"
  | "iacs"
  | "structural_carrier_diagram"
  | "test_surface_map";

export type QualificationProofLaneKind = "unit" | "integration" | "negative";

export type QualificationSourceAssetKind =
  | "python_design"
  | "python_test_surface"
  | "python_test";

export interface QualificationDesignAssetRef {
  readonly path: string;
  readonly kind: QualificationDesignAssetKind;
  readonly exists: boolean;
  readonly declared: boolean;
}

export interface QualificationProofLaneRef {
  readonly path: string;
  readonly kind: QualificationProofLaneKind;
  readonly exists: boolean;
  readonly declared: boolean;
  readonly validates: readonly string[];
}

export interface QualificationSourceAssetRef {
  readonly path: string;
  readonly kind: QualificationSourceAssetKind;
  readonly exists: boolean;
  readonly declared: boolean;
}

export type MethodTraceGapKind =
  | "missing_design_asset"
  | "undeclared_design_asset"
  | "missing_design_kind"
  | "missing_proof_lane"
  | "undeclared_proof_lane"
  | "missing_proof_kind"
  | "missing_validates_tags"
  | "missing_source_asset"
  | "undeclared_source_asset";

export interface MethodTraceGapRef {
  readonly kind: MethodTraceGapKind;
  readonly ref: string;
}

export interface MethodTraceQualificationRequest {
  readonly moduleName: "M05-qualification-scenarios";
  readonly designAssets: readonly QualificationDesignAssetRef[];
  readonly proofLanes: readonly QualificationProofLaneRef[];
  readonly sourceAssets: readonly QualificationSourceAssetRef[];
}

export interface MethodTraceQualificationPassed {
  readonly kind: "passed";
  readonly moduleName: string;
  readonly designKinds: readonly QualificationDesignAssetKind[];
  readonly proofKinds: readonly QualificationProofLaneKind[];
}

export interface MethodTraceQualificationRejected {
  readonly kind: "rejected";
  readonly moduleName: string;
  readonly reason: string;
  readonly gaps: readonly MethodTraceGapRef[];
}

export type MethodTraceQualificationOutcome =
  | MethodTraceQualificationPassed
  | MethodTraceQualificationRejected;

export type FakeLaneStepKind =
  | "scenario_authority"
  | "asset_addressing"
  | "public_start"
  | "dispatch_request"
  | "result_assessment"
  | "live_status";

export interface FakeLaneStepRef {
  readonly kind: FakeLaneStepKind;
  readonly valid: boolean;
  readonly detail: string;
}

export interface FakeLaneQualificationRequest {
  readonly scenarioName: string;
  readonly scenarioAuthorityRefs: readonly string[];
  readonly assetAddressingKind: "resolved" | "rejected";
  readonly resolvedTargetKind: "graph_function" | null;
  readonly resolvedTargetHandle: string | null;
  readonly dispatchExpectedEdge: string | null;
  readonly startOutcomeKind:
    | "advanced"
    | "blocked"
    | "yielded"
    | "converged"
    | "rejected";
  readonly startStopPredicate: string | null;
  readonly emittedEventKinds: readonly string[];
  readonly resultAssessmentKind: "accepted" | "rejected" | null;
  readonly liveStatusKind: "idle" | "ready" | "attention";
  readonly liveRunStatus: string;
}

export interface FakeLaneQualificationPassed {
  readonly kind: "passed";
  readonly scenarioName: string;
  readonly scenarioAuthorityRefs: readonly string[];
  readonly trace: readonly FakeLaneStepRef[];
}

export interface FakeLaneQualificationRejected {
  readonly kind: "rejected";
  readonly scenarioName: string;
  readonly reason: string;
  readonly trace: readonly FakeLaneStepRef[];
}

export type FakeLaneQualificationOutcome =
  | FakeLaneQualificationPassed
  | FakeLaneQualificationRejected;
