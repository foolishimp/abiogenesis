import path, {
  isAbsolute,
  join,
  relative,
  resolve
} from "node:path";
import type {
  SdlcMaterializedProductFileRole,
  SdlcPostflightGapDossier,
  SdlcPostflightGapReason,
  SdlcProductMaterializationContract,
  SdlcProductMaterializationAuthorityReconciliation,
  SdlcWorkerHandoffManifest
} from "../../carriers.js";
import {
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
} from "../../../graph/index.js";
import {
  SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE,
  SDLC_COMPONENT_CONCERN_ROLES,
  SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES,
  SDLC_COMPONENT_REPAIR_TARGETS,
  SDLC_TEST_CASE_KINDS,
  SDLC_TEST_EXECUTION_LANES
} from "../../carriers.js";
import {
  fileURLToPath
} from "node:url";
import {
  makeSdlcBlockingReason
} from "../../../shared/blocking_reason.js";
import {
  pathIsInside
} from "../../../shared/path.js";
import {
  reconcileSdlcProductMaterializationAuthority
} from "../../product_materialization/authority.js";
import {
  sdlcEdgeOutputPolicyForTargetAssetType,
  sdlcInstalledOperatorProjectsOutput
} from "../../edge_output_policy.js";
import {
  uniqueSorted
} from "../../../shared/collections.js";
import {
  MATERIALIZED_PRODUCT_FILE_ROLES,
  workspaceLocalSdlcSurfaceRelativePath
} from "../../product_materialization/surface_paths.js";

function tenantRelativeOutputArtifactPath(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  const tenantRoot = resolve(manifest.productMaterialization.tenantRoot);
  const outputFile = resolve(manifest.outputFile);
  if (!pathIsInside(outputFile, tenantRoot)) {
    return null;
  }
  return relative(tenantRoot, outputFile).split(path.sep).join("/");
}

function targetAdmitsTestExecutionEvidence(targetAssetType: string): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType)
    .admitsTestExecutionEvidence;
}

function edgeOutputPolicyProjectsOutput(targetAssetType: string): boolean {
  return sdlcInstalledOperatorProjectsOutput(targetAssetType);
}

function workerAuthoredTargetCarrierProtocolRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(manifest.targetAssetType)
    .workerAuthoredTargetCarrierProtocolRequired;
}

function declaredExecutionContract(input: string): boolean {
  const contract = input.trim().toLowerCase();
  return (
    contract.length > 0 &&
    contract !== "undeclared" &&
    contract !== "none" &&
    contract !== "n/a" &&
    contract !== "not_applicable"
  );
}

function productMaterializationRequiresTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return productMaterializationHasExecutionRepairScope({
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    productMaterialization: manifest.productMaterialization
  });
}

function productMaterializationHasExecutionRepairScope(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly productMaterialization: SdlcProductMaterializationContract;
}): boolean {
  if (
    input.targetAssetType === "test_execution_result_surface" &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  ) {
    return true;
  }
  return (
    input.edgeName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
    input.targetAssetType === "component_code_surface" &&
    input.productMaterialization.required &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  );
}

function manifestAdmitsTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return targetAdmitsTestExecutionEvidence(manifest.targetAssetType);
}

function tenantStackSpecRoot(manifest: SdlcWorkerHandoffManifest): string {
  return join(
    manifest.workspaceRoot,
    manifest.productMaterialization.selectedOutputRoot,
    "spec"
  );
}

function tenantStackAuthorityCanonicalSpecFile(
  manifest: SdlcWorkerHandoffManifest
): string {
  return join(tenantStackSpecRoot(manifest), "TECH_STACK.json");
}

function materializationAuthorityNeedsTenantStackRepair(
  authority: Pick<SdlcProductMaterializationAuthorityReconciliation, "reasonRefs">
): boolean {
  return (
    authority.reasonRefs.includes("tenant_stack_authority_missing") ||
    authority.reasonRefs.includes("tenant_stack_authority_invalid")
  );
}

function effectiveProductMaterializationRequiredRoles(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcMaterializedProductFileRole[] {
  const roles = new Set<SdlcMaterializedProductFileRole>(
    manifest.productMaterialization.requiredRoles
  );
  for (const target of reconcileSdlcProductMaterializationAuthority(manifest)
    .declaredProductTargetContracts) {
    roles.add(target.requiredRole);
  }
  return Object.freeze(
    MATERIALIZED_PRODUCT_FILE_ROLES.filter((role) => roles.has(role))
  );
}

function featureScopeNarrowsMaterialization(
  manifest: Pick<
    SdlcWorkerHandoffManifest,
    "featureScope" | "productMaterialization"
  >
): boolean {
  return (
    manifest.productMaterialization.required &&
    (manifest.featureScope.mode === "steel_thread" ||
      manifest.featureScope.mode === "targeted_repair") &&
    manifest.featureScope.includedModuleNames.length > 0
  );
}

function decodedScopeRef(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function listForPrompt(values: readonly string[]): string {
  return values.length === 0 ? "(none declared)" : values.join(", ");
}

const RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT = 240;

function retryGapReasonDiagnosticText(reason: SdlcPostflightGapReason): string {
  return reason.blockingReason.detail ?? reason.reason;
}

function isCurrentEdgeDownstreamTestPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  const text = decodedScopeRef(input.text).toLowerCase();
  if (input.manifest.targetAssetType === "component_code_surface") {
    return (
      text.includes("test_overlap_missing") &&
      (text.includes("component_test_surface") ||
        text.includes("test-execution") ||
        text.includes("test execution") ||
        text.includes("generated test"))
    );
  }
  if (input.manifest.targetAssetType === "component_test_surface") {
    return (
      text.includes("execution_environment") &&
      (text.includes("execution evidence") ||
        text.includes("execution_result_surface") ||
        text.includes("runtime_execution_surface") ||
        text.includes("test-execution") ||
        text.includes("test execution"))
    );
  }
  return false;
}

function isComponentCodeDownstreamTestPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_code_surface" &&
    isCurrentEdgeDownstreamTestPressure(input)
  );
}

function isComponentCodeDownstreamTestGapReason(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly reason: SdlcPostflightGapReason;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_code_surface" &&
    isComponentCodeDownstreamTestPressure({
      manifest: input.manifest,
      text: [
        input.reason.reason,
        input.reason.blockingReason.message,
        input.reason.blockingReason.detail ?? ""
      ].join(" ")
    })
  );
}

function isComponentTestDownstreamExecutionPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_test_surface" &&
    isCurrentEdgeDownstreamTestPressure(input)
  );
}

function isComponentTestDownstreamExecutionGapReason(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly reason: SdlcPostflightGapReason;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_test_surface" &&
    isComponentTestDownstreamExecutionPressure({
      manifest: input.manifest,
      text: [
        input.reason.reason,
        input.reason.blockingReason.message,
        input.reason.blockingReason.detail ?? ""
      ].join(" ")
    })
  );
}

function shouldConsolidateRetryGapReason(reason: SdlcPostflightGapReason): boolean {
  return (
    reason.reasonClass === "assurance" &&
    reason.blockingReason.code === "edge_closure_residual_pressure" &&
    reason.blockingReason.lawfulReentryPoint === "same_edge_retry"
  );
}

