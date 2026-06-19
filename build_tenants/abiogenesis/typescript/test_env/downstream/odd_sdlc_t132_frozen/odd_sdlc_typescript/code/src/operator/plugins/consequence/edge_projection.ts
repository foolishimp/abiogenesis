// Implements: T-184

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path, { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sdlcExecutiveEdgeAccountingRowFor } from "../../../graph/index.js";
import {
  constructSdlcProcessRunPlan,
  executeSdlcProcessRunPlan
} from "../../../effects/process_runner.js";
import {
  constructSdlcWriteTextFilePlan,
  executeSdlcFileStoreEffectPlan
} from "../../../effects/file_store.js";
import {
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseOptionalArray,
  parseStringList
} from "../../../shared/validation.js";
import { uniqueSorted } from "../../../shared/collections.js";
import { pathIsInside } from "../../../shared/path.js";
import { admitExactContractEnum } from "../../../shared/fd_admission.js";
import { deriveSdlcConformProjectProfileFromWorkspace } from "../../../workspace/index.js";
import type {
  SdlcComponentDepthRegister,
  SdlcComponentExecutionFailureRow,
  SdlcComponentTestQualificationRow,
  SdlcComponentTestRealizationRow,
  SdlcDesignDepthRegister,
  SdlcProductMaterializationContract,
  SdlcTestDesignRegister,
  SdlcTestExecutionPreparationRow,
  SdlcTestExecutionSurfaceRegister,
  SdlcWorkerExecutionEvidence,
  SdlcWorkerExecutionShardEvidence,
  SdlcWorkerHandoffManifest
} from "../../carriers.js";
import { admitComponentDepthRegisterFromArtifact } from "../../component_depth_register.js";
import { sdlcInstalledOperatorProjectsOutput } from "../../edge_output_policy.js";
import { sdlcOperatorRuntimePolicy } from "../../runtime_policy.js";
import {
  stableSdlcSystemArtifactJson,
  writeSdlcSystemArtifact
} from "../../system_artifacts.js";
import { sdlcWorkspaceLocalToolEnvironment } from "../../tool_environment.js";
import { admitTestExecutionSurfaceRegisterFromArtifact } from "../../test_execution_surface_register.js";
import { admitTestDesignRegisterFromArtifact } from "../../test_design_register.js";
import {
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation
} from "../evaluate/design_depth_register.js";
import {
  tenantLocalSdlcSurfaceRelativePath
} from "../../product_materialization/surface_paths.js";

const REPORT_FIELDS = Object.freeze([
  "kind",
  "projectionRole",
  "authoritativeStageResultRef",
  "graphFunctionName",
  "edgeName",
  "targetAssetType",
  "outputFile",
  "digest",
  "summary",
  "unresolvedReasons",
  "materializedFiles",
  "materializationDiagnostics",
  "executionEvidence",
  "executionEvidenceErrors",
  "obligationAssessments",
  "subworkstreamManifest",
  "fpTransformRequestRef",
  "fpTransformResultRef",
  "fpTransformStatusSnapshot",
  "fpEvaluateResultRef"
] as const);

function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}

function isOpenRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function parseOpenRecord(input: unknown, label: string): Record<string, unknown> {
  if (!isOpenRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return input;
}

function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}

function parseNullableNonNegativeInteger(input: unknown, label: string): number | null {
  if (input === null) {
    return null;
  }
  return parseNonNegativeInteger(input, label);
}

function executionEvidenceStatus(input: unknown, label: string) {
  return admitExactContractEnum({
    value: input,
    label,
    values: ["succeeded", "failed", "pending"] as const
  });
}

function admitWorkerExecutionShardEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionShardEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "shardId",
    "moduleName",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_shard_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution shard evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_shard_evidence" as const,
    shardId: parseNonEmptyString(record["shardId"], `${label}.shardId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    )
  });
}

function admitWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount",
    "shardEvidence"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_evidence" as const,
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["build", "test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    ),
    shardEvidence: parseOptionalArray(
      record["shardEvidence"],
      `${label}.shardEvidence`,
      admitWorkerExecutionShardEvidence
    )
  });
}

function admitOptionalWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence | null {
  if (input === undefined || input === null) {
    return null;
  }
  return admitWorkerExecutionEvidence(input, label);
}

function expectedArchivedFpEvaluateResultRef(reportFile: string): string {
  return pathToFileURL(join(dirname(reportFile), "fp_evaluate_result.json")).href;
}

function readArchivedWorkerResultReportRecord(input: {
  readonly filePath: string;
  readonly label: string;
}): Record<string, unknown> {
  const record = parseClosedRecord(
    JSON.parse(readFileSync(input.filePath, "utf8")),
    input.label,
    REPORT_FIELDS
  );
  const kind = parseNonEmptyString(record["kind"], `${input.label}.kind`);
  if (kind !== "odd_sdlc.worker_result_report") {
    throw new TypeError(`${input.label}.kind: unexpected report kind`);
  }
  const projectionRole = parseNonEmptyString(
    record["projectionRole"],
    `${input.label}.projectionRole`
  );
  if (projectionRole !== "typed_fp_stage_projection") {
    throw new TypeError(
      `${input.label}.projectionRole: expected typed_fp_stage_projection`
    );
  }
  const authoritativeStageResultRef = parseNonEmptyString(
    record["authoritativeStageResultRef"],
    `${input.label}.authoritativeStageResultRef`
  );
  if (authoritativeStageResultRef !== expectedArchivedFpEvaluateResultRef(input.filePath)) {
    throw new TypeError(
      `${input.label}.authoritativeStageResultRef: expected same-archive fp_evaluate_result.json`
    );
  }
  return record;
}

function filePathFromEvidenceRef(ref: string): string | null {
  if (ref.startsWith("file://")) {
    try {
      return fileURLToPath(ref);
    } catch {
      return null;
    }
  }
  return isAbsolute(ref) ? ref : null;
}

function isSdlcWorkerHandoffManifest(
  value: unknown
): value is SdlcWorkerHandoffManifest {
  const record = objectRecord(value);
  return (
    record !== null &&
    record["kind"] === "sdlc_worker_handoff_manifest" &&
    typeof record["reportFile"] === "string" &&
    typeof record["targetAssetType"] === "string" &&
    objectRecord(record["productMaterialization"]) !== null
  );
}

interface ParsedJsonCandidate {
  readonly ok: boolean;
  readonly value: unknown;
}

function parseJsonCandidate(input: string): ParsedJsonCandidate {
  try {
    const parsed: unknown = JSON.parse(input);
    return Object.freeze({ ok: true, value: parsed });
  } catch {
    return Object.freeze({ ok: false, value: null });
  }
}

function readArchivedWorkerHandoffManifestForReport(input: {
  readonly reportFile: string;
  readonly label: string;
}): SdlcWorkerHandoffManifest {
  const manifestPath = join(dirname(input.reportFile), "handoff_manifest.json");
  if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) {
    throw new TypeError(`${input.label}.handoffManifest: missing sibling handoff_manifest.json`);
  }
  const parsed = parseJsonCandidate(readFileSync(manifestPath, "utf8"));
  if (!parsed.ok) {
    throw new TypeError(`${input.label}.handoffManifest: invalid JSON`);
  }
  const record = objectRecord(parsed.value);
  if (record === null) {
    throw new TypeError(`${input.label}.handoffManifest: expected object`);
  }
  if (!isSdlcWorkerHandoffManifest(parsed.value)) {
    throw new TypeError(
      `${input.label}.handoffManifest: expected sdlc worker handoff manifest shape`
    );
  }
  const kind = parseNonEmptyString(
    record["kind"],
    `${input.label}.handoffManifest.kind`
  );
  if (kind !== "sdlc_worker_handoff_manifest") {
    throw new TypeError(
      `${input.label}.handoffManifest.kind: expected sdlc_worker_handoff_manifest`
    );
  }
  const reportFile = parseNonEmptyString(
    record["reportFile"],
    `${input.label}.handoffManifest.reportFile`
  );
  if (resolve(reportFile) !== resolve(input.reportFile)) {
    throw new TypeError(
      `${input.label}.handoffManifest.reportFile: expected same-archive worker_result_report.json`
    );
  }
  return parsed.value;
}

function readExecutionResultEvidenceFromReportRef(ref: string): {
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
  readonly sourceManifest: SdlcWorkerHandoffManifest | null;
  readonly error: string | null;
} {
  const filePath = filePathFromEvidenceRef(ref);
  if (filePath === null || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return Object.freeze({
      executionEvidence: null,
      sourceManifest: null,
      error: "not a readable file evidence ref"
    });
  }
  try {
    const record = readArchivedWorkerResultReportRecord({
      filePath,
      label: "SourceWorkerResultReport"
    });
    const targetAssetType = parseNonEmptyString(
      record["targetAssetType"],
      "SourceWorkerResultReport.targetAssetType"
    );
    if (targetAssetType !== "test_execution_result_surface") {
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: `unexpected source target ${targetAssetType}`
      });
    }
    const sourceManifest = readArchivedWorkerHandoffManifestForReport({
      reportFile: filePath,
      label: "SourceWorkerResultReport"
    });
    if (sourceManifest.targetAssetType !== "test_execution_result_surface") {
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: `source manifest target mismatch ${sourceManifest.targetAssetType}`
      });
    }
    const executionEvidence = admitOptionalWorkerExecutionEvidence(
      record["executionEvidence"],
      "SourceWorkerResultReport.executionEvidence"
    );
    if (executionEvidence === null) {
      const executionEvidenceErrors = parseStringList(
        record["executionEvidenceErrors"] ?? [],
        "SourceWorkerResultReport.executionEvidenceErrors"
      );
      const outputFile = parseNonEmptyString(
        record["outputFile"],
        "SourceWorkerResultReport.outputFile"
      );
      let outputArtifactError: string | null = null;
      if (
        resolve(outputFile) === resolve(sourceManifest.outputFile) &&
        existsSync(outputFile) &&
        statSync(outputFile).isFile()
      ) {
        try {
          return Object.freeze({
            executionEvidence: admitWorkerExecutionEvidence(
              JSON.parse(readFileSync(outputFile, "utf8")),
              "SourceWorkerResultReport.outputFile.executionEvidence"
            ),
            sourceManifest,
            error: null
          });
        } catch (error) {
          outputArtifactError = error instanceof Error ? error.message : String(error);
        }
      }
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: executionEvidenceErrors.length > 0
          ? `execution evidence invalid: ${executionEvidenceErrors.join("; ")}`
          : outputArtifactError !== null
            ? `execution evidence output invalid: ${outputArtifactError}`
          : "execution evidence missing"
      });
    }
    return Object.freeze({ executionEvidence, sourceManifest, error: null });
  } catch (error) {
    return Object.freeze({
      executionEvidence: null,
      sourceManifest: null,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function writeWorkspaceTargetJsonFile(input: {
  readonly filePath: string;
  readonly payload: unknown;
}): void {
  writeWorkspaceTargetFile({
    filePath: input.filePath,
    content: stableSdlcSystemArtifactJson(input.payload)
  });
}

function writeWorkspaceTargetFile(input: {
  readonly filePath: string;
  readonly content: string;
}): void {
  executeSdlcFileStoreEffectPlan(
    constructSdlcWriteTextFilePlan({
      absolutePath: input.filePath,
      content: input.content
    })
  );
}

function componentDepthSurfaceFile(
  manifest: SdlcWorkerHandoffManifest,
  targetAssetType: string
): string | null {
  const relativePath = tenantLocalSdlcSurfaceRelativePath(targetAssetType);
  if (relativePath === null) {
    return null;
  }
  return join(manifest.productMaterialization.tenantRoot, relativePath);
}

function readAdmittedComponentDepthSurface(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly targetAssetType: string;
}): SdlcComponentDepthRegister | null {
  const outputFile = componentDepthSurfaceFile(
    input.manifest,
    input.targetAssetType
  );
  if (outputFile === null || !existsSync(outputFile)) {
    return null;
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.targetAssetType,
    outputFile
  });
  return admission.status === "admitted" ? admission.register : null;
}

function readAdmittedImplementationDesign(
  manifest: SdlcWorkerHandoffManifest,
  fpEvaluatorAdmissionEvidenceRefs: readonly string[] = Object.freeze([])
): SdlcDesignDepthRegister | null {
  const admission =
    fpEvaluatorAdmissionEvidenceRefs.length > 0
      ? admitImplementationDesignRegisterForRuntimeEvaluation({
          manifest,
          fpEvaluatorAdmissionEvidenceRefs
        })
      : admitImplementationDesignRegisterForManifest({
          manifest
        });
  return admission.status === "admitted" ? admission.register : null;
}

function readAdmittedTestDesign(
  manifest: SdlcWorkerHandoffManifest
): SdlcTestDesignRegister | null {
  const outputFile = componentDepthSurfaceFile(manifest, "test_design_surface");
  if (outputFile === null || !existsSync(outputFile)) {
    return null;
  }
  const admission = admitTestDesignRegisterFromArtifact({
    targetAssetType: "test_design_surface",
    outputFile
  });
  return admission.status === "admitted" ? admission.register : null;
}

function latestExecutionResultReportRefs(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const operatorRunsRoot = join(
    manifest.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(manifest.workspaceRoot)
      .runtimeLayout.operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return Object.freeze([]);
  }
  const reports: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  for (const runId of readdirSync(operatorRunsRoot)) {
    const filePath = join(operatorRunsRoot, runId, "worker_result_report.json");
    if (
      resolve(filePath) === resolve(manifest.reportFile) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      continue;
    }
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath,
        label: "LatestExecutionResultReport"
      });
      if (record["targetAssetType"] === "test_execution_result_surface") {
        reports.push(Object.freeze({ filePath, mtimeMs: statSync(filePath).mtimeMs }));
      }
    } catch {
      continue;
    }
  }
  return Object.freeze(
    reports
      .sort((left, right) => right.mtimeMs - left.mtimeMs)
      .map((report) => pathToFileURL(report.filePath).href)
  );
}

function latestAdmittedExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): SdlcWorkerExecutionEvidence | null {
  for (const ref of latestExecutionResultReportRefs(manifest)) {
    const readResult = readExecutionResultEvidenceFromReportRef(ref);
    if (readResult.executionEvidence !== null) {
      return readResult.executionEvidence;
    }
  }
  return null;
}

function sanitizedCarrierId(input: string): string {
  const sanitized = input
    .trim()
    .replace(/[^A-Za-z0-9_.:-]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return sanitized.length > 0 ? sanitized : "unnamed";
}

function testRefForRow(
  manifest: SdlcWorkerHandoffManifest,
  row: SdlcComponentTestRealizationRow
): string {
  const normalizedRelativePath = path.normalize(row.relativePath);
  const selectedOutputRoot = path.normalize(
    manifest.productMaterialization.selectedOutputRoot
  );
  const absolutePath = isAbsolute(normalizedRelativePath)
    ? normalizedRelativePath
    : normalizedRelativePath === selectedOutputRoot ||
        normalizedRelativePath.startsWith(`${selectedOutputRoot}${path.sep}`)
      ? join(manifest.workspaceRoot, normalizedRelativePath)
      : join(manifest.productMaterialization.tenantRoot, normalizedRelativePath);
  return pathToFileURL(absolutePath).href;
}

function failureKindForExecutionEvidence(
  evidence: SdlcWorkerExecutionEvidence | null
): SdlcComponentExecutionFailureRow["failureKind"] {
  if (evidence === null || evidence.status === "pending") {
    return "execution_evidence_missing";
  }
  if ((evidence.failedCount ?? 0) > 0) {
    return "assertion_failure";
  }
  return evidence.status === "failed" ? "runtime_exception" : "triage_gap";
}

function failureRowsForComponentTests(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly componentTestRows: readonly SdlcComponentTestRealizationRow[];
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
}): readonly SdlcComponentExecutionFailureRow[] {
  if (
    input.executionEvidence?.status === "succeeded" &&
    (input.executionEvidence.failedCount ?? 0) === 0 &&
    (input.executionEvidence.testsObserved ?? 0) > 0
  ) {
    return Object.freeze([]);
  }
  const evidenceRefs =
    input.executionEvidence?.reportRefs ??
    Object.freeze([pathToFileURL(input.manifest.outputFile).href]);
  const failureKind = failureKindForExecutionEvidence(input.executionEvidence);
  const rows =
    input.componentTestRows.length > 0
      ? input.componentTestRows
      : Object.freeze([
          {
            kind: "sdlc_component_test_realization_row" as const,
            testClassId: "component-test-surface-missing",
            relativePath: "design/component_test_surface.md",
            testcaseIds: Object.freeze([]),
            componentIds: Object.freeze([]),
            requirementIds: Object.freeze([]),
            shardId: null
          }
        ]);
  return Object.freeze(
    rows.map((row, index) => {
      const shardId =
        row.shardId ??
        input.executionEvidence?.shardEvidence[index]?.shardId ??
        input.executionEvidence?.shardEvidence[0]?.shardId ??
        "unsharded";
      return Object.freeze({
        kind: "sdlc_component_execution_failure_row" as const,
        failureId: `failure:${sanitizedCarrierId(row.testClassId)}:${sanitizedCarrierId(shardId)}`,
        shardId,
        moduleName:
          input.executionEvidence?.shardEvidence.find(
            (shard) => shard.shardId === shardId
          )?.moduleName ?? "component-test",
        testClassId: row.testClassId,
        testcaseIds: row.testcaseIds,
        componentIds: row.componentIds,
        requirementIds: row.requirementIds,
        failureKind,
        repairTarget:
          failureKind === "execution_evidence_missing"
            ? "test_execution_surface"
            : "component_code",
        lawfulReentryPoint: "repair_worker_output",
        attributionConfidence: "medium" as const,
        sourceRefs: Object.freeze(row.componentIds.map((id) => `component:${id}`)),
        testRefs: Object.freeze([testRefForRow(input.manifest, row)]),
        evidenceRefs
      });
    })
  );
}

function qualificationRowsForComponentTests(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly componentTestRows: readonly SdlcComponentTestRealizationRow[];
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
}): readonly SdlcComponentTestQualificationRow[] {
  function statusForEvidence(
    evidence: SdlcWorkerExecutionEvidence | SdlcWorkerExecutionShardEvidence | null
  ): SdlcComponentTestQualificationRow["status"] {
    return evidence === null
      ? "unproven"
      : evidence.status === "pending"
        ? "pending"
        : evidence.status === "failed"
          ? "failed"
          : (evidence.failedCount ?? 0) === 0 &&
              (evidence.testsObserved ?? 0) > 0
            ? "passed"
            : "blocked";
  }
  function evidenceForRow(
    row: SdlcComponentTestRealizationRow,
    index: number
  ): SdlcWorkerExecutionEvidence | SdlcWorkerExecutionShardEvidence | null {
    if (input.executionEvidence === null) {
      return null;
    }
    return (
      input.executionEvidence.shardEvidence.find(
        (shard) => row.shardId !== null && shard.shardId === row.shardId
      ) ??
      input.executionEvidence.shardEvidence[index] ??
      input.executionEvidence
    );
  }
  return Object.freeze(
    input.componentTestRows.map((row, index) => {
      const evidence = evidenceForRow(row, index);
      const evidenceRefs =
        evidence?.reportRefs ??
        input.executionEvidence?.reportRefs ??
        Object.freeze([pathToFileURL(input.manifest.outputFile).href]);
      return Object.freeze({
        kind: "sdlc_component_test_qualification_row" as const,
        testClassId: row.testClassId,
        testcaseIds: row.testcaseIds,
        componentIds: row.componentIds,
        requirementIds: row.requirementIds,
        status: statusForEvidence(evidence),
        evidenceRefs
      });
    })
  );
}

function latestAdmittedTestExecutionSurfaceRegister(
  manifest: SdlcWorkerHandoffManifest
): SdlcTestExecutionSurfaceRegister | null {
  const operatorRunsRoot = join(
    manifest.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(manifest.workspaceRoot)
      .runtimeLayout.operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return null;
  }
  const reports: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  for (const runId of readdirSync(operatorRunsRoot)) {
    const filePath = join(operatorRunsRoot, runId, "worker_result_report.json");
    if (
      resolve(filePath) === resolve(manifest.reportFile) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      continue;
    }
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath,
        label: "PriorTestExecutionSurfaceReport"
      });
      if (record["targetAssetType"] === "test_execution_surface") {
        reports.push(Object.freeze({ filePath, mtimeMs: statSync(filePath).mtimeMs }));
      }
    } catch {
      continue;
    }
  }
  for (const report of reports.sort((left, right) => right.mtimeMs - left.mtimeMs)) {
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath: report.filePath,
        label: "PriorTestExecutionSurfaceReport"
      });
      const outputFile = parseNonEmptyString(
        record["outputFile"],
        "PriorTestExecutionSurfaceReport.outputFile"
      );
      const admission = admitTestExecutionSurfaceRegisterFromArtifact({
        targetAssetType: "test_execution_surface",
        outputFile
      });
      if (admission.status === "admitted") {
        return admission.register;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function testExecutionFrameworkRef(manifest: SdlcWorkerHandoffManifest): string {
  const testDesign = readAdmittedTestDesign(manifest);
  const profileRef = testDesign?.testStackProfileRows[0]?.frameworkRef;
  if (profileRef !== undefined && profileRef.length > 0) {
    return profileRef;
  }
  return "framework://declared-test-runner";
}

function workspaceRelativeExecutionDirectory(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workingDirectory: string;
}): string {
  const workspaceRoot = resolve(input.manifest.workspaceRoot);
  const workingDirectory = resolve(input.workingDirectory);
  if (pathIsInside(workingDirectory, workspaceRoot)) {
    return relative(workspaceRoot, workingDirectory).split(path.sep).join("/");
  }
  return input.workingDirectory;
}

function shardIdPart(input: string): string {
  const sanitized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return sanitized.length > 0 ? sanitized : "default";
}

function testExecutionPreparationRowsForManifest(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTestExecutionPreparationRow[] {
  const testDesign = readAdmittedTestDesign(manifest);
  const frameworkRef = testExecutionFrameworkRef(manifest);
  const fallbackRequirementIds: readonly string[] = Object.freeze([]);
  if (
    testDesign !== null &&
    testDesign.testExecutionScheduleRows.length > 0
  ) {
    return Object.freeze(
      testDesign.testExecutionScheduleRows.map(
        (schedule, index): SdlcTestExecutionPreparationRow => {
          const matchingTopologyRows = Object.freeze(
            testDesign.testComponentTopologyRows.filter((row) => {
              if (schedule.shardId !== null && row.shardId === schedule.shardId) {
                return true;
              }
              return row.testcaseIds.some((testcaseId) =>
                schedule.testCaseRefs.includes(testcaseId)
              );
            })
          );
          const sourceTestFileRefs = uniqueSorted(
            matchingTopologyRows.map((row) => `workspace://${row.relativePath}`)
          );
          const moduleName =
            testDesign.testModuleRows[index]?.moduleName ??
            testDesign.testModuleRows[0]?.moduleName ??
            manifest.productMaterialization.activeTenant;
          return Object.freeze({
            kind: "sdlc_test_execution_preparation_row" as const,
            scheduleRef: schedule.scheduleRef,
            moduleName,
            testClassId:
              matchingTopologyRows[0]?.testClassId ??
              `test-class://${manifest.productMaterialization.activeTenant}/${shardIdPart(
                schedule.shardId ?? schedule.scheduleRef
              )}`,
            testcaseIds: uniqueSorted([
              ...schedule.testCaseRefs,
              ...matchingTopologyRows.flatMap((row) => row.testcaseIds)
            ]),
            command: schedule.command,
            workingDirectory: manifest.productMaterialization.selectedOutputRoot,
            frameworkRef: schedule.frameworkRef,
            shardId: schedule.shardId,
            sourceTestFileRefs,
            requirementIds:
              matchingTopologyRows.length === 0
                ? fallbackRequirementIds
                : uniqueSorted(
                    matchingTopologyRows.flatMap((row) => row.requirementIds)
                  ),
            status: "prepared" as const,
            evidenceRefs: uniqueSorted([
              pathToFileURL(manifest.outputFile).href,
              schedule.scheduleRef,
              ...sourceTestFileRefs
            ])
          });
        }
      )
    );
  }
  const rowsFromShard = manifest.productMaterialization.executionShards
    .filter((shard) => shard.moduleName === "full-suite")
    .map(
    (shard): SdlcTestExecutionPreparationRow => {
      const testClassId =
        `test-class://${manifest.productMaterialization.activeTenant}/${shardIdPart(
          shard.moduleName
        )}`;
      return Object.freeze({
        kind: "sdlc_test_execution_preparation_row" as const,
        scheduleRef: `test-schedule://${manifest.productMaterialization.activeTenant}/declared-full-suite`,
        moduleName: shard.moduleName,
        testClassId,
        testcaseIds: Object.freeze([]),
        command: shard.command,
        workingDirectory: workspaceRelativeExecutionDirectory({
          manifest,
          workingDirectory: shard.workingDirectory
        }),
        frameworkRef,
        shardId: shard.shardId,
        sourceTestFileRefs: Object.freeze([]),
        requirementIds: fallbackRequirementIds,
        status: "prepared" as const,
        evidenceRefs: uniqueSorted([
          pathToFileURL(manifest.outputFile).href,
          ...shard.expectedReportRefs
        ])
      });
    }
  );
  if (rowsFromShard.length > 0) {
    return Object.freeze(rowsFromShard);
  }
  const command = manifest.productMaterialization.testExecutionContract.trim();
  return Object.freeze([
    Object.freeze({
      kind: "sdlc_test_execution_preparation_row" as const,
      scheduleRef: `test-schedule://${manifest.productMaterialization.activeTenant}/declared`,
      moduleName: manifest.productMaterialization.activeTenant,
      testClassId: `test-class://${manifest.productMaterialization.activeTenant}/declared`,
      testcaseIds: Object.freeze([]),
      command: command.length === 0 ? "undeclared" : command,
      workingDirectory: manifest.productMaterialization.selectedOutputRoot,
      frameworkRef,
      shardId: null,
      sourceTestFileRefs: Object.freeze([]),
      requirementIds: fallbackRequirementIds,
      status: command.length === 0 ? "blocked" as const : "prepared" as const,
      evidenceRefs: Object.freeze([pathToFileURL(manifest.outputFile).href])
    })
  ]);
}

