// Implements: T-175
// Carries: T-174 graph truth into the cataloged TypeScript tenant graph contract.

import { materializeGraphFunction, type Module } from "@abiogenesis/typescript-tenant";
import type {
  SdlcEdgeClosureClassification,
  SdlcEdgeGainClosureContract
} from "../graph/edge_gain_closure_contracts.js";
import type { SdlcTargetCarrierContractRow } from "../graph/target_carrier_contracts.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

export type SdlcProductGraphWorkerDispatchPolicy =
  | "single_worker_handoff"
  | "abg_frontier_eligible"
  | "projection_only"
  | "library_only";

export type SdlcProductGraphDiagnosticCode =
  | "published_vector_missing_edge_contract"
  | "close_capable_vector_missing_target_carrier"
  | "edge_contract_missing_published_vector"
  | "target_carrier_missing_published_vector"
  | "t174_frontier_row_missing_required_artifact";

export interface SdlcProductGraphContractRow {
  readonly kind: "sdlc_product_graph_contract_row";
  readonly graphVectorRef: string;
  readonly edgeRef: string;
  readonly graphFunctionName: string;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly closeClassification: SdlcEdgeClosureClassification;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierBindingPolicy:
    | "declared_target_carrier_contract"
    | "not_required"
    | "missing";
  readonly edgeGainClosureContractRef: string | null;
  readonly overlayEligibilityRefs: readonly string[];
  readonly workerDispatchPolicy: SdlcProductGraphWorkerDispatchPolicy;
  readonly deterministicActionRef: string | null;
  readonly requiredArtifactRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
}

export interface SdlcProductGraphEdgePolicyRow {
  readonly edgeRef: string;
  readonly workerDispatchPolicy?: SdlcProductGraphWorkerDispatchPolicy | undefined;
  readonly requiredArtifactRefs?: readonly string[] | undefined;
  readonly proofLaneRefs?: readonly string[] | undefined;
}

export interface SdlcProductGraphContractDiagnostic {
  readonly kind: "sdlc_product_graph_contract_diagnostic";
  readonly code: SdlcProductGraphDiagnosticCode;
  readonly edgeRef: string;
  readonly detail: string;
}

export interface SdlcProductGraphContractCatalog {
  readonly kind: "sdlc_product_graph_contract_catalog";
  readonly catalogRef: "product-graph-contract-catalog://odd-sdlc/ts-v1";
  readonly rows: readonly SdlcProductGraphContractRow[];
  readonly diagnostics: readonly SdlcProductGraphContractDiagnostic[];
  readonly rowByEdgeRef: Readonly<Record<string, SdlcProductGraphContractRow>>;
}

export interface SdlcProductGraphOverlaySource {
  readonly overlayRef: string;
  readonly graphVectorRefs: readonly string[];
}

function edgeAssuranceContractRef(
  contract: SdlcEdgeGainClosureContract
): string {
  return [
    "edge-assurance-contract://odd-sdlc",
    encodeURIComponent(contract.edgeRef),
    encodeURIComponent(contract.targetAssetType)
  ].join("/");
}

function vectorSourcesByEdge(module: Module): ReadonlyMap<string, readonly string[]> {
  const rows = new Map<string, readonly string[]>();
  for (const graphFunction of module.graphFunctions) {
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!rows.has(vector.name)) {
        rows.set(vector.name, Object.freeze(vector.source.map((node) => node.name)));
      }
    }
  }
  return rows;
}

function graphFunctionByVector(module: Module): ReadonlyMap<string, string> {
  const rows = new Map<string, string>();
  for (const graphFunction of module.graphFunctions) {
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!rows.has(vector.name)) {
        rows.set(vector.name, graphFunction.name);
      }
    }
  }
  return rows;
}

function publishedVectorRefs(module: Module): readonly string[] {
  return uniqueSorted([...graphFunctionByVector(module).keys()]);
}

function overlaysForEdge(input: {
  readonly edgeRef: string;
  readonly overlays: readonly SdlcProductGraphOverlaySource[];
}): readonly string[] {
  return uniqueSorted(
    input.overlays.flatMap((overlay) =>
      overlay.graphVectorRefs.includes(input.edgeRef) ? [overlay.overlayRef] : []
    )
  );
}

