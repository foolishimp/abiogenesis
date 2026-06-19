// Implements: REQ-F-ODDSDLC-007
// Implements: REQ-F-ODDSDLC-012
// Implements: REQ-F-ODDSDLC-016
// Implements: REQ-F-ODDSDLC-022
// Implements: REQ-F-ODDSDLC-032

import {
  FG_CONFORM_PROJECT,
  FG_INGRESS_PROJECT,
  type IngressSourceSet,
  type ProjectIngressContract
} from "../graph/library.js";
import type { SdlcProfileOverlayStrategy } from "../shared/overlay_strategy.js";

export const SDLC_SOURCE_INPUT_ROLE_VALUES = Object.freeze([
  "intent_surface",
  "requirement_surface",
  "project_constraints",
  "project_readme",
  "appendix_surface",
  "unstructured"
] as const);

export type SdlcSourceInputRole =
  (typeof SDLC_SOURCE_INPUT_ROLE_VALUES)[number];

export const SDLC_AMBIGUITY_KIND_VALUES = Object.freeze([
  "none",
  "ambiguous"
] as const);

export type SdlcAmbiguityKind =
  (typeof SDLC_AMBIGUITY_KIND_VALUES)[number];

export interface SdlcIngressAmbiguity {
  readonly kind: SdlcAmbiguityKind;
  readonly reasons: readonly string[];
}

export interface SdlcSourceInput {
  readonly kind: "sdlc_source_input";
  readonly uri: string;
  readonly relativePath: string;
  readonly digest: string;
  readonly detectedRole: SdlcSourceInputRole;
  readonly authorityMarkers: readonly string[];
  readonly ambiguity: SdlcIngressAmbiguity;
}

export interface SdlcProjectConstraints {
  readonly kind: "sdlc_project_constraints";
  readonly projectSlug: string;
  readonly activeTenant: string;
  readonly selectedOutputRoot: string;
  readonly runtimeLayout: SdlcRuntimeLayout;
  readonly ambiguityRiskAppetite: "low" | "medium" | "high";
  readonly capabilityContracts: readonly string[];
}

export interface SdlcRuntimeLayout {
  readonly kind: "sdlc_runtime_layout";
  readonly runtimeRoot: string;
  readonly transformAssetRoot: string;
  readonly operatorRunRoot: string;
  readonly productMaterializationRootPolicy: "selected_output_root";
}

export const SDLC_REALIZATION_MODE_VALUES = Object.freeze([
  "selected_output_tree",
  "planned_output_tree",
  "generated_proving_subset"
] as const);

export type SdlcRealizationMode =
  (typeof SDLC_REALIZATION_MODE_VALUES)[number];

export interface SdlcCapabilityContract {
  readonly kind: "sdlc_capability_contract";
  readonly name: string;
  readonly value: string;
}

export interface SdlcConformProjectProfile {
  readonly kind: "sdlc_conform_project_profile";
  readonly workspaceName: string;
  readonly projectSlug: string;
  readonly projectKind: string;
  readonly language: string;
  readonly testRunner: string;
  readonly tool: string;
  readonly version: string;
  readonly moduleStructure: string;
  readonly declaredModuleNames: readonly string[];
  readonly ambiguityRiskAppetite: "low" | "medium" | "high";
  readonly activeTenant: string;
  readonly selectedOutputRoot: string;
  readonly declaredOutputRoot: string;
  readonly runtimeLayout: SdlcRuntimeLayout;
  readonly buildExecutionContract: string;
  readonly testExecutionContract: string;
  readonly deploymentContract: string;
  readonly runtimeObservationContract: string;
  readonly capabilityContracts: readonly SdlcCapabilityContract[];
  readonly rootCodePolicy: string;
  readonly realizationMode: SdlcRealizationMode;
  readonly overlayStrategy: SdlcProfileOverlayStrategy;
  readonly overlayRef: string;
  readonly resolutionReason: string;
  readonly sourceConstraintDigest: string;
}