function consolidatedResidualPressureReason(
  dossier: SdlcPostflightGapDossier,
  reasons: readonly SdlcPostflightGapReason[]
): SdlcPostflightGapReason {
  const samples = uniqueSorted(reasons.map(retryGapReasonDiagnosticText)).slice(
    0,
    RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT
  );
  const omittedCount = Math.max(0, reasons.length - samples.length);
  const detail = [
    `requiredResidualPressureRefCount=${reasons.length}`,
    ...(samples.length === 0
      ? []
      : [`sampleRequiredPressureRefs=${samples.join(" | ")}`]),
    ...(omittedCount === 0
      ? []
      : [`omittedRequiredPressureRefCount=${omittedCount}`])
  ].join("; ");
  const evidenceRefs = uniqueSorted([
    dossier.currentGapDossierRef,
    ...reasons
      .flatMap((reason) => reason.blockingReason.evidenceRefs)
      .slice(0, RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT)
  ]);
  return Object.freeze({
    kind: "sdlc_postflight_gap_reason" as const,
    reason: `edge_closure_residual_pressure:${dossier.currentGapDossierRef}`,
    reasonClass: "assurance" as const,
    blockingReason: makeSdlcBlockingReason({
      code: "edge_closure_residual_pressure",
      reasonClass: "assurance",
      lawfulReentryPoint: "same_edge_retry",
      message: "Edge closure residual pressure requires same-edge repair.",
      detail,
      evidenceRefs
    })
  });
}

function retryPromptGapReasonsForDossier(
  manifest: SdlcWorkerHandoffManifest,
  dossier: SdlcPostflightGapDossier
): readonly SdlcPostflightGapReason[] {
  if (dossier.retryEligible !== true) {
    return Object.freeze([]);
  }
  const residualPressureReasons: SdlcPostflightGapReason[] = [];
  const passthroughReasons: SdlcPostflightGapReason[] = [];
  for (const reason of dossier.reasons) {
    if (
      isComponentCodeDownstreamTestGapReason({
        manifest,
        reason
      }) ||
      isComponentTestDownstreamExecutionGapReason({
        manifest,
        reason
      })
    ) {
      continue;
    }
    if (shouldConsolidateRetryGapReason(reason)) {
      residualPressureReasons.push(reason);
    } else {
      passthroughReasons.push(reason);
    }
  }
  if (residualPressureReasons.length <= 1) {
    return Object.freeze([
      ...residualPressureReasons,
      ...passthroughReasons
    ]);
  }
  return Object.freeze([
    consolidatedResidualPressureReason(dossier, residualPressureReasons),
    ...passthroughReasons
  ]);
}

function compactComponentDepthDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  const projection = manifest.targetCarrierProjection;
  const envelopeDirective =
    `Emit a raw JSON component_depth_register selected target-carrier envelope with ` +
    `\`kind:"${projection.outputCarrierKind}"\`, ` +
    `\`targetAssetType:"${manifest.targetAssetType}"\`, ` +
    `\`edgeRef:"${manifest.edgeName}"\`, ` +
    `\`contractRef:"${projection.targetCarrierContractRef}"\`, ` +
    `\`contractDigest:"${projection.targetCarrierContractDigest}"\`, and ` +
    `\`payload.kind:"sdlc_component_depth_register"\`, ` +
    `\`payload.registerVersion:"ts-component-depth-v1"\`, ` +
    `\`payload.targetAssetType:"${manifest.targetAssetType}"\`. ` +
    "For Markdown output artifacts, place the raw JSON object under the target-carrier heading; the artifact may include bounded prose outside that raw JSON object. " +
    "The payload field set is closed: use only kind, registerVersion, targetAssetType, componentTopologyRows, componentRealizationRows, testComponentTopologyRows, componentTestRows, componentTestQualificationRows, componentExecutionFailureRegister, componentRepairSchedule, and releaseDepthParity. " +
    "Do not wrap the component_depth_register carrier in Markdown fences. " +
    "Do not place materializedFiles, summaries, execution evidence, worker reports, product-file observations, or tenant-stack authority inside payload; cite evidence only on the selected carrier envelope or in prose.";
  const componentTopologyRowsDirective =
    "When emitting payload.componentTopologyRows, each row must carry kind=sdlc_component_topology_row, componentId, moduleName, relativePath, publicBoundary, concernRole, requirementIds, and sourceAssetRefs; " +
    `componentTopologyRows[].concernRole values are exactly ${SDLC_COMPONENT_CONCERN_ROLES.join(", ")}; ` +
    'use "other" for simple executable entrypoints or glue unless admitted source authority maps the component to a narrower role; ' +
    "sourceAssetRefs must name the design or source authority used for that topology row.";
  const componentRealizationRowsDirective =
    "Emit payload.componentRealizationRows with kind=sdlc_component_realization_row, componentId, moduleName, relativePath, publicBoundary, requirementIds, and sourceAssetRefs; order rows by dependency reason and keep progress component-addressable. For unused component-depth arrays emit [] and for unused nullable component-depth objects emit null.";
  switch (manifest.targetAssetType) {
    case "component_code_surface":
      if (manifest.graphFunctionName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET) {
        return "No component-depth schema is required for declared-product materialization; close over observed product files, requirement trace evidence, and traversal consequence.";
      }
      return [
        envelopeDirective,
        componentTopologyRowsDirective,
        componentRealizationRowsDirective,
        "For component_code_surface, payload.componentRealizationRows must contain only source/implementation rows whose product file role is source. Role=test targets, test/ paths, proof-test targets, and execution evidence belong to component_test_surface or later test-execution edges, not to this carrier.",
        "For component_code_surface, represent test-stage fields as payload.testComponentTopologyRows=[], payload.componentTestRows=[], payload.componentTestQualificationRows=[], payload.componentExecutionFailureRegister=null, payload.componentRepairSchedule=null, and payload.releaseDepthParity=null.",
        "Do not emit payload.componentRepairSchedule on component_code_surface. If Current evaluated gaps mention componentRepairSchedule on this target, remove the stale optional schedule from the component-code carrier; repair scheduling belongs only to component_repair_schedule_surface and release_depth_parity_surface.",
        "Materialize source only against the admitted implementation decomposition summary and module dependency map named by targetCarrierProjection.requiredStagedAuthorityRefs.",
        "Preserve source component boundaries from the composite implementation design authority.",
        "On re-entry with Current evaluated gaps, make the listed blocker the first materialization target: inspect the cited product file and its nearest dependency authority, perform the minimal source repair, then update the component_depth_register evidence for that repaired row.",
        "Bounded repair order: before the first edit, read at most worker_construction_brief plus the cited gap evidence file, the target source file, and one directly imported dependency file when needed."
      ].join("\n");
    case "component_realization_qualification_surface":
      return "Qualification edge worker role: read admitted component realization evidence and return bounded observations. The installed operator publishes the component_realization_qualification_surface carrier.";
    case "component_test_surface":
      return [
        envelopeDirective,
        "Emit payload.componentTestRows with row kind `sdlc_component_test_realization_row` and fields testClassId, relativePath, testcaseIds, componentIds, requirementIds, and shardId.",
        "componentTestRows[].requirementIds is the carrier field and must be a string array; product-file materialization records may use requirementTraceObligationIds, but componentTestRows must not.",
        "Every admitted requirement obligation in workerInvocationPackage.traversalObligationContext.obligations must be traceable from at least one generated test file comment, one payload.componentTestRows[].requirementIds entry, or one worker_result_report/materialization-manifest evidence row; do not rely on test success or file existence as lineage.",
        "For component_test_surface, do not copy source componentTopologyRows or componentRealizationRows from component_code_surface; bind tests to source ownership only through componentTestRows[].componentIds.",
        "If tenant stack authority declares Node ESM/moduleSystem=esm and the test target extension is .js, .mjs, or .jsx, emit ESM imports and never require(...), module.exports, or exports.* unless CommonJS is explicitly declared.",
        "Represent unused component-depth fields as payload.componentTopologyRows=[], payload.componentRealizationRows=[], payload.testComponentTopologyRows=[], payload.componentTestQualificationRows=[], payload.componentExecutionFailureRegister=null, payload.componentRepairSchedule=null, and payload.releaseDepthParity=null.",
        "Materialize tests only against the admitted testcase authority, test stack profile, test decomposition summary, and test dependency map named by targetCarrierProjection.requiredStagedAuthorityRefs.",
        "Preserve testClassId/testcase allocation from the composite test design authority.",
        "On re-entry, existing testcaseIds, requirementIds, source-overlap rows, and test files are monotonic: do not remove or narrow them unless Current evaluated gaps specifically cite that row as wrong_stage, trace_missing, schema_invalid, boundary_collapsed, semantic_not_realized, or test_overlap_missing.",
        "On schema-local re-entry, repair the rejected component_depth_register fields first, then update only the affected test-file tags or register rows named by Current evaluated gaps."
      ].join("\n");
    case "uat_test_source_surface":
      return [
        envelopeDirective,
        "Emit payload.componentTestRows with row kind `sdlc_component_test_realization_row` for requirement-specific UAT executable tests only.",
        "Every payload.componentTestRows[] UAT row must include non-empty string fields testClassId, relativePath, and shardId plus non-empty testcaseIds, componentIds, and requirementIds arrays; do not omit shardId or emit it as null.",
        "For protocol testcase refs, every payload.componentTestRows[].testcaseIds entry must be from the UAT lane, for example `tc://<scope>/uat/<case>`; do not include positive, unit, component, or helper testcase refs in this UAT carrier.",
        "UAT test source is requirement/testcase specific: bind every row to testcaseIds and requirementIds, and do not require implementation module-specific source shape as the generation basis.",
        "Use the admitted test stack profile, testcase authority, UAT testcase rows, and expected-result bindings to create framework-discoverable role=test files.",
        "If tenant stack authority declares Node ESM/moduleSystem=esm and the UAT test target extension is .js, .mjs, or .jsx, emit ESM imports and never require(...), module.exports, or exports.* unless CommonJS is explicitly declared.",
        "Do not copy component source topology rows into this carrier. Component/module consistency is checked later by qualification fan-in.",
        "Represent unused component-depth fields as payload.componentTopologyRows=[], payload.componentRealizationRows=[], payload.testComponentTopologyRows=[], payload.componentTestQualificationRows=[], payload.componentExecutionFailureRegister=null, payload.componentRepairSchedule=null, and payload.releaseDepthParity=null."
      ].join("\n");
    case "component_test_qualification_surface":
      return "Qualification edge worker role: read admitted component-test and test-execution evidence and return bounded observations. The installed operator publishes the component_test_qualification_surface carrier.";
    case "component_repair_schedule_surface":
      return [
        envelopeDirective,
        "Emit payload.componentRepairSchedule with kind=sdlc_component_repair_schedule, registerVersion=ts-component-depth-v1, scheduleStatus, repairRows, and evidenceRefs.",
        `payload.componentRepairSchedule.scheduleStatus must be one of: ${SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES.join(", ")}.`,
        "Each repair row must carry kind=sdlc_component_repair_schedule_row, scheduleId, failureId, repairTarget, lawfulReentryPoint, attributionConfidence, testcaseIds, componentIds, requirementIds, sourceRefs, testRefs, and evidenceRefs.",
        `repairRows[].repairTarget must be one of: ${SDLC_COMPONENT_REPAIR_TARGETS.join(", ")}.`,
        `repairRows[].attributionConfidence must be one of: ${SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE.join(", ")}.`,
        "Use admitted component test qualification rows, component execution failure rows, test execution evidence, and component realization evidence to bind each repair row to the smallest owned component/test/source subsurface.",
        "For component_repair_schedule_surface, represent non-repair component-depth fields as payload.componentTopologyRows=[], payload.componentRealizationRows=[], payload.testComponentTopologyRows=[], payload.componentTestRows=[], payload.componentTestQualificationRows=[], payload.componentExecutionFailureRegister=null, and payload.releaseDepthParity=null.",
        "Do not copy topology, realization, test-topology, test-realization, or qualification rows from source authority surfaces into this repair-schedule payload; cite those surfaces only through schedule evidenceRefs or repair row refs.",
        "Set attributionConfidence=high only when the row binds concrete failed testcaseIds, componentIds, requirementIds, sourceRefs or testRefs, and execution evidence refs. If that evidence is absent or contradictory, use scheduleStatus=triage_gap with evidenceRefs that name the missing authority instead of emitting medium-confidence repair rows.",
        "On re-entry after component_repair_schedule_not_high_confidence or component_repair_schedule_triage_gap, treat the gap as the work queue: bind the row to concrete evidence and emit high-confidence repair rows when the evidence exists; otherwise preserve explicit residual pressure instead of pretending closure.",
        "Do not infer ecosystem-specific root cause as framework law. The schedule owns generic repair depth: failed executable obligation -> component/test/source ownership -> bounded repair target -> evidence refs."
      ].join("\n");
    case "release_depth_parity_surface":
      return "Release-depth edge worker role: read admitted realization, test, repair, archive, and execution evidence and return bounded observations. The installed operator publishes the release_depth_parity_surface carrier.";
    default:
      return null;
  }
}

function compactTestDesignDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  if (manifest.targetAssetType !== "test_design_surface") {
    return null;
  }
  const trivialProductDirective = manifestRequiresTrivialDegenerateProduct(manifest)
    ? "Trivial product profile is active: emit the degenerate test topology only. Produce one test module row, one test component topology row, one testcase authority row, one execution schedule row, and one shard for the declared test command. Do not fan out runtime, source, assertion, or execution-evidence facts into separate test-owned obligations."
    : null;
  return [
    `Materialize the target test-design ADR at ${workerFacingPath(manifest, manifest.outputFile)} with bounded editor operations. If the file already exists, update it with targeted Edit operations, not a whole-file Write replacement. Use the edit operation as the drafting surface; assistant-visible output is only compact progress.`,
    "Use worker_construction_brief.targetCarrierProjection construction refs and the row fields listed here as the authoritative test-design carrier shape; do not derive row field names from prose tables.",
    "Emit a fenced `json test_design_register` carrier with `kind:\"sdlc_test_design_register\"`, `registerVersion:\"ts-test-design-v1\"`, and `targetAssetType:\"test_design_surface\"`.",
    "The fenced `sdlc_test_design_register` top-level field set is closed to the register fields named here. Do not wrap the fenced register in a target-carrier envelope, and do not add target-carrier envelope fields such as edgeRef, contractRef, contractDigest, payload, summary, or evidenceRefs inside the fenced register.",
    "Use one composite test design carrier with designConsumptionRows, uatTestcaseRows, testcaseAuthorityRows, testStackProfileRows, testModuleRows, testComponentTopologyRows, testDataBindings, expectedResultBindings, uatIntegrationBindings, and testExecutionScheduleRows.",
    "testComponentTopologyRows[].relativePath names the planned generated test product file under the tenant-declared test root; it must not point at the source-under-test path.",
    "Bound the carrier for first-pass construction: do not duplicate every scenario row, every component row, or full source/design text. Preserve breadth by module and requirement family, carry sourceDesignObligationRefs/evidenceRefs to the complete upstream surfaces, and keep row counts small enough to fit in bounded write/edit payloads.",
    "Prefer one representative executable unit/integration case per module family plus UAT-to-integration bindings over a giant exhaustive register. Later graph edges and residual pressure may expand coverage; this edge must create the typed test-design authority without exhausting worker output.",
    "Use exact row kinds: `sdlc_design_consumption_contract`, `sdlc_test_case_row`, `sdlc_test_stack_profile_row`, `sdlc_test_module_row`, `sdlc_test_component_topology_row`, `sdlc_test_data_binding`, `sdlc_expected_result_binding`, `sdlc_uat_integration_binding`, and `sdlc_test_execution_schedule_row`.",
    `Use caseKind only for test-case class: ${SDLC_TEST_CASE_KINDS.join(", ")}. Use executionLane only for execution lane: ${SDLC_TEST_EXECUTION_LANES.join(", ")}. Do not use unit as caseKind; use positive, negative, boundary, integration, uat, or regression for caseKind and put unit only in executionLane.`,
    "Use exact row fields from the construction template: contractRef/sourceDesignObligationRefs/authorityBasisRefs/consumerGraphFunctionRefs for design consumption; testCaseRef/caseKind/executionLane/sourceDesignObligationRefs/testcaseAuthorityRefs/expectedBehavior for every sdlc_test_case_row in uatTestcaseRows and testcaseAuthorityRows; stackRef/frameworkRef/buildTool for test stack profiles; moduleName/moduleRef/testRoot for test modules; testClassId/relativePath/testcaseIds/componentIds/requirementIds/shardId for test topology; testDataRef/testCaseRef/inputFixtureRefs/generationPolicyRef/expectedResultRef/sourceDesignObligationRefs for test data; expectedResultRef/testCaseRef/assertionRefs/expectedResultSummary/verificationPolicyRef for expected results; and uatTestCaseRef/integrationTestCaseRef/executionLane for UAT integration. Do not use legacy aliases such as caseId, componentRef, requirementRefs, scnRef, bindingId, or testcaseIds in rows whose typed fields require testCaseRef or testCaseRefs.",
    "Every listed test-design scalar field is required as a non-empty string unless this prompt explicitly says otherwise. Do not emit null for generationPolicyRef, expectedResultRef, verificationPolicyRef, frameworkRef, buildTool, shardId, executionLane, or row refs; when there is no generated fixture, set generationPolicyRef to a literal policy ref such as `policy://odd-sdlc/test-data/no-generated-fixtures`.",
    "For testDataBindings and expectedResultBindings, testCaseRef is a single string. Do not put arrays in testCaseRef; split many test cases into multiple binding rows or choose one representative testCaseRef and carry broader coverage through testcaseAuthorityRefs/sourceDesignObligationRefs.",
    "testExecutionScheduleRows must bind scheduleRef, testCaseRefs, command, frameworkRef, and shardId to the declared test execution contract.",
    trivialProductDirective
  ].filter((directive): directive is string => directive !== null).join(" ");
}

function compactTestExecutionSurfaceDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  if (manifest.targetAssetType !== "test_execution_surface") {
    return null;
  }
  if (edgeOutputPolicyProjectsOutput(manifest.targetAssetType)) {
    return "Test-execution-surface carrier protocol is evaluator-owned; do not emit a selected target-carrier envelope. Read the declared test execution contract and current workspace state only for bounded observations before the installed operator publishes the preparation carrier.";
  }
  const projection = manifest.targetCarrierProjection;
  return [
    "Use worker_construction_brief.targetCarrierProjection construction refs and the row fields listed here as the authoritative test-execution preparation carrier shape; do not inspect framework source code to infer row fields.",
    `Emit a fenced \`json test_execution_surface_register\` selected target-carrier envelope with \`kind:"${projection.outputCarrierKind}"\`, \`targetAssetType:"${manifest.targetAssetType}"\`, \`edgeRef:"${manifest.edgeName}"\`, \`contractRef:"${projection.targetCarrierContractRef}"\`, \`contractDigest:"${projection.targetCarrierContractDigest}"\`, and \`payload.kind:"sdlc_test_execution_surface_register"\`, \`payload.registerVersion:"ts-test-execution-v1"\`, \`payload.targetAssetType:"test_execution_surface"\`.`,
    "Emit payload.testExecutionPreparationRows with row kind `sdlc_test_execution_preparation_row`.",
    "Each preparation row must carry scheduleRef, moduleName, testClassId, testcaseIds, command, workingDirectory, frameworkRef, shardId, sourceTestFileRefs, requirementIds, status, and evidenceRefs.",
    "Use status `prepared` only when the declared command, workspace-relative workingDirectory, and graph-generated test files are present; use `blocked` or `pending` with evidenceRefs when they are not.",
    "Do not run the test command in this edge; derive_test_execution_result_surface is the only graph edge that emits execution evidence."
  ].join(" ");
}

function compactWorkspaceSpecSurfaceDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  const workspacePath =
    workspaceLocalSdlcSurfaceRelativePath(manifest.targetAssetType);
  if (workspacePath === null) {
    return null;
  }
  if (
    manifest.targetAssetType !== "requirement_surface" &&
    manifest.targetAssetType !== "uat_testcases_surface" &&
    manifest.targetAssetType !== "testcase_authority_surface"
  ) {
    return "Use evaluator-supplied construction hints only as shape guidance; write the Markdown authority surface at the declared output path and omit protocol metadata.";
  }
  const trivialProductDirective =
    manifestRequiresTrivialDegenerateProduct(manifest) &&
    manifest.targetAssetType === "requirement_surface"
      ? "Trivial product profile is active: collapse implementation, runtime, test, and execution facts into the smallest lawful requirement set. A minimal product should normally emit one product requirement row plus target-surface protocol rows, not one requirement per execution detail."
      : null;
  return [
    `Write the graph-owned workspace specification surface at \`${workspacePath}\`; do not treat this as conformance output.`,
    "Use construction brief authority refs and construction hints to organize content rows and preserve stable row refs; do not render target-carrier protocol fields into the Markdown artifact.",
    "Current-workspace authority refs and the selected construction template are sufficient when this output is absent; derive the surface from those refs without mining prior generated examples.",
    "The construction template is GTL typed construction shape for F_P clarity; it is not an assurance gate and does not close product meaning.",
    "Materialize the target file as the working surface after reading the listed authority refs. If the file already exists, use targeted Edit operations instead of a whole-file Write replacement; if the file is absent, create a compact Markdown artifact. Keep assistant-visible narration to compact progress notes, keep the Markdown artifact under 250 lines, and prefer compact tables with stable refs over copied authority text.",
    manifest.targetAssetType === "requirement_surface"
      ? "For requirement_surface, derive requirement rows from imported authority and current intent/product/goal pressure."
      : manifest.targetAssetType === "uat_testcases_surface"
        ? "For uat_testcases_surface, derive user-acceptance testcase rows directly from requirement pressure before design construction."
        : "For testcase_authority_surface, bind testcase authority rows to requirements and UAT testcase refs so downstream design/test implementation consumes declared test pressure.",
    trivialProductDirective
  ].filter((directive): directive is string => directive !== null).join(" ");
}

function compactDesignDepthDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  switch (manifest.targetAssetType) {
    case "implementation_design_surface":
      const trivialProductDirective = manifestRequiresTrivialDegenerateProduct(manifest)
        ? "Trivial product profile is active: emit the degenerate implementation topology only. Produce one module row, one implementation component topology row, one source realization row, one source file target, tenant-declared build config targets when present, test file targets only when the product declares test artifacts, at most one entity, and at most one stateless state row. Map build-config, source, runtime, and proof-subject requirement refs to the single implementation component when they describe the same one-file product. Keep proof execution as downstream residual pressure. One source file remains one component row."
        : null;
      return [
        "Write the implementation design ADR as the candidate transform artifact; the ADR carries design decisions, module boundary, product file targets, and requirement lineage.",
        "Evaluator-owned outputs stay with the framework: design-depth register, selected target-carrier payload, evaluator verdict, decomposition summary, dependency map, and admission JSON.",
        "The evaluate.C/F_P design-depth evaluator populates the design-depth register from the ADR, source authority, product file targets, requirement lineage, and post-transform evidence after this worker exits; deterministic framework code admits and validates that register before closure.",
        "Use ordinary ADR sections and compact Markdown tables for module boundary, product file targets, and requirement lineage; these are design artifact content, not evaluator-owned carrier JSON.",
        "Implementation design ADR stack profile rows must expose tenant stack authority as scalar design facts when declared: language, runtime/module system, build tool, build config, dependency policy, test runner, and test command. Do not omit tenant-declared stack fields that the design-depth register admits.",
        "Write the ADR as bounded sections: header/status, context, decision, module boundary, product file targets, requirement lineage, and consequences.",
        "Hard output bound: keep the Markdown artifact under 450 lines, keep each write/edit payload under 180 lines, and use compact rows with source refs rather than copying upstream authority text.",
        "Keep the ADR proportional to immediate implementation structure: identify only the stack, module boundary, component/file targets, requirement lineage, and design decisions needed to materialize the declared product surface from current source assets.",
        "Use construction_brief.stagePressure.proportionalityProfile as the admitted proportionality budget: a degenerate profile means one module / one component / one function; do not exceed its maxModules/maxComponents without a hard requirement in admitted authority.",
        "A substantive implementation design must preserve decomposition proportionality: no component should own more than 8 requirement refs in the requirement-lineage table; split coarse facade/engine/validator decisions into narrower public-boundary components before materialization.",
        "Before code can close, implementation design must explicitly decompose requirement pressure to the asset granularity it demands. If requirements imply separable public, runtime, data-contract, or test boundaries, name those boundaries in component-level rows instead of hiding them inside one coarse module facade.",
        "Implementation component topology rows admitted by the evaluator use componentTopologyRows[].componentId/moduleName/relativePath/publicBoundary/concernRole with row kind=sdlc_component_topology_row; publicBoundary and concernRole are string fields.",
        "Use the Product File Targets section to name every declared product file and role. Source/implementation realization belongs to source file targets; proof-test targets belong to test design and component-test surfaces.",
        "Graph-generated tests are declared as product file targets with role=test, then realized by test_design_surface and component_test_surface. Component_code_surface realization rows own source and implementation files.",
        "Map requirement obligations, runtime execution proof, process archives, test assertions, downstream evidence, and audit lineage to the owning design decision or carry them as residual pressure. Promote them into implementation modules only when the source design declares them as product modules or product data.",
        "For a single-file or script product, one module boundary, one primary source/program responsibility, and one materialization/invocation decision are sufficient.",
        trivialProductDirective
      ].filter((directive): directive is string => directive !== null).join("\n");
    default:
      return null;
  }
}

function compactExecutionEvidenceDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  if (manifest.targetAssetType === "test_run_archive_surface") {
    return "Archive the admitted test_execution_result_surface truth; do not run test commands, do not emit fresh sdlc_worker_execution_evidence, and do not synthesize release evidence.";
  }
  if (!manifestAdmitsTestExecutionEvidence(manifest)) {
    return null;
  }
  if (manifest.targetAssetType === "test_execution_result_surface") {
    return [
      "Execution-result edge worker role: read the declared test execution contract and current workspace state for installed-operator execution.",
      "The installed operator runs the declared execution shards and publishes the sdlc_worker_execution_evidence carrier."
    ].join(" ");
  }
  return [
    "Emit sdlc_worker_execution_evidence JSON for the declared test execution contract; executable product materialization must run or explicitly fail/pending its test contract before closure.",
    "Use this exact closed carrier shape: {\"kind\":\"sdlc_worker_execution_evidence\",\"lane\":\"test\",\"command\":\"<declared test command>\",\"status\":\"succeeded|failed|pending\",\"reportRefs\":[\"file://...\"],\"testsObserved\":1,\"passedCount\":1,\"failedCount\":0,\"shardEvidence\":[{\"kind\":\"sdlc_worker_execution_shard_evidence\",\"shardId\":\"<stable shard id>\",\"moduleName\":\"<module>\",\"lane\":\"test\",\"command\":\"<shard command>\",\"status\":\"succeeded|failed|pending\",\"reportRefs\":[\"file://...\"],\"testsObserved\":1,\"passedCount\":1,\"failedCount\":0}]}.",
    "No other executionEvidence or shardEvidence fields are admitted; shardEvidence[].kind MUST be exactly \"sdlc_worker_execution_shard_evidence\".",
    "executionEvidence.status MUST be one of: succeeded, failed, pending. Do not use status values such as not_run.",
    "executionEvidence.lane MUST be exactly \"test\".",
    "executionEvidence.testsObserved, passedCount, and failedCount MUST be numbers or null.",
    "For non-failed executable test evidence, testsObserved MUST be greater than zero; add or run a real discoverable test for the declared test contract rather than reporting zero observed tests.",
    "For shardEvidence rows, use the declared test execution contract when present: copy shardId, moduleName, command, and workingDirectory rather than inventing shorthand shard refs.",
    manifest.targetAssetType === "test_execution_result_surface"
      ? "If compile, discovery, or test execution exits non-zero, diagnose and repair the product source/test/build files within allowed write roots, then rerun the declared shard/contract until it succeeds or a hard external blocker remains."
      : "If execution exits non-zero during compile, discovery, or test phases, record failed, not pending.",
    manifest.targetAssetType === "test_execution_result_surface"
      ? "Do not emit failed execution evidence merely for a repairable compile, discovery, or test failure. Emit failed only after bounded in-edge repair attempts have been exhausted, and include the repair attempts plus final failing logs as evidence."
      : null,
    "Capture stdout/stderr and report files under allowed write roots from worker_brief.allowedWriteRoots; never use /tmp or any outside-workspace path for test logs.",
    "allowedWriteRoots are workspace-root-relative unless already absolute; if a shard command changes cwd, resolve them to workspace-root absolute paths before redirecting stdout/stderr.",
    "Use pending only when execution did not run or external evidence is still unavailable. Pending evidence is a lawful non-closure carrier for triage or repricing; do not present a not-run document as release closure evidence."
  ].filter((directive): directive is string => directive !== null).join(" ");
}

function compactScheduleDirective(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  if (!manifest.targetAssetType.endsWith("_schedule_surface")) {
    return null;
  }
  return "Emit schedule truth with dependency graph, tranches, shard register where relevant, obligation ledger, gap ledger, and next tranche selector.";
}

function tenantStackAuthorityRepairDirectives(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly authority: SdlcProductMaterializationAuthorityReconciliation;
}): readonly string[] {
  if (!materializationAuthorityNeedsTenantStackRepair(input.authority)) {
    return Object.freeze([]);
  }
  const target = workerFacingPath(
    input.manifest,
    tenantStackAuthorityCanonicalSpecFile(input.manifest)
  );
  return Object.freeze([
    `Tenant-stack authority repair target: ${target}.`,
    "Tenant-stack reconciliation: before product-file edits, inspect stack authority, bootstrap/design/ADR refs, declared product targets/roles, commands, and execution-context files.",
    "Apply the generic stack reconciliation protocol before product-file edits or tenant-stack repairs: inspect tenant stack authority surfaces, accepted bootstrap/design/ADR refs, declared product targets/roles, commands, and execution-context files.",
    "If the initial bootstrap names or implies stack-specific construction pressure, create or repair the tenant TECH_STACK/TESTING_TECH_STACK authority from bootstrap facts and ADR/design decisions.",
    "Record a compact stack reconciliation decision: declared stack, conflict/underdefinition, repair surface (tenant authority, product files, both, or blocked), and proof command/probe result when executable.",
    "Do not repair tenant-stack authority from an untested local assumption. Do not rely on ecosystem defaults; repair TECH_STACK/TESTING_TECH_STACK from current authority when this edge permits it, otherwise report blocked/re-entry pressure.",
    "Do not embed tenant-stack authority inside component_depth_register, target carriers, worker reports, or runtime archives; keep tenant-stack authority in tenant spec files only.",
    "Execution-environment facts such as host/cache policy, workspaceLocalDirectories, and environmentVariables belong in TECH_STACK/TESTING_TECH_STACK; workspaceLocalDirectories are transient tool/cache/work dirs, not product target dirs."
  ]);
}

function retryDefectDirectivesForWorker(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const reasons = manifest.retryContext.priorGapDossiers.flatMap((dossier) =>
    retryPromptGapReasonsForDossier(manifest, dossier).map((reason) => {
      const detail = workerFacingDiagnosticText(
        manifest,
        reason.blockingReason.detail ?? reason.reason
      );
      const message = workerFacingDiagnosticText(
        manifest,
        reason.blockingReason.message
      );
      return `${reason.blockingReason.lawfulReentryPoint}: ${message} (${detail})`;
    })
  );
  if (reasons.length === 0) {
    return Object.freeze([]);
  }
  return Object.freeze([
    "This is a retry/re-entry attempt. Repair the evaluated residual pressure before adding new surface area.",
    ...reasons.slice(0, 6).map((reason) => `Evaluated residual pressure: ${reason}`),
    ...(reasons.length > 6
      ? [`Evaluated residual pressure count omitted: ${reasons.length - 6}`]
      : [])
  ]);
}

