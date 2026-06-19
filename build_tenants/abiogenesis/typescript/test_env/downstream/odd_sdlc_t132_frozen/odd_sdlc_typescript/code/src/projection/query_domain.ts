// Implements: REQ-F-ODDSDLC-020
// Implements: REQ-F-ODDSDLC-035

import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  deriveRuntimeAggregateProjection,
  materializeGraphFunction,
  type ConstructionPriorityScheme,
  type ExecutionBasis,
  type GraphFunction,
  type GraphVector,
  type Module,
  type RuntimeEvent,
  type SerializedAttrs
} from "@abiogenesis/typescript-tenant";
import {
  SOFTWARE_DOMAIN_ASSET_FAMILIES,
  SOFTWARE_DOMAIN_ASSET_TYPES,
  SOFTWARE_DOMAIN_WORK_ACT_TYPES
} from "../domain/index.js";
import { sortedStrings } from "../shared/collections.js";
import {
  constructSdlcGraphFunctionCatalog,
  constructSdlcTraversalOverlayCatalog,
  constructSdlcOptimisingOverlay,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRegistry,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  FG_BOOTSTRAP_SDLC_ENTRY,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  publicSdlcOverlayStartTargets,
  projectSdlcTargetCarrierReadModel,
  sdlcGraphFunctionBoundaryRef,
  sdlcGraphVectorBoundaryRef,
  sdlcPublishedTraversalTargetRef,
  sdlcTargetOutcomeRef,
  type SdlcEdgeGainClosureContract,
  type SdlcGraphFunctionCatalog,
  type SdlcOptimisingOverlay,
  type SdlcTargetCarrierDiagnostic,
  type SdlcTargetCarrierReadModel,
  type SdlcTraversalOverlayCatalog
} from "../graph/index.js";
import {
  digestSdlcEdgeGainClosureContract,
  sdlcEdgeAssuranceContractRef
} from "../operator/edge_gain_closure.js";
import {
  deriveOddSdlcEvaluateNextReport,
  type OddSdlcEvaluateNextReport
} from "../runtime/index.js";
import {
  projectSdlcRequirementClosureRegister,
  type SdlcLineageLedger,
  type SdlcRequirementCarryStatus,
  type SdlcRequirementClosureRegister,
  type SdlcRequirementFulfillmentStatus
} from "./requirement_closure.js";
import type {
  SdlcEdgeClosureDisposition,
  SdlcEdgeFulfillmentAssessmentStatus,
  SdlcEdgeFulfillmentCounts
} from "../operator/traversal_consequence.js";
import type {
  SdlcConformProjectReport,
  SdlcWorkspaceIngressReport
} from "../workspace/index.js";
import {
  projectSdlcTicketWorkflow,
  type SdlcTicketWorkflowProjection
} from "../tickets/index.js";

function ticketWorkflowWorkspaceRoot(workspaceRootUri: string): string {
  try {
    const parsed = new URL(workspaceRootUri);
    if (parsed.protocol === "file:") {
      return fileURLToPath(parsed);
    }
  } catch {
    // Synthetic fixture roots are legal query-domain inputs but have no tickets.
  }
  const digest = createHash("sha256")
    .update(workspaceRootUri)
    .digest("hex")
    .slice(0, 16);
  return join("/tmp", "odd-sdlc-ticket-workflow-non-file", digest);
}

export interface SdlcGraphFunctionSurface {
  readonly name: string;
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
  readonly vectorNames: readonly string[];
  readonly source: "gtl_module";
}

export interface SdlcStartTargetSurface {
  readonly name: string;
  readonly graphFunctionRef: string;
  readonly jobName: string;
  readonly overlayRefs: readonly string[];
  readonly defaultForOverlayRefs: readonly string[];
}

export interface SdlcAssetOwnershipSurface {
  readonly assetType: string;
  readonly producerGraphFunctions: readonly string[];
}

export type SdlcTargetObligationBindingStatus =
  | "eligible"
  | "no_published_action"
  | "stale_action_publication";

export interface SdlcTargetObligationBinding {
  readonly kind: "sdlc_target_obligation_binding";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly bindingRef: string;
  readonly declaredTargetAssetType: string;
  readonly targetAssetRefs: readonly string[];
  readonly requiredRole: "construct_target_asset";
  readonly evidenceRefs: readonly string[];
  readonly admissibleGraphFunctionNames: readonly string[];
  readonly publishedActionRefs: readonly string[];
  readonly status: SdlcTargetObligationBindingStatus;
  readonly disposition:
    | "published_action_eligible"
    | "no_action"
    | "stale_query_domain";
  readonly reasonRefs: readonly string[];
}

export interface SdlcRequirementFulfillmentPublicCounts
  extends Pick<
    SdlcEdgeFulfillmentCounts,
    "fulfilled" | "partial" | "blocked" | "unfulfilled" | "missing" | "extra"
  > {
  readonly total: number;
  readonly planned: number;
  readonly carriedForward: number;
  readonly unresolved: number;
}

export type SdlcRequirementFulfillmentArchiveRehydrationStatus =
  | "not_attempted"
  | "no_operator_runs"
  | "no_archive_with_consequence_triple"
  | "rehydrated";

export interface SdlcRequirementFulfillmentArchiveRehydration {
  readonly kind: "sdlc_requirement_fulfillment_archive_rehydration";
  readonly status: SdlcRequirementFulfillmentArchiveRehydrationStatus;
  readonly archiveRef: string | null;
  readonly scannedArchiveRefs: readonly string[];
  readonly missingArtifactRefs: readonly string[];
}

export type SdlcRequirementFulfillmentPublicStatus =
  | SdlcRequirementFulfillmentStatus
  // Rendered from evaluate_action obligation assessments.
  | "blocked"
  // Public label for an unassessed action obligation.
  | "unfulfilled"
  // Public label for a requirement-shaped obligation not present in source closure truth.
  | "extra";

export interface SdlcRequirementFulfillmentAssessmentPublicInput {
  readonly obligationId: string;
  readonly fulfillmentStatus: SdlcEdgeFulfillmentAssessmentStatus;
  readonly evidenceRefs?: readonly string[];
  readonly blockingReasons?: readonly string[];
}

export interface SdlcRequirementFulfillmentPublicRow {
  readonly kind: "sdlc_requirement_fulfillment_public_row";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly requirementId: string;
  readonly requirementDisplayId: string;
  readonly requirementAuthorityRef: string;
  readonly authorityDerivationRefs: readonly string[];
  readonly obligationRef: string;
  readonly sourceInputUris: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly fulfillmentStatus: SdlcRequirementFulfillmentPublicStatus;
  readonly carryStatus: SdlcRequirementCarryStatus;
  readonly openReasonRefs: readonly string[];
  readonly openReasons: readonly string[];
  readonly ledgerRefs: readonly string[];
  readonly closureDecisionRefs: readonly string[];
  readonly evaluatorSourceRefs: readonly string[];
  readonly sourceRegisterRef: string;
}

