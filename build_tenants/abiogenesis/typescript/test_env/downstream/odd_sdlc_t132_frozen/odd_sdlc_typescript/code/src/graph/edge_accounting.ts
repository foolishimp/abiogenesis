// Implements: T-172
// Implements: REQ-F-ODDSDLC-081

import { OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS } from "./catalog.js";
import { uniqueNonEmptySorted as uniqueSorted } from "../shared/collections.js";

export type SdlcExecutiveEdgeAccountingDisposition =
  | "required"
  | "conditional"
  | "projection_no_close"
  | "merge_required"
  | "replace_required"
  | "delete_required";

export interface SdlcExecutiveEdgeAccountingRow {
  readonly kind: "sdlc_executive_edge_accounting_row";
  readonly edgeName: string;
  readonly disposition: SdlcExecutiveEdgeAccountingDisposition;
  readonly ownedPressureRefs: readonly string[];
  readonly authorityOutputRefs: readonly string[];
  readonly predecessorEdgeNames: readonly string[];
  readonly successorEdgeNames: readonly string[];
  readonly closureEvidenceRefs: readonly string[];
  readonly workerDispatchAllowed: boolean;
  readonly rationale: string;
}

export interface SdlcExecutiveEdgeAccountingAudit {
  readonly kind: "sdlc_executive_edge_accounting_audit";
  readonly selectedEdgeNames: readonly string[];
  readonly accountedEdgeNames: readonly string[];
  readonly missingEdgeNames: readonly string[];
  readonly extraEdgeNames: readonly string[];
  readonly projectionNoCloseEdgeNames: readonly string[];
  readonly conditionalEdgeNames: readonly string[];
  readonly mergeRequiredEdgeNames: readonly string[];
  readonly replaceRequiredEdgeNames: readonly string[];
  readonly deleteRequiredEdgeNames: readonly string[];
  readonly workerDispatchViolationEdgeNames: readonly string[];
  readonly observedWorkerDispatchViolationEdgeNames: readonly string[];
  readonly closeCapableWithoutEvidenceEdgeNames: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly admissionDecision: "admit" | "reject";
}

interface SdlcExecutiveEdgeAccountingSeed {
  readonly edgeName: string;
  readonly disposition: SdlcExecutiveEdgeAccountingDisposition;
  readonly ownedPressureRefs: readonly string[];
  readonly authorityOutputRefs: readonly string[];
  readonly closureEvidenceRefs: readonly string[];
  readonly workerDispatchAllowed: boolean;
  readonly rationale: string;
}

const NON_CONSTRUCTION_DISPOSITIONS: readonly SdlcExecutiveEdgeAccountingDisposition[] =
  Object.freeze([
    "projection_no_close",
    "merge_required",
    "replace_required",
    "delete_required"
  ] satisfies readonly SdlcExecutiveEdgeAccountingDisposition[]);

// required: emits new authority/evidence; conditional: lawful only under named
// pressure; projection_no_close: rollup with no new closure evidence; merge,
// replace, and delete are active cleanup signals for inherited graph edges.
const CLOSE_CAPABLE_DISPOSITIONS: readonly SdlcExecutiveEdgeAccountingDisposition[] =
  Object.freeze([
    "required",
    "conditional"
  ] satisfies readonly SdlcExecutiveEdgeAccountingDisposition[]);

function neighbors(edgeName: string): {
  readonly predecessorEdgeNames: readonly string[];
  readonly successorEdgeNames: readonly string[];
} {
  const selectedSteps: readonly string[] = OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS;
  const index = selectedSteps.indexOf(edgeName);
  if (index < 0) {
    return Object.freeze({
      predecessorEdgeNames: Object.freeze([]),
      successorEdgeNames: Object.freeze([])
    });
  }
  const predecessor = selectedSteps[index - 1];
  const successor = selectedSteps[index + 1];
  return Object.freeze({
    predecessorEdgeNames:
      predecessor === undefined ? Object.freeze([]) : Object.freeze([predecessor]),
    successorEdgeNames:
      successor === undefined ? Object.freeze([]) : Object.freeze([successor])
  });
}