export const SDLC_PRODUCT_GRAPH_EDGE_POLICY_ROWS = Object.freeze([
  Object.freeze({
    edgeRef: "derive_implementation_design_surface",
    workerDispatchPolicy: "single_worker_handoff",
    requiredArtifactRefs: Object.freeze([
      "operator-run-artifact://design-depth-fp-evaluator-register"
    ])
  }),
  Object.freeze({
    edgeRef: "derive_component_code_surface",
    workerDispatchPolicy: "abg_frontier_eligible",
    requiredArtifactRefs: Object.freeze([
      "operator-run-artifact://implementation-decomposition-summary",
      "operator-run-artifact://module-dependency-map",
      "operator-run-artifact://module-dependency-traversal-selection",
      "operator-run-artifact://live-fp-parallel-materialization-frontier",
      "operator-run-artifact://review-grade-edge-fulfillment-assessment"
    ]),
    proofLaneRefs: Object.freeze([
      "test://odd-sdlc/t174/feature-dependency-frontier"
    ])
  }),
  Object.freeze({
    edgeRef: "derive_component_test_surface",
    workerDispatchPolicy: "abg_frontier_eligible",
    requiredArtifactRefs: Object.freeze([
      "operator-run-artifact://implementation-decomposition-summary",
      "operator-run-artifact://module-dependency-map",
      "operator-run-artifact://module-dependency-traversal-selection",
      "operator-run-artifact://test-decomposition-summary",
      "operator-run-artifact://test-dependency-map",
      "operator-run-artifact://test-dependency-traversal-selection",
      "operator-run-artifact://live-fp-parallel-materialization-frontier",
      "operator-run-artifact://review-grade-edge-fulfillment-assessment"
    ]),
    proofLaneRefs: Object.freeze([
      "test://odd-sdlc/t174/feature-dependency-frontier"
    ])
  }),
  Object.freeze({
    edgeRef: "derive_uat_test_source_surface",
    workerDispatchPolicy: "abg_frontier_eligible",
    requiredArtifactRefs: Object.freeze([
      "operator-run-artifact://test-decomposition-summary",
      "operator-run-artifact://test-dependency-map",
      "operator-run-artifact://test-dependency-traversal-selection",
      "operator-run-artifact://live-fp-parallel-materialization-frontier",
      "operator-run-artifact://review-grade-edge-fulfillment-assessment"
    ]),
    proofLaneRefs: Object.freeze([
      "test://odd-sdlc/t174/feature-dependency-frontier",
      "test://odd-sdlc/t203/uat-test-source"
    ])
  }),
  Object.freeze({
    edgeRef: "derive_test_execution_result_surface",
    workerDispatchPolicy: "single_worker_handoff",
    requiredArtifactRefs: Object.freeze([])
  })
] as const satisfies readonly SdlcProductGraphEdgePolicyRow[]);

function edgePolicyForEdge(edgeRef: string): SdlcProductGraphEdgePolicyRow | null {
  return SDLC_PRODUCT_GRAPH_EDGE_POLICY_ROWS.find(
    (policy) => policy.edgeRef === edgeRef
  ) ?? null;
}

function defaultWorkerDispatchPolicy(
  closureClassification: SdlcEdgeClosureClassification
): SdlcProductGraphWorkerDispatchPolicy {
  if (closureClassification === "library_only") {
    return "library_only";
  }
  if (
    closureClassification === "projection_only" ||
    closureClassification === "no_close"
  ) {
    return "projection_only";
  }
  return "single_worker_handoff";
}

function reviewGradeArtifactRefsForContract(input: {
  readonly closeClassification: SdlcEdgeClosureClassification;
  readonly workerDispatchPolicy: SdlcProductGraphWorkerDispatchPolicy;
  readonly targetAssetType: string;
}): readonly string[] {
  if (input.closeClassification !== "close_capable") {
    return Object.freeze([]);
  }
  if (
    input.workerDispatchPolicy === "projection_only" ||
    input.workerDispatchPolicy === "library_only"
  ) {
    return Object.freeze([]);
  }
  if (
    input.targetAssetType === "component_realization_qualification_surface" ||
    input.targetAssetType === "test_execution_surface" ||
    input.targetAssetType === "test_execution_result_surface" ||
    input.targetAssetType === "component_test_qualification_surface" ||
    input.targetAssetType === "test_run_archive_surface" ||
    input.targetAssetType === "release_depth_parity_surface"
  ) {
    return Object.freeze([]);
  }
  return Object.freeze([
    "operator-run-artifact://review-grade-edge-fulfillment-assessment",
    "operator-run-artifact://review-grade-edge-fulfillment-run",
    "operator-run-artifact://review-grade-edge-fulfillment-process-started"
  ]);
}

