// Implements: T-184

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path, { isAbsolute, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { uniqueSorted } from "../../../shared/collections.js";
import { deriveSdlcConformProjectProfileFromWorkspace } from "../../../workspace/index.js";
import type {
  SdlcComponentRepairReentryPlan,
  SdlcComponentRepairScheduleRow,
  SdlcPostflightGapDossier,
  SdlcPostflightGapReason,
  SdlcWorkerHandoffManifest
} from "../../carriers.js";
import { admitComponentDepthRegisterFromArtifact } from "../../component_depth_register.js";

export function componentDepthFieldSetForTarget(
  targetAssetType: string
): readonly string[] {
  const envelope = [
    "kind=sdlc_component_depth_register",
    "registerVersion=ts-component-depth-v1",
    `targetAssetType=${targetAssetType}`
  ];
  if (targetAssetType === "implementation_design_surface") {
    return Object.freeze([
      ...envelope,
      "stackProfileRows[]",
      "implementationModuleRows[]",
      "aggregateDomainModelRows[]",
      "componentTopologyRows[].kind",
      "componentTopologyRows[].componentId",
      "componentTopologyRows[].moduleName",
      "componentTopologyRows[].relativePath",
      "componentTopologyRows[].publicBoundary",
      "componentTopologyRows[].concernRole",
      "componentTopologyRows[].requirementIds",
      "componentTopologyRows[].sourceAssetRefs"
    ]);
  }
  if (
    targetAssetType === "component_code_surface" ||
    targetAssetType === "component_realization_qualification_surface"
  ) {
    const sourceFields = [
      ...envelope,
      "componentTopologyRows[].kind=sdlc_component_topology_row",
      "componentTopologyRows[].componentId",
      "componentTopologyRows[].moduleName",
      "componentTopologyRows[].relativePath",
      "componentTopologyRows[].publicBoundary",
      "componentTopologyRows[].concernRole",
      "componentTopologyRows[].requirementIds",
      "componentTopologyRows[].sourceAssetRefs",
      "componentRealizationRows[].kind=sdlc_component_realization_row",
      "componentRealizationRows[].componentId",
      "componentRealizationRows[].moduleName",
      "componentRealizationRows[].relativePath",
      "componentRealizationRows[].publicBoundary",
      "componentRealizationRows[].requirementIds",
      "componentRealizationRows[].sourceAssetRefs"
    ];
    if (targetAssetType === "component_code_surface") {
      return Object.freeze([
        ...sourceFields,
        "testComponentTopologyRows=[]",
        "componentTestRows=[]",
        "componentTestQualificationRows=[]",
        "componentExecutionFailureRegister=null",
        "componentRepairSchedule=null",
        "releaseDepthParity=null"
      ]);
    }
    return Object.freeze(sourceFields);
  }
  if (targetAssetType === "component_test_surface") {
    return Object.freeze([
      ...envelope,
      "componentTopologyRows=[]",
      "componentRealizationRows=[]",
      "testComponentTopologyRows=[]",
      "componentTestRows[].kind",
      "componentTestRows[].testClassId",
      "componentTestRows[].relativePath",
      "componentTestRows[].testcaseIds",
      "componentTestRows[].componentIds",
      "componentTestRows[].requirementIds",
      "componentTestRows[].shardId",
      "componentTestQualificationRows=[]",
      "componentExecutionFailureRegister=null",
      "componentRepairSchedule=null",
      "releaseDepthParity=null"
    ]);
  }
  if (targetAssetType === "component_test_qualification_surface") {
    return Object.freeze([
      ...envelope,
      "componentTestQualificationRows[].kind",
      "componentTestQualificationRows[].testClassId",
      "componentTestQualificationRows[].testcaseIds",
      "componentTestQualificationRows[].componentIds",
      "componentTestQualificationRows[].requirementIds",
      "componentTestQualificationRows[].status",
      "componentTestQualificationRows[].evidenceRefs"
    ]);
  }
  if (targetAssetType === "component_repair_schedule_surface") {
    return Object.freeze([
      ...envelope,
      "componentRepairSchedule.kind",
      "componentRepairSchedule.registerVersion",
      "componentRepairSchedule.scheduleStatus",
      "componentRepairSchedule.repairRows",
      "componentRepairSchedule.evidenceRefs",
      "componentRepairSchedule.repairRows[].kind",
      "componentRepairSchedule.repairRows[].scheduleId",
      "componentRepairSchedule.repairRows[].failureId",
      "componentRepairSchedule.repairRows[].repairTarget",
      "componentRepairSchedule.repairRows[].lawfulReentryPoint",
      "componentRepairSchedule.repairRows[].attributionConfidence",
      "componentRepairSchedule.repairRows[].testcaseIds",
      "componentRepairSchedule.repairRows[].componentIds",
      "componentRepairSchedule.repairRows[].requirementIds",
      "componentRepairSchedule.repairRows[].sourceRefs",
      "componentRepairSchedule.repairRows[].testRefs",
      "componentRepairSchedule.repairRows[].evidenceRefs"
    ]);
  }
  if (targetAssetType === "release_depth_parity_surface") {
    return Object.freeze([
      ...envelope,
      "releaseDepthParity.kind",
      "releaseDepthParity.status",
      "releaseDepthParity.evidenceRefs"
    ]);
  }
  return Object.freeze(envelope);
}

export function designDepthFieldSetForTarget(
  targetAssetType: string
): readonly string[] {
  if (targetAssetType === "implementation_design_surface") {
    return Object.freeze([
      "kind",
      "registerVersion",
      "targetAssetType",
      "stackProfileRows[].kind=sdlc_stack_profile_row",
      "stackProfileRows[].stackRef",
      "stackProfileRows[].language",
      "stackProfileRows[].buildTool",
      "implementationModuleRows[].kind=sdlc_implementation_module_row",
      "implementationModuleRows[].moduleName",
      "implementationModuleRows[].moduleRef",
      "aggregateDomainModelRows[].kind=sdlc_aggregate_domain_model_row",
      "aggregateDomainModelRows[].modelRef",
      "moduleSchemaFragments[].kind",
      "moduleSchemaFragments[].moduleName",
      "moduleSchemaFragments[].entities[].kind",
      "moduleSchemaFragments[].entities[].entityId",
      "moduleSchemaFragments[].entities[].moduleName",
      "moduleSchemaFragments[].entities[].ownership",
      "moduleSchemaFragments[].entities[].attributes[].kind",
      "moduleSchemaFragments[].entities[].attributes[].attributeId",
      "moduleSchemaFragments[].entities[].attributes[].name",
      "moduleSchemaFragments[].entities[].attributes[].valueType",
      "moduleSchemaFragments[].entities[].attributes[].cardinality",
      "moduleSchemaFragments[].entities[].attributes[].invariantRefs",
      "moduleSchemaFragments[].entities[].invariants",
      "moduleSchemaFragments[].entities[].sourceAssetRefs",
      "moduleSchemaFragments[].operations[].kind",
      "moduleSchemaFragments[].operations[].operationId",
      "moduleSchemaFragments[].operations[].moduleName",
      "moduleSchemaFragments[].operations[].inputEntityIds",
      "moduleSchemaFragments[].operations[].outputEntityIds",
      "moduleSchemaFragments[].operations[].requiredAttributeIds",
      "moduleSchemaFragments[].requirementIds",
      "moduleSchemaFragments[].sourceAssetRefs",
      "moduleStateDiagramFragments[].kind",
      "moduleStateDiagramFragments[].moduleName",
      "moduleStateDiagramFragments[].entityId",
      "moduleStateDiagramFragments[].stateless",
      "moduleStateDiagramFragments[].states",
      "moduleStateDiagramFragments[].transitions[].kind",
      "moduleStateDiagramFragments[].transitions[].transitionId",
      "moduleStateDiagramFragments[].transitions[].fromState",
      "moduleStateDiagramFragments[].transitions[].toState",
      "moduleStateDiagramFragments[].transitions[].operationId",
      "moduleStateDiagramFragments[].transitions[].entityId",
      "moduleStateDiagramFragments[].requirementIds",
      "moduleStateDiagramFragments[].sourceAssetRefs",
      "aggregateDomainModel.kind=sdlc_aggregate_domain_model",
      "aggregateDomainModel.modelVersion",
      "aggregateDomainModel.entities[].kind=sdlc_aggregate_domain_entity",
      "aggregateDomainModel.entities[].entityId",
      "aggregateDomainModel.entities[].ownerModuleName",
      "aggregateDomainModel.entities[].attributes[].kind",
      "aggregateDomainModel.entities[].attributes[].attributeId",
      "aggregateDomainModel.entities[].attributes[].name",
      "aggregateDomainModel.entities[].attributes[].valueType",
      "aggregateDomainModel.entities[].attributes[].cardinality",
      "aggregateDomainModel.entities[].attributes[].invariantRefs",
      "aggregateDomainModel.entities[].sourceModuleNames",
      "aggregateDomainModel.operations[].kind=sdlc_domain_operation",
      "aggregateDomainModel.operations[].operationId",
      "aggregateDomainModel.operations[].moduleName",
      "aggregateDomainModel.operations[].inputEntityIds",
      "aggregateDomainModel.operations[].outputEntityIds",
      "aggregateDomainModel.operations[].requiredAttributeIds",
      "aggregateDomainModel.crossModuleReferences[].fromModuleName",
      "aggregateDomainModel.crossModuleReferences[].toModuleName",
      "aggregateDomainModel.crossModuleReferences[].entityId",
      "aggregateDomainModel.evidenceRefs",
      "sunnyDaySequenceRows[].kind=sdlc_sunny_day_sequence_row",
      "sunnyDaySequenceRows[].sequenceRef",
      "aggregateSunnyDaySequence.kind=sdlc_aggregate_sunny_day_sequence",
      "aggregateSunnyDaySequence.sequenceVersion",
      "aggregateSunnyDaySequence.steps[].kind=sdlc_sunny_day_sequence_step",
      "aggregateSunnyDaySequence.steps[].stepId",
      "aggregateSunnyDaySequence.steps[].moduleName",
      "aggregateSunnyDaySequence.steps[].operationId",
      "aggregateSunnyDaySequence.steps[].inputEntityIds",
      "aggregateSunnyDaySequence.steps[].outputEntityIds",
      "aggregateSunnyDaySequence.steps[].stateTransitionIds",
      "aggregateSunnyDaySequence.evidenceRefs",
      "componentTopologyRows[].kind=sdlc_component_topology_row",
      "componentTopologyRows[].componentId",
      "componentTopologyRows[].moduleName",
      "componentTopologyRows[].relativePath",
      "componentTopologyRows[].publicBoundary",
      "componentTopologyRows[].concernRole",
      "componentTopologyRows[].requirementIds",
      "componentTopologyRows[].sourceAssetRefs",
      "componentRealizationRows[].kind=sdlc_component_realization_row",
      "componentRealizationRows[].componentId",
      "componentRealizationRows[].moduleName",
      "componentRealizationRows[].relativePath",
      "componentRealizationRows[].publicBoundary",
      "componentRealizationRows[].trancheId",
      "componentRealizationRows[].firstProductFileToChange",
      "componentRealizationRows[].upstreamComponentIds",
      "componentRealizationRows[].requirementIds",
      "componentRealizationRows[].sourceAssetRefs",
      "fileTargetRows[].kind=sdlc_file_target_row",
      "fileTargetRows[].relativePath",
      "fileTargetRows[].role",
      "designCompletenessVerdict.kind=sdlc_design_completeness_verdict",
      "designCompletenessVerdict.verdictVersion",
      "designCompletenessVerdict.entity.kind=sdlc_design_completeness_axis_verdict",
      "designCompletenessVerdict.entity.axis",
      "designCompletenessVerdict.entity.status",
      "designCompletenessVerdict.entity.reasons",
      "designCompletenessVerdict.entity.evidenceRefs",
      "designCompletenessVerdict.attribute.kind=sdlc_design_completeness_axis_verdict",
      "designCompletenessVerdict.attribute.axis",
      "designCompletenessVerdict.attribute.status",
      "designCompletenessVerdict.attribute.reasons",
      "designCompletenessVerdict.attribute.evidenceRefs",
      "designCompletenessVerdict.flow.kind=sdlc_design_completeness_axis_verdict",
      "designCompletenessVerdict.flow.axis",
      "designCompletenessVerdict.flow.status",
      "designCompletenessVerdict.flow.reasons",
      "designCompletenessVerdict.flow.evidenceRefs"
    ]);
  }
  return Object.freeze(["kind", "registerVersion", "targetAssetType"]);
}

export function testDesignFieldSetForTarget(
  targetAssetType: string
): readonly string[] {
  return Object.freeze([
    "kind=sdlc_test_design_register",
    "registerVersion=ts-test-design-v1",
    `targetAssetType=${targetAssetType}`,
    "designConsumptionRows[].kind=sdlc_design_consumption_contract",
    "designConsumptionRows[].contractRef",
    "designConsumptionRows[].sourceDesignObligationRefs",
    "designConsumptionRows[].authorityBasisRefs",
    "designConsumptionRows[].consumerGraphFunctionRefs",
    "uatTestcaseRows[].kind=sdlc_test_case_row",
    "uatTestcaseRows[].testCaseRef",
    "uatTestcaseRows[].caseKind",
    "uatTestcaseRows[].executionLane",
    "uatTestcaseRows[].sourceDesignObligationRefs",
    "uatTestcaseRows[].testcaseAuthorityRefs",
    "uatTestcaseRows[].expectedBehavior",
    "testcaseAuthorityRows[].kind=sdlc_test_case_row",
    "testcaseAuthorityRows[].testCaseRef",
    "testcaseAuthorityRows[].caseKind",
    "testcaseAuthorityRows[].executionLane",
    "testcaseAuthorityRows[].sourceDesignObligationRefs",
    "testcaseAuthorityRows[].testcaseAuthorityRefs",
    "testcaseAuthorityRows[].expectedBehavior",
    "testStackProfileRows[].kind=sdlc_test_stack_profile_row",
    "testStackProfileRows[].stackRef",
    "testStackProfileRows[].frameworkRef",
    "testStackProfileRows[].buildTool",
    "testModuleRows[].kind=sdlc_test_module_row",
    "testModuleRows[].moduleName",
    "testModuleRows[].moduleRef",
    "testModuleRows[].testRoot",
    "testComponentTopologyRows[].kind=sdlc_test_component_topology_row",
    "testComponentTopologyRows[].testClassId",
    "testComponentTopologyRows[].relativePath",
    "testComponentTopologyRows[].testcaseIds",
    "testComponentTopologyRows[].componentIds",
    "testComponentTopologyRows[].requirementIds",
    "testComponentTopologyRows[].shardId",
    "testDataBindings[].kind=sdlc_test_data_binding",
    "testDataBindings[].testDataRef",
    "testDataBindings[].testCaseRef",
    "testDataBindings[].inputFixtureRefs",
    "testDataBindings[].generationPolicyRef",
    "testDataBindings[].expectedResultRef",
    "testDataBindings[].sourceDesignObligationRefs",
    "expectedResultBindings[].kind=sdlc_expected_result_binding",
    "expectedResultBindings[].expectedResultRef",
    "expectedResultBindings[].testCaseRef",
    "expectedResultBindings[].assertionRefs",
    "expectedResultBindings[].expectedResultSummary",
    "expectedResultBindings[].verificationPolicyRef",
    "uatIntegrationBindings[].kind=sdlc_uat_integration_binding",
    "uatIntegrationBindings[].uatTestCaseRef",
    "uatIntegrationBindings[].integrationTestCaseRef",
    "uatIntegrationBindings[].executionLane",
    "testExecutionScheduleRows[].kind=sdlc_test_execution_schedule_row",
    "testExecutionScheduleRows[].scheduleRef",
    "testExecutionScheduleRows[].testCaseRefs",
    "testExecutionScheduleRows[].command",
    "testExecutionScheduleRows[].frameworkRef",
    "testExecutionScheduleRows[].shardId"
  ]);
}

export function acceptedCarrierSchemaForReason(input: {
  readonly reason: string;
  readonly targetAssetType: string;
}): { readonly schemaRef: string; readonly fieldSet: readonly string[] } | null {
  if (
    input.reason.startsWith("component_depth_register_") ||
    input.reason === "component_depth_register_missing" ||
    input.reason.startsWith("component_repair_schedule_") ||
    input.reason.startsWith("component_repair_row_open:")
  ) {
    return Object.freeze({
      schemaRef: "schema://odd_sdlc/component_depth_register",
      fieldSet: componentDepthFieldSetForTarget(input.targetAssetType)
    });
  }
  if (
    input.reason.startsWith("design_depth_register_invalid:") ||
    input.reason === "design_depth_register_missing" ||
    input.reason.startsWith("design_depth_") ||
    input.reason.startsWith("design_attribute_missing:") ||
    input.reason.startsWith("design_flow_") ||
    input.reason.startsWith("design_state_") ||
    input.reason.startsWith("design_entity_") ||
    input.reason.startsWith("design_module_") ||
    input.reason.startsWith("design_cross_module_") ||
    input.reason.startsWith("design_operation_")
  ) {
    return Object.freeze({
      schemaRef: "schema://odd_sdlc/design_depth_register",
      fieldSet: designDepthFieldSetForTarget(input.targetAssetType)
    });
  }
  if (
    input.reason.startsWith("test_design_register_invalid:") ||
    input.reason === "test_design_register_missing" ||
    input.reason.startsWith("test_design_register_")
  ) {
    return Object.freeze({
      schemaRef: "schema://odd_sdlc/test_design_register",
      fieldSet: testDesignFieldSetForTarget(input.targetAssetType)
    });
  }
  if (
    input.reason.startsWith("test_execution_evidence_invalid") ||
    input.reason.startsWith("test_execution_evidence_missing")
  ) {
    return Object.freeze({
      schemaRef: "schema://odd_sdlc/test_execution_evidence",
      fieldSet: Object.freeze([
        "kind",
        "lane",
        "command",
        "status",
        "reportRefs",
        "testsObserved",
        "passedCount",
        "failedCount",
        "shardEvidence[].kind",
        "shardEvidence[].shardId",
        "shardEvidence[].moduleName",
        "shardEvidence[].lane",
        "shardEvidence[].command",
        "shardEvidence[].status",
        "shardEvidence[].reportRefs",
        "shardEvidence[].testsObserved",
        "shardEvidence[].passedCount",
        "shardEvidence[].failedCount"
      ])
    });
  }
  return null;
}

function repairReentryTargetForRepairTarget(
  repairTarget: SdlcComponentRepairScheduleRow["repairTarget"]
): { readonly targetEdgeName: string; readonly targetAssetType: string } | null {
  if (repairTarget === "component_test") {
    return Object.freeze({
      targetEdgeName: "derive_component_test_surface",
      targetAssetType: "component_test_surface"
    });
  }
  if (repairTarget === "component_code") {
    return Object.freeze({
      targetEdgeName: "derive_component_code_surface",
      targetAssetType: "component_code_surface"
    });
  }
  if (repairTarget === "test_schedule") {
    return Object.freeze({
      targetEdgeName: "derive_test_design_surface",
      targetAssetType: "test_design_surface"
    });
  }
  if (repairTarget === "test_execution_surface") {
    return Object.freeze({
      targetEdgeName: "prepare_test_execution_surface",
      targetAssetType: "test_execution_surface"
    });
  }
  return null;
}

function filePathForEvidenceRef(input: {
  readonly workspaceRoot: string;
  readonly ref: string;
}): string | null {
  try {
    const parsed = new URL(input.ref);
    if (parsed.protocol === "file:") {
      return fileURLToPath(parsed);
    }
    if (parsed.protocol === "workspace:") {
      return join(input.workspaceRoot, parsed.pathname.replace(/^\/+/, ""));
    }
  } catch {
    if (isAbsolute(input.ref)) {
      return input.ref;
    }
  }
  return null;
}

export function existingEvidencePaths(input: {
  readonly workspaceRoot: string;
  readonly refs: readonly string[];
}): readonly string[] {
  return uniqueSorted(
    input.refs.flatMap((ref) => {
      const filePath = filePathForEvidenceRef({
        workspaceRoot: input.workspaceRoot,
        ref
      });
      return filePath !== null && existsSync(filePath) && statSync(filePath).isFile()
        ? [filePath]
        : [];
    })
  );
}

function recentRuntimeAssetPaths(input: {
  readonly workspaceRoot: string;
  readonly targetAssetTypes: readonly string[];
  readonly limit: number;
}): readonly string[] {
  const assetsRoot = join(
    input.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot).runtimeLayout
      .transformAssetRoot
  );
  if (!existsSync(assetsRoot) || !statSync(assetsRoot).isDirectory()) {
    return Object.freeze([]);
  }
  const candidates: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  for (const runId of readdirSync(assetsRoot)) {
    const runRoot = join(assetsRoot, runId);
    if (!existsSync(runRoot) || !statSync(runRoot).isDirectory()) {
      continue;
    }
    for (const targetAssetType of input.targetAssetTypes) {
      const filePath = join(runRoot, `${targetAssetType}.md`);
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        candidates.push(Object.freeze({
          filePath,
          mtimeMs: statSync(filePath).mtimeMs
        }));
      }
    }
  }
  return Object.freeze(
    candidates
      .sort((left, right) => right.mtimeMs - left.mtimeMs)
      .slice(0, input.limit)
      .map((candidate) => candidate.filePath)
  );
}