function writeTestExecutionSurfaceProjection(
  manifest: SdlcWorkerHandoffManifest
): void {
  const preparationRows = testExecutionPreparationRowsForManifest(manifest);
  writeWorkspaceTargetJsonFile({
    filePath: manifest.outputFile,
    payload: Object.freeze({
      kind: "sdlc_test_execution_surface_register" as const,
      registerVersion: "ts-test-execution-v1" as const,
      targetAssetType: "test_execution_surface" as const,
      testExecutionPreparationRows: preparationRows,
      evidenceRefs: uniqueSorted([
        pathToFileURL(manifest.outputFile).href,
        ...preparationRows.flatMap((row) => row.evidenceRefs)
      ]),
      summary: "Framework-prepared test execution surface from declared shards."
    } satisfies SdlcTestExecutionSurfaceRegister)
  });
}

function writeTestRunArchiveProjection(
  manifest: SdlcWorkerHandoffManifest
): void {
  const executionResultReportRefs = latestExecutionResultReportRefs(manifest);
  const executionEvidenceLines = executionResultReportRefs.flatMap((ref) => {
    const readResult = readExecutionResultEvidenceFromReportRef(ref);
    if (readResult.executionEvidence === null) {
      return [`- ${ref} status=invalid detail=${readResult.error ?? "missing"}`];
    }
    const evidence = readResult.executionEvidence;
    return [
      [
        `- ${ref}`,
        `status=${evidence.status}`,
        `command=${evidence.command}`,
        `testsObserved=${evidence.testsObserved ?? "n/a"}`,
        `passed=${evidence.passedCount ?? "n/a"}`,
        `failed=${evidence.failedCount ?? "n/a"}`
      ].join(" ")
    ];
  });
  const content = [
    "# test_run_archive_surface",
    "",
    "source_function: consequence.edge_projection.writeTestRunArchiveProjection",
    "worker_dispatch_allowed: false",
    "",
    "Archived dependencies:",
    ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`),
    "",
    "Execution result report refs:",
    ...(executionResultReportRefs.length === 0
      ? ["- none"]
      : executionResultReportRefs.map((ref) => `- ${ref}`)),
    "",
    "Execution evidence:",
    ...(executionEvidenceLines.length === 0 ? ["- none"] : executionEvidenceLines),
    ""
  ].join("\n");
  writeWorkspaceTargetFile({
    filePath: manifest.outputFile,
    content
  });
}

function writeGenericDeclaredProjectionMarkdown(
  manifest: SdlcWorkerHandoffManifest
): void {
  const edgeAccountingRow = sdlcExecutiveEdgeAccountingRowFor(manifest.edgeName);
  if (edgeAccountingRow === null) {
    throw new TypeError(
      `missing edge accounting row for projection edge ${manifest.edgeName}`
    );
  }
  const content = [
    `# ${manifest.targetAssetType}`,
    "",
    `graph_function: ${manifest.graphFunctionName}`,
    `edge: ${manifest.edgeName}`,
    "source_function: consequence.edge_projection.writeDeclaredEdgeProjectionOutput",
    "worker_dispatch_allowed: false",
    `edge_accounting_disposition: ${edgeAccountingRow.disposition}`,
    `edge_accounting_rationale: ${edgeAccountingRow.rationale}`,
    "",
    "## Authority Outputs",
    "",
    ...edgeAccountingRow.authorityOutputRefs.map((ref) => `- ${ref}`),
    "",
    "## Closure Evidence",
    "",
    ...(edgeAccountingRow.closureEvidenceRefs.length === 0
      ? ["- projection/no-close"]
      : edgeAccountingRow.closureEvidenceRefs.map((ref) => `- ${ref}`)),
    "",
    "## Source Authority",
    "",
    ...manifest.traversalObligationContext.authorityRefs.map((ref) => `- ${ref}`),
    ""
  ].join("\n");
  writeWorkspaceTargetFile({
    filePath: manifest.outputFile,
    content
  });
}