function productMaterializationArtifactRefsForContract(input: {
  readonly closeClassification: SdlcEdgeClosureClassification;
  readonly targetAssetType: string;
}): readonly string[] {
  if (input.closeClassification !== "close_capable") {
    return Object.freeze([]);
  }
  if (input.targetAssetType === "feature_decomp_surface") {
    return Object.freeze([]);
  }
  return Object.freeze([
    "operator-run-artifact://product-materialization-manifest"
  ]);
}

function rowForEdge(input: {
  readonly edgeRef: string;
  readonly graphFunctionName: string;
  readonly sourceAssetTypes: readonly string[];
  readonly contract: SdlcEdgeGainClosureContract | undefined;
  readonly targetCarrier: SdlcTargetCarrierContractRow | undefined;
  readonly overlays: readonly SdlcProductGraphOverlaySource[];
}): SdlcProductGraphContractRow {
  const closeClassification =
    input.contract?.closureClassification ?? "no_close";
  const targetAssetType =
    input.contract?.targetAssetType ?? input.targetCarrier?.targetAssetType ?? "unknown_target_asset";
  const edgePolicy = edgePolicyForEdge(input.edgeRef);
  const edgePolicyRequiredArtifactRefs =
    edgePolicy?.requiredArtifactRefs ?? Object.freeze([]);
  const workerDispatchPolicy =
    edgePolicy?.workerDispatchPolicy ??
    defaultWorkerDispatchPolicy(closeClassification);
  return Object.freeze({
    kind: "sdlc_product_graph_contract_row" as const,
    graphVectorRef: input.edgeRef,
    edgeRef: input.edgeRef,
    graphFunctionName: input.graphFunctionName,
    sourceAssetTypes:
      input.contract?.sourceAssetTypes ?? uniqueSorted(input.sourceAssetTypes),
    targetAssetType,
    closeClassification,
    targetCarrierContractRef:
      input.targetCarrier?.targetCarrierContractRef ?? null,
    targetCarrierBindingPolicy:
      input.targetCarrier === undefined
        ? closeClassification === "close_capable"
          ? "missing"
          : "not_required"
        : "declared_target_carrier_contract",
    edgeGainClosureContractRef:
      input.contract === undefined ? null : edgeAssuranceContractRef(input.contract),
    overlayEligibilityRefs: overlaysForEdge({
      edgeRef: input.edgeRef,
      overlays: input.overlays
    }),
    workerDispatchPolicy,
    deterministicActionRef:
      input.contract?.deterministicOptimizationRefs[0] ?? null,
    requiredArtifactRefs: uniqueSorted([
      ...(input.contract?.ledgerInputKinds.map((kind) =>
        `ledger-input-kind://odd-sdlc/${kind}`
      ) ?? []),
      ...productMaterializationArtifactRefsForContract({
        closeClassification,
        targetAssetType
      }),
      ...reviewGradeArtifactRefsForContract({
        closeClassification,
        workerDispatchPolicy,
        targetAssetType
      }),
      ...edgePolicyRequiredArtifactRefs
    ]),
    proofLaneRefs: uniqueSorted([
      ...(input.contract?.proofLaneRefs ?? []),
      ...(edgePolicy?.proofLaneRefs ?? [])
    ])
  });
}

function diagnostic(input: {
  readonly code: SdlcProductGraphDiagnosticCode;
  readonly edgeRef: string;
  readonly detail: string;
}): SdlcProductGraphContractDiagnostic {
  return Object.freeze({
    kind: "sdlc_product_graph_contract_diagnostic" as const,
    code: input.code,
    edgeRef: input.edgeRef,
    detail: input.detail
  });
}