function componentRepairRowsFromArtifact(input: {
  readonly outputFile: string;
  readonly preferredTargetAssetType: string;
}): readonly SdlcComponentRepairScheduleRow[] {
  const targetAssetTypes = uniqueSorted([
    input.preferredTargetAssetType,
    "component_repair_schedule_surface",
    "release_depth_parity_surface"
  ]);
  for (const targetAssetType of targetAssetTypes) {
    const admission = admitComponentDepthRegisterFromArtifact({
      targetAssetType,
      outputFile: input.outputFile
    });
    if (
      admission.status === "admitted" &&
      admission.register !== null &&
      admission.register.componentRepairSchedule !== null
    ) {
      return admission.register.componentRepairSchedule.repairRows;
    }
  }
  return Object.freeze([]);
}

function componentRepairRowsForFailure(input: {
  readonly workspaceRoot: string;
  readonly preferredTargetAssetType: string;
  readonly failureId: string;
  readonly evidenceRefs: readonly string[];
  readonly currentOutputFile?: string | null;
}): readonly SdlcComponentRepairScheduleRow[] {
  const paths = uniqueSorted([
    ...(input.currentOutputFile !== undefined &&
    input.currentOutputFile !== null &&
    existsSync(input.currentOutputFile) &&
    statSync(input.currentOutputFile).isFile()
      ? [input.currentOutputFile]
      : []),
    ...existingEvidencePaths({
      workspaceRoot: input.workspaceRoot,
      refs: input.evidenceRefs
    }),
    ...recentRuntimeAssetPaths({
      workspaceRoot: input.workspaceRoot,
      targetAssetTypes: Object.freeze([
        "component_repair_schedule_surface",
        "release_depth_parity_surface"
      ]),
      limit: 8
    })
  ]);
  return Object.freeze(
    paths.flatMap((outputFile) =>
      componentRepairRowsFromArtifact({
        outputFile,
        preferredTargetAssetType: input.preferredTargetAssetType
      }).filter((row) => row.failureId === input.failureId)
    )
  );
}

