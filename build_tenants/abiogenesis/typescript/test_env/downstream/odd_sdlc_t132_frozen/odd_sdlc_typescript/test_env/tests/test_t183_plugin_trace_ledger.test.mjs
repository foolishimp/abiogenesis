// Validates: T-183

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

test("T-183 records the finite ABG plugin trace ledger as the audit work queue", () => {
  const ticket = readRepoFile(
    ".ai-workspace/tickets/completed/T-183-delete-fd-semantic-registers-and-restore-bare-admission.md"
  );

  for (const row of [
    "P-001",
    "P-002",
    "P-003",
    "P-004",
    "P-005",
    "P-006",
    "P-007",
    "P-008",
    "P-009",
    "P-010"
  ]) {
    assert.match(ticket, new RegExp(`\\| ${row} \\|`, "u"), `${row} is traced`);
  }
  assert.match(ticket, /runEngineIterateAsync/u);
  assert.match(ticket, /plugin\.evaluate\.C\/F_P rule/u);
  assert.match(ticket, /SdlcEdgeFulfillmentLedger/u);
  assert.match(ticket, /EdgeClosureDecision/u);
});

test("T-183 installed SDLC supplies only the selected transform/evaluate/consequence plugin spine", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const pluginSetSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
  );
  assert.match(installedOperatorSource, /createSdlcAbgPluginSet\(/u);

  assert.match(pluginSetSource, /fpDispatch/u);
  assert.match(pluginSetSource, /fpEvaluator/u);
  assert.match(pluginSetSource, /consequenceProjection/u);
  assert.match(pluginSetSource, /evaluationRules/u);
  assert.match(pluginSetSource, /designDepthFpEvaluatorRule/u);
  assert.match(pluginSetSource, /reviewGradeEdgeFulfillmentRule/u);
  assert.match(pluginSetSource, /requiredEvaluationRuleRefs/u);
  assert.match(pluginSetSource, /DESIGN_DEPTH_FP_EVALUATOR_RULE_REF/u);
  assert.match(pluginSetSource, /REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF/u);
  assert.doesNotMatch(pluginSetSource, /fdEvaluator/u);
  assert.doesNotMatch(pluginSetSource, /fhAdmission/u);
  assert.doesNotMatch(pluginSetSource, /transformTasks/u);
  assert.doesNotMatch(pluginSetSource, /consequenceTasks/u);
});

test("T-183 generic generated assets cannot enter default F_D closure", () => {
  const source = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  assert.match(source, /if \(transition\.kind === "fd_advance"\)/u);
  assert.match(source, /transition\.edge !== FG_CONFORM_PROJECT/u);
  assert.match(source, /unsupported_fd_transition/u);
  assert.match(source, /reviewGradeResidualPressureRefsForState/u);
  assert.match(source, /fpEvaluationCloseDispositionForState/u);
  assert.match(source, /admitReviewGradeEdgeFulfillmentAssessmentFromArtifact/u);
  const deferralFunction = source.slice(
    source.indexOf("function shouldDeferDispatchConsequenceToFpEvaluator"),
    source.indexOf("function manifestRefSegment")
  );
  assert.match(deferralFunction, /reviewGradeEdgeFulfillmentAssessmentRequired/u);
  assert.match(deferralFunction, /state\.workerReport !== null/u);
});

