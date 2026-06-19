// Implements: REQ-F-ODDSDLC-010
// Implements: REQ-F-ODDSDLC-011
// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015
// Investigates: T-168

import type { SdlcGraphFunctionCatalog } from "../graph/index.js";
import { uniquePresentSorted as uniqueSorted } from "../shared/collections.js";
import type {
  SdlcCoAffirmationLedger,
  SdlcExpectedResultBinding,
  SdlcTestCaseKind,
  SdlcTestCaseRow,
  SdlcTestDataBinding,
  SdlcTestExecutionEvidenceAdmission,
  SdlcTestResultVerificationRow
} from "./carriers.js";

export interface SdlcTestPipelineGraphNodeCorrelation {
  readonly kind: "sdlc_test_pipeline_graph_node_correlation";
  readonly phase: string;
  readonly nodeName: string;
  readonly producerGraphFunctionName: string;
}

export const SDLC_TEST_PIPELINE_GRAPH_NODE_CORRELATIONS = Object.freeze([
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "requirements authority",
    nodeName: "requirement_surface",
    producerGraphFunctionName: "derive_requirement_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "UAT testcase pressure",
    nodeName: "uat_testcases_surface",
    producerGraphFunctionName: "derive_uat_testcases_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "testcase authority",
    nodeName: "testcase_authority_surface",
    producerGraphFunctionName: "derive_testcase_authority_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "design authority",
    nodeName: "design_surface",
    producerGraphFunctionName: "derive_design_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "scenario authority",
    nodeName: "scenario_surface",
    producerGraphFunctionName: "derive_scenario_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "implementation design authority",
    nodeName: "implementation_design_surface",
    producerGraphFunctionName: "derive_implementation_design_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "composite test plan",
    nodeName: "test_design_surface",
    producerGraphFunctionName: "derive_test_design_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "component test source",
    nodeName: "component_test_surface",
    producerGraphFunctionName: "derive_component_test_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "declared framework command",
    nodeName: "test_execution_surface",
    producerGraphFunctionName: "prepare_test_execution_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "observed test result",
    nodeName: "test_execution_result_surface",
    producerGraphFunctionName: "derive_test_execution_result_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "verification rows",
    nodeName: "component_test_qualification_surface",
    producerGraphFunctionName: "qualify_component_test_execution_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "repair pressure",
    nodeName: "component_repair_schedule_surface",
    producerGraphFunctionName: "derive_component_repair_schedule_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "archived test proof",
    nodeName: "test_run_archive_surface",
    producerGraphFunctionName: "derive_test_run_archive_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "release co-qualification",
    nodeName: "release_depth_parity_surface",
    producerGraphFunctionName: "derive_release_depth_parity_surface"
  },
  {
    kind: "sdlc_test_pipeline_graph_node_correlation",
    phase: "release readiness",
    nodeName: "release_surface",
    producerGraphFunctionName: "prepare_release_surface"
  }
] as const satisfies readonly SdlcTestPipelineGraphNodeCorrelation[]);

function requireNonEmptyString(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return trimmed;
}

function requireRefs(values: readonly string[], label: string): readonly string[] {
  const refs = uniqueSorted(values.map((value) => value.trim()));
  if (refs.length === 0) {
    throw new TypeError(`${label} requires at least one ref`);
  }
  return refs;
}

function pressureRef(input: {
  readonly testCaseRef: string;
  readonly reason: string;
}): string {
  return [
    "pressure://odd-sdlc/test-pipeline",
    encodeURIComponent(input.testCaseRef),
    encodeURIComponent(input.reason)
  ].join("/");
}

function caseRangePressureRef(caseKind: SdlcTestCaseKind): string {
  return `pressure://odd-sdlc/test-pipeline/case-range/${caseKind}`;
}

function catalogEntryByName(input: {
  readonly catalog: SdlcGraphFunctionCatalog;
  readonly name: string;
}) {
  return input.catalog.functions.find((entry) => entry.name === input.name) ?? null;
}

export function assertSdlcTestPipelineGraphCorrelation(input: {
  readonly catalog: SdlcGraphFunctionCatalog;
  readonly correlations?: readonly SdlcTestPipelineGraphNodeCorrelation[];
}): void {
  const correlations =
    input.correlations ?? SDLC_TEST_PIPELINE_GRAPH_NODE_CORRELATIONS;
  for (const correlation of correlations) {
    const entry = catalogEntryByName({
      catalog: input.catalog,
      name: correlation.producerGraphFunctionName
    });
    if (entry === null) {
      throw new TypeError(
        `${correlation.phase}: missing producer graph function ${correlation.producerGraphFunctionName}`
      );
    }
    if (!entry.outputs.includes(correlation.nodeName)) {
      throw new TypeError(
        `${correlation.phase}: ${correlation.producerGraphFunctionName} must produce ${correlation.nodeName}`
      );
    }
  }
}