function diagnosticNeedlesForRepairRow(
  row: SdlcComponentRepairScheduleRow
): readonly string[] {
  return uniqueSorted([
    row.failureId,
    ...row.testRefs.map((ref) => path.basename(ref)),
    ...row.sourceRefs.map((ref) => path.basename(ref)),
    "[error]",
    "test_compile_failed",
    "blockerDetail"
  ]).filter((needle) => needle.length > 0);
}

function diagnosticEvidenceForRepairRow(input: {
  readonly workspaceRoot: string;
  readonly row: SdlcComponentRepairScheduleRow;
  readonly evidenceRefs: readonly string[];
}): { readonly evidenceRefs: readonly string[]; readonly excerpt: string } {
  const paths = uniqueSorted([
    ...existingEvidencePaths({
      workspaceRoot: input.workspaceRoot,
      refs: uniqueSorted([...input.evidenceRefs, ...input.row.evidenceRefs])
    }),
    ...recentRuntimeAssetPaths({
      workspaceRoot: input.workspaceRoot,
      targetAssetTypes: Object.freeze(["test_execution_result_surface"]),
      limit: 6
    })
  ]);
  const needles = diagnosticNeedlesForRepairRow(input.row).map((needle) =>
    needle.toLowerCase()
  );
  const selectedLines: string[] = [];
  const evidenceRefs: string[] = [];
  for (const filePath of paths) {
    let content: string;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    const matchingLines = content
      .split(/\r?\n/u)
      .filter((line) => {
        const lower = line.toLowerCase();
        return needles.some((needle) => lower.includes(needle));
      })
      .slice(0, 40);
    if (matchingLines.length === 0) {
      continue;
    }
    evidenceRefs.push(pathToFileURL(filePath).href);
    selectedLines.push(`From ${pathToFileURL(filePath).href}:`, ...matchingLines);
  }
  return Object.freeze({
    evidenceRefs: uniqueSorted(evidenceRefs),
    excerpt: selectedLines.join("\n").slice(0, 2400)
  });
}