function resolvePreparedExecutionWorkingDirectory(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workingDirectory: string;
}): string {
  if (isAbsolute(input.workingDirectory)) {
    return input.workingDirectory;
  }
  return resolve(input.manifest.workspaceRoot, input.workingDirectory);
}

function installedOperatorExecutionShards(
  manifest: SdlcWorkerHandoffManifest
): SdlcProductMaterializationContract["executionShards"] {
  if (manifest.targetAssetType !== "test_execution_result_surface") {
    return manifest.productMaterialization.executionShards;
  }
  const register = latestAdmittedTestExecutionSurfaceRegister(manifest);
  const preparedRows =
    register?.testExecutionPreparationRows.filter((row) => row.status === "prepared") ??
    Object.freeze([]);
  if (preparedRows.length === 0) {
    return manifest.productMaterialization.executionShards;
  }
  const runtimePolicy = sdlcOperatorRuntimePolicy();
  return Object.freeze(
    preparedRows.map((row, index) =>
      Object.freeze({
        kind: "sdlc_execution_shard" as const,
        shardId:
          row.shardId ??
          `test-shard-${String(index + 1).padStart(2, "0")}-${shardIdPart(row.moduleName)}`,
        lane: "test" as const,
        moduleName: row.moduleName,
        command: row.command,
        workingDirectory: resolvePreparedExecutionWorkingDirectory({
          manifest,
          workingDirectory: row.workingDirectory
        }),
        timeoutMs: runtimePolicy.executionShardTimeoutMs,
        inactivityTimeoutMs: runtimePolicy.executionShardInactivityTimeoutMs,
        expectedReportRefs: Object.freeze([row.scheduleRef]),
        allowedByproductGlobs: Object.freeze([]),
        requiredEvidenceKind: "sdlc_worker_execution_evidence" as const,
        retryPolicy: "same_shard_then_triage" as const
      })
    )
  );
}