test("T-183 lineage completeness is review-grade F_P pressure, not F_D postflight closure", () => {
  const postflightSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight.ts"
  );
  const postflightReturn = postflightSource.slice(
    postflightSource.indexOf("return Object.freeze({", postflightSource.indexOf("function evaluateSdlcComputeStage")),
    postflightSource.indexOf("function obligationAssessmentCounts")
  );
  assert.match(
    postflightSource,
    /function activeComputeStageBlockingReasonCarriers/u
  );
  assert.match(
    postflightSource,
    /input\.manifest\.targetAssetType !== "test_execution_result_surface"/u
  );
  assert.match(
    postflightSource,
    /reason\.code === "test_execution_evidence_missing"/u
  );
  assert.match(
    postflightReturn,
    /status:\s*activeBlockingReasonCarriers\.length > 0 \? "blocked" : "passed"/u
  );
  assert.match(
    postflightReturn,
    /blockingReasons:\s*Object\.freeze\(\s*activeBlockingReasonCarriers\.map/u
  );
  assert.doesNotMatch(postflightReturn, /status: blockingReasons\.length/u);

  const postflightChecksSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight_checks.ts"
  );
  const materializationCheck = postflightChecksSource.slice(
    postflightChecksSource.indexOf("function evaluateMaterializedProductFiles"),
    postflightChecksSource.indexOf("function evaluateExecutionEvidence")
  );
  assert.match(
    materializationCheck,
    /requirementLineageRequiredForFile && unrelatedRequirementLineage\.length > 0/u
  );
  assert.doesNotMatch(
    materializationCheck,
    /requirementTraceObligationIds\.length === 0\s*\?\s*\["requirementTraceObligationIds"\]/u
  );

  const promptSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );
  assert.match(
    promptSource,
    /Requirement lineage is transformer-owned semantic evidence/u
  );
  assert.match(
    promptSource,
    /Mark trace_missing when a generated product file is used as fulfillment evidence/u
  );
});