function row(
  seed: SdlcExecutiveEdgeAccountingSeed
): SdlcExecutiveEdgeAccountingRow {
  const edgeNeighbors = neighbors(seed.edgeName);
  return Object.freeze({
    kind: "sdlc_executive_edge_accounting_row" as const,
    edgeName: seed.edgeName,
    disposition: seed.disposition,
    ownedPressureRefs: uniqueSorted(seed.ownedPressureRefs),
    authorityOutputRefs: uniqueSorted(seed.authorityOutputRefs),
    predecessorEdgeNames: edgeNeighbors.predecessorEdgeNames,
    successorEdgeNames: edgeNeighbors.successorEdgeNames,
    closureEvidenceRefs: uniqueSorted(seed.closureEvidenceRefs),
    workerDispatchAllowed: seed.workerDispatchAllowed,
    rationale: seed.rationale
  });
}

const FULL_TRAVERSAL_EDGE_ACCOUNTING_SEEDS = Object.freeze([
  {
    edgeName: "derive_intent_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://bootstrap/input-intent"],
    authorityOutputRefs: ["surface://intent"],
    closureEvidenceRefs: ["evidence://intent-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns the first reduction from input pressure into intent."
  },
  {
    edgeName: "derive_product_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://intent/product-definition"],
    authorityOutputRefs: ["surface://product"],
    closureEvidenceRefs: ["evidence://product-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns product-definition pressure after intent is admitted."
  },
  {
    edgeName: "derive_goal_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://product/current-work-wave"],
    authorityOutputRefs: ["surface://goals"],
    closureEvidenceRefs: ["evidence://goal-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns bounded work-wave pressure before requirements."
  },
  {
    edgeName: "derive_requirement_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://goals/requirements"],
    authorityOutputRefs: ["surface://requirements"],
    closureEvidenceRefs: ["evidence://requirement-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns constitutional requirement pressure for the wave."
  },
  {
    edgeName: "derive_uat_testcases_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://requirements/uat-testcases"],
    authorityOutputRefs: ["surface://uat-testcases"],
    closureEvidenceRefs: ["evidence://uat-testcase-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns requirement-facing acceptance pressure before design."
  },
  {
    edgeName: "derive_testcase_authority_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://requirements/testcase-authority"],
    authorityOutputRefs: ["surface://testcase-authority"],
    closureEvidenceRefs: ["evidence://testcase-authority-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns testcase authority binding instead of test prompt inference."
  },
  {
    edgeName: "derive_feature_decomp_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://requirements/feature-decomposition"],
    authorityOutputRefs: ["surface://feature-decomposition"],
    closureEvidenceRefs: ["evidence://feature-decomposition-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns requirement grouping pressure before design synthesis."
  },
  {
    edgeName: "derive_design_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://requirements/design"],
    authorityOutputRefs: ["surface://design"],
    closureEvidenceRefs: ["evidence://design-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns design commitments over requirements and testcase pressure."
  },
  {
    edgeName: "derive_scenario_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://design/scenarios"],
    authorityOutputRefs: ["surface://scenarios"],
    closureEvidenceRefs: ["evidence://scenario-surface-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns scenario pressure before implementation planning."
  },
  {
    edgeName: "derive_implementation_design_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://design/implementation-topology"],
    authorityOutputRefs: [
      "surface://implementation-design",
      "surface://implementation-decomposition-summary",
      "surface://module-dependency-map"
    ],
    closureEvidenceRefs: ["evidence://implementation-design-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns implementation topology and dependency authority before code."
  },
  {
    edgeName: "derive_component_code_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://implementation-topology/source-materialization"],
    authorityOutputRefs: ["surface://component-code"],
    closureEvidenceRefs: ["evidence://component-code-materialization"],
    workerDispatchAllowed: true,
    rationale: "Owns bounded source materialization from admitted topology."
  },
  {
    edgeName: "qualify_component_realization_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://component-code/realization-qualification"],
    authorityOutputRefs: ["surface://component-realization-qualification"],
    closureEvidenceRefs: ["evidence://component-realization-qualification"],
    workerDispatchAllowed: false,
    rationale: "Owns evaluator qualification of materialized implementation rows."
  },
  {
    edgeName: "derive_code_surface",
    disposition: "projection_no_close",
    ownedPressureRefs: ["pressure://qualified-component-code/code-rollup"],
    authorityOutputRefs: ["projection://code-surface"],
    closureEvidenceRefs: [],
    workerDispatchAllowed: false,
    rationale: "Rolls admitted implementation carriers into a code projection."
  },
  {
    edgeName: "derive_test_design_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://design/test-topology"],
    authorityOutputRefs: [
      "surface://test-design",
      "surface://test-decomposition-summary",
      "surface://test-dependency-map"
    ],
    closureEvidenceRefs: ["evidence://test-design-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns test topology, stack/profile, and dependency authority."
  },
  {
    edgeName: "derive_component_test_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://test-topology/test-materialization"],
    authorityOutputRefs: ["surface://component-tests"],
    closureEvidenceRefs: ["evidence://component-test-materialization"],
    workerDispatchAllowed: true,
    rationale: "Owns bounded test materialization from admitted test topology."
  },
  {
    edgeName: "derive_uat_test_source_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://requirements/uat-test-source"],
    authorityOutputRefs: ["surface://uat-test-source"],
    closureEvidenceRefs: ["evidence://uat-test-source-materialization"],
    workerDispatchAllowed: true,
    rationale: "Owns requirement-specific UAT executable test-source materialization."
  },
  {
    edgeName: "prepare_test_execution_surface",
    disposition: "projection_no_close",
    ownedPressureRefs: ["pressure://test-design/execution-transition"],
    authorityOutputRefs: ["projection://test-execution-transition"],
    closureEvidenceRefs: [],
    workerDispatchAllowed: false,
    rationale: "Projects declared execution transition; execution evidence is owned by the result edge."
  },
  {
    edgeName: "derive_test_execution_result_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://test-execution/observed-results"],
    authorityOutputRefs: ["surface://test-execution-result"],
    closureEvidenceRefs: ["evidence://admitted-test-execution"],
    workerDispatchAllowed: false,
    rationale: "Owns framework-authored execution-result evidence and scoped repair pressure."
  },
  {
    edgeName: "qualify_component_test_execution_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://execution-result/test-qualification"],
    authorityOutputRefs: ["surface://component-test-qualification"],
    closureEvidenceRefs: ["evidence://component-test-execution-qualification"],
    workerDispatchAllowed: false,
    rationale: "Owns evaluator comparison of observed execution against test design."
  },
  {
    edgeName: "derive_component_repair_schedule_surface",
    disposition: "conditional",
    ownedPressureRefs: ["pressure://component-failure/repair-schedule"],
    authorityOutputRefs: ["surface://component-repair-schedule"],
    closureEvidenceRefs: ["evidence://repair-schedule-admission"],
    workerDispatchAllowed: true,
    rationale: "Owns F_P repair scheduling depth only when admitted failure pressure exists."
  },
  {
    edgeName: "derive_test_run_archive_surface",
    disposition: "projection_no_close",
    ownedPressureRefs: ["pressure://admitted-execution/archive-projection"],
    authorityOutputRefs: ["projection://test-run-archive"],
    closureEvidenceRefs: [],
    workerDispatchAllowed: false,
    rationale: "Projects admitted execution and qualification truth into an archive view."
  },
  {
    edgeName: "derive_release_depth_parity_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://qualified-code-tests/release-depth-parity"],
    authorityOutputRefs: ["surface://release-depth-parity"],
    closureEvidenceRefs: ["evidence://release-depth-parity-admission"],
    workerDispatchAllowed: false,
    rationale: "Owns evaluator co-affirmation between realization and tests."
  },
  {
    edgeName: "prepare_release_surface",
    disposition: "required",
    ownedPressureRefs: ["pressure://release/qualification"],
    authorityOutputRefs: ["surface://release"],
    closureEvidenceRefs: ["evidence://release-qualification"],
    workerDispatchAllowed: false,
    rationale: "Owns final release qualification over admitted construction truth."
  }
] satisfies readonly SdlcExecutiveEdgeAccountingSeed[]);