export interface SdlcRequirementFulfillmentPublicProjection {
  readonly kind: "sdlc_requirement_fulfillment_public_projection";
  readonly readOnly: true;
  readonly gapEvaluationFunction: null;
  readonly nextActionEvaluationFunction: "evaluate_next" | null;
  readonly actionClosureEvaluationFunction: "evaluate_action";
  readonly choosesNextTraversal: false;
  readonly sourceRegisterRef: string;
  readonly rows: readonly SdlcRequirementFulfillmentPublicRow[];
  readonly counts: SdlcRequirementFulfillmentPublicCounts;
  readonly edgeFulfillmentCounts: SdlcEdgeFulfillmentCounts | null;
  readonly edgeClosureDisposition: SdlcEdgeClosureDisposition | null;
  readonly archiveRehydration: SdlcRequirementFulfillmentArchiveRehydration;
  readonly fulfilledRequirementIds: readonly string[];
  readonly carriedForwardRequirementIds: readonly string[];
  readonly unresolvedRequirementIds: readonly string[];
  readonly fulfilledRequirementAuthorityRefs?: readonly string[];
  readonly carriedForwardRequirementAuthorityRefs?: readonly string[];
  readonly unresolvedRequirementAuthorityRefs?: readonly string[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcRequirementFulfillmentEdgeLedgerSource {
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly counts: SdlcEdgeFulfillmentCounts;
}

export interface SdlcRequirementFulfillmentClosureSource {
  readonly decisionRef: string;
  readonly disposition: SdlcEdgeClosureDisposition;
}

export interface SdlcRequirementFulfillmentNextActionSource {
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string | null;
}

export interface SdlcDomainDefaultsCarrier {
  readonly kind: "odd_sdlc_domain_defaults";
  readonly defaultsVersion: "ts-domain-defaults-v1";
  readonly carrierRef: string;
  readonly digest: string;
  readonly digestRef: string;
  readonly policyScope:
    | "query_domain"
    | "public_gap_evaluator"
    | "installed_runner";
  readonly substrateBoundary: "odd_sdlc_domain_policy_not_abg_defaults";
  readonly defaultRegime: "F_P";
  readonly defaultGapPriorityPolicyRef: string;
  readonly defaultGapPrioritySchemeRef: string;
  readonly sourceRefs: readonly string[];
}

export type SdlcEdgeAssuranceReadModelDiagnosticCode =
  | "missing_edge_gain_closure_contract"
  | "missing_target_carrier_contract"
  | "unregistered_edge_gain_closure_contract";

export interface SdlcEdgeAssuranceReadModelDiagnostic {
  readonly kind: "sdlc_edge_assurance_read_model_diagnostic";
  readonly code: SdlcEdgeAssuranceReadModelDiagnosticCode;
  readonly edgeRef: string;
  readonly detail: string;
}

export interface SdlcEdgeAssuranceReadModelRow {
  readonly kind: "sdlc_edge_assurance_read_model_row";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly edgeRef: string;
  readonly closureClassification: SdlcEdgeGainClosureContract["closureClassification"];
  readonly edgeAssuranceContractRef: string;
  readonly edgeAssuranceContractDigest: string;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly sourceAssetPolicy: SdlcEdgeGainClosureContract["sourceAssetPolicy"];
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}

export interface SdlcEdgeAssuranceReadModel {
  readonly kind: "sdlc_edge_assurance_read_model";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly actionClosureEvaluationFunction: "evaluate_action";
  readonly rows: readonly SdlcEdgeAssuranceReadModelRow[];
  readonly diagnostics: readonly SdlcEdgeAssuranceReadModelDiagnostic[];
  readonly missingContractRefs: readonly string[];
  readonly unregisteredContractRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly emittedRuntimeEventKinds: readonly [];
}

const ODD_SDLC_DOMAIN_DEFAULTS_VERSION = "ts-domain-defaults-v1" as const;
const ODD_SDLC_DOMAIN_DEFAULTS_REF =
  `domain-defaults://odd-sdlc/${ODD_SDLC_DOMAIN_DEFAULTS_VERSION}`;
const ODD_SDLC_DEFAULT_GAP_PRIORITY_POLICY_REF =
  `${ODD_SDLC_DOMAIN_DEFAULTS_REF}/policy/default-follow-graph`;
const ODD_SDLC_DEFAULT_GAP_PRIORITY_SCHEME_REF =
  `${ODD_SDLC_DOMAIN_DEFAULTS_REF}/priority-scheme/default-follow-graph`;

function domainDefaultsDigest(input: {
  readonly defaultsVersion: typeof ODD_SDLC_DOMAIN_DEFAULTS_VERSION;
  readonly defaultRegime: "F_P";
  readonly defaultGapPriorityPolicyRef: string;
  readonly defaultGapPrioritySchemeRef: string;
  readonly substrateBoundary: SdlcDomainDefaultsCarrier["substrateBoundary"];
  readonly sourceRefs: readonly string[];
}): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(input), "utf8")
    .digest("hex")}`;
}

export function constructSdlcDomainDefaultsCarrier(): SdlcDomainDefaultsCarrier {
  const sourceRefs = Object.freeze([
    "specification/GOALS.md#Current-Computational-Target",
    "specification/PRODUCT.md#Installed-Operator-Loop"
  ]);
  const digest = domainDefaultsDigest({
    defaultsVersion: ODD_SDLC_DOMAIN_DEFAULTS_VERSION,
    defaultRegime: "F_P",
    defaultGapPriorityPolicyRef: ODD_SDLC_DEFAULT_GAP_PRIORITY_POLICY_REF,
    defaultGapPrioritySchemeRef: ODD_SDLC_DEFAULT_GAP_PRIORITY_SCHEME_REF,
    substrateBoundary: "odd_sdlc_domain_policy_not_abg_defaults",
    sourceRefs
  });
  return Object.freeze({
    kind: "odd_sdlc_domain_defaults",
    defaultsVersion: ODD_SDLC_DOMAIN_DEFAULTS_VERSION,
    carrierRef: ODD_SDLC_DOMAIN_DEFAULTS_REF,
    digest,
    digestRef: `${ODD_SDLC_DOMAIN_DEFAULTS_REF}/digest/${digest.slice("sha256:".length)}`,
    policyScope: "public_gap_evaluator",
    substrateBoundary: "odd_sdlc_domain_policy_not_abg_defaults",
    defaultRegime: "F_P",
    defaultGapPriorityPolicyRef: ODD_SDLC_DEFAULT_GAP_PRIORITY_POLICY_REF,
    defaultGapPrioritySchemeRef: ODD_SDLC_DEFAULT_GAP_PRIORITY_SCHEME_REF,
    sourceRefs
  });
}

export interface SdlcQueryDomainProjection {
  readonly kind: "sdlc_query_domain_projection";
  readonly contractName: "odd_sdlc.query-domain";
  readonly contractVersion: "ts-v1";
  readonly runtimeModel: "abg-native";
  readonly queryModel: "odd-domain-read-model";
  readonly readOnly: true;
  readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
  readonly workspaceRootUri: string;
  readonly assetTypes: typeof SOFTWARE_DOMAIN_ASSET_TYPES;
  readonly assetFamilies: typeof SOFTWARE_DOMAIN_ASSET_FAMILIES;
  readonly workActTypes: typeof SOFTWARE_DOMAIN_WORK_ACT_TYPES;
  readonly domainDefaults: SdlcDomainDefaultsCarrier;
  readonly libraryFunctions: SdlcGraphFunctionCatalog["libraryFunctions"];
  readonly functions: SdlcGraphFunctionCatalog["functions"];
  readonly programs: SdlcGraphFunctionCatalog["executives"];
  readonly traversalOverlays: SdlcTraversalOverlayCatalog;
  readonly optimisingOverlays: readonly SdlcOptimisingOverlay[];
  readonly graphFunctions: readonly SdlcGraphFunctionSurface[];
  readonly startTargets: readonly SdlcStartTargetSurface[];
  readonly assetOwnership: readonly SdlcAssetOwnershipSurface[];
  readonly targetBindings: readonly SdlcTargetObligationBinding[];
  readonly targetCarriers: SdlcTargetCarrierReadModel;
  readonly edgeAssurance: SdlcEdgeAssuranceReadModel;
  readonly requirementFulfillment: SdlcRequirementFulfillmentPublicProjection;
  readonly ticketWorkflow: SdlcTicketWorkflowProjection;
  readonly currentDossierRefs: readonly string[];
  readonly projectConformance: SdlcConformProjectReport | null;
}

export type SdlcGapStatus = "open" | "partial" | "converged";

export interface SdlcGapProjection {
  readonly kind: "sdlc_gap_projection";
  readonly readOnly: true;
  readonly evaluationFunction: "eval_gap";
  readonly productAssetModelRef: string;
  readonly choosesNextTraversal: false;
  readonly evaluatesActionClosure: false;
  readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
  readonly graphFunctionName: string;
  readonly status: SdlcGapStatus;
  readonly currentEdge: string | null;
  readonly edgeAssuranceContractRef: string | null;
  readonly edgeAssuranceContractDigest: string | null;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierDiagnostics: readonly SdlcTargetCarrierDiagnostic[];
  readonly edgeAssuranceProofLaneRefs: readonly string[];
  readonly edgeAssuranceResidualPressureRefs: readonly string[];
  readonly edgeAssuranceDiagnostics: readonly SdlcEdgeAssuranceReadModelDiagnostic[];
  readonly nextVectorIndex: number | null;
  readonly closedVectorIndexes: readonly number[];
}

export interface SdlcGapDossier {
  readonly kind: "sdlc_gap_dossier";
  readonly readOnly: true;
  readonly gapEvaluationFunction: "eval_gap";
  readonly nextActionEvaluationFunction: "evaluate_next";
  readonly actionClosureEvaluationFunction: null;
  readonly choosesNextTraversal: false;
  readonly rankingAuthority: "abiogenesis_construction_priority_projection";
  readonly localRankingAuthority: false;
  readonly edge: string | null;
  readonly status: SdlcGapStatus;
  readonly edgeAssuranceContractRef: string | null;
  readonly edgeAssuranceContractDigest: string | null;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierDiagnostics: readonly SdlcTargetCarrierDiagnostic[];
  readonly edgeAssuranceProofLaneRefs: readonly string[];
  readonly edgeAssuranceResidualPressureRefs: readonly string[];
  readonly edgeAssuranceDiagnostics: readonly SdlcEdgeAssuranceReadModelDiagnostic[];
  readonly evidenceRefs: readonly string[];
  readonly triageInput: string;
  readonly nextActionBasisKind: "initial_selection";
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly gapPressureRefs: readonly string[];
  readonly targetBindingRefs: readonly string[];
  readonly actionCatalogRefs: readonly string[];
  readonly nextActionProjectionRef: string | null;
  readonly prioritySchemeRef: string | null;
  readonly bestActionRef: string | null;
  readonly bestGraphFunctionRef: string | null;
  readonly bestGraphVectorRef: string | null;
  readonly rankingReasonRefs: readonly string[];
  readonly requirementFulfillment: SdlcRequirementFulfillmentPublicProjection;
  readonly nextLawfulActions: readonly string[];
}

export interface SdlcSpanAnalysisProjection {
  readonly kind: "sdlc_span_analysis_projection";
  readonly readOnly: true;
  readonly graphFunctionName: string;
  readonly fromEdge: string | null;
  readonly toEdge: string | null;
  readonly zoom: "edge" | "span" | "graph";
  readonly edges: readonly string[];
}

function graphFunctionSurface(module: Module): readonly SdlcGraphFunctionSurface[] {
  return Object.freeze(
    module.graphFunctions.map((graphFunction) => {
      const graph = materializeGraphFunction(graphFunction);
      return Object.freeze({
        name: graphFunction.name,
        inputNames: Object.freeze(graphFunction.inputs.map((node) => node.name)),
        outputNames: Object.freeze(graphFunction.outputs.map((node) => node.name)),
        vectorNames: Object.freeze(graph.vectors.map((vector) => vector.name)),
        source: "gtl_module"
      });
    })
  );
}

function publishedGraphVectorRefsForModule(module: Module): readonly string[] {
  return sortedStrings([
    ...new Set(
      module.graphFunctions.flatMap((graphFunction) =>
        materializeGraphFunction(graphFunction).vectors.map((vector) => vector.name)
      )
    )
  ]);
}

function publishedGraphVectorsForModule(module: Module): readonly GraphVector[] {
  const byName = new Map<string, GraphVector>();
  for (const graphFunction of module.graphFunctions) {
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!byName.has(vector.name)) {
        byName.set(vector.name, vector);
      }
    }
  }
  return Object.freeze([...byName.values()]);
}

function edgeAssuranceRowFromContract(
  contract: SdlcEdgeGainClosureContract,
  targetCarriers: SdlcTargetCarrierReadModel
): SdlcEdgeAssuranceReadModelRow {
  const targetCarrier = targetCarriers.rows.find(
    (row) => row.edgeRef === contract.edgeRef
  );
  return Object.freeze({
    kind: "sdlc_edge_assurance_read_model_row" as const,
    readOnly: true as const,
    choosesNextTraversal: false as const,
    edgeRef: contract.edgeRef,
    closureClassification: contract.closureClassification,
    edgeAssuranceContractRef: sdlcEdgeAssuranceContractRef(contract),
    edgeAssuranceContractDigest: digestSdlcEdgeGainClosureContract(contract),
    targetCarrierContractRef:
      targetCarrier?.targetCarrierContractRef ?? null,
    targetCarrierContractDigest:
      targetCarrier?.targetCarrierContractDigest ?? null,
    sourceAssetPolicy: contract.sourceAssetPolicy,
    sourceAssetTypes: contract.sourceAssetTypes,
    targetAssetType: contract.targetAssetType,
    proofLaneRefs: contract.proofLaneRefs,
    residualPressureRefs: contract.residualPressureRefs
  });
}

export function projectSdlcEdgeAssuranceReadModel(input: {
  readonly module: Module;
  readonly contracts?: readonly SdlcEdgeGainClosureContract[];
  readonly targetCarriers?: SdlcTargetCarrierReadModel;
}): SdlcEdgeAssuranceReadModel {
  const contracts = input.contracts ?? SDLC_EDGE_GAIN_CLOSURE_CONTRACTS;
  const publishedGraphVectorRefs = publishedGraphVectorRefsForModule(input.module);
  const targetCarriers =
    input.targetCarriers ??
    projectSdlcTargetCarrierReadModel({
      publishedGraphVectorRefs,
      vectors: publishedGraphVectorsForModule(input.module),
      contracts
    });
  const publishedGraphVectorRefSet = new Set(publishedGraphVectorRefs);
  const contractByEdgeRef = new Map<string, SdlcEdgeGainClosureContract>();
  for (const contract of contracts) {
    if (!contractByEdgeRef.has(contract.edgeRef)) {
      contractByEdgeRef.set(contract.edgeRef, contract);
    }
  }
  const rows = Object.freeze(
    publishedGraphVectorRefs
      .map((edgeRef) => contractByEdgeRef.get(edgeRef))
      .filter(
        (contract): contract is SdlcEdgeGainClosureContract =>
          contract !== undefined
      )
      .map((contract) => edgeAssuranceRowFromContract(contract, targetCarriers))
  );
  const missingContractRefs = publishedGraphVectorRefs.filter(
    (edgeRef) => !contractByEdgeRef.has(edgeRef)
  );
  const unregisteredContractRefs = sortedStrings([
    ...new Set(
      contracts
        .map((contract) => contract.edgeRef)
        .filter((edgeRef) => !publishedGraphVectorRefSet.has(edgeRef))
    )
  ]);
  const diagnostics = Object.freeze([
    ...missingContractRefs.map((edgeRef) =>
      Object.freeze({
        kind: "sdlc_edge_assurance_read_model_diagnostic" as const,
        code: "missing_edge_gain_closure_contract" as const,
        edgeRef,
        detail: `${edgeRef}: published graph vector has no edge gain/closure contract row`
      })
    ),
    ...rows
      .filter(
        (row) =>
          row.closureClassification === "close_capable" &&
          row.targetCarrierContractRef === null
      )
      .map((row) =>
        Object.freeze({
          kind: "sdlc_edge_assurance_read_model_diagnostic" as const,
          code: "missing_target_carrier_contract" as const,
          edgeRef: row.edgeRef,
          detail: `${row.edgeRef}: close-capable edge assurance row has no target carrier contract row`
        })
      ),
    ...unregisteredContractRefs.map((edgeRef) =>
      Object.freeze({
        kind: "sdlc_edge_assurance_read_model_diagnostic" as const,
        code: "unregistered_edge_gain_closure_contract" as const,
        edgeRef,
        detail: `${edgeRef}: edge gain/closure contract row has no published graph vector`
      })
    )
  ]);
  return Object.freeze({
    kind: "sdlc_edge_assurance_read_model" as const,
    readOnly: true as const,
    choosesNextTraversal: false as const,
    actionClosureEvaluationFunction: "evaluate_action" as const,
    rows,
    diagnostics,
    missingContractRefs: Object.freeze(missingContractRefs),
    unregisteredContractRefs,
    proofLaneRefs: sortedStrings([
      ...new Set(rows.flatMap((row) => row.proofLaneRefs))
    ]),
    residualPressureRefs: sortedStrings([
      ...new Set(rows.flatMap((row) => row.residualPressureRefs))
    ]),
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

function edgeAssuranceReadModelForEdge(input: {
  readonly readModel: SdlcEdgeAssuranceReadModel;
  readonly edgeRef: string | null;
}): {
  readonly row: SdlcEdgeAssuranceReadModelRow | null;
  readonly diagnostics: readonly SdlcEdgeAssuranceReadModelDiagnostic[];
} {
  if (input.edgeRef === null) {
    return Object.freeze({
      row: null,
      diagnostics: Object.freeze([] as const)
    });
  }
  return Object.freeze({
    row:
      input.readModel.rows.find((row) => row.edgeRef === input.edgeRef) ?? null,
    diagnostics: Object.freeze(
      input.readModel.diagnostics.filter(
        (diagnostic) => diagnostic.edgeRef === input.edgeRef
      )
    )
  });
}

function targetCarrierReadModelForEdge(input: {
  readonly readModel: SdlcTargetCarrierReadModel;
  readonly edgeRef: string | null;
}): {
  readonly row: SdlcTargetCarrierReadModel["rows"][number] | null;
  readonly diagnostics: readonly SdlcTargetCarrierDiagnostic[];
} {
  if (input.edgeRef === null) {
    return Object.freeze({
      row: null,
      diagnostics: Object.freeze([] as const)
    });
  }
  return Object.freeze({
    row:
      input.readModel.rows.find((row) => row.edgeRef === input.edgeRef) ?? null,
    diagnostics: Object.freeze(
      input.readModel.diagnostics.filter(
        (diagnostic) => diagnostic.edgeRef === input.edgeRef
      )
    )
  });
}

function startTargets(input: {
  readonly module: Module;
  readonly overlayCatalog: SdlcTraversalOverlayCatalog;
  readonly projectConformance?: SdlcConformProjectReport | null;
}): readonly SdlcStartTargetSurface[] {
  return publicSdlcOverlayStartTargets({
    module: input.module,
    catalog: input.overlayCatalog,
    projectConformanceStatus: input.projectConformance?.status ?? null
  });
}

function assetOwnership(
  catalog: SdlcGraphFunctionCatalog
): readonly SdlcAssetOwnershipSurface[] {
  const producers = new Map<string, string[]>();
  for (const entry of catalog.libraryFunctions) {
    for (const output of entry.outputs) {
      const existing = producers.get(output) ?? [];
      existing.push(entry.name);
      producers.set(output, existing);
    }
  }
  for (const entry of catalog.functions) {
    if (entry.graphTrackPublication !== "default") {
      continue;
    }
    for (const output of entry.outputs) {
      const existing = producers.get(output) ?? [];
      existing.push(entry.backingGraphFunction);
      producers.set(output, existing);
    }
  }
  return Object.freeze(
    [...producers.entries()].map(([assetType, producerGraphFunctions]) =>
      Object.freeze({
        assetType,
        producerGraphFunctions: Object.freeze([...producerGraphFunctions].sort())
      })
    )
  );
}

function targetBindingForOwnership(input: {
  readonly ownership: SdlcAssetOwnershipSurface;
  readonly graphFunctions: readonly SdlcGraphFunctionSurface[];
  readonly targetAssetRefs?: readonly string[];
  readonly evidenceRefs?: readonly string[];
}): SdlcTargetObligationBinding {
  const publishedNames = new Set(
    input.graphFunctions.map((graphFunction) => graphFunction.name)
  );
  const admissibleGraphFunctionNames = Object.freeze(
    input.ownership.producerGraphFunctions.filter((name) => publishedNames.has(name))
  );
  const status: SdlcTargetObligationBindingStatus =
    admissibleGraphFunctionNames.length > 0
      ? "eligible"
      : input.ownership.producerGraphFunctions.length > 0
        ? "stale_action_publication"
        : "no_published_action";
  const disposition =
    status === "eligible"
      ? "published_action_eligible"
      : status === "stale_action_publication"
        ? "stale_query_domain"
        : "no_action";
  return Object.freeze({
    kind: "sdlc_target_obligation_binding",
    readOnly: true,
    choosesNextTraversal: false,
    bindingRef: `target-binding://odd-sdlc/${input.ownership.assetType}`,
    declaredTargetAssetType: input.ownership.assetType,
    targetAssetRefs: Object.freeze([
      ...(input.targetAssetRefs ?? [`asset-type://odd-sdlc/${input.ownership.assetType}`])
    ]),
    requiredRole: "construct_target_asset",
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
    admissibleGraphFunctionNames,
    publishedActionRefs: Object.freeze(
      admissibleGraphFunctionNames.map(
        (name) => `published-action://odd-sdlc/graph-function/${name}`
      )
    ),
    status,
    disposition,
    reasonRefs: Object.freeze(
      status === "eligible"
        ? ["target_asset_bound_to_published_graph_action"]
        : status === "stale_action_publication"
          ? ["asset_owner_names_unpublished_graph_function"]
          : ["target_asset_has_no_published_graph_action"]
    )
  });
}

