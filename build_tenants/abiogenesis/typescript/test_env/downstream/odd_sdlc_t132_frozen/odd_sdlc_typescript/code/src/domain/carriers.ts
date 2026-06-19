// Implements: REQ-F-ODDSDLC-009
// Implements: REQ-F-ODDSDLC-010
// Implements: REQ-F-ODDSDLC-011
// Implements: REQ-F-ODDSDLC-012
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-016
// Implements: REQ-F-ODDSDLC-038

export const SDLC_ASSET_MUTABILITY_VALUES = Object.freeze([
  "immutable",
  "mutable_checkpointed"
] as const);

export type SdlcAssetMutability =
  (typeof SDLC_ASSET_MUTABILITY_VALUES)[number];

export const SDLC_ASSET_PROVENANCE_MODEL_VALUES = Object.freeze([
  "generated",
  "adopted",
  "imported",
  "repaired",
  "retrofitted",
  "released",
  "deployed",
  "returned"
] as const);

export type SdlcAssetProvenanceModel =
  (typeof SDLC_ASSET_PROVENANCE_MODEL_VALUES)[number];

export const SDLC_WORKSITE_STATE_VALUES = Object.freeze([
  "requested",
  "gated",
  "specifying",
  "designing",
  "implementing",
  "qualifying",
  "released",
  "deployed",
  "observing",
  "returned",
  "retrofitting"
] as const);

export type SdlcWorksiteState =
  (typeof SDLC_WORKSITE_STATE_VALUES)[number];

export const SDLC_WORKSITE_ASSET_REF_ROLE_VALUES = Object.freeze([
  "system_asset",
  "workspace_asset",
  "runtime_evidence",
  "product_materialization",
  "operator_run_evidence"
] as const);

export type SdlcWorksiteAssetRefRole =
  (typeof SDLC_WORKSITE_ASSET_REF_ROLE_VALUES)[number];

export const SDLC_CAPABILITY_FAMILY_VALUES = Object.freeze([
  "core_fd",
  "capability_fd",
  "postflight_fd",
  "operational_fd",
  "fp_worker",
  "fh_gate"
] as const);

export type SdlcCapabilityFamily =
  (typeof SDLC_CAPABILITY_FAMILY_VALUES)[number];

export const SDLC_OPERATIONAL_LANE_VALUES = Object.freeze([
  "build",
  "test_execution",
  "deployment",
  "runtime_return"
] as const);

export type SdlcOperationalLane =
  (typeof SDLC_OPERATIONAL_LANE_VALUES)[number];

export const SDLC_OPERATIONAL_RESULT_STATUS_VALUES = Object.freeze([
  "succeeded",
  "failed",
  "pending"
] as const);

export type SdlcOperationalResultStatus =
  (typeof SDLC_OPERATIONAL_RESULT_STATUS_VALUES)[number];

export const SDLC_OPERATIONAL_STATE_VALUES = Object.freeze([
  "pending",
  "failed",
  "succeeded"
] as const);

export type SdlcOperationalState =
  (typeof SDLC_OPERATIONAL_STATE_VALUES)[number];

export interface SdlcAssetType {
  readonly kind: "sdlc_asset_type";
  readonly name: string;
  readonly description: string;
  readonly semanticFacets: readonly string[];
  readonly libraryLevel: string;
  readonly mutableDefault: boolean;
  readonly proofHints: readonly string[];
  readonly closureHints: readonly string[];
}

export interface SdlcAssetFamily {
  readonly kind: "sdlc_asset_family";
  readonly name: string;
  readonly description: string;
  readonly lifecycleRole: string;
  readonly representativeAssetTypes: readonly string[];
  readonly realizationStatus: string;
}

export interface SdlcAssetProvenance {
  readonly kind: "sdlc_asset_provenance";
  readonly model: SdlcAssetProvenanceModel;
  readonly source: string;
  readonly mutable: boolean;
  readonly historyBasis: string;
}

export interface SdlcAssetCheckpoint {
  readonly kind: "sdlc_asset_checkpoint";
  readonly exists: boolean;
  readonly pathKind: string;
  readonly contentDigest: string | null;
  readonly byteCount: number | null;
}

export interface SdlcAsset {
  readonly kind: "sdlc_asset";
  readonly assetId: string;
  readonly uri: string;
  readonly declaredType: string;
  readonly family: string;
  readonly mutability: SdlcAssetMutability;
  readonly provenance: SdlcAssetProvenance;
  readonly checkpoint: SdlcAssetCheckpoint | null;
}