export function componentRepairReentryPlanForReason(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dossier: SdlcPostflightGapDossier;
  readonly reason: SdlcPostflightGapReason;
}): SdlcComponentRepairReentryPlan | null {
  const prefix = "component_repair_row_open:";
  if (!input.reason.reason.startsWith(prefix)) {
    return null;
  }
  const failureId = input.reason.reason.slice(prefix.length);
  if (failureId.length === 0) {
    return null;
  }
  const evidenceRefs = uniqueSorted([
    ...input.dossier.evidenceRefs,
    ...input.reason.blockingReason.evidenceRefs
  ]);
  const row = componentRepairRowsForFailure({
    workspaceRoot: input.manifest.workspaceRoot,
    preferredTargetAssetType: input.dossier.targetAssetType,
    failureId,
    evidenceRefs,
    currentOutputFile: input.manifest.outputFile
  })[0];
  if (row === undefined) {
    return null;
  }
  const target = repairReentryTargetForRepairTarget(row.repairTarget);
  if (target === null) {
    return null;
  }
  const acceptedCarrier = acceptedCarrierSchemaForReason({
    reason: input.reason.reason,
    targetAssetType: target.targetAssetType
  });
  if (acceptedCarrier === null) {
    return null;
  }
  const diagnostics = diagnosticEvidenceForRepairRow({
    workspaceRoot: input.manifest.workspaceRoot,
    row,
    evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_component_repair_reentry_plan" as const,
    planVersion: "ts-component-repair-reentry-v1" as const,
    planId: `component_repair_reentry:${row.failureId}`,
    sourceGapDossierRef: input.dossier.currentGapDossierRef,
    sourceEdgeName: input.dossier.edgeName,
    sourceTargetAssetType: input.dossier.targetAssetType,
    reason: input.reason.reason,
    targetEdgeName: target.targetEdgeName,
    targetAssetType: target.targetAssetType,
    repairTarget: row.repairTarget,
    failureId: row.failureId,
    scheduleId: row.scheduleId,
    testcaseIds: row.testcaseIds,
    componentIds: row.componentIds,
    requirementIds: row.requirementIds,
    sourceRefs: row.sourceRefs,
    testRefs: row.testRefs,
    repairRowEvidenceRefs: uniqueSorted(row.evidenceRefs),
    diagnosticEvidenceRefs: uniqueSorted([
      ...diagnostics.evidenceRefs,
      ...row.evidenceRefs
    ]),
    diagnosticExcerpt: diagnostics.excerpt,
    acceptedCarrierSchemaRef: acceptedCarrier.schemaRef,
    acceptedCarrierFieldSet: acceptedCarrier.fieldSet,
    noBroadRegeneration: true
  });
}

export function componentRepairReentryPlansForGapDossier(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dossier: SdlcPostflightGapDossier;
}): readonly SdlcComponentRepairReentryPlan[] {
  const plans = new Map<string, SdlcComponentRepairReentryPlan>();
  for (const reason of input.dossier.reasons) {
    const plan = componentRepairReentryPlanForReason({
      manifest: input.manifest,
      dossier: input.dossier,
      reason
    });
    if (plan !== null) {
      plans.set(plan.planId, plan);
    }
  }
  return Object.freeze([...plans.values()]);
}