export function constructSdlcProductGraphContractCatalog(input: {
  readonly module: Module;
  readonly edgeContracts: readonly SdlcEdgeGainClosureContract[];
  readonly targetCarrierRows: readonly SdlcTargetCarrierContractRow[];
  readonly overlays?: readonly SdlcProductGraphOverlaySource[] | undefined;
}): SdlcProductGraphContractCatalog {
  const vectorRefs = publishedVectorRefs(input.module);
  const graphFunctionNames = graphFunctionByVector(input.module);
  const sourceAssetTypes = vectorSourcesByEdge(input.module);
  const contractsByEdge = new Map(
    input.edgeContracts.map((contract) => [contract.edgeRef, contract])
  );
  const targetCarriersByEdge = new Map(
    input.targetCarrierRows.map((row) => [row.edgeRef, row])
  );
  const overlays = input.overlays ?? Object.freeze([]);
  const rows = Object.freeze(
    vectorRefs.map((edgeRef) =>
      rowForEdge({
        edgeRef,
        graphFunctionName: graphFunctionNames.get(edgeRef) ?? edgeRef,
        sourceAssetTypes: sourceAssetTypes.get(edgeRef) ?? Object.freeze([]),
        contract: contractsByEdge.get(edgeRef),
        targetCarrier: targetCarriersByEdge.get(edgeRef),
        overlays
      })
    )
  );
  const vectorRefSet = new Set(vectorRefs);
  const diagnostics = Object.freeze([
    ...rows
      .filter((row) => row.edgeGainClosureContractRef === null)
      .map((row) =>
        diagnostic({
          code: "published_vector_missing_edge_contract",
          edgeRef: row.edgeRef,
          detail: `${row.edgeRef}: published graph vector has no product edge gain/closure contract`
        })
      ),
    ...rows
      .filter(
        (row) =>
          row.closeClassification === "close_capable" &&
          row.targetCarrierContractRef === null
      )
      .map((row) =>
        diagnostic({
          code: "close_capable_vector_missing_target_carrier",
          edgeRef: row.edgeRef,
          detail: `${row.edgeRef}: close-capable graph row has no target carrier contract`
        })
      ),
    ...input.edgeContracts
      .filter((contract) => !vectorRefSet.has(contract.edgeRef))
      .map((contract) =>
        diagnostic({
          code: "edge_contract_missing_published_vector",
          edgeRef: contract.edgeRef,
          detail: `${contract.edgeRef}: edge contract has no published graph vector`
        })
      ),
    ...input.targetCarrierRows
      .filter((targetCarrier) => !vectorRefSet.has(targetCarrier.edgeRef))
      .map((targetCarrier) =>
        diagnostic({
          code: "target_carrier_missing_published_vector",
          edgeRef: targetCarrier.edgeRef,
          detail: `${targetCarrier.edgeRef}: target carrier row has no published graph vector`
        })
      ),
    ...rows
      .filter(
        (row) =>
          row.workerDispatchPolicy === "abg_frontier_eligible" &&
          !row.requiredArtifactRefs.some((artifactRef) =>
            artifactRef.includes("dependency")
          )
      )
      .map((row) =>
        diagnostic({
          code: "t174_frontier_row_missing_required_artifact",
          edgeRef: row.edgeRef,
          detail: `${row.edgeRef}: ABG-frontier eligible row does not name dependency-map artifacts`
        })
      )
  ]);
  return Object.freeze({
    kind: "sdlc_product_graph_contract_catalog" as const,
    catalogRef: "product-graph-contract-catalog://odd-sdlc/ts-v1" as const,
    rows,
    diagnostics,
    rowByEdgeRef: Object.freeze(
      Object.fromEntries(rows.map((row) => [row.edgeRef, row]))
    )
  });
}

export function requireSdlcProductGraphContractRow(input: {
  readonly catalog: SdlcProductGraphContractCatalog;
  readonly edgeRef: string;
}): SdlcProductGraphContractRow {
  const row = input.catalog.rowByEdgeRef[input.edgeRef];
  if (row === undefined) {
    throw new TypeError(`${input.edgeRef}: missing SDLC product graph contract row`);
  }
  return row;
}

export function assertSdlcProductGraphContractCatalog(
  catalog: SdlcProductGraphContractCatalog
): void {
  if (catalog.diagnostics.length > 0) {
    throw new TypeError(
      `SdlcProductGraphContractCatalog diagnostics: ${catalog.diagnostics
        .map((row) => `${row.code}:${row.edgeRef}`)
        .join(", ")}`
    );
  }
}
