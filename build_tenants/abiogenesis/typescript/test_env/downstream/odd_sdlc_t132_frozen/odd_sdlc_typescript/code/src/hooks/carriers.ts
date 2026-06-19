// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-017

import type { SdlcAssetBinding } from "../domain/index.js";

export const SDLC_HOOK_EDGE_CLASS_VALUES = Object.freeze([
  "bootstrap_specification",
  "design",
  "implementation",
  "qualification",
  "release",
  "operational_return"
] as const);

export type SdlcHookEdgeClass = (typeof SDLC_HOOK_EDGE_CLASS_VALUES)[number];

export const SDLC_WORK_OPERATION_VALUES = Object.freeze([
  "generate",
  "adopt",
  "import",
  "repair",
  "qualify",
  "release",
  "deploy",
  "return",
  "retrofit"
] as const);

export type SdlcWorkOperation = (typeof SDLC_WORK_OPERATION_VALUES)[number];

export const SDLC_EVALUATOR_PHASE_VALUES = Object.freeze([
  "preflight_fd",
  "postflight_fd"
] as const);

export type SdlcEvaluatorPhase = (typeof SDLC_EVALUATOR_PHASE_VALUES)[number];

export const SDLC_EVALUATOR_STATUS_VALUES = Object.freeze([
  "passed",
  "blocked"
] as const);

export type SdlcEvaluatorStatus = (typeof SDLC_EVALUATOR_STATUS_VALUES)[number];

export const EMPTY_RUNTIME_EVENT_KINDS: readonly [] = Object.freeze([]);

export interface SdlcHookTransformProfile {
  readonly kind: "sdlc_hook_transform_profile";
  readonly preflightFd: readonly string[];
  readonly constructiveFp: string;
  readonly capabilityFd: readonly string[];
  readonly postflightFd: readonly string[];
  readonly fhGate: string | null;
}

export interface SdlcWorkReportContract {
  readonly kind: "sdlc_work_report_contract";
  readonly requiredFields: readonly string[];
  readonly requireGraphFunctionAuthority: true;
  readonly requireTargetBinding: true;
  readonly requireEvidenceRefs: true;
  readonly requireInputOutputIdentity: true;
  readonly requireGeneratedAssetAttestation: true;
  readonly preserveAmbiguityCandidates: true;
}

export interface SdlcHookClosurePolicy {
  readonly kind: "sdlc_hook_closure_policy";
  readonly postflightFdRequired: true;
  readonly generatedAssetContractMustPass: true;
  readonly traceTagsAloneSufficient: false;
  readonly nextTraversalSelectionAuthority: "abg_runtime";
  readonly maySelectNextTraversal: false;
  readonly unresolvedOutcomeAuthority: "abg_retry_repair";
  readonly continuationEvidenceRequired: true;
}

export interface SdlcHookContract {
  readonly kind: "sdlc_hook_contract";
  readonly edgeName: string;
  readonly edgeClass: SdlcHookEdgeClass;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly transformProfile: SdlcHookTransformProfile;
  readonly workReportContract: SdlcWorkReportContract;
  readonly closurePolicy: SdlcHookClosurePolicy;
}

export interface SdlcAssetIdentity {
  readonly kind: "sdlc_asset_identity";
  readonly assetId: string;
  readonly uri: string;
  readonly declaredType: string;
  readonly digest: string;
  readonly byteCount: number;
}

export interface SdlcEvidenceRef {
  readonly kind: "sdlc_evidence_ref";
  readonly ref: string;
  readonly evidenceType: string;
  readonly digest: string;
}

export interface SdlcAmbiguityCandidate {
  readonly kind: "sdlc_ambiguity_candidate";
  readonly candidateId: string;
  readonly affectedAssetId: string;
  readonly relativePath: string;
  readonly reason: string;
}

export interface SdlcGeneratedAssetContractAttestation {
  readonly kind: "sdlc_generated_asset_contract_attestation";
  readonly contractName: string;
  readonly targetAssetId: string;
  readonly satisfied: boolean;
  readonly materialized: boolean;
  readonly diagnostics: readonly string[];
  readonly foreignRealizationCandidates: readonly SdlcAmbiguityCandidate[];
}

export interface SdlcGeneratedAssetAuthority {
  readonly kind: "sdlc_generated_asset_authority";
  readonly graphFunctionName: string;
  readonly selectedBy: "abg_selected_edge";
  readonly targetAssetType: string;
  readonly targetAssetId: string;
}

export interface SdlcHookInvocation {
  readonly kind: "sdlc_hook_invocation";
  readonly hookName: string;
  readonly edgeName: string;
  readonly edgeClass: SdlcHookEdgeClass;
  readonly sourceBindings: readonly SdlcAssetBinding[];
  readonly targetBinding: SdlcAssetBinding;
  readonly inputIdentities: readonly SdlcAssetIdentity[];
  readonly requestedOperation: SdlcWorkOperation;
  readonly fpWorkerContractRef: string | null;
}

export interface SdlcConstructorResult {
  readonly kind: "sdlc_constructor_result";
  readonly operationType: SdlcWorkOperation;
  readonly outputIdentity: SdlcAssetIdentity;
  readonly evidenceRefs: readonly SdlcEvidenceRef[];
  readonly generatedAssetContract: SdlcGeneratedAssetContractAttestation;
  readonly ambiguityCandidates: readonly SdlcAmbiguityCandidate[];
}

export interface SdlcWorkReport {
  readonly kind: "sdlc_work_report";
  readonly hookName: string;
  readonly edgeName: string;
  readonly edgeClass: SdlcHookEdgeClass;
  readonly targetBinding: SdlcAssetBinding;
  readonly requestedOperation: SdlcWorkOperation;
  readonly operationType: SdlcWorkOperation;
  readonly inputIdentities: readonly SdlcAssetIdentity[];
  readonly outputIdentity: SdlcAssetIdentity;
  readonly evidenceRefs: readonly SdlcEvidenceRef[];
  readonly generatedAssetAuthority: SdlcGeneratedAssetAuthority;
  readonly generatedAssetContract: SdlcGeneratedAssetContractAttestation;
  readonly ambiguityCandidates: readonly SdlcAmbiguityCandidate[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcEvaluatorResult {
  readonly kind: "sdlc_evaluator_result";
  readonly phase: SdlcEvaluatorPhase;
  readonly status: SdlcEvaluatorStatus;
  readonly checkedEvaluatorNames: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcHookTurnOutcome {
  readonly kind: "sdlc_hook_turn_outcome";
  readonly contract: SdlcHookContract;
  readonly preflight: SdlcEvaluatorResult;
  readonly workReport: SdlcWorkReport | null;
  readonly postflight: SdlcEvaluatorResult | null;
  readonly emittedRuntimeEventKinds: readonly [];
}
