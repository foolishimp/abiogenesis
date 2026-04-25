export type SdlcBootstrapInputKind =
  | "unstructured"
  | "loosely_structured"
  | "structured";

export type SdlcProjectElementType =
  | "project_identity"
  | "intent_candidate"
  | "requirement_candidate";

export type SdlcDerivationConfidence = "low" | "medium" | "high";

export type SdlcDerivationKind =
  | "bootstrap_conformance"
  | "semantic_extraction"
  | "authority_marker_projection"
  | "ambiguity_detection";

export interface SdlcBootstrapInputRef {
  readonly id: string;
  readonly kind: SdlcBootstrapInputKind;
  readonly uri: string;
  readonly digest: string;
  readonly mediaType: string;
  readonly authorityMarkers: readonly string[];
  readonly detectedSchemas: readonly string[];
  readonly summary: string;
}

export interface SdlcBootstrapInputSet {
  readonly kind: "sdlc_bootstrap_input_set";
  readonly id: string;
  readonly inputs: readonly SdlcBootstrapInputRef[];
}

export interface SdlcRuntimeProvenanceRef {
  readonly runId: string | null;
  readonly graphFunctionId: string;
  readonly graphFunctionName: string;
  readonly vectorId: string;
  readonly vectorName: string;
  readonly transitionKind: string;
  readonly eventKinds: readonly string[];
}

export interface SdlcProjectElement {
  readonly id: string;
  readonly elementType: SdlcProjectElementType;
  readonly assetId: string;
  readonly text: string;
  readonly sourceInputIds: readonly string[];
  readonly confidence: SdlcDerivationConfidence;
  readonly authorityRefs: readonly string[];
}

export interface SdlcAssetLineageEntry {
  readonly id: string;
  readonly sourceInputIds: readonly string[];
  readonly targetAssetId: string;
  readonly derivationKind: SdlcDerivationKind;
  readonly runtimeProvenance: SdlcRuntimeProvenanceRef;
}

export interface SdlcElementLineageEntry {
  readonly id: string;
  readonly sourceInputIds: readonly string[];
  readonly sourceElementIds: readonly string[];
  readonly targetElementId: string;
  readonly derivationKind: SdlcDerivationKind;
  readonly claim: string;
  readonly evidenceRefs: readonly string[];
  readonly confidence: SdlcDerivationConfidence;
  readonly runtimeProvenance: SdlcRuntimeProvenanceRef;
}

export interface SdlcDerivationLedger {
  readonly id: string;
  readonly assetLineage: readonly SdlcAssetLineageEntry[];
  readonly elementLineage: readonly SdlcElementLineageEntry[];
}

export interface SdlcAmbiguityEntry {
  readonly id: string;
  readonly sourceInputIds: readonly string[];
  readonly reason: string;
  readonly status: "open";
  readonly runtimeProvenance: SdlcRuntimeProvenanceRef;
}

export interface SdlcProject {
  readonly kind: "sdlc_project";
  readonly id: string;
  readonly inputSetId: string;
  readonly name: string;
  readonly authoritySurfaceIds: readonly string[];
  readonly elements: readonly SdlcProjectElement[];
  readonly ambiguityEntries: readonly SdlcAmbiguityEntry[];
  readonly derivationLedger: SdlcDerivationLedger;
}