export function deriveSdlcTargetObligationBinding(input: {
  readonly queryDomain: SdlcQueryDomainProjection;
  readonly targetAssetType: string;
  readonly targetAssetRefs?: readonly string[];
  readonly evidenceRefs?: readonly string[];
}): SdlcTargetObligationBinding {
  const ownership = input.queryDomain.assetOwnership.find(
    (entry) => entry.assetType === input.targetAssetType
  ) ?? Object.freeze({
    assetType: input.targetAssetType,
    producerGraphFunctions: Object.freeze([])
  });
  return targetBindingForOwnership({
    ownership,
    graphFunctions: input.queryDomain.graphFunctions,
    ...(input.targetAssetRefs === undefined
      ? {}
      : { targetAssetRefs: input.targetAssetRefs }),
    ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: input.evidenceRefs })
  });
}

interface GraphFunctionStructuralSignature {
  readonly id: string;
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
  readonly vectorSignatures: readonly string[];
  readonly declarationSignature: string;
  readonly tags: readonly string[];
  readonly effects: readonly string[];
}

function requirementOpenReasonRef(input: {
  readonly requirementAuthorityRef: string;
  readonly reason: string;
}): string {
  return [
    "requirement-open://odd-sdlc",
    encodeURIComponent(input.requirementAuthorityRef),
    encodeURIComponent(input.reason)
  ].join("/");
}