export function outcomeDirectivesForWorker(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const edgePolicyProjectionOutput = edgeOutputPolicyProjectsOutput(
    manifest.targetAssetType
  );
  const workerAuthoredTargetCarrierProtocol =
    workerAuthoredTargetCarrierProtocolRequired(manifest);
  const targetCarrierProtocolDirectives =
    workerAuthoredTargetCarrierProtocol
      ? [
          `Target carrier contract: ${manifest.targetCarrierProjection.targetCarrierContractRef}.`,
          `Target carrier digest: ${manifest.targetCarrierProjection.targetCarrierContractDigest}.`,
          `Target carrier kind: ${manifest.targetCarrierProjection.outputCarrierKind}; nested payload path: ${manifest.targetCarrierProjection.nestedPayloadPath}.`,
          `Construction depth role: ${manifest.targetCarrierProjection.constructionDepthRole}.`,
          ...(manifest.targetCarrierProjection.producedStagedAuthorityRefs.length === 0
            ? []
            : [
                `Produced staged authority refs: ${manifest.targetCarrierProjection.producedStagedAuthorityRefs.join(", ")}.`
              ]),
          ...(manifest.targetCarrierProjection.requiredStagedAuthorityRefs.length === 0
            ? []
            : [
                `Required staged authority refs: ${manifest.targetCarrierProjection.requiredStagedAuthorityRefs.join(", ")}.`
              ]),
          `Target carrier required fields: ${manifest.targetCarrierProjection.requiredFieldRefs.join(", ")}.`,
          `Target carrier fixed protocol fields: ${manifest.targetCarrierProjection.fixedProtocolFieldRefs.join(", ")}.`,
          `Worker-fillable target carrier fields: ${manifest.targetCarrierProjection.workerFillableFieldRefs.join(", ")}.`,
          `Target carrier construction template ref: ${manifest.targetCarrierProjection.constructionTemplateRef}; exact carrier admission remains evaluator-owned.`
        ]
      : [
          "Target-carrier protocol is evaluator-owned; do not render carrier kind/contract/digest/template/projection metadata."
        ];
  const directives: string[] = [
    `Outcome: ${manifest.graphFunctionName} -> ${manifest.targetAssetType}.`,
    ...(edgePolicyProjectionOutput
      ? [
          `Edge-policy projection output: ${workerFacingPath(manifest, manifest.outputFile)}.`,
          "The installed operator derives and writes the selected evaluation artifact after this process exits.",
          "Return after any allowed repair checks; do not fill target-carrier payload, summary, or evidence fields for this edge-policy projection artifact."
        ]
      : [
          `Write output artifact: ${workerFacingPath(manifest, manifest.outputFile)}.`,
          ...(manifest.outputFile.toLowerCase().endsWith(".md")
            ? [
                "Markdown output artifact: read listed refs first, use bounded targeted edits for existing files, and cite stable refs instead of copied authority text."
              ]
            : [])
        ]),
    `Do not write framework result report: ${workerFacingPath(manifest, manifest.reportFile)}.`,
    ...targetCarrierProtocolDirectives
  ];
  if (manifest.targetAssetType === "implementation_design_surface") {
    directives.push(
      "evaluate.C/F_P design-depth evaluator populates the design-depth register from workspace authority, the ADR transform artifact, worker result report, construction brief, invocation package, and admitted ledgers.",
      "Deterministic framework code admits and validates the evaluator register shape, identity, source file targets, evidence refs, and staged authority carriers; it does not derive replacement design-depth content."
    );
  }
  directives.push(...retryDefectDirectivesForWorker(manifest));
  if (manifest.featureScope.mode === "full_breadth") {
    directives.push(
      "Full breadth: do not narrow induction, product, goal, or requirement pressure to a feature slice."
    );
  } else {
    directives.push(
      "Steel thread / targeted repair: close only included scope and preserve deferred scope by ref."
    );
  }
  const tenantOutputArtifact = tenantRelativeOutputArtifactPath(manifest);
  const productMaterializationAuthority =
    reconcileSdlcProductMaterializationAuthority(manifest);
  const productFileTargets =
    productMaterializationAuthority.declaredProductFileTargets;
  const executionRepairMaterialization =
    productMaterializationRequiresTestExecutionEvidence(manifest);
  if (!manifest.productMaterialization.required) {
    if (executionRepairMaterialization) {
      directives.push(
        "Product materialization is execution-repair scoped for this edge: you may edit product source/test/build files under the tenant root only to make the declared test execution contract compile and pass.",
        "Do not add unrelated product scope; keep repairs limited to compile, discovery, or test failures observed by this execution edge.",
        `Tenant root: ${workerFacingPath(manifest, manifest.productMaterialization.tenantRoot)}.`,
        `Allowed write roots: ${listForPrompt(manifest.allowedWriteRoots.map((root) => workerFacingPath(manifest, root)))}.`
      );
    } else if (edgeOutputPolicyProjectsOutput(manifest.targetAssetType)) {
      directives.push(
        "Product materialization is not part of this edge.",
        "Worker role is observation over the selected evaluation inputs."
      );
    } else {
      directives.push(
        "Product materialization is not required for this edge.",
        "Do not write product source/test files for this edge."
      );
    }
    if (tenantOutputArtifact !== null) {
      if (edgePolicyProjectionOutput) {
        directives.push(
          `Edge-policy tenant-local SDLC surface path for current replay/admission: ${tenantOutputArtifact}; do not write this path and do not list it in materializedFiles.`
        );
      } else {
        directives.push(
          `tenant-local SDLC surface artifact path: ${tenantOutputArtifact}; do not list it in materializedFiles.`
        );
      }
      if (tenantOutputArtifact.startsWith("design/adrs/")) {
        directives.push(
          "ADR/design output must carry Status:, Implements:, Derives from:, Supersedes:, Superseded by:, and retained-special-case fields."
        );
      }
    }
    if (manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY) {
      directives.push(
        "This legacy authority-audit edge is not allowed to create replacement authority surfaces.",
        "Use the deterministic project bootstrap read model and imported specification files as current state.",
        "Do not write specification/INTENT.md, specification/PRODUCT.md, specification/GOALS.md, or specification/requirements/* from this edge.",
        "If authority is missing or ambiguous, report residual pressure in the worker assessment; do not synthesize a conformant script or substitute authority.",
        "Current-full traversal should normally enter through Fg_conform_project and derive_intent_surface, not this edge."
      );
    }
    if (manifest.edgeName === FG_DERIVE_LITE_DESIGN_ADR_SURFACE) {
      directives.push(
        "This is the lite design/ADR edge.",
        "Produce a compact implementation design/ADR from current workspace authority; evaluate.C/F_P will convert it plus the admitted ledgers into the design-depth register.",
        "Give the evaluator enough product intent to infer topology: decision, module boundary, product file target, execution command, requirement lineage, and tenant-declared stack/module pressure are required even when the product is a single script.",
        "When tenant stack authority exists, carry its required design-depth scalars into the ADR Stack Profile using values from that authority, not ecosystem defaults: language, runtime/module system, build tool, build config, dependency policy, test runner, and test command.",
        "When declaring file targets, make source syntax, test syntax, module/runtime system, extension choices, and execution commands match the admitted stack authority; if they diverge, repair the stack authority or the file targets instead of documenting a local override in prose."
      );
    }
    if (manifest.targetAssetType === "code_surface") {
      directives.push(
        "For code_surface, produce a compatibility rollup over admitted component_code_surface and component_realization_qualification_surface evidence."
      );
    }
  } else {
    const scopedMaterialization =
      featureScopeNarrowsMaterialization(manifest);
    directives.push(
      "Product materialization is REQUIRED for this edge.",
      `Tenant root: ${workerFacingPath(manifest, manifest.productMaterialization.tenantRoot)}.`,
      `Selected output root: ${manifest.productMaterialization.selectedOutputRoot}.`,
      `Framework-observed materializedFiles.relativePath basis after worker exit: ${manifest.productMaterialization.relativePathBasis}.`,
      scopedMaterialization
        ? `Included modules for this edge: ${listForPrompt(manifest.featureScope.includedModuleNames)}.`
        : `Declared modules: ${listForPrompt(manifest.productMaterialization.declaredModuleNames)}.`,
      scopedMaterialization
        ? `Deferred modules are lineage only for this edge; do not create or modify their files: ${listForPrompt(manifest.featureScope.deferredModuleNames)}.`
        : "Deferred modules: none.",
      `Required roles: ${listForPrompt(effectiveProductMaterializationRequiredRoles(manifest))}.`,
      `Build/test contracts: ${manifest.productMaterialization.buildExecutionContract} / ${manifest.productMaterialization.testExecutionContract}.`,
      "SDLC code-depth rule: admitted UAT/scenario authority plus build/test execution is the primary repair signal for executable product behavior; obligation rows are trace/provenance and do not close behavior by themselves.",
      productFileTargets.length === 0
        ? manifest.targetAssetType === "component_test_surface"
          ? "Declared product file targets: pending component-test register; componentTestRows[].relativePath becomes the test product target set for this edge."
          : manifest.targetAssetType === "uat_test_source_surface"
            ? "Declared product file targets: pending UAT component-depth register; componentTestRows[].relativePath becomes the role=test product target set for this edge."
          : "Declared product file targets: none."
        : `Declared product file targets: ${productFileTargets.join(", ")}.`,
      productMaterializationAuthority.declaredProductTargetContracts.length === 0
        ? "Declared product target role policy: none."
        : `Declared product target role policy: ${productMaterializationAuthority.declaredProductTargetContracts
            .map(
              (target) =>
                `${target.path} (${target.targetKind}, role=${target.requiredRole}, policy=${target.policyRef})`
            )
            .join("; ")}.`,
      productFileTargets.length === 0
        ? manifest.targetAssetType === "component_test_surface"
          ? "Component test files required by this edge are product materialization under the selected output root; operator-run asset archives may hold evidence, but they do not satisfy role=test product materialization."
          : manifest.targetAssetType === "uat_test_source_surface"
            ? "UAT test files required by this edge are product materialization under the selected output root; operator-run asset archives may hold evidence, but they do not satisfy role=test product materialization."
          : "Declared product file target set is empty; do not leave tenant-root build/test byproducts as product materialization."
	        : "Declared product file targets are the exact product surface for this edge. Build/test byproducts not listed as declared product targets must not be listed as materialized product files. Tenant-declared allowed byproducts may remain only when covered by execution shard allowedByproductGlobs; otherwise write transient evidence under operator-run roots or clean byproducts after capturing execution evidence.",
      `Product authority reconciliation: ${productMaterializationAuthority.status}; reasons: ${listForPrompt(productMaterializationAuthority.reasonRefs)}.`,
      `Allowed write roots: ${listForPrompt(manifest.allowedWriteRoots.map((root) => workerFacingPath(manifest, root)))}.`,
      "Do not use /tmp or any outside-workspace path for temporary build/test evidence; write transient logs under allowed write roots.",
      "Allowed write roots are workspace-root-relative unless already absolute; if you change cwd into a tenant or shard directory, resolve allowed write roots to workspace-root absolute paths before writing logs.",
      "Do not create or modify product files outside the declared product file targets and allowed shared build roots for this edge.",
      "Before executable product materialization or repair, read tenant stack authority under the selected output root; if missing, invalid, or underdefined, use the generic stack reconciliation protocol and repair tenant authority instead of hidden SDLC defaults.",
      "If tenant stack authority declares Node ESM/moduleSystem=esm and the target product file extension is .js, .mjs, or .jsx, emit ESM imports/exports and do not emit require(...), module.exports, or exports.*. Use CommonJS only when the stack authority or declared target file extension explicitly selects CommonJS.",
      "Apply requirementTraceObligationIds as the prompt-visible required product-file requirement tag set for this edge.",
      "On retry, requirement ids named by Current evaluated gaps are also admissible repair tags even when they are omitted from the prompt-limited requirementTraceObligationIds list; do not remove a current evaluated gap id solely because it is absent from that list.",
      "Do not expand product file tags from traversal_intent_package alone; it is audit context for the broader graph.",
      "Do not author materializedFiles[] rows. The framework derives materializedFiles after this worker exits from observed product-file writes, file content, and admitted carriers.",
      "For every declared product file target with role source, test, or build_config that supports an active requirement, embed parseable requirement tags in the file when the file syntax permits and mirror the same obligation ids in the target carrier/component rows. Build_config files are not exempt.",
      "For product files that cannot carry native comments, such as strict structured configuration files, carry lineage in the target carrier/table using component/file rows and evidence refs; do not rely on worker prose.",
      "When a product file is evidence for a fulfilled requirement, carry parseable requirement tags in that file when syntax permits and cite the same obligation ids in the target carrier/component rows.",
      "For source files, put requirement tags at the top of the file using valid native comment syntax, one exact canonical id per line, for example `// requirement:tenant.requirements.req_example_001`; canonical ids already include the `requirement:` prefix, so do not write `requirement:requirement:...`; do not rely on the report alone for product-file lineage."
    );
    directives.push(
      ...tenantStackAuthorityRepairDirectives({
        manifest,
        authority: productMaterializationAuthority
      })
    );
    if (
      productMaterializationAuthority.status === "missing" ||
      productMaterializationAuthority.status === "ambiguous"
    ) {
      directives.push(
        "If product target inventory is missing or ambiguous, inspect PRODUCT.md, requirements, and construction brief authority refs; derive the product topology and report the rationale in the worker result."
      );
    }
    if (manifest.targetAssetType === "test_design_surface") {
      directives.push(
        "Generated test plan rows must define discoverable tests for the declared test execution contract.",
        "Emit a fenced ```test_design_register JSON block whose top-level kind is sdlc_test_design_register and whose row fields match the prompt-listed row contract exactly."
      );
    }
    if (manifest.targetAssetType === "component_code_surface") {
      directives.push(
        manifest.graphFunctionName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
          ? "For declared product materialization, materialize product files under the declared product file targets. The output artifact is the traversal summary carrier, not a substitute for source/build files. Use minimal source structure only when no topology authority is present."
          : manifest.graphFunctionName === FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
          ? "For framework-smoke Min(F_P) component_code_surface, materialize the source product files declared by the admitted F_P design-depth register and stagePressure. Preserve the declared test execution contract for downstream derive_test_execution_result_surface; do not run it on the component-code edge. Keep componentRealizationRows source-role only."
          : manifest.edgeName === FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
          ? "For lite component_code_surface, materialize only the bounded source implementation files declared by construction_brief.stagePressure.designDepthEvaluatorRegisterRefs and the required staged authority refs. Do not infer topology from ADR prose alone and do not publish release, component-test, or test-execution carriers from this edge; use admitted UAT/scenario and build/test contracts only as repair probes and evidence for source behavior."
          : "For component_code_surface, materialize implementation/source files for each source-role declared component and record Component Realization Register evidence. Do not create test files, test component rows, repair schedules, or execution evidence on this edge."
      );
      directives.push(
        "For component_code_surface, force depth by iterating between the smallest admitted UAT/scenario probe, the declared build/test command or execution shard, and source repair. Do not create, modify, or execute test files on this edge; generated tests and test execution are owned by downstream test graph functions.",
        "Do not report a requirement as behavior-fulfilled merely because it is mapped to a component_depth_register row, lineage tag, manifest entry, or worker obligation assessment. Public behavior must be accountable to a source boundary plus scenario/build-test/evaluator evidence, or else be carried as explicit downstream pressure."
      );
      if (
        manifest.inputAssetTypes.includes("implementation_design_surface") &&
        manifest.targetCarrierProjection.requiredStagedAuthorityRefs.length > 0
      ) {
        directives.push(
          "Treat the admitted design-depth evaluator register as the highest implementation-design semantic pressure; read construction_brief.stagePressure.designDepthEvaluatorRegisterRefs before source edits.",
          "Use its source-role fileTargetRows/componentRealizationRows as source targets; if absent, report missing admitted design pressure.",
          "For each source-role realization, materialize or repair the named source file and carry componentId, publicBoundary, requirementIds, source tags, and target-carrier component trace rows.",
      "For each supporting build_config product target declared by admitted design authority, embed or mirror the same active requirement ids in file-native comments when legal and target-carrier rows when that supporting file participates in the proof contract. Role=test targets are downstream component_test_surface authority, not component_code_surface materialization.",
      "If accepted authority says a source target is an executable, script, program, CLI, service entrypoint, or must print/emit/respond when run, connect the product behavior to that source file's runtime entrypoint. An exported helper that only works when called by a test does not satisfy executable product materialization.",
      "Before writing or repairing source/build_config files, read the tenant stack authority surface, accepted design/ADR refs, declared product file targets, and declared execution contracts. If those inputs conflict, use the stack reconciliation protocol; do not change tenant-stack authority from an untested local assumption.",
      "Tenant stack authority must match the product files actually emitted. If source syntax, module/runtime system, or build tool differs from the seeded stack authority, repair the tenant stack authority or product files instead of documenting a local override in prose.",
      "Pre-return syntax check: every emitted source, test, and build/config product file must use the language, module/import system, file extension, test framework, and command shape declared by tenant stack authority. Do not write test files from component_code_surface.",
      "Do not satisfy multiple accepted component rows by collapsing them back into one coarse facade unless the admitted register gives that shared-component rationale."
    );
  }
      if (
        manifest.graphFunctionName !== FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
        manifest.edgeName !== FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
      ) {
        directives.push(
          "When declared product file targets are empty, derive the product source target set from admitted composite implementation design authority and materialize source files at payload.componentRealizationRows[].relativePath.",
          "Exclude role=test fileTargetRows, validator/proof-test component topology rows, and any test/ path from component_code_surface componentRealizationRows; those targets are consumed by component_test_surface.",
          "Build config files alone never satisfy required role source for component_code_surface; create source-role product files first, then add build/project files only as supporting materialization declared by admitted design authority.",
          "For component_code_surface, do not emit row-count-only executor scaffolds, print-only public runners, or requirement-comment shells. Source-role files must contain executable domain behavior matching the admitted module topology."
        );
      }
      if (manifest.graphFunctionName !== FG_MATERIALIZE_DECLARED_PRODUCT_ASSET) {
        directives.push(
          "For product files under an admitted runtime/module-system authority, emit source/build_config syntax that conforms to that authority or repair the authority before materialization. Do not create a language-specific compatibility exception inside component code.",
          "If test command or generated-test syntax pressure is visible while authoring component_code_surface, carry it as downstream test/build pressure unless the source or build_config authority itself must change."
        );
      }
    }
    if (manifest.targetAssetType === "component_test_surface") {
      directives.push(
        "For component_test_surface, materialize developer test files for each declared test class/file and record Component Test Register evidence.",
	        "On component_test_surface re-entry after partial materialization, first inventory existing framework-discoverable test files under the selected output root, then complete missing declared test classes and the component_test_surface carrier before broad source review.",
	        "For trace_missing repair, copy the exact admitted obligation ids cited by Current evaluated gaps into generated test comments and payload.componentTestRows[].requirementIds when those ids are requirement obligations; preserve testcaseIds and componentIds while expanding lineage.",
	        "Partial materialization re-entry must preserve existing testcaseIds, requirementIds, source-overlap rows, and test-file lineage unless a current evaluated gap names that exact row or obligation as wrong; never reduce the proof surface to make execution easier.",
	        "When declared product file targets are empty, derive test product file targets from admitted composite test design and materialize them under selected output root. Choose framework-discoverable test paths from the admitted tenant test stack authority or design rows; do not use a language-specific default in the SDLC prompt.",
	        "payload.componentTestRows[].relativePath must name the tenant-relative or selected-output-root-prefixed product test file path. Do not point componentTestRows at .ai-workspace/runtime asset paths; those paths are evidence archives, not product test files.",
	        "Generated test files are authored for the matching workerInvocationPackage.productMaterialization.executionShards[].workingDirectory; the installed operator executes the declared shard command after this transform returns.",
	        "Generated tests must derive paths and module/runtime syntax from the admitted tenant test stack authority, design rows, and shard workingDirectory; keep runtime compatibility inside declared source/test files or admitted design-declared support files.",
	        "For Node ESM tenants using .js, .mjs, or .jsx test files, generated tests must use ESM imports such as import test from \"node:test\" and import assert from \"node:assert/strict\"; never emit require(...), module.exports, or exports.* unless CommonJS is explicitly declared by stack or target authority.",
	        "Materialized tests must preserve declared testClassId; avoid local identifiers that collide with matcher words; prefer shouldEqual or parenthesized shouldBe RHS."
	      );
    }
  }
  for (const directive of [
    compactDesignDepthDirective(manifest),
    compactTestDesignDirective(manifest),
    compactTestExecutionSurfaceDirective(manifest),
    compactWorkspaceSpecSurfaceDirective(manifest),
    compactComponentDepthDirective(manifest),
    compactExecutionEvidenceDirective(manifest),
    compactScheduleDirective(manifest)
  ]) {
    if (directive !== null) {
      directives.push(directive);
    }
  }
  return Object.freeze(directives);
}