export interface SdlcConformProjectReport {
  readonly kind: "sdlc_conform_project_report";
  readonly governingGraphFunction: typeof FG_CONFORM_PROJECT;
  readonly status: "passed" | "blocked";
  readonly workspaceRootUri: string;
  readonly sourceRefs: readonly string[];
  readonly materializedTopologyRefs: readonly string[];
  readonly profile: SdlcConformProjectProfile;
  readonly conformanceGaps: readonly string[];
}

export const SDLC_MANAGED_TRAVERSAL_PHASE_VALUES = Object.freeze([
  "prestep",
  "execute",
  "postprocess"
] as const);

export type SdlcManagedTraversalPhase =
  (typeof SDLC_MANAGED_TRAVERSAL_PHASE_VALUES)[number];

export interface SdlcManagedTraversalPhaseContract {
  readonly kind: "sdlc_managed_traversal_phase_contract";
  readonly phase: SdlcManagedTraversalPhase;
  readonly contract: string;
}

export interface SdlcManagedTraversalManifest {
  readonly kind: "sdlc_managed_traversal_manifest";
  readonly graphFunctionName: typeof FG_CONFORM_PROJECT;
  readonly sourceType: "unordered_source_set";
  readonly targetType: "constitutional_bootstrap";
  readonly workspaceRootUri: string;
  readonly sourceRefs: readonly string[];
  readonly expectedOutputRelativePaths: readonly string[];
  readonly phaseContracts: readonly SdlcManagedTraversalPhaseContract[];
}

export interface SdlcImportedRequirementAuthority {
  readonly kind: "sdlc_imported_requirement_authority";
  /**
   * Backward-compatible operator display alias. Closure authority is
   * `requirementAuthorityRef`.
   */
  readonly requirementId: string;
  readonly requirementDisplayId: string;
  readonly requirementAuthorityRef: string;
  readonly authorityMarkerRef: string;
  readonly authorityDerivationRefs: readonly string[];
  readonly sourceUri: string;
  readonly sourceDigest: string;
}

export type SdlcRequirementTransformAuthorityStatus =
  | "current"
  | "stale"
  | "ambiguous"
  | "contradictory";

export interface SdlcRequirementTransformAuthority {
  readonly kind: "sdlc_requirement_transform_authority";
  readonly requirementId: string;
  readonly requirementDisplayId: string;
  readonly requirementAuthorityRef: string;
  readonly transformRef: string;
  readonly predecessorTransformRefs: readonly string[];
  readonly transformInputAuthorityRef: string;
  readonly transformOutputAuthorityRef: string;
  readonly sourceInputUris: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly status: SdlcRequirementTransformAuthorityStatus;
}

export interface SdlcBootstrapLineageRecord {
  readonly kind: "sdlc_bootstrap_lineage_record";
  readonly elementId: string;
  readonly elementKind: "project" | "requirement_seed" | "authority_marker";
  readonly sourceInputUris: readonly string[];
  readonly requirementId?: string;
  readonly requirementDisplayId?: string;
  readonly requirementAuthorityRef?: string;
  readonly authorityDerivationRefs?: readonly string[];
}

export interface SdlcWorkspaceIngressReport {
  readonly kind: "sdlc_workspace_ingress_report";
  readonly governingGraphFunction: typeof FG_INGRESS_PROJECT;
  readonly workspaceRootUri: string;
  readonly projectConstraints: SdlcProjectConstraints;
  readonly ingressSourceSet: IngressSourceSet;
  readonly projectIngressContract: ProjectIngressContract;
  readonly sourceInputs: readonly SdlcSourceInput[];
  readonly importedRequirementAuthorities: readonly SdlcImportedRequirementAuthority[];
  readonly requirementTransformAuthorities: readonly SdlcRequirementTransformAuthority[];
  readonly lineage: readonly SdlcBootstrapLineageRecord[];
  readonly ambiguityRegister: readonly string[];
  readonly bootstrapGapSet: readonly string[];
}

export interface SdlcSourceInputSnapshot {
  readonly uri: string;
  readonly relativePath: string;
  readonly content: string;
}
