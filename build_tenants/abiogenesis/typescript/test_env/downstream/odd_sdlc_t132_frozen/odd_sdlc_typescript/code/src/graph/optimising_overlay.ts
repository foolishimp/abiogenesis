import {
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import type {
  SdlcTraversalOutcomeClass
} from "../contracts/carrier_domain_catalog.js";
import type {
  SdlcTraversalOverlayRef
} from "../shared/overlay_strategy.js";
import {
  admitSdlcTraversalOverlayRef
} from "../shared/overlay_strategy.js";

export const SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION =
  "Fg_bootstrap_sdlc_entry" as const;

export const SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF =
  "overlay://odd-sdlc/bootstrap-entry-optimising" as const;

export type SdlcBootstrapTraversalOutcomeStatus =
  | "entry_admitted"
  | "entry_rejected";

export type SdlcBootstrapOptimizationStatus =
  | "optimized"
  | "generic_fallback";

export interface TypedSdlcEntryNode {
  readonly kind: "typed_sdlc_entry_node";
  readonly entryNodeRef: string;
  readonly sourceTypeName: "type.unstructured";
  readonly targetTypeName: "typed_sdlc_entry";
  readonly workspaceIdentityRef: string;
  readonly projectSlug: string;
  readonly selectedOutputRoot: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly landscapeFactRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcBootstrapEntryNonAdmission {
  readonly kind: "sdlc_bootstrap_entry_non_admission";
  readonly nonAdmissionRef: string;
  readonly sourceTypeName: "type.unstructured";
  readonly targetTypeName: "typed_sdlc_entry";
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly fallbackGraphFunctionRef: string;
  readonly genericFpRequired: true;
  readonly reasonRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcBootstrapProportionalityReport {
  readonly kind: "sdlc_bootstrap_proportionality_report";
  readonly reportRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly profileClass: "compact" | "broad";
  readonly optimizationStatus: SdlcBootstrapOptimizationStatus;
  readonly selectedOptimisingOverlayRef: typeof SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF;
  readonly selectedChildOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly selectedStartTargetRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly deterministicSpecializationAdmitted: boolean;
  readonly applicabilityEnvelopeRefs: readonly string[];
  readonly landscapeFactRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureBehaviorRef: string;
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcBootstrapTraversalOutcome {
  readonly kind: "sdlc_bootstrap_traversal_outcome";
  readonly outcomeRef: string;
  readonly graphFunctionName: typeof SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION;
  readonly sourceTypeName: "type.unstructured";
  readonly targetTypeName: "typed_sdlc_entry";
  readonly status: SdlcBootstrapTraversalOutcomeStatus;
  readonly entryNodeRef: string | null;
  readonly entryNonAdmissionRef: string | null;
  readonly proportionalityReportRef: string;
  readonly selectedOptimisingOverlayRef: typeof SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF;
  readonly selectedChildOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly optimizationStatus: SdlcBootstrapOptimizationStatus;
  readonly optimizationNonAdmissionReasonRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcBootstrapPreStartExecutionContract {
  readonly kind: "sdlc_bootstrap_pre_start_execution_contract";
  readonly contractRef: string;
  readonly graphFunctionName: typeof SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION;
  readonly sourceTypeName: "type.unstructured";
  readonly targetTypeName: "sdlc_bootstrap_traversal_outcome";
  readonly outcomeRef: string;
  readonly workspaceIdentityRef: string;
  readonly objectiveRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly fallbackGraphFunctionRef: string;
  readonly replayIdentityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcOptimisingOverlay {
  readonly kind: "sdlc_optimising_overlay";
  readonly overlayRef: typeof SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF;
  readonly overlayRole: "optimising_parent_overlay";
  readonly childOverlayRefs: readonly SdlcTraversalOverlayRef[];
  readonly candidateGraphFunctionRefs: readonly string[];
  readonly outputContract:
    "admitted_overlay_binding_or_edge_specialization";
  readonly createsRuntimeTruth: false;
  readonly ownsClosureAuthority: false;
  readonly queryDomainReadModelOnly: true;
  readonly genericFallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly proofLaneRefs: readonly string[];
}

export interface SdlcOptimizedOverlayBinding {
  readonly kind: "sdlc_optimized_overlay_binding";
  readonly bindingRef: string;
  readonly optimisingOverlayRef: typeof SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF;
  readonly childOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly selectedEdgeContractRefs: readonly string[];
  readonly ticketObjectiveRefs: readonly string[];
  readonly status: SdlcBootstrapOptimizationStatus;
  readonly genericFallbackRequired: boolean;
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly closureAuthorityRef: "edge-assurance-contracts";
  readonly basisRefs: readonly string[];
}

export interface SdlcOptimizedEdgeSpecialization {
  readonly kind: "sdlc_optimized_edge_specialization";
  readonly specializationRef: string;
  readonly optimisingOverlayRef: typeof SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF;
  readonly childOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly deterministicTransformRef: string;
  readonly edgeAssuranceContractRef: string;
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureBehaviorRef: string;
  readonly status: "admitted" | "not_admitted";
  readonly nonAdmissionReasonRefs: readonly string[];
}

export interface SdlcBootstrapPublicStartOptimization {
  readonly kind: "sdlc_bootstrap_public_start_optimization";
  readonly optimisingOverlay: SdlcOptimisingOverlay;
  readonly preStartExecutionContract: SdlcBootstrapPreStartExecutionContract;
  readonly outcome: SdlcBootstrapTraversalOutcome;
  readonly entryNode: TypedSdlcEntryNode | null;
  readonly entryNonAdmission: SdlcBootstrapEntryNonAdmission | null;
  readonly proportionalityReport: SdlcBootstrapProportionalityReport;
  readonly optimizedOverlayBinding: SdlcOptimizedOverlayBinding;
  readonly optimizedEdgeSpecialization: SdlcOptimizedEdgeSpecialization;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.filter((value) => value.length > 0))]);
}

function compactRefPart(value: string): string {
  return encodeURIComponent(value).replaceAll("%2F", "~");
}

function parseTraversalOverlayRef(value: unknown, label: string): SdlcTraversalOverlayRef {
  return admitSdlcTraversalOverlayRef(parseNonEmptyString(value, label), label);
}

function profileClassFor(outcomeClass: SdlcTraversalOutcomeClass): "compact" | "broad" {
  return outcomeClass === "domain_product" ? "broad" : "compact";
}

function admittedOptimizationStatus(
  status: SdlcBootstrapOptimizationStatus
): "admitted" | "not_admitted" {
  return status === "optimized" ? "admitted" : "not_admitted";
}

function assertTraversalOutcomeShape(
  outcome: SdlcBootstrapTraversalOutcome
): void {
  const hasEntry = outcome.entryNodeRef !== null;
  const hasNonAdmission = outcome.entryNonAdmissionRef !== null;
  if (hasEntry === hasNonAdmission) {
    throw new TypeError(
      "SdlcBootstrapTraversalOutcome requires exactly one entryNodeRef or entryNonAdmissionRef"
    );
  }
  if (outcome.status === "entry_admitted" && !hasEntry) {
    throw new TypeError("entry_admitted outcome requires entryNodeRef");
  }
  if (outcome.status === "entry_rejected" && !hasNonAdmission) {
    throw new TypeError("entry_rejected outcome requires entryNonAdmissionRef");
  }
  if (
    outcome.optimizationStatus === "generic_fallback" &&
    outcome.optimizationNonAdmissionReasonRefs.length === 0
  ) {
    throw new TypeError(
      "generic_fallback outcome requires optimizationNonAdmissionReasonRefs"
    );
  }
}

export function constructSdlcOptimisingOverlay(input: {
  readonly childOverlayRefs: readonly SdlcTraversalOverlayRef[];
  readonly candidateGraphFunctionRefs: readonly string[];
  readonly genericFallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly proofLaneRefs?: readonly string[];
}): SdlcOptimisingOverlay {
  if (input.childOverlayRefs.length === 0) {
    throw new TypeError("SdlcOptimisingOverlay.childOverlayRefs must be non-empty");
  }
  if (input.candidateGraphFunctionRefs.length === 0) {
    throw new TypeError(
      "SdlcOptimisingOverlay.candidateGraphFunctionRefs must be non-empty"
    );
  }
  return Object.freeze({
    kind: "sdlc_optimising_overlay" as const,
    overlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    overlayRole: "optimising_parent_overlay" as const,
    childOverlayRefs: Object.freeze([...input.childOverlayRefs]),
    candidateGraphFunctionRefs: Object.freeze([...input.candidateGraphFunctionRefs]),
    outputContract: "admitted_overlay_binding_or_edge_specialization" as const,
    createsRuntimeTruth: false as const,
    ownsClosureAuthority: false as const,
    queryDomainReadModelOnly: true as const,
    genericFallbackOverlayRef: input.genericFallbackOverlayRef,
    proofLaneRefs: Object.freeze([
      ...(input.proofLaneRefs ?? [
        "proof://odd-sdlc/t165/bootstrap-proportionality",
        "proof://odd-sdlc/t165/generic-fp-fallback"
      ])
    ])
  });
}

export function constructTypedSdlcEntryNode(input: {
  readonly entryNodeRef: string;
  readonly workspaceIdentityRef: string;
  readonly projectSlug: string;
  readonly selectedOutputRoot: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly landscapeFactRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}): TypedSdlcEntryNode {
  return Object.freeze({
    kind: "typed_sdlc_entry_node" as const,
    entryNodeRef: parseNonEmptyString(input.entryNodeRef, "entryNodeRef"),
    sourceTypeName: "type.unstructured" as const,
    targetTypeName: "typed_sdlc_entry" as const,
    workspaceIdentityRef: parseNonEmptyString(
      input.workspaceIdentityRef,
      "workspaceIdentityRef"
    ),
    projectSlug: parseNonEmptyString(input.projectSlug, "projectSlug"),
    selectedOutputRoot: parseNonEmptyString(
      input.selectedOutputRoot,
      "selectedOutputRoot"
    ),
    outcomeClass: input.outcomeClass,
    landscapeFactRefs: uniqueStrings(input.landscapeFactRefs),
    capabilityRefs: uniqueStrings(input.capabilityRefs),
    sourceRefs: uniqueStrings(input.sourceRefs),
    predecessorRefs: uniqueStrings(input.predecessorRefs)
  });
}

export function constructSdlcBootstrapEntryNonAdmission(input: {
  readonly nonAdmissionRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly fallbackGraphFunctionRef: string;
  readonly reasonRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}): SdlcBootstrapEntryNonAdmission {
  if (input.reasonRefs.length === 0) {
    throw new TypeError("SdlcBootstrapEntryNonAdmission.reasonRefs must be non-empty");
  }
  return Object.freeze({
    kind: "sdlc_bootstrap_entry_non_admission" as const,
    nonAdmissionRef: parseNonEmptyString(input.nonAdmissionRef, "nonAdmissionRef"),
    sourceTypeName: "type.unstructured" as const,
    targetTypeName: "typed_sdlc_entry" as const,
    fallbackOverlayRef: input.fallbackOverlayRef,
    fallbackGraphFunctionRef: parseNonEmptyString(
      input.fallbackGraphFunctionRef,
      "fallbackGraphFunctionRef"
    ),
    genericFpRequired: true as const,
    reasonRefs: uniqueStrings(input.reasonRefs),
    sourceRefs: uniqueStrings(input.sourceRefs),
    predecessorRefs: uniqueStrings(input.predecessorRefs)
  });
}

export function constructSdlcBootstrapProportionalityReport(input: {
  readonly reportRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly optimizationStatus: SdlcBootstrapOptimizationStatus;
  readonly selectedChildOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly selectedStartTargetRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly deterministicSpecializationAdmitted: boolean;
  readonly applicabilityEnvelopeRefs: readonly string[];
  readonly landscapeFactRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureBehaviorRef: string;
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}): SdlcBootstrapProportionalityReport {
  if (
    input.optimizationStatus === "generic_fallback" &&
    input.nonAdmissionReasonRefs.length === 0
  ) {
    throw new TypeError(
      "generic_fallback proportionality report requires nonAdmissionReasonRefs"
    );
  }
  return Object.freeze({
    kind: "sdlc_bootstrap_proportionality_report" as const,
    reportRef: parseNonEmptyString(input.reportRef, "reportRef"),
    outcomeClass: input.outcomeClass,
    profileClass: profileClassFor(input.outcomeClass),
    optimizationStatus: input.optimizationStatus,
    selectedOptimisingOverlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    selectedChildOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: parseNonEmptyString(
      input.selectedGraphFunctionRef,
      "selectedGraphFunctionRef"
    ),
    selectedStartTargetRef: parseNonEmptyString(
      input.selectedStartTargetRef,
      "selectedStartTargetRef"
    ),
    fallbackOverlayRef: input.fallbackOverlayRef,
    deterministicSpecializationAdmitted: input.deterministicSpecializationAdmitted,
    applicabilityEnvelopeRefs: uniqueStrings(input.applicabilityEnvelopeRefs),
    landscapeFactRefs: uniqueStrings(input.landscapeFactRefs),
    proofLaneRefs: uniqueStrings(input.proofLaneRefs),
    residualPressureBehaviorRef: parseNonEmptyString(
      input.residualPressureBehaviorRef,
      "residualPressureBehaviorRef"
    ),
    nonAdmissionReasonRefs: uniqueStrings(input.nonAdmissionReasonRefs),
    predecessorRefs: uniqueStrings(input.predecessorRefs)
  });
}

export function constructSdlcBootstrapTraversalOutcome(input: {
  readonly outcomeRef: string;
  readonly status: SdlcBootstrapTraversalOutcomeStatus;
  readonly entryNodeRef: string | null;
  readonly entryNonAdmissionRef: string | null;
  readonly proportionalityReportRef: string;
  readonly selectedChildOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly optimizationStatus: SdlcBootstrapOptimizationStatus;
  readonly optimizationNonAdmissionReasonRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}): SdlcBootstrapTraversalOutcome {
  const outcome = Object.freeze({
    kind: "sdlc_bootstrap_traversal_outcome" as const,
    outcomeRef: parseNonEmptyString(input.outcomeRef, "outcomeRef"),
    graphFunctionName: SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION,
    sourceTypeName: "type.unstructured" as const,
    targetTypeName: "typed_sdlc_entry" as const,
    status: input.status,
    entryNodeRef:
      input.entryNodeRef === null
        ? null
        : parseNonEmptyString(input.entryNodeRef, "entryNodeRef"),
    entryNonAdmissionRef:
      input.entryNonAdmissionRef === null
        ? null
        : parseNonEmptyString(input.entryNonAdmissionRef, "entryNonAdmissionRef"),
    proportionalityReportRef: parseNonEmptyString(
      input.proportionalityReportRef,
      "proportionalityReportRef"
    ),
    selectedOptimisingOverlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    selectedChildOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: parseNonEmptyString(
      input.selectedGraphFunctionRef,
      "selectedGraphFunctionRef"
    ),
    fallbackOverlayRef: input.fallbackOverlayRef,
    optimizationStatus: input.optimizationStatus,
    optimizationNonAdmissionReasonRefs: uniqueStrings(
      input.optimizationNonAdmissionReasonRefs
    ),
    predecessorRefs: uniqueStrings(input.predecessorRefs)
  });
  assertTraversalOutcomeShape(outcome);
  return outcome;
}

export function constructSdlcBootstrapPreStartExecutionContract(input: {
  readonly contractRef: string;
  readonly outcomeRef: string;
  readonly workspaceIdentityRef: string;
  readonly objectiveRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly fallbackGraphFunctionRef: string;
  readonly replayIdentityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}): SdlcBootstrapPreStartExecutionContract {
  const replayIdentityRefs = uniqueStrings(input.replayIdentityRefs);
  if (replayIdentityRefs.length === 0) {
    throw new TypeError(
      "SdlcBootstrapPreStartExecutionContract.replayIdentityRefs must be non-empty"
    );
  }
  return Object.freeze({
    kind: "sdlc_bootstrap_pre_start_execution_contract" as const,
    contractRef: parseNonEmptyString(input.contractRef, "contractRef"),
    graphFunctionName: SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION,
    sourceTypeName: "type.unstructured" as const,
    targetTypeName: "sdlc_bootstrap_traversal_outcome" as const,
    outcomeRef: parseNonEmptyString(input.outcomeRef, "outcomeRef"),
    workspaceIdentityRef: parseNonEmptyString(
      input.workspaceIdentityRef,
      "workspaceIdentityRef"
    ),
    objectiveRef: parseNonEmptyString(input.objectiveRef, "objectiveRef"),
    fallbackOverlayRef: input.fallbackOverlayRef,
    fallbackGraphFunctionRef: parseNonEmptyString(
      input.fallbackGraphFunctionRef,
      "fallbackGraphFunctionRef"
    ),
    replayIdentityRefs,
    evidenceRefs: uniqueStrings(input.evidenceRefs)
  });
}

export function constructSdlcOptimizedOverlayBinding(input: {
  readonly bindingRef: string;
  readonly childOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly selectedEdgeContractRefs: readonly string[];
  readonly ticketObjectiveRefs: readonly string[];
  readonly status: SdlcBootstrapOptimizationStatus;
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly basisRefs: readonly string[];
}): SdlcOptimizedOverlayBinding {
  if (
    input.status === "generic_fallback" &&
    input.nonAdmissionReasonRefs.length === 0
  ) {
    throw new TypeError(
      "generic_fallback optimized overlay binding requires nonAdmissionReasonRefs"
    );
  }
  return Object.freeze({
    kind: "sdlc_optimized_overlay_binding" as const,
    bindingRef: parseNonEmptyString(input.bindingRef, "bindingRef"),
    optimisingOverlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    childOverlayRef: input.childOverlayRef,
    selectedGraphFunctionRef: parseNonEmptyString(
      input.selectedGraphFunctionRef,
      "selectedGraphFunctionRef"
    ),
    selectedEdgeContractRefs: uniqueStrings(input.selectedEdgeContractRefs),
    ticketObjectiveRefs: uniqueStrings(input.ticketObjectiveRefs),
    status: input.status,
    genericFallbackRequired: input.status === "generic_fallback",
    nonAdmissionReasonRefs: uniqueStrings(input.nonAdmissionReasonRefs),
    closureAuthorityRef: "edge-assurance-contracts" as const,
    basisRefs: uniqueStrings(input.basisRefs)
  });
}

export function constructSdlcOptimizedEdgeSpecialization(input: {
  readonly specializationRef: string;
  readonly childOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly deterministicTransformRef: string;
  readonly edgeAssuranceContractRef: string;
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureBehaviorRef: string;
  readonly status: "admitted" | "not_admitted";
  readonly nonAdmissionReasonRefs: readonly string[];
}): SdlcOptimizedEdgeSpecialization {
  if (input.status === "not_admitted" && input.nonAdmissionReasonRefs.length === 0) {
    throw new TypeError(
      "not_admitted optimized edge specialization requires nonAdmissionReasonRefs"
    );
  }
  return Object.freeze({
    kind: "sdlc_optimized_edge_specialization" as const,
    specializationRef: parseNonEmptyString(
      input.specializationRef,
      "specializationRef"
    ),
    optimisingOverlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    childOverlayRef: input.childOverlayRef,
    selectedGraphFunctionRef: parseNonEmptyString(
      input.selectedGraphFunctionRef,
      "selectedGraphFunctionRef"
    ),
    deterministicTransformRef: parseNonEmptyString(
      input.deterministicTransformRef,
      "deterministicTransformRef"
    ),
    edgeAssuranceContractRef: parseNonEmptyString(
      input.edgeAssuranceContractRef,
      "edgeAssuranceContractRef"
    ),
    proofLaneRefs: uniqueStrings(input.proofLaneRefs),
    residualPressureBehaviorRef: parseNonEmptyString(
      input.residualPressureBehaviorRef,
      "residualPressureBehaviorRef"
    ),
    status: input.status,
    nonAdmissionReasonRefs: uniqueStrings(input.nonAdmissionReasonRefs)
  });
}

export function constructSdlcBootstrapPublicStartOptimization(input: {
  readonly workspaceIdentityRef: string;
  readonly projectSlug: string;
  readonly selectedOutputRoot: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly selectedChildOverlayRef: SdlcTraversalOverlayRef;
  readonly selectedGraphFunctionRef: string;
  readonly selectedStartTargetRef: string;
  readonly fallbackOverlayRef: SdlcTraversalOverlayRef;
  readonly fallbackGraphFunctionRef: string;
  readonly optimizationAdmitted: boolean;
  readonly landscapeFactRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly applicabilityEnvelopeRefs: readonly string[];
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly ticketObjectiveRefs?: readonly string[];
}): SdlcBootstrapPublicStartOptimization {
  const basis = [
    input.projectSlug,
    input.selectedChildOverlayRef,
    input.selectedGraphFunctionRef,
    input.outcomeClass
  ].map(compactRefPart).join("/");
  const optimizationStatus: SdlcBootstrapOptimizationStatus =
    input.optimizationAdmitted ? "optimized" : "generic_fallback";
  const defaultReasonRefs =
    optimizationStatus === "generic_fallback" &&
    input.nonAdmissionReasonRefs.length === 0
      ? ["optimization-non-admission://odd-sdlc/bootstrap-entry/domain-product"]
      : input.nonAdmissionReasonRefs;
  const outcomeRef = `bootstrap-outcome://odd-sdlc/${basis}`;
  const reportRef = `proportionality-report://odd-sdlc/${basis}`;
  const entryNodeRef = input.optimizationAdmitted
    ? `entry-node://odd-sdlc/${basis}`
    : null;
  const nonAdmissionRef = input.optimizationAdmitted
    ? null
    : `entry-non-admission://odd-sdlc/${basis}`;
  const entryNode = entryNodeRef === null
    ? null
    : constructTypedSdlcEntryNode({
        entryNodeRef,
        workspaceIdentityRef: input.workspaceIdentityRef,
        projectSlug: input.projectSlug,
        selectedOutputRoot: input.selectedOutputRoot,
        outcomeClass: input.outcomeClass,
        landscapeFactRefs: input.landscapeFactRefs,
        capabilityRefs: input.capabilityRefs,
        sourceRefs: input.sourceRefs,
        predecessorRefs: [
          input.workspaceIdentityRef,
          ...input.landscapeFactRefs,
          ...input.capabilityRefs
        ]
      });
  const entryNonAdmission = nonAdmissionRef === null
    ? null
    : constructSdlcBootstrapEntryNonAdmission({
        nonAdmissionRef,
        fallbackOverlayRef: input.fallbackOverlayRef,
        fallbackGraphFunctionRef: input.fallbackGraphFunctionRef,
        reasonRefs: defaultReasonRefs,
        sourceRefs: input.sourceRefs,
        predecessorRefs: [
          input.workspaceIdentityRef,
          ...input.landscapeFactRefs,
          ...defaultReasonRefs
        ]
      });
  const proofLaneRefs = Object.freeze([
    "proof://odd-sdlc/t165/bootstrap-proportionality",
    "proof://odd-sdlc/t165/generic-fp-fallback"
  ]);
  const residualPressureBehaviorRef =
    "residual-pressure://odd-sdlc/t164-edge-assurance-preserved";
  const proportionalityReport = constructSdlcBootstrapProportionalityReport({
    reportRef,
    outcomeClass: input.outcomeClass,
    optimizationStatus,
    selectedChildOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: input.selectedGraphFunctionRef,
    selectedStartTargetRef: input.selectedStartTargetRef,
    fallbackOverlayRef: input.fallbackOverlayRef,
    deterministicSpecializationAdmitted: input.optimizationAdmitted,
    applicabilityEnvelopeRefs: input.applicabilityEnvelopeRefs,
    landscapeFactRefs: input.landscapeFactRefs,
    proofLaneRefs,
    residualPressureBehaviorRef,
    nonAdmissionReasonRefs: defaultReasonRefs,
    predecessorRefs: [
      ...(entryNode?.predecessorRefs ?? []),
      ...(entryNonAdmission?.predecessorRefs ?? [])
    ]
  });
  const outcome = constructSdlcBootstrapTraversalOutcome({
    outcomeRef,
    status: input.optimizationAdmitted ? "entry_admitted" : "entry_rejected",
    entryNodeRef,
    entryNonAdmissionRef: nonAdmissionRef,
    proportionalityReportRef: proportionalityReport.reportRef,
    selectedChildOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: input.selectedGraphFunctionRef,
    fallbackOverlayRef: input.fallbackOverlayRef,
    optimizationStatus,
    optimizationNonAdmissionReasonRefs: defaultReasonRefs,
    predecessorRefs: [
      proportionalityReport.reportRef,
      ...(entryNode === null ? [] : [entryNode.entryNodeRef]),
      ...(entryNonAdmission === null ? [] : [entryNonAdmission.nonAdmissionRef])
    ]
  });
  const preStartExecutionContract =
    constructSdlcBootstrapPreStartExecutionContract({
      contractRef: `pre-start-execution-contract://odd-sdlc/${basis}`,
      outcomeRef: outcome.outcomeRef,
      workspaceIdentityRef: input.workspaceIdentityRef,
      objectiveRef:
        input.ticketObjectiveRefs?.[0] ?? `objective://odd-sdlc/bootstrap-entry/${basis}`,
      fallbackOverlayRef: input.fallbackOverlayRef,
      fallbackGraphFunctionRef: input.fallbackGraphFunctionRef,
      replayIdentityRefs: [
        input.workspaceIdentityRef,
        outcome.outcomeRef,
        proportionalityReport.reportRef,
        ...(entryNode === null ? [] : [entryNode.entryNodeRef]),
        ...(entryNonAdmission === null ? [] : [entryNonAdmission.nonAdmissionRef])
      ],
      evidenceRefs: [
        outcome.outcomeRef,
        proportionalityReport.reportRef,
        input.selectedChildOverlayRef,
        input.fallbackOverlayRef
      ]
    });
  const optimisingOverlay = constructSdlcOptimisingOverlay({
    childOverlayRefs: [input.selectedChildOverlayRef, input.fallbackOverlayRef],
    candidateGraphFunctionRefs: [
      input.selectedGraphFunctionRef,
      input.fallbackGraphFunctionRef
    ],
    genericFallbackOverlayRef: input.fallbackOverlayRef,
    proofLaneRefs
  });
  const optimizedOverlayBinding = constructSdlcOptimizedOverlayBinding({
    bindingRef: `optimized-overlay-binding://odd-sdlc/${basis}`,
    childOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: input.selectedGraphFunctionRef,
    selectedEdgeContractRefs: [
      "edge-assurance-contract://odd-sdlc/t164",
      `edge-assurance-contract://odd-sdlc/${compactRefPart(input.selectedStartTargetRef)}`
    ],
    ticketObjectiveRefs: input.ticketObjectiveRefs ?? [
      ".ai-workspace/tickets/active/T-165-define-optimising-overlay-for-landscape-conditioned-fd-specialization.md"
    ],
    status: optimizationStatus,
    nonAdmissionReasonRefs: defaultReasonRefs,
    basisRefs: [
      outcome.outcomeRef,
      proportionalityReport.reportRef,
      ...(entryNode === null ? [] : [entryNode.entryNodeRef]),
      ...(entryNonAdmission === null ? [] : [entryNonAdmission.nonAdmissionRef])
    ]
  });
  const optimizedEdgeSpecialization = constructSdlcOptimizedEdgeSpecialization({
    specializationRef: `optimized-edge-specialization://odd-sdlc/${basis}`,
    childOverlayRef: input.selectedChildOverlayRef,
    selectedGraphFunctionRef: input.selectedGraphFunctionRef,
    deterministicTransformRef:
      `deterministic-transform://odd-sdlc/bootstrap-entry/${compactRefPart(input.outcomeClass)}`,
    edgeAssuranceContractRef: "edge-assurance-contract://odd-sdlc/t164",
    proofLaneRefs,
    residualPressureBehaviorRef,
    status: admittedOptimizationStatus(optimizationStatus),
    nonAdmissionReasonRefs: defaultReasonRefs
  });
  return Object.freeze({
    kind: "sdlc_bootstrap_public_start_optimization" as const,
    optimisingOverlay,
    preStartExecutionContract,
    outcome,
    entryNode,
    entryNonAdmission,
    proportionalityReport,
    optimizedOverlayBinding,
    optimizedEdgeSpecialization
  });
}

export function admitSdlcBootstrapTraversalOutcome(
  input: unknown,
  label = "SdlcBootstrapTraversalOutcome"
): SdlcBootstrapTraversalOutcome {
  const record = parseClosedRecord(input, label, [
    "kind",
    "outcomeRef",
    "graphFunctionName",
    "sourceTypeName",
    "targetTypeName",
    "status",
    "entryNodeRef",
    "entryNonAdmissionRef",
    "proportionalityReportRef",
    "selectedOptimisingOverlayRef",
    "selectedChildOverlayRef",
    "selectedGraphFunctionRef",
    "fallbackOverlayRef",
    "optimizationStatus",
    "optimizationNonAdmissionReasonRefs",
    "predecessorRefs"
  ]);
  parseEnumValue(record["kind"], `${label}.kind`, [
    "sdlc_bootstrap_traversal_outcome"
  ]);
  parseEnumValue(record["graphFunctionName"], `${label}.graphFunctionName`, [
    SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION
  ]);
  parseEnumValue(record["sourceTypeName"], `${label}.sourceTypeName`, [
    "type.unstructured"
  ]);
  parseEnumValue(record["targetTypeName"], `${label}.targetTypeName`, [
    "typed_sdlc_entry"
  ]);
  parseEnumValue(
    record["selectedOptimisingOverlayRef"],
    `${label}.selectedOptimisingOverlayRef`,
    [SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF]
  );
  const outcome = Object.freeze({
    kind: "sdlc_bootstrap_traversal_outcome" as const,
    outcomeRef: parseNonEmptyString(record["outcomeRef"], `${label}.outcomeRef`),
    graphFunctionName: SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION,
    sourceTypeName: "type.unstructured" as const,
    targetTypeName: "typed_sdlc_entry" as const,
    status: parseEnumValue(record["status"], `${label}.status`, [
      "entry_admitted",
      "entry_rejected"
    ]),
    entryNodeRef:
      record["entryNodeRef"] === null
        ? null
        : parseNonEmptyString(record["entryNodeRef"], `${label}.entryNodeRef`),
    entryNonAdmissionRef:
      record["entryNonAdmissionRef"] === null
        ? null
        : parseNonEmptyString(
            record["entryNonAdmissionRef"],
            `${label}.entryNonAdmissionRef`
          ),
    proportionalityReportRef: parseNonEmptyString(
      record["proportionalityReportRef"],
      `${label}.proportionalityReportRef`
    ),
    selectedOptimisingOverlayRef: SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF,
    selectedChildOverlayRef: parseTraversalOverlayRef(
      record["selectedChildOverlayRef"],
      `${label}.selectedChildOverlayRef`
    ),
    selectedGraphFunctionRef: parseNonEmptyString(
      record["selectedGraphFunctionRef"],
      `${label}.selectedGraphFunctionRef`
    ),
    fallbackOverlayRef: parseTraversalOverlayRef(
      record["fallbackOverlayRef"],
      `${label}.fallbackOverlayRef`
    ),
    optimizationStatus: parseEnumValue(
      record["optimizationStatus"],
      `${label}.optimizationStatus`,
      ["optimized", "generic_fallback"]
    ),
    optimizationNonAdmissionReasonRefs: parseStringList(
      record["optimizationNonAdmissionReasonRefs"],
      `${label}.optimizationNonAdmissionReasonRefs`
    ),
    predecessorRefs: parseStringList(
      record["predecessorRefs"],
      `${label}.predecessorRefs`
    )
  });
  assertTraversalOutcomeShape(outcome);
  return outcome;
}

export function admitSdlcBootstrapPreStartExecutionContract(
  input: unknown,
  label = "SdlcBootstrapPreStartExecutionContract"
): SdlcBootstrapPreStartExecutionContract {
  const record = parseClosedRecord(input, label, [
    "kind",
    "contractRef",
    "graphFunctionName",
    "sourceTypeName",
    "targetTypeName",
    "outcomeRef",
    "workspaceIdentityRef",
    "objectiveRef",
    "fallbackOverlayRef",
    "fallbackGraphFunctionRef",
    "replayIdentityRefs",
    "evidenceRefs"
  ]);
  parseEnumValue(record["kind"], `${label}.kind`, [
    "sdlc_bootstrap_pre_start_execution_contract"
  ]);
  parseEnumValue(record["graphFunctionName"], `${label}.graphFunctionName`, [
    SDLC_BOOTSTRAP_ENTRY_GRAPH_FUNCTION
  ]);
  parseEnumValue(record["sourceTypeName"], `${label}.sourceTypeName`, [
    "type.unstructured"
  ]);
  parseEnumValue(record["targetTypeName"], `${label}.targetTypeName`, [
    "sdlc_bootstrap_traversal_outcome"
  ]);
  return constructSdlcBootstrapPreStartExecutionContract({
    contractRef: parseNonEmptyString(record["contractRef"], `${label}.contractRef`),
    outcomeRef: parseNonEmptyString(record["outcomeRef"], `${label}.outcomeRef`),
    workspaceIdentityRef: parseNonEmptyString(
      record["workspaceIdentityRef"],
      `${label}.workspaceIdentityRef`
    ),
    objectiveRef: parseNonEmptyString(record["objectiveRef"], `${label}.objectiveRef`),
    fallbackOverlayRef: parseTraversalOverlayRef(
      record["fallbackOverlayRef"],
      `${label}.fallbackOverlayRef`
    ),
    fallbackGraphFunctionRef: parseNonEmptyString(
      record["fallbackGraphFunctionRef"],
      `${label}.fallbackGraphFunctionRef`
    ),
    replayIdentityRefs: parseStringList(
      record["replayIdentityRefs"],
      `${label}.replayIdentityRefs`
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

export function admitSdlcOptimizedOverlayBinding(
  input: unknown,
  label = "SdlcOptimizedOverlayBinding"
): SdlcOptimizedOverlayBinding {
  const record = parseClosedRecord(input, label, [
    "kind",
    "bindingRef",
    "optimisingOverlayRef",
    "childOverlayRef",
    "selectedGraphFunctionRef",
    "selectedEdgeContractRefs",
    "ticketObjectiveRefs",
    "status",
    "genericFallbackRequired",
    "nonAdmissionReasonRefs",
    "closureAuthorityRef",
    "basisRefs"
  ]);
  parseEnumValue(record["kind"], `${label}.kind`, [
    "sdlc_optimized_overlay_binding"
  ]);
  parseEnumValue(record["optimisingOverlayRef"], `${label}.optimisingOverlayRef`, [
    SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF
  ]);
  parseEnumValue(record["closureAuthorityRef"], `${label}.closureAuthorityRef`, [
    "edge-assurance-contracts"
  ]);
  const status = parseEnumValue(record["status"], `${label}.status`, [
    "optimized",
    "generic_fallback"
  ]);
  return constructSdlcOptimizedOverlayBinding({
    bindingRef: parseNonEmptyString(record["bindingRef"], `${label}.bindingRef`),
    childOverlayRef: parseTraversalOverlayRef(
      record["childOverlayRef"],
      `${label}.childOverlayRef`
    ),
    selectedGraphFunctionRef: parseNonEmptyString(
      record["selectedGraphFunctionRef"],
      `${label}.selectedGraphFunctionRef`
    ),
    selectedEdgeContractRefs: parseStringList(
      record["selectedEdgeContractRefs"],
      `${label}.selectedEdgeContractRefs`
    ),
    ticketObjectiveRefs: parseStringList(
      record["ticketObjectiveRefs"],
      `${label}.ticketObjectiveRefs`
    ),
    status,
    nonAdmissionReasonRefs: parseStringList(
      record["nonAdmissionReasonRefs"],
      `${label}.nonAdmissionReasonRefs`
    ),
    basisRefs: parseStringList(record["basisRefs"], `${label}.basisRefs`)
  });
}

export function admitSdlcOptimizedEdgeSpecialization(
  input: unknown,
  label = "SdlcOptimizedEdgeSpecialization"
): SdlcOptimizedEdgeSpecialization {
  const record = parseClosedRecord(input, label, [
    "kind",
    "specializationRef",
    "optimisingOverlayRef",
    "childOverlayRef",
    "selectedGraphFunctionRef",
    "deterministicTransformRef",
    "edgeAssuranceContractRef",
    "proofLaneRefs",
    "residualPressureBehaviorRef",
    "status",
    "nonAdmissionReasonRefs"
  ]);
  parseEnumValue(record["kind"], `${label}.kind`, [
    "sdlc_optimized_edge_specialization"
  ]);
  parseEnumValue(record["optimisingOverlayRef"], `${label}.optimisingOverlayRef`, [
    SDLC_BOOTSTRAP_OPTIMISING_OVERLAY_REF
  ]);
  return constructSdlcOptimizedEdgeSpecialization({
    specializationRef: parseNonEmptyString(
      record["specializationRef"],
      `${label}.specializationRef`
    ),
    childOverlayRef: parseTraversalOverlayRef(
      record["childOverlayRef"],
      `${label}.childOverlayRef`
    ),
    selectedGraphFunctionRef: parseNonEmptyString(
      record["selectedGraphFunctionRef"],
      `${label}.selectedGraphFunctionRef`
    ),
    deterministicTransformRef: parseNonEmptyString(
      record["deterministicTransformRef"],
      `${label}.deterministicTransformRef`
    ),
    edgeAssuranceContractRef: parseNonEmptyString(
      record["edgeAssuranceContractRef"],
      `${label}.edgeAssuranceContractRef`
    ),
    proofLaneRefs: parseStringList(record["proofLaneRefs"], `${label}.proofLaneRefs`),
    residualPressureBehaviorRef: parseNonEmptyString(
      record["residualPressureBehaviorRef"],
      `${label}.residualPressureBehaviorRef`
    ),
    status: parseEnumValue(record["status"], `${label}.status`, [
      "admitted",
      "not_admitted"
    ]),
    nonAdmissionReasonRefs: parseStringList(
      record["nonAdmissionReasonRefs"],
      `${label}.nonAdmissionReasonRefs`
    )
  });
}

export function assertSdlcOptimisingOverlayReadModelOnly(
  overlay: SdlcOptimisingOverlay
): SdlcOptimisingOverlay {
  if (overlay.createsRuntimeTruth !== false) {
    throw new TypeError("optimising overlay must not create runtime truth");
  }
  if (overlay.ownsClosureAuthority !== false) {
    throw new TypeError("optimising overlay must not own closure authority");
  }
  if (overlay.queryDomainReadModelOnly !== true) {
    throw new TypeError("optimising overlay query projection must be read-only");
  }
  return overlay;
}

export function assertSdlcOptimizedBindingDoesNotClose(
  binding: SdlcOptimizedOverlayBinding
): SdlcOptimizedOverlayBinding {
  if (binding.closureAuthorityRef !== "edge-assurance-contracts") {
    throw new TypeError("optimized binding cannot own closure authority");
  }
  return binding;
}