export const SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING = Object.freeze(
  FULL_TRAVERSAL_EDGE_ACCOUNTING_SEEDS.map((seed) => row(seed))
) satisfies readonly SdlcExecutiveEdgeAccountingRow[];

export function sdlcExecutiveEdgeAccountingRowFor(
  edgeName: string,
  accountingRows:
    | readonly SdlcExecutiveEdgeAccountingRow[]
    | undefined = SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING
): SdlcExecutiveEdgeAccountingRow | null {
  return accountingRows.find((accountingRow) => accountingRow.edgeName === edgeName) ?? null;
}

export function deriveSdlcExecutiveEdgeAccountingAudit(input?: {
  readonly selectedEdgeNames?: readonly string[] | undefined;
  readonly observedDispatchedEdgeNames?: readonly string[] | undefined;
  readonly accountingRows?:
    | readonly SdlcExecutiveEdgeAccountingRow[]
    | undefined;
}): SdlcExecutiveEdgeAccountingAudit {
  const selectedEdgeNames = uniqueSorted(
    input?.selectedEdgeNames ?? OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
  );
  const accountingRows =
    input?.accountingRows ?? SDLC_T172_FULL_TRAVERSAL_EDGE_ACCOUNTING;
  const accountedEdgeNames = uniqueSorted(
    accountingRows.map((accountingRow) => accountingRow.edgeName)
  );
  const selectedSet = new Set(selectedEdgeNames);
  const accountedSet = new Set(accountedEdgeNames);
  const missingEdgeNames = uniqueSorted(
    selectedEdgeNames.filter((edgeName) => !accountedSet.has(edgeName))
  );
  const extraEdgeNames = uniqueSorted(
    accountedEdgeNames.filter((edgeName) => !selectedSet.has(edgeName))
  );
  const projectionNoCloseEdgeNames = edgeNamesByDisposition(
    accountingRows,
    "projection_no_close"
  );
  const conditionalEdgeNames = edgeNamesByDisposition(accountingRows, "conditional");
  const mergeRequiredEdgeNames = edgeNamesByDisposition(
    accountingRows,
    "merge_required"
  );
  const replaceRequiredEdgeNames = edgeNamesByDisposition(
    accountingRows,
    "replace_required"
  );
  const deleteRequiredEdgeNames = edgeNamesByDisposition(
    accountingRows,
    "delete_required"
  );
  const workerDispatchViolationEdgeNames = uniqueSorted(
    accountingRows
      .filter(
        (accountingRow) =>
          NON_CONSTRUCTION_DISPOSITIONS.includes(accountingRow.disposition) &&
          accountingRow.workerDispatchAllowed
      )
      .map((accountingRow) => accountingRow.edgeName)
  );
  const observedWorkerDispatchViolationEdgeNames = uniqueSorted(
    uniqueSorted(input?.observedDispatchedEdgeNames ?? []).filter((edgeName) => {
      const accountingRow = sdlcExecutiveEdgeAccountingRowFor(
        edgeName,
        accountingRows
      );
      return accountingRow !== null && !accountingRow.workerDispatchAllowed;
    })
  );
  const closeCapableWithoutEvidenceEdgeNames = uniqueSorted(
    accountingRows
      .filter(
        (accountingRow) =>
          CLOSE_CAPABLE_DISPOSITIONS.includes(accountingRow.disposition) &&
          (accountingRow.ownedPressureRefs.length === 0 ||
            accountingRow.authorityOutputRefs.length === 0 ||
            accountingRow.closureEvidenceRefs.length === 0)
      )
      .map((accountingRow) => accountingRow.edgeName)
  );
  const blockingReasons = uniqueSorted([
    ...missingEdgeNames.map((edgeName) => `missing_edge_accounting:${edgeName}`),
    ...extraEdgeNames.map((edgeName) => `extra_edge_accounting:${edgeName}`),
    ...workerDispatchViolationEdgeNames.map(
      (edgeName) => `projection_or_delete_dispatches_worker:${edgeName}`
    ),
    ...observedWorkerDispatchViolationEdgeNames.map(
      (edgeName) => `observed_worker_dispatch_disallowed:${edgeName}`
    ),
    ...closeCapableWithoutEvidenceEdgeNames.map(
      (edgeName) => `close_capable_edge_without_evidence:${edgeName}`
    )
  ]);
  return Object.freeze({
    kind: "sdlc_executive_edge_accounting_audit" as const,
    selectedEdgeNames,
    accountedEdgeNames,
    missingEdgeNames,
    extraEdgeNames,
    projectionNoCloseEdgeNames,
    conditionalEdgeNames,
    mergeRequiredEdgeNames,
    replaceRequiredEdgeNames,
    deleteRequiredEdgeNames,
    workerDispatchViolationEdgeNames,
    observedWorkerDispatchViolationEdgeNames,
    closeCapableWithoutEvidenceEdgeNames,
    blockingReasons,
    admissionDecision: blockingReasons.length === 0 ? "admit" : "reject"
  });
}

function edgeNamesByDisposition(
  accountingRows: readonly SdlcExecutiveEdgeAccountingRow[],
  disposition: SdlcExecutiveEdgeAccountingDisposition
): readonly string[] {
  return uniqueSorted(
    accountingRows
      .filter((accountingRow) => accountingRow.disposition === disposition)
      .map((accountingRow) => accountingRow.edgeName)
  );
}