function installedOperatorShardTimeoutMs(shardTimeoutMs: number): number {
  const runtimePolicy = sdlcOperatorRuntimePolicy();
  const minimumTimeoutMs = runtimePolicy.minimumOperatorTimeoutMs;
  const declaredTimeoutMs = Math.max(shardTimeoutMs, minimumTimeoutMs);
  if (runtimePolicy.installedOperatorShardTimeoutCapMs !== null) {
    return Math.max(
      minimumTimeoutMs,
      Math.min(declaredTimeoutMs, runtimePolicy.installedOperatorShardTimeoutCapMs)
    );
  }
  return declaredTimeoutMs;
}

const INSTALLED_OPERATOR_SHARD_RUNNER_SOURCE = `
const { spawn } = require("node:child_process");
const input = JSON.parse(process.argv[1]);
const child = spawn(input.command, {
  cwd: input.cwd,
  shell: true,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: input.env
});
let stdout = "";
let stderr = "";
let timedOut = false;
let settled = false;
function killGroup(signal) {
  try {
    process.kill(-child.pid, signal);
  } catch {}
}
function finish(result) {
  if (settled) return;
  settled = true;
  clearTimeout(timeoutTimer);
  clearTimeout(forceKillTimer);
  clearTimeout(forceFinishTimer);
  process.stdout.write(JSON.stringify({ ...result, stdout, stderr }));
}
const timeoutTimer = setTimeout(() => {
  timedOut = true;
  killGroup("SIGTERM");
}, input.timeoutMs);
const forceKillTimer = setTimeout(() => {
  if (timedOut) killGroup("SIGKILL");
}, input.timeoutMs + 1000);
const forceFinishTimer = setTimeout(() => {
  finish({ status: null, signal: "SIGKILL", error: "timeout", timedOut: true });
}, input.timeoutMs + 3000);
child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
child.on("error", (error) => {
  finish({ status: null, signal: null, error: error.message, timedOut });
});
child.on("close", (status, signal) => {
  finish({ status, signal, error: null, timedOut });
});
`;