const EMPTY_LINEAGE_LEDGER: SdlcLineageLedger = Object.freeze({
  kind: "sdlc_lineage_ledger" as const,
  entries: Object.freeze([]),
  emittedRuntimeEventKinds: Object.freeze([] as const)
});

function requirementFulfillmentCounts(
  rows: readonly SdlcRequirementFulfillmentPublicRow[]
): SdlcRequirementFulfillmentPublicCounts {
  return Object.freeze({
    total: rows.length,
    fulfilled: rows.filter((row) => row.fulfillmentStatus === "fulfilled").length,
    partial: rows.filter((row) => row.fulfillmentStatus === "partial").length,
    planned: rows.filter((row) => row.fulfillmentStatus === "planned").length,
    blocked: rows.filter((row) => row.fulfillmentStatus === "blocked").length,
    unfulfilled: rows.filter((row) => row.fulfillmentStatus === "unfulfilled").length,
    missing: rows.filter((row) => row.fulfillmentStatus === "missing").length,
    extra: rows.filter((row) => row.fulfillmentStatus === "extra").length,
    carriedForward: rows.filter((row) => row.carryStatus === "carried_forward").length,
    unresolved: rows.filter((row) => row.fulfillmentStatus !== "fulfilled").length
  });
}

export function constructSdlcRequirementFulfillmentArchiveRehydration(input: {
  readonly status: SdlcRequirementFulfillmentArchiveRehydrationStatus;
  readonly archiveRef?: string | null;
  readonly scannedArchiveRefs?: readonly string[];
  readonly missingArtifactRefs?: readonly string[];
}): SdlcRequirementFulfillmentArchiveRehydration {
  return Object.freeze({
    kind: "sdlc_requirement_fulfillment_archive_rehydration" as const,
    status: input.status,
    archiveRef: input.archiveRef ?? null,
    scannedArchiveRefs: Object.freeze([...(input.scannedArchiveRefs ?? [])]),
    missingArtifactRefs: Object.freeze([...(input.missingArtifactRefs ?? [])])
  });
}

export function withSdlcRequirementFulfillmentArchiveRehydration(input: {
  readonly projection: SdlcRequirementFulfillmentPublicProjection;
  readonly archiveRehydration: SdlcRequirementFulfillmentArchiveRehydration;
}): SdlcRequirementFulfillmentPublicProjection {
  return Object.freeze({
    ...input.projection,
    archiveRehydration: input.archiveRehydration
  });
}

interface RequirementFulfillmentPublicRowBasis {
  readonly requirementId: string;
  readonly requirementDisplayId?: string;
  readonly requirementAuthorityRef: string;
  readonly authorityDerivationRefs?: readonly string[];
  readonly sourceInputUris: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly fulfillmentStatus: SdlcRequirementFulfillmentPublicStatus;
  readonly carryStatus: SdlcRequirementCarryStatus;
  readonly openReasons: readonly string[];
}