export interface SdlcAssetBinding {
  readonly kind: "sdlc_asset_binding";
  readonly nodeName: string;
  readonly assetIds: readonly string[];
}

export interface SdlcWorksite {
  readonly kind: "sdlc_worksite";
  readonly worksiteId: string;
  readonly rootUri: string;
  readonly lifecycleState: SdlcWorksiteState;
  readonly activeAssetIds: readonly string[];
  readonly systemAssetRefs: readonly string[];
  readonly workspaceAssetRefs: readonly string[];
  readonly runtimeEvidenceRefs: readonly string[];
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedActionRef: string | null;
}

export interface SdlcWorksiteAssetRef {
  readonly kind: "sdlc_worksite_asset_ref";
  readonly ref: string;
  readonly role: SdlcWorksiteAssetRefRole;
  readonly description: string;
}

export interface SdlcWorksiteObservation {
  readonly kind: "sdlc_worksite_observation";
  readonly observationRef: string;
  readonly worksiteId: string;
  readonly systemAssetRefs: readonly string[];
  readonly workspaceAssetRefs: readonly string[];
  readonly runtimeEvidenceRefs: readonly string[];
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedActionRef: string | null;
  readonly targetBindingRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcLawfulActionMenuEntry {
  readonly kind: "sdlc_lawful_action_menu_entry";
  readonly actionId: string;
  readonly graphFunctionRef: string;
  readonly sourceAssetRefs: readonly string[];
  readonly targetAssetRef: string;
  readonly expectedCarrierRef: string;
  readonly humanDecision: string;
  readonly retryActionRef: string | null;
  readonly donePredicate: string;
}

export interface SdlcInstalledRunArchive {
  readonly kind: "sdlc_installed_run_archive";
  readonly archiveRoot: string;
  readonly workspaceRoot: string;
  readonly runtimeRoot: string;
  readonly operatorRunRefs: readonly string[];
  readonly processTraceRefs: readonly string[];
  readonly productEvidenceRefs: readonly string[];
  readonly executionProofRefs: readonly string[];
}

export interface SdlcConstructionEvidenceCycle {
  readonly kind: "sdlc_construction_evidence_cycle";
  readonly cycleRef: string;
  readonly worksiteObservationRef: string;
  readonly constructionIntentRef: string;
  readonly workerProcessRef: string;
  readonly edgeFulfillmentLedgerRef: string;
  readonly closureDecisionRef: string;
  readonly nextActionProjectionRef: string;
  readonly materializationManifestRef: string | null;
  readonly executionProofRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcWorkActDescriptor {
  readonly kind: "sdlc_work_act_descriptor";
  readonly name: string;
  readonly description: string;
  readonly mutatesWorkspace: boolean;
  readonly producesGovernedEvidence: boolean;
  readonly typicalAssetFamilies: readonly string[];
  readonly realizationStatus: string;
}

export interface SdlcWorkAct {
  readonly kind: "sdlc_work_act";
  readonly workActId: string;
  readonly descriptorName: string;
  readonly inputAssetIds: readonly string[];
  readonly outputAssetIds: readonly string[];
  readonly evidenceAssetIds: readonly string[];
  readonly provenance: SdlcAssetProvenance;
}

export interface SdlcCapability {
  readonly kind: "sdlc_capability";
  readonly capabilityId: string;
  readonly family: SdlcCapabilityFamily;
  readonly binding: string;
  readonly supportsAssetFamilies: readonly string[];
  readonly evidenceExpectation: string;
}

export interface SdlcOperationalTransitionCommand {
  readonly kind: "sdlc_operational_transition_command";
  readonly commandId: string;
  readonly lane: SdlcOperationalLane;
  readonly requiredSubstrateBinding: string;
  readonly capabilityContract: string;
  readonly returnedEvidenceExpectation: string;
  readonly targetAssetIds: readonly string[];
}

export interface SdlcOperationalResult {
  readonly kind: "sdlc_operational_result";
  readonly resultId: string;
  readonly commandId: string;
  readonly status: SdlcOperationalResultStatus;
  readonly evidenceAssetIds: readonly string[];
  readonly returnedAt: string | null;
}

export interface SdlcOperationalStateProjection {
  readonly kind: "sdlc_operational_state_projection";
  readonly projectionId: string;
  readonly commandId: string;
  readonly lane: SdlcOperationalLane;
  readonly state: SdlcOperationalState;
  readonly sourceResultIds: readonly string[];
  readonly sourceRuntimeFactRefs: readonly string[];
}