function workerFacingPath(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  filePath: string
): string {
  const workspaceRoot = resolve(manifest.workspaceRoot);
  const resolvedPath = resolve(filePath);
  const relativePath = relative(workspaceRoot, resolvedPath);
  if (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  ) {
    return relativePath === "" ? "." : relativePath;
  }
  return filePath;
}

function workerFacingDiagnosticPath(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  rawPath: string
): string {
  const relativePath = workerFacingPath(manifest, rawPath);
  if (relativePath !== rawPath) {
    return relativePath;
  }
  return `[outside-workspace-path:${path.basename(rawPath)}]`;
}

function workerFacingDiagnosticText(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  text: string
): string {
  return text
    .replace(/file:\/\/\/[^\s;),"]+/gu, (candidate) => {
      try {
        const filePath = fileURLToPath(candidate);
        const relativePath = workerFacingPath(manifest, filePath);
        if (relativePath !== filePath) {
          return `workspace://${relativePath}`;
        }
        return `[outside-workspace-file:${path.basename(filePath)}]`;
      } catch {
        return "[outside-workspace-file]";
      }
    })
    .replace(
      /(^|[\s;,(="'])\/(?!\/)[A-Za-z0-9._~!$&'*+=:@%/-]+/gu,
      (match, prefix: string) =>
        `${prefix}${workerFacingDiagnosticPath(
          manifest,
          match.slice(prefix.length)
        )}`
    );
}

function manifestCapabilityValue(
  manifest: SdlcWorkerHandoffManifest,
  name: string
): string | null {
  return (
    manifest.conformedProject.capabilityContracts?.find(
      (contract) => contract.name === name
    )?.value ?? null
  );
}

function truthyCapabilityValue(value: string | null): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function manifestRequiresTrivialDegenerateProduct(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return truthyCapabilityValue(manifestCapabilityValue(manifest, "trivial_product"));
}