function runInstalledOperatorShardCommand(input: {
  readonly command: string;
  readonly cwd: string;
  readonly timeoutMs: number;
}): {
  readonly status: number | null;
  readonly signal: string | null;
  readonly error: string | null;
  readonly timedOut: boolean;
  readonly stdout: string;
  readonly stderr: string;
} {
	const env = installedOperatorShardEnvironment(input.cwd);
  const result = executeSdlcProcessRunPlan(
    constructSdlcProcessRunPlan({
      command: process.execPath,
      args: Object.freeze([
        "-e",
        INSTALLED_OPERATOR_SHARD_RUNNER_SOURCE,
        JSON.stringify({
          command: input.command,
          cwd: input.cwd,
          timeoutMs: input.timeoutMs,
          env
        })
      ]),
      cwd: input.cwd,
      env,
      maxBufferBytes: 1024 * 1024 * 20,
      timeoutMs: input.timeoutMs + 5000
    })
  );
  const raw = result.stdout.trim();
  if (raw.length > 0) {
    try {
      const record = parseOpenRecord(JSON.parse(raw), "InstalledOperatorShardRun");
      return Object.freeze({
        status:
          typeof record["status"] === "number" ? record["status"] : null,
        signal:
          typeof record["signal"] === "string" ? record["signal"] : null,
        error:
          typeof record["error"] === "string" ? record["error"] : null,
        timedOut: record["timedOut"] === true,
        stdout: typeof record["stdout"] === "string" ? record["stdout"] : "",
        stderr: typeof record["stderr"] === "string" ? record["stderr"] : ""
      });
    } catch {
      // Fall through to the wrapper-level result below.
    }
  }
  return Object.freeze({
    status: result.status,
    signal: result.signal,
    error: result.errorMessage,
    timedOut: result.errorMessage === "spawnSync node ETIMEDOUT",
    stdout: result.stdout,
    stderr: result.stderr
  });
}