test("T-183 post-transform diagnostics are bound through one functional interface", () => {
  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const flowStart = installedOperatorSource.indexOf(
    "async function runSdlcPostTransformDiagnosticFlow"
  );
  assert.notEqual(flowStart, -1, "central diagnostic flow is declared");
  const flowEnd = installedOperatorSource.indexOf(
    "async function refreshDesignDepthStateFromFpEvaluatorRegister",
    flowStart
  );
  const diagnosticFlow = installedOperatorSource.slice(flowStart, flowEnd);
  assert.match(diagnosticFlow, /writeProductMaterializationManifest\(/u);
  assert.match(diagnosticFlow, /evaluateSdlcComputeStage\(/u);
  assert.match(diagnosticFlow, /writeSdlcFpEvaluateResult\(/u);
  assert.match(diagnosticFlow, /writeTraversalSelectionAudit\(/u);
  assert.match(diagnosticFlow, /deriveSdlcOperatorAssuranceGate\(/u);
  assert.doesNotMatch(diagnosticFlow, /assurance_ledgers\.json/u);

  assert.equal(
    (installedOperatorSource.match(/evaluateSdlcComputeStage\(/gu) ?? []).length,
    1,
    "installed operator has one deterministic diagnostic evaluation call site"
  );
  assert.equal(
    (installedOperatorSource.match(/writeSdlcFpEvaluateResult\(/gu) ?? []).length,
    2,
    "installed operator has only the diagnostic writer and the design-depth blocked-evaluator rewrite"
  );
  assert.equal(
    (installedOperatorSource.match(/deriveSdlcOperatorAssuranceGate\(/gu) ?? []).length,
    1,
    "installed operator has one assurance satisfaction projection call site"
  );

  const refreshFlow = installedOperatorSource.slice(
    installedOperatorSource.indexOf("async function refreshDesignDepthStateFromFpEvaluatorRegister"),
    installedOperatorSource.indexOf("function shouldDeferDispatchConsequenceToFpEvaluator")
  );
  assert.match(refreshFlow, /runSdlcPostTransformDiagnosticFlow\(/u);
  const blockedDesignDepthRewrite = installedOperatorSource.slice(
    installedOperatorSource.indexOf("function stateWithBlockedDesignDepthFpEvaluatorOutcome"),
    installedOperatorSource.indexOf("function workerReportWithReviewGradeAssessment")
  );
  assert.match(blockedDesignDepthRewrite, /writeSdlcFpEvaluateResult\(/u);
  assert.match(
    blockedDesignDepthRewrite,
    /design_depth_fp_evaluator_postflight\.json/u
  );
  const dispatchFlow = installedOperatorSource.slice(
    installedOperatorSource.indexOf("const completeReportDispatch = async"),
    installedOperatorSource.indexOf("const edgeAccountingRow =")
  );
  assert.match(dispatchFlow, /runSdlcPostTransformDiagnosticFlow\(/u);
  assert.doesNotMatch(installedOperatorSource, /postflight_failed/u);
});

test("T-183 F_D assurance ledgers are purged from traversal authority", () => {
  const assuranceGateSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/assurance_gate.ts"
  );
  assert.match(
    assuranceGateSource,
    /requiredDimensions: Object\.freeze\(\[\]\)/u,
    "deterministic diagnostic fold has no required traversal dimensions"
  );
  assert.doesNotMatch(
    assuranceGateSource,
    /foldSdlcAssuranceLedgers|diagnosticOnlyAssuranceLedger|derive[A-Za-z]+AssuranceLedger/u,
    "F_D assurance ledgers must not be constructed or folded in the operator gate"
  );
  assert.doesNotMatch(
    assuranceGateSource,
    /sdlc_assurance_ledger/u,
    "operator gate must not author assurance ledger carriers"
  );

  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  assert.doesNotMatch(installedOperatorSource, /assurance_ledgers\.json/u);
  assert.match(installedOperatorSource, /reviewGradeResidualPressureRefsForState/u);
  assert.match(installedOperatorSource, /fpEvaluationCloseDispositionForState/u);
  assert.match(installedOperatorSource, /deriveSdlcEdgeClosureDecision/u);
});

test("T-183 system artifacts use the ABG/system artifact writer surface", () => {
  const ticket = readRepoFile(
    ".ai-workspace/tickets/completed/T-183-delete-fd-semantic-registers-and-restore-bare-admission.md"
  );
  assert.match(ticket, /\| R-129 \| System artifact write authority \|/u);

  const systemArtifactSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/system_artifacts.ts"
  );
  assert.match(systemArtifactSource, /export function writeSdlcSystemArtifact/u);
  assert.match(systemArtifactSource, /constructSdlcOperatorRunArtifactArchiveWritePlan/u);
  assert.match(systemArtifactSource, /authoritative operator archive payload has no catalog row/u);

  const transformLaunchSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts"
  );
  assert.match(transformLaunchSource, /writeSdlcSystemArtifact\(\{/u);
  assert.doesNotMatch(transformLaunchSource, /writeOperatorArchiveFile/u);

  for (const relativePath of [
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight.ts",
    "build_tenants/typescript/code/src/operator/plugins/evaluate/content_register.ts",
    "build_tenants/typescript/code/src/operator/design_depth_register.ts"
  ]) {
    const source = readRepoFile(relativePath);
    assert.match(source, /writeSdlcSystemArtifact/u, relativePath);
    assert.doesNotMatch(source, /writeFileSync/u, relativePath);
  }

  const installedOperatorSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const designDepthEvaluator = installedOperatorSource.slice(
    installedOperatorSource.indexOf("async function materializeDesignDepthRegisterWithFpEvaluator"),
    installedOperatorSource.indexOf("async function materializeReviewGradeEdgeFulfillmentWithFpEvaluator")
  );
  assert.match(designDepthEvaluator, /writeSdlcSystemArtifact\(\{/u);
  assert.doesNotMatch(designDepthEvaluator, /writeFileSync/u);
  const reviewGradeEvaluator = installedOperatorSource.slice(
    installedOperatorSource.indexOf("async function materializeReviewGradeEdgeFulfillmentWithFpEvaluator"),
    installedOperatorSource.indexOf("function constructSdlcAbgOwnedFpEvaluationOutcome")
  );
  assert.match(reviewGradeEvaluator, /writeSdlcSystemArtifact\(\{/u);
  assert.doesNotMatch(reviewGradeEvaluator, /writeFileSync/u);
});