function validateTestCase(row: SdlcTestCaseRow): void {
  requireNonEmptyString(row.testCaseRef, "testCase.testCaseRef");
  requireRefs(row.sourceDesignObligationRefs, "testCase.sourceDesignObligationRefs");
  requireRefs(row.testcaseAuthorityRefs, "testCase.testcaseAuthorityRefs");
  requireNonEmptyString(row.expectedBehavior, "testCase.expectedBehavior");
}

function frameworkExecutionBypassed(
  evidence: SdlcTestExecutionEvidenceAdmission
): boolean {
  return (
    evidence.declaredFrameworkRef.startsWith("harness://") ||
    evidence.declaredCommand === "harness_assertion"
  );
}

export function constructSdlcTestPipelineCoAffirmationLedger(input: {
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly implementationEvidenceRefs: readonly string[];
  readonly testEvidenceRefs: readonly string[];
  readonly testCases: readonly SdlcTestCaseRow[];
  readonly testDataBindings: readonly SdlcTestDataBinding[];
  readonly expectedResultBindings: readonly SdlcExpectedResultBinding[];
  readonly executionEvidence: SdlcTestExecutionEvidenceAdmission;
  readonly verificationRows: readonly SdlcTestResultVerificationRow[];
  readonly requiredCaseKinds?: readonly SdlcTestCaseKind[];
}): SdlcCoAffirmationLedger {
  const ledgerRef = requireNonEmptyString(input.ledgerRef, "ledgerRef");
  const ledgerVersionRef = requireNonEmptyString(
    input.ledgerVersionRef,
    "ledgerVersionRef"
  );
  const implementationEvidenceRefs = requireRefs(
    input.implementationEvidenceRefs,
    "implementationEvidenceRefs"
  );
  const testEvidenceRefs = requireRefs(input.testEvidenceRefs, "testEvidenceRefs");
  if (input.testCases.length === 0) {
    throw new TypeError("co-affirmation requires at least one test case");
  }
  for (const row of input.testCases) {
    validateTestCase(row);
  }
  requireNonEmptyString(
    input.executionEvidence.admissionRef,
    "executionEvidence.admissionRef"
  );
  requireNonEmptyString(
    input.executionEvidence.testExecutionSurfaceRef,
    "executionEvidence.testExecutionSurfaceRef"
  );
  requireNonEmptyString(
    input.executionEvidence.declaredFrameworkRef,
    "executionEvidence.declaredFrameworkRef"
  );
  requireNonEmptyString(
    input.executionEvidence.declaredCommand,
    "executionEvidence.declaredCommand"
  );
  requireNonEmptyString(
    input.executionEvidence.observedResultRef,
    "executionEvidence.observedResultRef"
  );

  const dataByCase = new Map(
    input.testDataBindings.map((binding) => [binding.testCaseRef, binding])
  );
  const expectedByCase = new Map(
    input.expectedResultBindings.map((binding) => [binding.testCaseRef, binding])
  );
  const verificationByCase = new Map(
    input.verificationRows.map((row) => [row.testCaseRef, row])
  );
  const residualPressureRefs: string[] = [];
  for (const testCase of input.testCases) {
    const data = dataByCase.get(testCase.testCaseRef);
    const expected = expectedByCase.get(testCase.testCaseRef);
    const verification = verificationByCase.get(testCase.testCaseRef);
    if (data === undefined) {
      residualPressureRefs.push(
        pressureRef({ testCaseRef: testCase.testCaseRef, reason: "test-data-missing" })
      );
    } else {
      requireNonEmptyString(data.testDataRef, "testData.testDataRef");
      requireNonEmptyString(data.generationPolicyRef, "testData.generationPolicyRef");
      requireNonEmptyString(data.expectedResultRef, "testData.expectedResultRef");
      requireRefs(data.sourceDesignObligationRefs, "testData.sourceDesignObligationRefs");
      if (expected !== undefined && data.expectedResultRef !== expected.expectedResultRef) {
        residualPressureRefs.push(
          pressureRef({
            testCaseRef: testCase.testCaseRef,
            reason: "expected-result-ref-mismatch"
          })
        );
      }
    }
    if (expected === undefined) {
      residualPressureRefs.push(
        pressureRef({
          testCaseRef: testCase.testCaseRef,
          reason: "expected-result-missing"
        })
      );
    } else {
      requireNonEmptyString(
        expected.expectedResultRef,
        "expectedResult.expectedResultRef"
      );
      requireNonEmptyString(
        expected.expectedResultSummary,
        "expectedResult.expectedResultSummary"
      );
      requireNonEmptyString(
        expected.verificationPolicyRef,
        "expectedResult.verificationPolicyRef"
      );
      requireRefs(expected.assertionRefs, "expectedResult.assertionRefs");
    }
    if (verification === undefined) {
      residualPressureRefs.push(
        pressureRef({ testCaseRef: testCase.testCaseRef, reason: "verification-missing" })
      );
    } else {
      requireNonEmptyString(verification.verificationRef, "verification.verificationRef");
      requireNonEmptyString(
        verification.expectedResultRef,
        "verification.expectedResultRef"
      );
      requireNonEmptyString(
        verification.observedResultRef,
        "verification.observedResultRef"
      );
      requireRefs(verification.evidenceRefs, "verification.evidenceRefs");
      if (expected !== undefined && verification.expectedResultRef !== expected.expectedResultRef) {
        residualPressureRefs.push(
          pressureRef({
            testCaseRef: testCase.testCaseRef,
            reason: "verification-expected-result-mismatch"
          })
        );
      }
      if (
        verification.observedResultRef !== input.executionEvidence.observedResultRef
      ) {
        residualPressureRefs.push(
          pressureRef({
            testCaseRef: testCase.testCaseRef,
            reason: "verification-observed-result-mismatch"
          })
        );
      }
      if (verification.status !== "passed") {
        residualPressureRefs.push(
          pressureRef({
            testCaseRef: testCase.testCaseRef,
            reason: `verification-${verification.status}`
          })
        );
      }
    }
  }

  for (const caseKind of input.requiredCaseKinds ?? Object.freeze([])) {
    if (!input.testCases.some((testCase) => testCase.caseKind === caseKind)) {
      residualPressureRefs.push(caseRangePressureRef(caseKind));
    }
  }

  if (input.executionEvidence.status !== "succeeded") {
    residualPressureRefs.push(
      `pressure://odd-sdlc/test-pipeline/execution-status/${input.executionEvidence.status}`
    );
  }
  if (input.executionEvidence.testsObserved <= 0) {
    residualPressureRefs.push("pressure://odd-sdlc/test-pipeline/zero-tests-observed");
  }
  if (input.executionEvidence.reportRefs.length === 0) {
    residualPressureRefs.push("pressure://odd-sdlc/test-pipeline/report-refs-missing");
  }
  if (frameworkExecutionBypassed(input.executionEvidence)) {
    residualPressureRefs.push("pressure://odd-sdlc/test-pipeline/framework-bypassed");
  }

  const verificationRefs = uniqueSorted(
    input.verificationRows.map((row) => row.verificationRef)
  );
  const testcaseRefs = uniqueSorted(input.testCases.map((row) => row.testCaseRef));
  const designObligationRefs = uniqueSorted(
    input.testCases.flatMap((row) => row.sourceDesignObligationRefs)
  );
  const executionEvidenceRefs = uniqueSorted([
    input.executionEvidence.admissionRef,
    input.executionEvidence.testExecutionSurfaceRef,
    input.executionEvidence.observedResultRef,
    ...input.executionEvidence.reportRefs,
    ...input.executionEvidence.evidenceRefs
  ]);
  const residuals = uniqueSorted(residualPressureRefs);
  return Object.freeze({
    kind: "sdlc_co_affirmation_ledger" as const,
    ledgerRef,
    ledgerVersionRef,
    designObligationRefs,
    implementationEvidenceRefs,
    testEvidenceRefs,
    executionEvidenceRefs,
    verificationRefs,
    testcaseRefs,
    status: residuals.length === 0 ? "coaffirmed" : "blocked",
    residualPressureRefs: residuals,
    predecessorRefs: uniqueSorted([
      ...designObligationRefs,
      ...implementationEvidenceRefs,
      ...testEvidenceRefs,
      ...executionEvidenceRefs,
      ...verificationRefs,
      ...testcaseRefs,
      ...residuals
    ])
  });
}