function constructSdlcRequirementFulfillmentPublicProjection(input: {
  readonly sourceRegisterRef: string;
  readonly rows: readonly RequirementFulfillmentPublicRowBasis[];
  readonly ledgerRefs: readonly string[];
  readonly closureDecisionRefs: readonly string[];
  readonly evaluatorSourceRefs: readonly string[];
  readonly edgeFulfillmentCounts?: SdlcEdgeFulfillmentCounts | null;
  readonly edgeClosureDisposition?: SdlcEdgeClosureDisposition | null;
  readonly archiveRehydration?: SdlcRequirementFulfillmentArchiveRehydration;
}): SdlcRequirementFulfillmentPublicProjection {
  const rows = Object.freeze(
    input.rows.map((row) => {
      const requirementDisplayId = row.requirementDisplayId ?? row.requirementId;
      const requirementAuthorityRef = row.requirementAuthorityRef;
      return Object.freeze({
        kind: "sdlc_requirement_fulfillment_public_row" as const,
        readOnly: true as const,
        choosesNextTraversal: false as const,
        requirementId: requirementDisplayId,
        requirementDisplayId,
        requirementAuthorityRef,
        authorityDerivationRefs: Object.freeze([
          ...(row.authorityDerivationRefs ?? [])
        ]),
        obligationRef: `requirement:${requirementAuthorityRef}`,
        sourceInputUris: row.sourceInputUris,
        evidenceRefs: row.evidenceRefs,
        fulfillmentStatus: row.fulfillmentStatus,
        carryStatus: row.carryStatus,
        openReasonRefs: Object.freeze(
          row.openReasons.map((reason) =>
            requirementOpenReasonRef({
              requirementAuthorityRef,
              reason
            })
          )
        ),
        openReasons: row.openReasons,
        ledgerRefs: input.ledgerRefs,
        closureDecisionRefs: input.closureDecisionRefs,
        evaluatorSourceRefs: input.evaluatorSourceRefs,
        sourceRegisterRef: input.sourceRegisterRef
      });
    })
  );
  return Object.freeze({
    kind: "sdlc_requirement_fulfillment_public_projection" as const,
    readOnly: true as const,
    gapEvaluationFunction: null,
    nextActionEvaluationFunction:
      input.evaluatorSourceRefs.length === 0 ? null : "evaluate_next",
    actionClosureEvaluationFunction: "evaluate_action" as const,
    choosesNextTraversal: false as const,
    sourceRegisterRef: input.sourceRegisterRef,
    rows,
    counts: requirementFulfillmentCounts(rows),
    edgeFulfillmentCounts: input.edgeFulfillmentCounts ?? null,
    edgeClosureDisposition: input.edgeClosureDisposition ?? null,
    archiveRehydration:
      input.archiveRehydration ??
      constructSdlcRequirementFulfillmentArchiveRehydration({
        status: "not_attempted"
      }),
    fulfilledRequirementIds: Object.freeze(
      rows
        .filter((row) => row.fulfillmentStatus === "fulfilled")
        .map((row) => row.requirementId)
    ),
    carriedForwardRequirementIds: Object.freeze(
      rows
        .filter((row) => row.carryStatus === "carried_forward")
        .map((row) => row.requirementId)
    ),
    unresolvedRequirementIds: Object.freeze(
      rows
        .filter((row) => row.fulfillmentStatus !== "fulfilled")
        .map((row) => row.requirementId)
    ),
    fulfilledRequirementAuthorityRefs: Object.freeze(
      rows
        .filter((row) => row.fulfillmentStatus === "fulfilled")
        .map((row) => row.requirementAuthorityRef)
    ),
    carriedForwardRequirementAuthorityRefs: Object.freeze(
      rows
        .filter((row) => row.carryStatus === "carried_forward")
        .map((row) => row.requirementAuthorityRef)
    ),
    unresolvedRequirementAuthorityRefs: Object.freeze(
      rows
        .filter((row) => row.fulfillmentStatus !== "fulfilled")
        .map((row) => row.requirementAuthorityRef)
    ),
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

export function projectSdlcRequirementFulfillmentPublicView(input: {
  readonly closureRegister: SdlcRequirementClosureRegister;
  readonly sourceRegisterRef?: string;
  readonly ledgerRefs?: readonly string[];
  readonly closureDecisionRefs?: readonly string[];
  readonly evaluatorSourceRefs?: readonly string[];
  readonly archiveRehydration?: SdlcRequirementFulfillmentArchiveRehydration;
}): SdlcRequirementFulfillmentPublicProjection {
  const sourceRegisterRef =
    input.sourceRegisterRef ?? "requirement-closure-register://odd-sdlc/query-domain";
  const ledgerRefs = Object.freeze([...(input.ledgerRefs ?? [sourceRegisterRef])]);
  const closureDecisionRefs = Object.freeze([...(input.closureDecisionRefs ?? [])]);
  const evaluatorSourceRefs = Object.freeze([...(input.evaluatorSourceRefs ?? [])]);
  return constructSdlcRequirementFulfillmentPublicProjection({
    sourceRegisterRef,
    ledgerRefs,
    closureDecisionRefs,
    evaluatorSourceRefs,
    edgeFulfillmentCounts: null,
    edgeClosureDisposition: null,
    ...(input.archiveRehydration === undefined
      ? {}
      : { archiveRehydration: input.archiveRehydration }),
    rows: input.closureRegister.entries.map((entry) =>
      Object.freeze({
        requirementId: entry.requirementId,
        requirementDisplayId: entry.requirementDisplayId ?? entry.requirementId,
        requirementAuthorityRef: entry.requirementAuthorityRef,
        authorityDerivationRefs: entry.authorityDerivationRefs ?? Object.freeze([]),
        sourceInputUris: entry.sourceInputUris,
        evidenceRefs: entry.evidenceRefs,
        fulfillmentStatus: entry.fulfillmentStatus,
        carryStatus: entry.carryStatus,
        openReasons: entry.openReasons
      })
    )
  });
}

function requirementAuthorityRefFromObligationId(obligationId: string): string | null {
  const prefix = "requirement:";
  return obligationId.startsWith(prefix) && obligationId.length > prefix.length
    ? obligationId.slice(prefix.length)
    : null;
}

function publicStatusFromAssessment(
  status: SdlcEdgeFulfillmentAssessmentStatus
): SdlcRequirementFulfillmentPublicStatus {
  if (status === "unassessed") {
    return "unfulfilled";
  }
  return status;
}

export function publicRequirementStatusToClosureRegisterStatus(
  status: SdlcRequirementFulfillmentPublicStatus
): SdlcRequirementFulfillmentStatus {
  if (
    status === "blocked" ||
    status === "unfulfilled" ||
    status === "extra"
  ) {
    return "missing";
  }
  return status;
}

export function projectSdlcRequirementFulfillmentPublicViewFromAssessments(input: {
  readonly closureRegister: SdlcRequirementClosureRegister;
  readonly assessments: readonly SdlcRequirementFulfillmentAssessmentPublicInput[];
  readonly edgeFulfillmentLedger: SdlcRequirementFulfillmentEdgeLedgerSource;
  readonly edgeClosureDecision: SdlcRequirementFulfillmentClosureSource;
  readonly nextActionProjection: SdlcRequirementFulfillmentNextActionSource;
  readonly sourceRegisterRef?: string;
  readonly archiveRehydration?: SdlcRequirementFulfillmentArchiveRehydration;
}): SdlcRequirementFulfillmentPublicProjection {
  const sourceRegisterRef =
    input.sourceRegisterRef ??
    `requirement-closure-register://odd-sdlc/${encodeURIComponent(input.edgeFulfillmentLedger.ledgerRef)}`;
  const assessmentByRequirementAuthorityRef = new Map(
    input.assessments
      .map((assessment) =>
        Object.freeze({
          assessment,
          requirementAuthorityRef: requirementAuthorityRefFromObligationId(
            assessment.obligationId
          )
        })
      )
      .filter(
        (entry): entry is {
          readonly assessment: SdlcRequirementFulfillmentAssessmentPublicInput;
          readonly requirementAuthorityRef: string;
        } => entry.requirementAuthorityRef !== null
      )
      .map((entry) => [entry.requirementAuthorityRef, entry.assessment])
  );
  const entryByRequirementAuthorityRef = new Map(
    input.closureRegister.entries.map((entry) => [
      entry.requirementAuthorityRef,
      entry
    ])
  );
  const requirementAuthorityRefs = Object.freeze(
    [
      ...new Set([
        ...input.closureRegister.entries.map(
          (entry) => entry.requirementAuthorityRef
        ),
        ...assessmentByRequirementAuthorityRef.keys()
      ])
    ].sort()
  );
  const ledgerRefs = Object.freeze([
    input.edgeFulfillmentLedger.ledgerRef,
    input.edgeFulfillmentLedger.ledgerVersionRef
  ]);
  const closureDecisionRefs = Object.freeze([input.edgeClosureDecision.decisionRef]);
  const evaluatorSourceRefs = Object.freeze([
    input.nextActionProjection.nextActionProjectionRef,
    ...(input.nextActionProjection.selectedActionRef === null
      ? []
      : [input.nextActionProjection.selectedActionRef])
  ]);
  return constructSdlcRequirementFulfillmentPublicProjection({
    sourceRegisterRef,
    ledgerRefs,
    closureDecisionRefs,
    evaluatorSourceRefs,
    edgeFulfillmentCounts: input.edgeFulfillmentLedger.counts,
    edgeClosureDisposition: input.edgeClosureDecision.disposition,
    ...(input.archiveRehydration === undefined
      ? {}
      : { archiveRehydration: input.archiveRehydration }),
    rows: requirementAuthorityRefs.map((requirementAuthorityRef) => {
      const entry = entryByRequirementAuthorityRef.get(requirementAuthorityRef);
      const assessment =
        assessmentByRequirementAuthorityRef.get(requirementAuthorityRef);
      const fulfillmentStatus =
        assessment === undefined
          ? entry?.fulfillmentStatus ?? "missing"
          : entry === undefined
            ? "extra"
          : publicStatusFromAssessment(assessment.fulfillmentStatus);
      const openReasons =
        fulfillmentStatus === "fulfilled"
          ? Object.freeze([])
          : Object.freeze(
              assessment === undefined
                ? entry?.openReasons ?? ["obligation_assessment_missing"]
                : [
                    ...(entry === undefined
                      ? [`obligation_extra:${assessment.obligationId}`]
                      : []),
                    `obligation_${assessment.fulfillmentStatus}`,
                    ...(assessment.blockingReasons ?? [])
                  ]
            );
      return Object.freeze({
        requirementId: entry?.requirementId ?? requirementAuthorityRef,
        requirementDisplayId:
          entry?.requirementDisplayId ?? entry?.requirementId ?? requirementAuthorityRef,
        requirementAuthorityRef,
        authorityDerivationRefs:
          entry?.authorityDerivationRefs ?? Object.freeze([]),
        sourceInputUris: entry?.sourceInputUris ?? Object.freeze([]),
        evidenceRefs: Object.freeze(
          assessment === undefined
            ? entry?.evidenceRefs ?? []
            : assessment.evidenceRefs ?? []
        ),
        fulfillmentStatus,
        carryStatus:
          fulfillmentStatus === "fulfilled"
            ? "fulfilled" as const
            : "carried_forward" as const,
        openReasons
      });
    })
  });
}

function closureRegisterFromRequirementFulfillmentPublicProjection(
  projection: SdlcRequirementFulfillmentPublicProjection
): SdlcRequirementClosureRegister {
  const entries = Object.freeze(
    projection.rows.map((row) =>
      Object.freeze({
        kind: "sdlc_requirement_closure_entry" as const,
        requirementId: row.requirementId,
        requirementDisplayId: row.requirementDisplayId,
        requirementAuthorityRef: row.requirementAuthorityRef,
        authorityDerivationRefs: row.authorityDerivationRefs,
        sourceInputUris: row.sourceInputUris,
        assetIds: Object.freeze([]),
        producedByGraphFunctions: Object.freeze([]),
        proofKinds: Object.freeze([]),
        authorityVerbs: Object.freeze([]),
        evidenceRefs: row.evidenceRefs,
        traceabilityStatus: "absent" as const,
        fulfillmentStatus: publicRequirementStatusToClosureRegisterStatus(
          row.fulfillmentStatus
        ),
        carryStatus: row.carryStatus,
        openReasons: row.openReasons
      })
    )
  );
  return Object.freeze({
    kind: "sdlc_requirement_closure_register" as const,
    entries,
    fulfilledRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    carriedForwardRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementId)
    ),
    unresolvedRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    fulfilledRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    carriedForwardRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    unresolvedRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

export function projectSdlcRequirementFulfillmentPublicViewFromPriorProjection(input: {
  readonly sourceProjection: SdlcRequirementFulfillmentPublicProjection;
  readonly assessments: readonly SdlcRequirementFulfillmentAssessmentPublicInput[];
  readonly edgeFulfillmentLedger: SdlcRequirementFulfillmentEdgeLedgerSource;
  readonly edgeClosureDecision: SdlcRequirementFulfillmentClosureSource;
  readonly nextActionProjection: SdlcRequirementFulfillmentNextActionSource;
  readonly sourceRegisterRef?: string;
  readonly archiveRehydration?: SdlcRequirementFulfillmentArchiveRehydration;
}): SdlcRequirementFulfillmentPublicProjection {
  return projectSdlcRequirementFulfillmentPublicViewFromAssessments({
    closureRegister: closureRegisterFromRequirementFulfillmentPublicProjection(
      input.sourceProjection
    ),
    assessments: input.assessments,
    edgeFulfillmentLedger: input.edgeFulfillmentLedger,
    edgeClosureDecision: input.edgeClosureDecision,
    nextActionProjection: input.nextActionProjection,
    ...(input.archiveRehydration === undefined
      ? {}
      : { archiveRehydration: input.archiveRehydration }),
    ...(input.sourceRegisterRef === undefined
      ? {}
      : { sourceRegisterRef: input.sourceRegisterRef })
  });
}

function projectSdlcRequirementFulfillmentForIngress(
  ingressReport: SdlcWorkspaceIngressReport
): SdlcRequirementFulfillmentPublicProjection {
  return projectSdlcRequirementFulfillmentPublicView({
    closureRegister: projectSdlcRequirementClosureRegister({
      ingressReport,
      lineageLedger: EMPTY_LINEAGE_LEDGER
    }),
    sourceRegisterRef: "requirement-closure-register://odd-sdlc/query-domain"
  });
}

function emptyRequirementFulfillmentPublicView(): SdlcRequirementFulfillmentPublicProjection {
  return projectSdlcRequirementFulfillmentPublicView({
    closureRegister: Object.freeze({
      kind: "sdlc_requirement_closure_register" as const,
      entries: Object.freeze([]),
      fulfilledRequirementIds: Object.freeze([]),
      carriedForwardRequirementIds: Object.freeze([]),
      unresolvedRequirementIds: Object.freeze([]),
      emittedRuntimeEventKinds: Object.freeze([] as const)
    }),
    sourceRegisterRef: "requirement-closure-register://odd-sdlc/absent"
  });
}

function serializedAttrsSignature(attrs: SerializedAttrs): string {
  return JSON.stringify(
    [...attrs.entries]
      .map((entry) => Object.freeze({
        key: entry.key,
        value: entry.value
      }))
      .sort((left, right) => left.key.localeCompare(right.key))
  );
}

function graphVectorSignature(vector: GraphVector): string {
  return JSON.stringify({
    id: vector.id,
    name: vector.name,
    sourceNames: vector.source.map((node) => node.name),
    targetName: vector.target.name,
    operatorNames: vector.operators.map((operator) => operator.name),
    evaluatorNames: vector.evaluators.map((evaluator) => evaluator.name),
    allowsSubwork: vector.allowsSubwork,
    declarationSignature: serializedAttrsSignature(vector.declarations),
    tags: sortedStrings(vector.tags)
  });
}

function graphFunctionStructuralSignature(
  graphFunction: GraphFunction
): GraphFunctionStructuralSignature {
  let graph: ReturnType<typeof materializeGraphFunction>;
  try {
    graph = materializeGraphFunction(graphFunction);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new TypeError(
      `SdlcQueryDomainProjection: admitted module structural drift: ${graphFunction.name}.materialize: ${message}`
    );
  }
  return Object.freeze({
    id: graphFunction.id,
    inputNames: Object.freeze(graphFunction.inputs.map((node) => node.name)),
    outputNames: Object.freeze(graphFunction.outputs.map((node) => node.name)),
    vectorSignatures: Object.freeze(graph.vectors.map(graphVectorSignature)),
    declarationSignature: serializedAttrsSignature(graphFunction.declarations),
    tags: sortedStrings(graphFunction.tags),
    effects: sortedStrings(graphFunction.effects)
  });
}

function graphFunctionsByName(module: Module): ReadonlyMap<string, GraphFunction> {
  return new Map(
    module.graphFunctions.map((graphFunction) => [graphFunction.name, graphFunction])
  );
}

function graphFunctionByName(module: Module, name: string): GraphFunction {
  const graphFunction = graphFunctionsByName(module).get(name);
  if (graphFunction === undefined) {
    throw new TypeError(`${name}: graph function is not published by module`);
  }
  return graphFunction;
}

function compareStringArray(input: {
  readonly label: string;
  readonly actual: readonly string[];
  readonly expected: readonly string[];
  readonly mismatches: string[];
}): void {
  if (JSON.stringify(input.actual) !== JSON.stringify(input.expected)) {
    input.mismatches.push(
      `${input.label}: expected ${JSON.stringify(input.expected)} got ${JSON.stringify(input.actual)}`
    );
  }
}

function assertGraphFunctionSignature(input: {
  readonly name: string;
  readonly actual: GraphFunction;
  readonly expected: GraphFunction;
  readonly mismatches: string[];
}): void {
  const actual = graphFunctionStructuralSignature(input.actual);
  const expected = graphFunctionStructuralSignature(input.expected);
  if (actual.id !== expected.id) {
    input.mismatches.push(`${input.name}.id: expected ${expected.id} got ${actual.id}`);
  }
  compareStringArray({
    label: `${input.name}.inputNames`,
    actual: actual.inputNames,
    expected: expected.inputNames,
    mismatches: input.mismatches
  });
  compareStringArray({
    label: `${input.name}.outputNames`,
    actual: actual.outputNames,
    expected: expected.outputNames,
    mismatches: input.mismatches
  });
  compareStringArray({
    label: `${input.name}.vectorSignatures`,
    actual: actual.vectorSignatures,
    expected: expected.vectorSignatures,
    mismatches: input.mismatches
  });
  if (actual.declarationSignature !== expected.declarationSignature) {
    input.mismatches.push(`${input.name}.declarations: structural drift`);
  }
  compareStringArray({
    label: `${input.name}.tags`,
    actual: actual.tags,
    expected: expected.tags,
    mismatches: input.mismatches
  });
  compareStringArray({
    label: `${input.name}.effects`,
    actual: actual.effects,
    expected: expected.effects,
    mismatches: input.mismatches
  });
}

function startTargetStructuralSignature(module: Module): readonly string[] {
  const graphFunctionById = new Map(
    module.graphFunctions.map((graphFunction) => [graphFunction.id, graphFunction.name])
  );
  return Object.freeze(
    module.jobs
      .flatMap((job) =>
        job.contracts.map((contract) =>
          `${job.name}:${contract.targetId}:${graphFunctionById.get(contract.targetId) ?? "unpublished"}`
        )
      )
      .sort()
  );
}

function assertModuleMatchesCatalog(input: {
  readonly module: Module;
  readonly catalog: SdlcGraphFunctionCatalog;
}): void {
  const canonicalModule = constructSdlcGtlModule();
  const actualByName = graphFunctionsByName(input.module);
  const expectedByName = graphFunctionsByName(canonicalModule);
  const moduleNames = new Set(actualByName.keys());
  const expectedNames = [
    ...input.catalog.libraryFunctions.map((entry) => entry.name),
    ...input.catalog.functions.map((entry) => entry.backingGraphFunction),
    ...input.catalog.executives.map((entry) => entry.backingGraphFunction)
  ];
  const missingNames = expectedNames.filter((name) => !moduleNames.has(name));
  if (missingNames.length > 0) {
    throw new TypeError(
      `SdlcQueryDomainProjection: admitted module missing graph functions: ${missingNames.join(", ")}`
    );
  }
  const unexpectedNames = [...moduleNames].filter((name) => !expectedByName.has(name));
  if (unexpectedNames.length > 0) {
    throw new TypeError(
      `SdlcQueryDomainProjection: admitted module contains unpublished graph functions: ${unexpectedNames.join(", ")}`
    );
  }
  const mismatches: string[] = [];
  for (const name of expectedNames) {
    const actual = actualByName.get(name);
    const expected = expectedByName.get(name);
    if (actual !== undefined && expected !== undefined) {
      assertGraphFunctionSignature({ name, actual, expected, mismatches });
    }
  }
  compareStringArray({
    label: "startTargets",
    actual: startTargetStructuralSignature(input.module),
    expected: startTargetStructuralSignature(canonicalModule),
    mismatches
  });
  if (mismatches.length > 0) {
    throw new TypeError(
      `SdlcQueryDomainProjection: admitted module structural drift: ${mismatches.join("; ")}`
    );
  }
}

export function projectSdlcQueryDomain(input: {
  readonly module: Module;
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly currentDossierRefs?: readonly string[];
  readonly projectConformance?: SdlcConformProjectReport | null;
}): SdlcQueryDomainProjection {
  const catalog = constructSdlcGraphFunctionCatalog();
  assertModuleMatchesCatalog({ module: input.module, catalog });
  const traversalOverlays = constructSdlcTraversalOverlayCatalog({
    module: input.module,
    graphCatalog: catalog
  });
  const graphFunctionSurfaces = graphFunctionSurface(input.module);
  const bootstrapEntryGraphFunction = input.module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_BOOTSTRAP_SDLC_ENTRY
  );
  if (bootstrapEntryGraphFunction === undefined) {
    throw new TypeError(`${FG_BOOTSTRAP_SDLC_ENTRY}: unpublished graph function`);
  }
  const bootstrapEntryGraphFunctionRef =
    sdlcGraphFunctionBoundaryRef(bootstrapEntryGraphFunction);
  const optimisingOverlays = Object.freeze([
    constructSdlcOptimisingOverlay({
      childOverlayRefs: Object.freeze([
        SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
        SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
        SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
        SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
      ]),
      candidateGraphFunctionRefs: Object.freeze([
        bootstrapEntryGraphFunctionRef,
        sdlcGraphFunctionBoundaryRef(
          graphFunctionByName(input.module, FG_DECOMPOSE_DEPTH_BETWEEN_NODES)
        ),
        ...traversalOverlays.overlays.flatMap((overlay) =>
          overlay.termination.terminalGraphFunctionRefs
        )
      ]),
      genericFallbackOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
    })
  ]);
  const assetOwnershipRows = assetOwnership(catalog);
  const domainDefaults = constructSdlcDomainDefaultsCarrier();
  const publishedGraphVectorRefs = publishedGraphVectorRefsForModule(input.module);
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({
    module: input.module,
    publishedGraphVectorRefs
  });
  const targetCarriers = targetCarrierRegistry.readModel;
  const edgeAssurance = projectSdlcEdgeAssuranceReadModel({
    module: input.module,
    targetCarriers
  });
  const requirementFulfillment = projectSdlcRequirementFulfillmentForIngress(
    input.ingressReport
  );
  const ticketWorkflow = projectSdlcTicketWorkflow({
    workspaceRoot: ticketWorkflowWorkspaceRoot(
      input.ingressReport.workspaceRootUri
    )
  });
  return Object.freeze({
    kind: "sdlc_query_domain_projection",
    contractName: "odd_sdlc.query-domain",
    contractVersion: "ts-v1",
    runtimeModel: "abg-native",
    queryModel: "odd-domain-read-model",
    readOnly: true,
    emittedRuntimeEventKinds: Object.freeze([]),
    workspaceRootUri: input.ingressReport.workspaceRootUri,
    assetTypes: SOFTWARE_DOMAIN_ASSET_TYPES,
    assetFamilies: SOFTWARE_DOMAIN_ASSET_FAMILIES,
    workActTypes: SOFTWARE_DOMAIN_WORK_ACT_TYPES,
    domainDefaults,
    libraryFunctions: catalog.libraryFunctions,
    functions: catalog.functions,
    programs: catalog.executives,
    traversalOverlays,
    optimisingOverlays,
    graphFunctions: graphFunctionSurfaces,
    startTargets: startTargets({
      module: input.module,
      overlayCatalog: traversalOverlays,
      projectConformance: input.projectConformance ?? null
    }),
    assetOwnership: assetOwnershipRows,
    targetBindings: Object.freeze(
      assetOwnershipRows.map((ownership) =>
        targetBindingForOwnership({
          ownership,
          graphFunctions: graphFunctionSurfaces
        })
      )
    ),
    targetCarriers,
    edgeAssurance,
    requirementFulfillment,
    ticketWorkflow,
    currentDossierRefs: Object.freeze([...(input.currentDossierRefs ?? [])]),
    projectConformance: input.projectConformance ?? null
  });
}

function gapStatus(input: {
  readonly vectorCount: number;
  readonly closedVectorIndexes: readonly number[];
  readonly nextVectorIndex: number | null;
}): SdlcGapStatus {
  if (input.nextVectorIndex === null) {
    return "converged";
  }
  if (input.closedVectorIndexes.length > 0) {
    return "partial";
  }
  return "open";
}

export function evalSdlcGapFromReplay(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): SdlcGapProjection {
  const projection = deriveRuntimeAggregateProjection(input.basis, input.events);
  const currentVector =
    projection.nextVectorIndex === null
      ? undefined
      : input.basis.graph.vectors[projection.nextVectorIndex];
  const currentEdge = currentVector?.name ?? null;
  const module = constructSdlcGtlModule();
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({
    module,
    publishedGraphVectorRefs: publishedGraphVectorRefsForModule(module)
  });
  const targetCarriers = targetCarrierRegistry.readModel;
  const edgeAssurance = edgeAssuranceReadModelForEdge({
    readModel: projectSdlcEdgeAssuranceReadModel({
      module,
      targetCarriers
    }),
    edgeRef: currentEdge
  });
  const targetCarrier = targetCarrierReadModelForEdge({
    readModel: targetCarriers,
    edgeRef: currentEdge
  });
  return Object.freeze({
    kind: "sdlc_gap_projection",
    readOnly: true,
    evaluationFunction: "eval_gap",
    productAssetModelRef:
      `product-asset-model://odd-sdlc/${input.basis.graphFunction.id}`,
    choosesNextTraversal: false,
    evaluatesActionClosure: false,
    emittedRuntimeEventKinds: Object.freeze([]),
    graphFunctionName: input.basis.graphFunction.name,
    status: gapStatus({
      vectorCount: projection.vectorCount,
      closedVectorIndexes: projection.closedVectorIndexes,
      nextVectorIndex: projection.nextVectorIndex
    }),
    currentEdge,
    edgeAssuranceContractRef:
      edgeAssurance.row?.edgeAssuranceContractRef ?? null,
    edgeAssuranceContractDigest:
      edgeAssurance.row?.edgeAssuranceContractDigest ?? null,
    targetCarrierContractRef:
      targetCarrier.row?.targetCarrierContractRef ?? null,
    targetCarrierContractDigest:
      targetCarrier.row?.targetCarrierContractDigest ?? null,
    targetCarrierDiagnostics: targetCarrier.diagnostics,
    edgeAssuranceProofLaneRefs:
      edgeAssurance.row?.proofLaneRefs ?? Object.freeze([] as const),
    edgeAssuranceResidualPressureRefs:
      edgeAssurance.row?.residualPressureRefs ?? Object.freeze([] as const),
    edgeAssuranceDiagnostics: edgeAssurance.diagnostics,
    nextVectorIndex: projection.nextVectorIndex,
    closedVectorIndexes: projection.closedVectorIndexes
  });
}

export function deriveSdlcGapDossier(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
  readonly triageInput: string;
  readonly evidenceRefs: readonly string[];
  readonly priorityScheme?: ConstructionPriorityScheme;
  readonly domainDefaults?: SdlcDomainDefaultsCarrier;
  readonly requirementFulfillment?: SdlcRequirementFulfillmentPublicProjection;
}): SdlcGapDossier {
  const gaps = evalSdlcGapFromReplay({
    basis: input.basis,
    events: input.events
  });
  const intentEventRefs = Object.freeze([
    `event://odd-sdlc/intent/${input.triageInput}`
  ]);
  const domainDefaults =
    input.domainDefaults ?? constructSdlcDomainDefaultsCarrier();
  const defaultParticipationRefs =
    input.priorityScheme === undefined && gaps.nextVectorIndex !== null
      ? Object.freeze([domainDefaults.carrierRef, domainDefaults.digestRef])
      : Object.freeze([]);
  const evaluator =
    gaps.nextVectorIndex === null
      ? null
      : evaluateSdlcNextAction(
          {
            basis: input.basis,
            events: input.events,
            vectorIndex: gaps.nextVectorIndex,
            closedVectorIndexes: gaps.closedVectorIndexes,
            triageInput: input.triageInput,
            evidenceRefs: input.evidenceRefs,
            intentEventRefs,
            productAssetModelRef: gaps.productAssetModelRef,
            domainDefaults
          },
          input.priorityScheme
        );
  return Object.freeze({
    kind: "sdlc_gap_dossier",
    readOnly: true,
    gapEvaluationFunction: "eval_gap",
    nextActionEvaluationFunction: "evaluate_next",
    actionClosureEvaluationFunction: null,
    choosesNextTraversal: false,
    rankingAuthority: "abiogenesis_construction_priority_projection",
    localRankingAuthority: false,
    edge: gaps.currentEdge,
    status: gaps.status,
    edgeAssuranceContractRef: gaps.edgeAssuranceContractRef,
    edgeAssuranceContractDigest: gaps.edgeAssuranceContractDigest,
    targetCarrierContractRef: gaps.targetCarrierContractRef,
    targetCarrierContractDigest: gaps.targetCarrierContractDigest,
    targetCarrierDiagnostics: gaps.targetCarrierDiagnostics,
    edgeAssuranceProofLaneRefs: gaps.edgeAssuranceProofLaneRefs,
    edgeAssuranceResidualPressureRefs: gaps.edgeAssuranceResidualPressureRefs,
    edgeAssuranceDiagnostics: gaps.edgeAssuranceDiagnostics,
    evidenceRefs: Object.freeze([...input.evidenceRefs, ...defaultParticipationRefs]),
    triageInput: input.triageInput,
    nextActionBasisKind: "initial_selection",
    intentEventRefs,
    productAssetModelRef: gaps.productAssetModelRef,
    gapPressureRefs: Object.freeze(evaluator?.gapPressureRefs ?? []),
    targetBindingRefs: Object.freeze(evaluator?.targetBindingRefs ?? []),
    actionCatalogRefs: Object.freeze(evaluator?.actionCatalogRefs ?? []),
    nextActionProjectionRef: evaluator?.priorityProjection.projectionRef ?? null,
    prioritySchemeRef: evaluator?.priorityProjection.prioritySchemeRef ?? null,
    bestActionRef: evaluator?.selectedPriorityRow?.actionRef ?? null,
    bestGraphFunctionRef: evaluator?.bestGraphFunctionRef ?? null,
    bestGraphVectorRef: evaluator?.bestGraphVectorRef ?? null,
    rankingReasonRefs: Object.freeze(
      evaluator === null
        ? []
        : [
            ...defaultParticipationRefs,
            ...(evaluator.selectedPriorityRow?.rankReasonRefs ?? [])
          ]
    ),
    requirementFulfillment:
      input.requirementFulfillment ?? emptyRequirementFulfillmentPublicView(),
    nextLawfulActions: Object.freeze(
      evaluator === null ? ["close_or_reprice"] : evaluator.nextLawfulActionRefs
    )
  });
}

function evaluateSdlcNextAction(
  input: {
    readonly basis: ExecutionBasis;
    readonly events: readonly RuntimeEvent[];
    readonly vectorIndex: number;
    readonly closedVectorIndexes: readonly number[];
    readonly triageInput: string;
    readonly evidenceRefs: readonly string[];
    readonly intentEventRefs: readonly string[];
    readonly productAssetModelRef: string;
    readonly domainDefaults: SdlcDomainDefaultsCarrier;
  },
  priorityScheme?: ConstructionPriorityScheme
): OddSdlcEvaluateNextReport {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("SdlcGapDossier evaluator requires a published graph vector");
  }
  const closedVectorIndexSet = new Set(input.closedVectorIndexes);
  const graphFunctionRef = sdlcGraphFunctionBoundaryRef(input.basis.graphFunction);
  const vectorRef = sdlcGraphVectorBoundaryRef(vector);
  const candidateVectors = input.basis.graph.vectors
    .map((candidate, index) => Object.freeze({ candidate, index }))
    .filter(({ index }) => !closedVectorIndexSet.has(index));
  const targetOutcomeRefs = Object.freeze(
    candidateVectors.map(
      ({ candidate }) =>
        sdlcTargetOutcomeRef({
          graphFunctionRef,
          targetNodeRef: candidate.target.id
        })
    )
  );
  const currentTargetOutcomeRef = sdlcTargetOutcomeRef({
    graphFunctionRef,
    targetNodeRef: vector.target.id
  });
  const effectivePriorityScheme =
    priorityScheme ??
    constructConstructionPriorityScheme({
      schemeRef:
        `${input.domainDefaults.defaultGapPrioritySchemeRef}/${graphFunctionRef}/${vectorRef}`,
      sourcePolicyRef: input.domainDefaults.defaultGapPriorityPolicyRef,
      rules: Object.freeze([
        constructConstructionPriorityRule({
          priorityRuleRef:
            `${input.domainDefaults.defaultGapPriorityPolicyRef}/rule/${graphFunctionRef}/${vectorRef}`,
          axis: "gap_repair",
          weight: 100,
          appliesToActionKinds: Object.freeze(["continue_graph_call"]),
          appliesToOutcomeRefs: Object.freeze([currentTargetOutcomeRef]),
          sourcePolicyRef: input.domainDefaults.defaultGapPriorityPolicyRef,
          strategyLabel: "follow_current_graph_edge"
        })
      ])
    });
  return deriveOddSdlcEvaluateNextReport({
    basis: input.basis,
    events: input.events,
    nextActionBasisKind: "initial_selection",
    intentEventRefs: input.intentEventRefs,
    productAssetModelRef: input.productAssetModelRef,
    episodeId: `construction-episode://odd-sdlc/gaps/${graphFunctionRef}`,
    observationId: `construction-observation://odd-sdlc/gaps/${graphFunctionRef}/${input.vectorIndex}/${input.events.length}`,
    priorityScheme: effectivePriorityScheme,
    pressures: Object.freeze([
      {
        pressureRef: `pressure://odd-sdlc/gap/${graphFunctionRef}/${vectorRef}`,
        pressureKind: "gap_row",
        sourceRef: `sdlc-gap-dossier://odd-sdlc/${input.triageInput}`,
        affectedAssetRefs: Object.freeze(
          candidateVectors.map(({ candidate }) => candidate.target.id)
        ),
        targetOutcomeRefs,
        evidenceRefs: input.evidenceRefs,
        severity: 1
      }
    ]),
    actions: Object.freeze(
      candidateVectors.map(({ candidate }) => {
        const graphVectorRef = sdlcGraphVectorBoundaryRef(candidate);
        const targetOutcomeRef = sdlcTargetOutcomeRef({
          graphFunctionRef,
          targetNodeRef: candidate.target.id
        });
        const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
          graphFunctionRef,
          graphVectorRef
        });
        return {
          actionKind: "continue_graph_call" as const,
          graphFunctionRef,
          graphVectorRef,
          publishedTraversalTargetRef,
          targetOutcomeRef,
          inputAssetRefs: Object.freeze(candidate.source.map((node) => node.id)),
          expectedOutputAssetRefs: Object.freeze([candidate.target.id]),
          requiredAuthorityRefs: Object.freeze([publishedTraversalTargetRef]),
          eligibleReasonRefs: Object.freeze([
            "odd_sdlc_gap_dossier_read_only_evaluator_view",
            input.domainDefaults.carrierRef
          ])
        };
      })
    )
  });
}

export function projectSdlcSpanAnalysis(input: {
  readonly basis: ExecutionBasis;
  readonly fromEdge?: string | null;
  readonly toEdge?: string | null;
  readonly zoom?: "edge" | "span" | "graph";
}): SdlcSpanAnalysisProjection {
  const allEdges = input.basis.graph.vectors.map((vector) => vector.name);
  const fromIndex =
    input.fromEdge === undefined || input.fromEdge === null
      ? 0
      : allEdges.indexOf(input.fromEdge);
  const toIndex =
    input.toEdge === undefined || input.toEdge === null
      ? allEdges.length - 1
      : allEdges.indexOf(input.toEdge);
  if (fromIndex < 0 || toIndex < 0 || fromIndex > toIndex) {
    throw new TypeError("SdlcSpanAnalysisProjection requires an ordered bounded edge span");
  }
  return Object.freeze({
    kind: "sdlc_span_analysis_projection",
    readOnly: true,
    graphFunctionName: input.basis.graphFunction.name,
    fromEdge: input.fromEdge ?? null,
    toEdge: input.toEdge ?? null,
    zoom: input.zoom ?? "span",
    edges: Object.freeze(allEdges.slice(fromIndex, toIndex + 1))
  });
}