function installedOperatorShardEnvironment(workspaceRoot: string): Record<string, string> {
	const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== "string") {
      continue;
    }
    if (key === "NODE_TEST_CONTEXT") {
      continue;
    }
    env[key] = value;
  }
	return {
		...env,
		...sdlcWorkspaceLocalToolEnvironment(workspaceRoot)
	};
}

function aggregateShardExecutionEvidence(
  shardEvidence: readonly SdlcWorkerExecutionShardEvidence[]
): {
  readonly testsObserved: number;
  readonly passedCount: number;
  readonly failedCount: number;
} | null {
  let testsObserved = 0;
  let passedCount = 0;
  let failedCount = 0;
  for (const shard of shardEvidence) {
    if (
      shard.testsObserved === null ||
      shard.passedCount === null ||
      shard.failedCount === null
    ) {
      return null;
    }
    testsObserved += shard.testsObserved;
    passedCount += shard.passedCount;
    failedCount += shard.failedCount;
  }
  return Object.freeze({ testsObserved, passedCount, failedCount });
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

function writeTestExecutionResultProjection(
  manifest: SdlcWorkerHandoffManifest
): void {
  if (admittedTestExecutionResultOutput(manifest) !== null) {
    return;
  }
  const shards = installedOperatorExecutionShards(manifest);
  const reportRefs: string[] = [];
  const shardEvidence: SdlcWorkerExecutionShardEvidence[] = [];
  for (const shard of shards) {
    const result = runInstalledOperatorShardCommand({
      command: shard.command,
      cwd: shard.workingDirectory,
      timeoutMs: installedOperatorShardTimeoutMs(shard.timeoutMs)
    });
    const shardRoot = `installed_operator_execution/${sanitizedCarrierId(shard.shardId)}`;
    const stdoutPath = writeSdlcSystemArtifact({
      archiveRoot: manifest.archiveRoot,
      relativePath: `${shardRoot}.stdout.log`,
      payload: result.stdout ?? ""
    });
    const stderrPath = writeSdlcSystemArtifact({
      archiveRoot: manifest.archiveRoot,
      relativePath: `${shardRoot}.stderr.log`,
      payload: result.stderr ?? ""
    });
    const summaryPath = writeSdlcSystemArtifact({
      archiveRoot: manifest.archiveRoot,
      relativePath: `${shardRoot}.summary.json`,
      payload: {
        kind: "sdlc_installed_operator_execution_shard_summary",
        shardId: shard.shardId,
        command: shard.command,
        workingDirectory: shard.workingDirectory,
        status: result.status,
        signal: result.signal,
        error: result.error,
        timedOut: result.timedOut
      }
    });
    const refs = Object.freeze([
      pathToFileURL(summaryPath).href,
      pathToFileURL(stdoutPath).href,
      pathToFileURL(stderrPath).href
    ]);
    reportRefs.push(...refs);
    const status: SdlcWorkerExecutionShardEvidence["status"] =
      result.status === 0 ? "succeeded" : "failed";
    shardEvidence.push(
      Object.freeze({
        kind: "sdlc_worker_execution_shard_evidence" as const,
        shardId: shard.shardId,
        moduleName: shard.moduleName,
        lane: "test" as const,
        command: shard.command,
        status,
        reportRefs: refs,
        testsObserved: 1,
        passedCount: status === "succeeded" ? 1 : 0,
        failedCount: status === "succeeded" ? 0 : 1
      })
    );
  }
  const aggregate = aggregateShardExecutionEvidence(shardEvidence);
  const status: SdlcWorkerExecutionEvidence["status"] =
    shards.length === 0
      ? "pending"
      : shardEvidence.every((shard) => shard.status === "succeeded")
        ? "succeeded"
        : "failed";
  if (shards.length === 0) {
    const summaryPath = writeSdlcSystemArtifact({
      archiveRoot: manifest.archiveRoot,
      relativePath: "installed_operator_execution/pending.summary.json",
      payload: {
        kind: "sdlc_installed_operator_execution_summary",
        status: "pending",
        reason: "no declared execution shards"
      }
    });
    reportRefs.push(pathToFileURL(summaryPath).href);
  }
  const declaredCommand =
    declaredExecutionContract(manifest.productMaterialization.testExecutionContract)
      ? manifest.productMaterialization.testExecutionContract
      : shardEvidence.map((shard) => shard.command).join(" && ") || "undeclared";
  const executionEvidence: SdlcWorkerExecutionEvidence = Object.freeze({
    kind: "sdlc_worker_execution_evidence" as const,
    lane: "test" as const,
    command: declaredCommand,
    status,
    reportRefs: uniqueSorted(reportRefs),
    testsObserved: aggregate?.testsObserved ?? null,
    passedCount: aggregate?.passedCount ?? null,
    failedCount: aggregate?.failedCount ?? null,
    shardEvidence: Object.freeze(shardEvidence)
  });
  writeWorkspaceTargetJsonFile({
    filePath: manifest.outputFile,
    payload: executionEvidence
  });
}

export function admittedTestExecutionResultOutput(
  manifest: SdlcWorkerHandoffManifest
): SdlcWorkerExecutionEvidence | null {
  if (
    manifest.targetAssetType !== "test_execution_result_surface" ||
    !existsSync(manifest.outputFile) ||
    !statSync(manifest.outputFile).isFile()
  ) {
    return null;
  }
  try {
    return admitWorkerExecutionEvidence(
      JSON.parse(readFileSync(manifest.outputFile, "utf8")),
      "testExecutionResultOutput.executionEvidence"
    );
  } catch {
    return null;
  }
}

export function writeTestExecutionResultSystemTransformOutput(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): string | null {
  if (input.manifest.targetAssetType !== "test_execution_result_surface") {
    return null;
  }
  writeTestExecutionResultProjection(input.manifest);
  return input.manifest.outputFile;
}

function writeComponentDepthProjection(
  manifest: SdlcWorkerHandoffManifest
): void {
  const artifactRef = pathToFileURL(manifest.outputFile).href;
  if (manifest.targetAssetType === "component_realization_qualification_surface") {
    const componentCode = readAdmittedComponentDepthSurface({
      manifest,
      targetAssetType: "component_code_surface"
    });
    const implementationDesign = readAdmittedImplementationDesign(manifest);
    writeWorkspaceTargetJsonFile({
      filePath: manifest.outputFile,
      payload: Object.freeze({
        kind: "sdlc_component_depth_register" as const,
        registerVersion: "ts-component-depth-v1" as const,
        targetAssetType: manifest.targetAssetType,
        componentTopologyRows:
          componentCode?.componentTopologyRows ??
          implementationDesign?.componentTopologyRows ??
          Object.freeze([]),
        componentRealizationRows:
          componentCode?.componentRealizationRows ??
          implementationDesign?.componentRealizationRows ??
          Object.freeze([]),
        testComponentTopologyRows: Object.freeze([]),
        componentTestRows: Object.freeze([]),
        componentTestQualificationRows: Object.freeze([]),
        componentExecutionFailureRegister: null,
        componentRepairSchedule: null,
        releaseDepthParity: null
      } satisfies SdlcComponentDepthRegister)
    });
    return;
  }
  if (manifest.targetAssetType === "component_test_qualification_surface") {
    const componentTest = readAdmittedComponentDepthSurface({
      manifest,
      targetAssetType: "component_test_surface"
    });
    const componentTestRows = componentTest?.componentTestRows ?? Object.freeze([]);
    const executionEvidence = latestAdmittedExecutionEvidence(manifest);
    const failureRows = failureRowsForComponentTests({
      manifest,
      componentTestRows,
      executionEvidence
    });
    writeWorkspaceTargetJsonFile({
      filePath: manifest.outputFile,
      payload: Object.freeze({
        kind: "sdlc_component_depth_register" as const,
        registerVersion: "ts-component-depth-v1" as const,
        targetAssetType: manifest.targetAssetType,
        componentTopologyRows: Object.freeze([]),
        componentRealizationRows: Object.freeze([]),
        testComponentTopologyRows: Object.freeze([]),
        componentTestRows,
        componentTestQualificationRows: qualificationRowsForComponentTests({
          manifest,
          componentTestRows,
          executionEvidence
        }),
        componentExecutionFailureRegister:
          failureRows.length === 0
            ? null
            : Object.freeze({
                kind: "component_execution_failure_register" as const,
                registerVersion: "ts-component-depth-v1" as const,
                failureRows
              }),
        componentRepairSchedule: null,
        releaseDepthParity: null
      } satisfies SdlcComponentDepthRegister)
    });
    return;
  }
  if (manifest.targetAssetType === "release_depth_parity_surface") {
    const repairRegister = readAdmittedComponentDepthSurface({
      manifest,
      targetAssetType: "component_repair_schedule_surface"
    });
    const executionEvidence = latestAdmittedExecutionEvidence(manifest);
    const schedule = repairRegister?.componentRepairSchedule ?? null;
    const executionRetiresSchedule =
      schedule !== null &&
      executionEvidence?.status === "succeeded" &&
      (executionEvidence.failedCount ?? 0) === 0 &&
      (executionEvidence.testsObserved ?? 0) > 0;
    const effectiveSchedule = executionRetiresSchedule
      ? Object.freeze({
          kind: "sdlc_component_repair_schedule" as const,
          registerVersion: "ts-component-depth-v1" as const,
          scheduleStatus: "no_repair_required" as const,
          repairRows: Object.freeze([]),
          evidenceRefs: uniqueSorted([
            ...executionEvidence.reportRefs,
            ...schedule.evidenceRefs
          ])
        })
      : schedule;
    const blockingReasons =
      effectiveSchedule === null
        ? Object.freeze(["component_repair_schedule_missing"])
        : effectiveSchedule.scheduleStatus === "repair_required" ||
            effectiveSchedule.scheduleStatus === "triage_gap" ||
            effectiveSchedule.repairRows.length > 0
          ? Object.freeze(effectiveSchedule.repairRows.map((row) => row.failureId))
          : Object.freeze([]);
    writeWorkspaceTargetJsonFile({
      filePath: manifest.outputFile,
      payload: Object.freeze({
        kind: "sdlc_component_depth_register" as const,
        registerVersion: "ts-component-depth-v1" as const,
        targetAssetType: manifest.targetAssetType,
        componentTopologyRows: Object.freeze([]),
        componentRealizationRows: Object.freeze([]),
        testComponentTopologyRows: Object.freeze([]),
        componentTestRows: Object.freeze([]),
        componentTestQualificationRows: Object.freeze([]),
        componentExecutionFailureRegister: null,
        componentRepairSchedule: effectiveSchedule,
        releaseDepthParity: Object.freeze({
          kind: "sdlc_release_depth_parity_assessment" as const,
          status: blockingReasons.length === 0 ? "met" as const : "blocked" as const,
          summary:
            blockingReasons.length === 0
              ? "Release depth parity is met by admitted component repair evidence."
              : "Release depth parity is blocked by admitted component repair evidence.",
          blockingReasons,
          evidenceRefs: uniqueSorted([
            artifactRef,
            ...(executionEvidence?.reportRefs ?? []),
            ...(effectiveSchedule?.evidenceRefs ?? [])
          ])
        })
      } satisfies SdlcComponentDepthRegister)
    });
    return;
  }
  writeGenericDeclaredProjectionMarkdown(manifest);
}

export function writeDeclaredEdgeProjectionOutput(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): string | null {
  if (!sdlcInstalledOperatorProjectsOutput(input.manifest.targetAssetType)) {
    return null;
  }
  if (input.manifest.targetAssetType === "test_execution_surface") {
    writeTestExecutionSurfaceProjection(input.manifest);
  } else if (input.manifest.targetAssetType === "test_run_archive_surface") {
    writeTestRunArchiveProjection(input.manifest);
  } else if (input.manifest.targetAssetType === "test_execution_result_surface") {
    writeTestExecutionResultProjection(input.manifest);
  } else {
    writeComponentDepthProjection(input.manifest);
  }
  return input.manifest.outputFile;
}
