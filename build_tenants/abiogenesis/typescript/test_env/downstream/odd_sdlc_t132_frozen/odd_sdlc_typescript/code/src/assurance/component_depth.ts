// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: T-113

import { existsSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { admitComponentDepthRegisterFromArtifact } from "../operator/component_depth_register.js";
import { FG_MATERIALIZE_DECLARED_PRODUCT_ASSET } from "../graph/index.js";
import type {
  SdlcComponentDepthRegister,
  SdlcComponentDepthRegisterAdmission,
  SdlcComponentExecutionFailureRegister,
  SdlcComponentRepairSchedule,
  SdlcComponentRealizationRow,
  SdlcComponentTestQualificationRow,
  SdlcComponentTestRealizationRow,
  SdlcMaterializedProductFileRole,
  SdlcTestComponentTopologyRow,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../operator/carriers.js";
import {
  assuranceLedger,
  assuranceReason,
  uniqueSorted,
  verdictFromReasons
} from "./shared.js";
import { deriveSdlcConformProjectProfileFromWorkspace } from "../workspace/index.js";
import type {
  SdlcAssuranceLedger,
  SdlcAssuranceLedgerReason
} from "./carriers.js";

interface ComponentDepthContract {
  readonly targetAssetType: string;
  readonly requiredMaterializedRole: SdlcMaterializedProductFileRole | null;
}

const COMPONENT_DEPTH_CONTRACTS = Object.freeze([
  {
    targetAssetType: "component_code_surface",
    requiredMaterializedRole: "source"
  },
  {
    targetAssetType: "component_realization_qualification_surface",
    requiredMaterializedRole: null
  },
  {
    targetAssetType: "component_test_surface",
    requiredMaterializedRole: "test"
  },
  {
    targetAssetType: "uat_test_source_surface",
    requiredMaterializedRole: "test"
  },
  {
    targetAssetType: "component_test_qualification_surface",
    requiredMaterializedRole: null
  },
  {
    targetAssetType: "component_repair_schedule_surface",
    requiredMaterializedRole: null
  },
  {
    targetAssetType: "release_depth_parity_surface",
    requiredMaterializedRole: null
  }
] as const satisfies readonly ComponentDepthContract[]);

export function componentDepthContractForTarget(
  targetAssetType: string
): ComponentDepthContract | null {
  return (
    COMPONENT_DEPTH_CONTRACTS.find(
      (contract) => contract.targetAssetType === targetAssetType
    ) ?? null
  );
}

function pathSetForRole(input: {
  readonly report: SdlcWorkerResultReport;
  readonly role: SdlcMaterializedProductFileRole;
}): ReadonlySet<string> {
  return new Set(
    input.report.materializedFiles
      .filter((file) => file.role === input.role && file.byteCount > 0)
      .map((file) => file.relativePath)
  );
}

function normalizePortablePath(value: string): string {
  return value.split(/[\\/]+/u).filter((part) => part.length > 0).join("/");
}

function tenantRelativeProductPath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): string {
  const normalized = normalizePortablePath(input.relativePath);
  const selectedOutputRoot = normalizePortablePath(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  if (normalized === selectedOutputRoot) {
    return "";
  }
  if (normalized.startsWith(`${selectedOutputRoot}/`)) {
    return normalized.slice(selectedOutputRoot.length + 1);
  }
  return normalized;
}

function materializedPathSet(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): ReadonlySet<string> {
  const selectedOutputRoot = normalizePortablePath(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const paths = new Set<string>();
  for (const file of input.report.materializedFiles) {
    if (file.byteCount <= 0) {
      continue;
    }
    const tenantRelativePath = normalizePortablePath(file.relativePath);
    paths.add(tenantRelativePath);
    paths.add(`${selectedOutputRoot}/${tenantRelativePath}`);
  }
  return paths;
}

function materializedPathSetForRole(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly role: SdlcMaterializedProductFileRole;
}): ReadonlySet<string> {
  const selectedOutputRoot = normalizePortablePath(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const paths = new Set<string>();
  for (const file of input.report.materializedFiles) {
    if (file.role !== input.role || file.byteCount <= 0) {
      continue;
    }
    const tenantRelativePath = normalizePortablePath(file.relativePath);
    paths.add(tenantRelativePath);
    paths.add(`${selectedOutputRoot}/${tenantRelativePath}`);
  }
  return paths;
}

function existingProductFileForRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): boolean {
  const tenantRoot = resolve(input.manifest.productMaterialization.tenantRoot);
  const tenantRelativePath = tenantRelativeProductPath(input);
  if (tenantRelativePath.length === 0) {
    return false;
  }
  const absolutePath = resolve(tenantRoot, tenantRelativePath);
  const relativeToRoot = relative(tenantRoot, absolutePath);
  if (
    relativeToRoot === "" ||
    relativeToRoot.startsWith("..") ||
    isAbsolute(relativeToRoot)
  ) {
    return false;
  }
  if (!existsSync(absolutePath)) {
    return false;
  }
  const fileStat = statSync(absolutePath);
  return fileStat.isFile() && fileStat.size > 0;
}

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return uniqueSorted([...duplicates]);
}

function reason(input: {
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly lawfulReentryPoint?: "same_edge_retry" | "repair_worker_output" | "requirement_reprice" | "design_reframe" | "operator_blocked";
}): SdlcAssuranceLedgerReason {
  return assuranceReason({
    code: input.code,
    message: input.message,
    evidenceRefs: input.evidenceRefs,
    lawfulReentryPoint: input.lawfulReentryPoint ?? "repair_worker_output"
  });
}

function componentDepthAdmissionReentryPoint(
  blockingReason: string
): "repair_worker_output" | "operator_blocked" {
  return blockingReason === "component_depth_output_missing"
    ? "operator_blocked"
    : "repair_worker_output";
}

function admissionReasons(
  admission: SdlcComponentDepthRegisterAdmission
): readonly SdlcAssuranceLedgerReason[] {
  if (admission.status === "admitted" || admission.status === "not_required") {
    return Object.freeze([]);
  }
  return Object.freeze(
    admission.blockingReasons.map((blockingReason) =>
      reason({
        code: blockingReason,
        message: `Component-depth register admission rejected: ${blockingReason}`,
        evidenceRefs: admission.evidenceRefs,
        lawfulReentryPoint: componentDepthAdmissionReentryPoint(blockingReason)
      })
    )
  );
}

function requiredMaterializationReasons(input: {
  readonly report: SdlcWorkerResultReport;
  readonly contract: ComponentDepthContract;
}): readonly SdlcAssuranceLedgerReason[] {
  if (input.contract.requiredMaterializedRole === null) {
    return Object.freeze([]);
  }
  const role = input.contract.requiredMaterializedRole;
  if (pathSetForRole({ report: input.report, role }).size > 0) {
    return Object.freeze([]);
  }
  return Object.freeze([
    reason({
      code: `component_depth_materialized_file_missing:${input.contract.targetAssetType}:${role}`,
      message: `Component-depth surface ${input.contract.targetAssetType} did not materialize a non-empty ${role} file.`,
      evidenceRefs: [pathToFileURL(input.report.outputFile).href]
    })
  ]);
}

function componentRealizationReasons(input: {
  readonly rows: readonly SdlcComponentRealizationRow[];
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const materializedPaths = materializedPathSet({
    manifest: input.manifest,
    report: input.report
  });
  const duplicatePaths = duplicateValues(input.rows.map((row) => row.relativePath));
  return Object.freeze([
    ...componentRealizationMetadataReasons(input),
    ...input.rows
      .filter(
        (row) =>
          !materializedPaths.has(normalizePortablePath(row.relativePath)) &&
          !existingProductFileForRelativePath({
            manifest: input.manifest,
            relativePath: row.relativePath
          })
      )
      .map((row) =>
        reason({
          code: `component_declared_path_not_materialized:${row.relativePath}`,
          message: `Component ${row.componentId} declared product path ${row.relativePath}, but it was not materialized as a non-empty product file.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...duplicatePaths.flatMap((relativePath) =>
      input.rows
        .filter((row) => row.relativePath === relativePath)
        .map((row) =>
          reason({
            code: `component_collapsed_into_unowned_file:${row.componentId}`,
            message: `Component ${row.componentId} shares realized path ${relativePath}; collapsed realization needs an explicit typed deferral carrier.`,
            evidenceRefs: input.evidenceRefs
          })
        )
    )
  ]);
}

function componentRealizationMetadataReasons(input: {
  readonly rows: readonly SdlcComponentRealizationRow[];
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze([
    ...duplicateValues(input.rows.map((row) => row.componentId)).map((componentId) =>
      reason({
        code: `component_realization_duplicate_component:${componentId}`,
        message: `Component realization declares duplicate componentId ${componentId}.`,
        evidenceRefs: input.evidenceRefs
      })
    ),
    ...input.rows
      .filter((row) => row.requirementIds.length === 0)
      .map((row) =>
        reason({
          code: `component_requirement_allocation_missing:${row.componentId}`,
          message: `Component realization ${row.componentId} has no requirement allocation.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.rows
      .filter((row) => row.sourceAssetRefs.length === 0)
      .map((row) =>
        reason({
          code: `component_source_asset_refs_missing:${row.componentId}`,
          message: `Component realization ${row.componentId} has no source asset refs.`,
          evidenceRefs: input.evidenceRefs
        })
      )
  ]);
}

function testTopologyReasons(input: {
  readonly rows: readonly SdlcTestComponentTopologyRow[];
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze([
    ...duplicateValues(input.rows.map((row) => row.testClassId)).map((testClassId) =>
      reason({
        code: `test_component_topology_duplicate_test_class:${testClassId}`,
        message: `Test component topology declares duplicate testClassId ${testClassId}.`,
        evidenceRefs: input.evidenceRefs
      })
    ),
    ...input.rows
      .filter((row) => row.testcaseIds.length === 0)
      .map((row) =>
        reason({
          code: `testcase_allocation_missing:${row.testClassId}`,
          message: `Test class ${row.testClassId} has no testcase allocation.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.rows
      .filter((row) => row.componentIds.length === 0)
      .map((row) =>
        reason({
          code: `test_class_component_mapping_missing:${row.testClassId}`,
          message: `Test class ${row.testClassId} has no component mapping.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.rows
      .filter((row) => row.requirementIds.length === 0)
      .map((row) =>
        reason({
          code: `test_class_requirement_mapping_missing:${row.testClassId}`,
          message: `Test class ${row.testClassId} has no requirement mapping.`,
          evidenceRefs: input.evidenceRefs
        })
      )
  ]);
}

function componentTestReasons(input: {
  readonly rows: readonly SdlcComponentTestRealizationRow[];
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const testPaths = materializedPathSetForRole({
    manifest: input.manifest,
    report: input.report,
    role: "test"
  });
  const duplicatePaths = duplicateValues(input.rows.map((row) => row.relativePath));
  return Object.freeze([
    ...input.rows
      .filter((row) => !testPaths.has(normalizePortablePath(row.relativePath)))
      .map((row) =>
        reason({
          code: `test_class_missing_file:${row.testClassId}`,
          message: `Test class ${row.testClassId} declared test path ${row.relativePath}, but it was not materialized as a test file.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...testTopologyReasons({
      rows: input.rows.map((row) =>
        Object.freeze({
          kind: "sdlc_test_component_topology_row" as const,
          testClassId: row.testClassId,
          relativePath: row.relativePath,
          testcaseIds: row.testcaseIds,
          componentIds: row.componentIds,
          requirementIds: row.requirementIds,
          shardId: row.shardId
        })
      ),
      evidenceRefs: input.evidenceRefs
    }),
    ...duplicatePaths.flatMap((relativePath) =>
      input.rows
        .filter((row) => row.relativePath === relativePath)
        .map((row) =>
          reason({
            code: `test_class_collapsed_into_unowned_file:${row.testClassId}`,
            message: `Test class ${row.testClassId} shares realized path ${relativePath}; collapsed test realization needs an explicit typed deferral carrier.`,
            evidenceRefs: input.evidenceRefs
          })
        )
    )
  ]);
}

function componentTestQualificationReasons(input: {
  readonly rows: readonly SdlcComponentTestQualificationRow[];
  readonly failureRegister: SdlcComponentExecutionFailureRegister | null;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const failureRows = input.failureRegister?.failureRows ?? [];
  function matchingFailure(row: SdlcComponentTestQualificationRow): boolean {
    return failureRows.some(
      (failure) =>
        failure.testClassId === row.testClassId &&
        row.testcaseIds.some((testcaseId) => failure.testcaseIds.includes(testcaseId)) &&
        row.componentIds.some((componentId) => failure.componentIds.includes(componentId)) &&
        row.requirementIds.some((requirementId) => failure.requirementIds.includes(requirementId))
    );
  }
  return Object.freeze(
    input.rows.flatMap((row) => [
      ...(row.evidenceRefs.length === 0
        ? [
            reason({
              code: `execution_test_class_unproven:${row.testClassId}`,
              message: `Test class ${row.testClassId} has no execution evidence refs.`,
              evidenceRefs: input.evidenceRefs
            })
          ]
        : []),
      ...(row.status === "pending" || row.status === "unproven"
        ? [
            reason({
              code: `execution_test_class_unproven:${row.testClassId}`,
              message: `Test class ${row.testClassId} execution status is ${row.status}.`,
              evidenceRefs: uniqueSorted([...input.evidenceRefs, ...row.evidenceRefs])
            })
          ]
        : []),
      ...(row.status === "blocked" && failureRows.length === 0
        ? [
            reason({
              code: `execution_test_class_blocked_without_failure:${row.testClassId}`,
              message: `Blocked test class ${row.testClassId} has no admitted component execution failure row to drive repair.`,
              evidenceRefs: uniqueSorted([...input.evidenceRefs, ...row.evidenceRefs]),
              lawfulReentryPoint: "repair_worker_output"
            })
          ]
        : []),
      ...(row.status === "failed" && !matchingFailure(row)
        ? [
            reason({
              code: `component_execution_failure_unattributed:${row.testClassId}`,
              message: `Failed test class ${row.testClassId} has no admitted component execution failure row.`,
              evidenceRefs: uniqueSorted([...input.evidenceRefs, ...row.evidenceRefs]),
              lawfulReentryPoint: "repair_worker_output"
            })
          ]
        : []),
      ...(row.status === "failed" &&
      failureRows.some(
        (failure) =>
          failure.testClassId === row.testClassId &&
          failure.attributionConfidence === "low"
      )
        ? [
            reason({
              code: `component_execution_failure_low_confidence:${row.testClassId}`,
              message: `Failed test class ${row.testClassId} only has low-confidence attribution; repair requires stronger attribution evidence.`,
              evidenceRefs: uniqueSorted([...input.evidenceRefs, ...row.evidenceRefs]),
              lawfulReentryPoint: "repair_worker_output"
            })
          ]
        : []),
      ...row.testcaseIds.flatMap((testcaseId) =>
        row.evidenceRefs.length === 0
          ? [
              reason({
                code: `execution_testcase_unproven:${testcaseId}`,
                message: `Testcase ${testcaseId} has no execution evidence refs.`,
                evidenceRefs: input.evidenceRefs
              })
            ]
          : []
      ),
      ...row.componentIds.flatMap((componentId) =>
        row.evidenceRefs.length === 0
          ? [
              reason({
                code: `execution_component_coverage_unproven:${componentId}`,
                message: `Component ${componentId} has no execution evidence refs.`,
                evidenceRefs: input.evidenceRefs
              })
            ]
          : []
      )
    ])
  );
}

function componentRepairScheduleReasons(input: {
  readonly schedule: SdlcComponentRepairSchedule | null;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const schedule = input.schedule;
  if (schedule === null) {
    return Object.freeze([
      reason({
        code: "component_repair_schedule_missing",
        message: "Component repair schedule surface did not carry a typed repair schedule.",
        evidenceRefs: input.evidenceRefs,
        lawfulReentryPoint: "repair_worker_output"
      })
    ]);
  }
  const scheduleRefs = uniqueSorted([...input.evidenceRefs, ...schedule.evidenceRefs]);
  return Object.freeze([
    ...(schedule.scheduleStatus === "no_repair_required" && schedule.repairRows.length > 0
      ? [
            reason({
              code: "component_repair_schedule_contradiction:no_repair_required_with_rows",
              message: "Repair schedule says no repair is required but carries repair rows.",
              evidenceRefs: scheduleRefs,
              lawfulReentryPoint: "repair_worker_output"
            })
        ]
      : []),
    ...(schedule.scheduleStatus === "repair_required" && schedule.repairRows.length === 0
      ? [
            reason({
              code: "component_repair_schedule_rows_missing",
              message: "Repair schedule says repair is required but carries no repair rows.",
              evidenceRefs: scheduleRefs,
              lawfulReentryPoint: "repair_worker_output"
            })
        ]
      : []),
    ...(schedule.scheduleStatus === "triage_gap"
      ? [
          reason({
            code: "component_repair_schedule_triage_gap",
            message:
              "Repair schedule stopped at triage_gap; repair worker output must supply a typed schedule or upstream repricing evidence before code/test mutation.",
            evidenceRefs: scheduleRefs,
            lawfulReentryPoint: "repair_worker_output"
          })
        ]
      : []),
    ...schedule.repairRows.flatMap((row) => [
      ...(row.componentIds.length === 0 ||
      row.testcaseIds.length === 0 ||
      row.requirementIds.length === 0
        ? [
            reason({
              code: `component_repair_schedule_unbound:${row.scheduleId}`,
              message: `Repair schedule row ${row.scheduleId} does not bind testcaseId + componentId + requirementId.`,
              evidenceRefs: uniqueSorted([...scheduleRefs, ...row.evidenceRefs]),
              lawfulReentryPoint: "repair_worker_output"
            })
          ]
        : []),
      ...(row.attributionConfidence !== "high"
        ? [
            reason({
              code: `component_repair_schedule_not_high_confidence:${row.scheduleId}`,
              message: `Repair schedule row ${row.scheduleId} is ${row.attributionConfidence}; automatic repair requires high confidence.`,
              evidenceRefs: uniqueSorted([...scheduleRefs, ...row.evidenceRefs]),
              lawfulReentryPoint: "repair_worker_output"
            })
          ]
        : [])
    ])
  ]);
}

function latestAdmittedComponentRepairSchedule(input: {
  readonly workspaceRoot: string;
}): { readonly schedule: SdlcComponentRepairSchedule; readonly evidenceRefs: readonly string[] } | null {
  const profile = deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot);
  const assetsRoot = join(
    input.workspaceRoot,
    profile.runtimeLayout.transformAssetRoot
  );
  const candidates: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  const pushCandidate = (filePath: string): void => {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      candidates.push(
        Object.freeze({
          filePath,
          mtimeMs: statSync(filePath).mtimeMs
        })
      );
    }
  };
  pushCandidate(
    join(
      input.workspaceRoot,
      profile.selectedOutputRoot,
      "design",
      "component_repair_schedule_surface.md"
    )
  );
  if (existsSync(assetsRoot) && statSync(assetsRoot).isDirectory()) {
    for (const runId of readdirSync(assetsRoot)) {
      pushCandidate(join(assetsRoot, runId, "component_repair_schedule_surface.md"));
    }
  }
  for (const candidate of candidates.sort((left, right) => right.mtimeMs - left.mtimeMs)) {
    const admission = admitComponentDepthRegisterFromArtifact({
      targetAssetType: "component_repair_schedule_surface",
      outputFile: candidate.filePath
    });
    if (
      admission.status === "admitted" &&
      admission.register !== null &&
      admission.register.componentRepairSchedule !== null
    ) {
      return Object.freeze({
        schedule: admission.register.componentRepairSchedule,
        evidenceRefs: uniqueSorted([candidate.filePath, ...admission.evidenceRefs])
      });
    }
  }
  return null;
}

function releaseDepthParityReasons(input: {
  readonly register: SdlcComponentDepthRegister;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const parity = input.register.releaseDepthParity;
  const sourceSchedule =
    input.register.componentRepairSchedule === null && parity?.status !== "met"
      ? latestAdmittedComponentRepairSchedule({
          workspaceRoot: input.manifest.workspaceRoot
        })
      : null;
  const schedule = input.register.componentRepairSchedule ?? sourceSchedule?.schedule ?? null;
  const scheduleEvidenceRefs = sourceSchedule?.evidenceRefs ?? Object.freeze([]);
  const repairScheduleReasons =
    schedule?.scheduleStatus === "repair_required" && schedule.repairRows.length > 0
      ? schedule.repairRows.map((row) =>
          reason({
            code: `component_repair_row_open:${row.failureId}`,
            message: `Repair row ${row.scheduleId} remains open for failure ${row.failureId}.`,
            evidenceRefs: uniqueSorted([
              ...input.evidenceRefs,
              ...scheduleEvidenceRefs,
              ...row.evidenceRefs
            ])
          })
        )
      : [];
  if (parity === null || parity.status === "met") {
    return Object.freeze(repairScheduleReasons);
  }
  return Object.freeze([
    ...repairScheduleReasons,
    reason({
      code: `release_depth_parity_${parity.status}`,
      message: `Release depth parity is ${parity.status}: ${parity.summary}`,
      evidenceRefs: uniqueSorted([...input.evidenceRefs, ...parity.evidenceRefs]),
      lawfulReentryPoint:
        parity.status === "repriced" ? "design_reframe" : "repair_worker_output"
    }),
    ...parity.blockingReasons.map((blockingReason) =>
      reason({
        code: `release_depth_parity_reason:${blockingReason}`,
        message: `Release depth parity blocker: ${blockingReason}`,
        evidenceRefs: uniqueSorted([...input.evidenceRefs, ...parity.evidenceRefs]),
        lawfulReentryPoint:
          parity.status === "repriced" ? "design_reframe" : "repair_worker_output"
      })
    )
  ]);
}

function comparisonReasons(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly register: SdlcComponentDepthRegister;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  switch (input.manifest.targetAssetType) {
    case "component_realization_qualification_surface":
      return componentRealizationMetadataReasons({
        rows: input.register.componentRealizationRows,
        evidenceRefs: input.evidenceRefs
      });
    case "component_code_surface":
      return componentRealizationReasons({
        rows: input.register.componentRealizationRows,
        manifest: input.manifest,
        report: input.report,
        evidenceRefs: input.evidenceRefs
      });
    case "component_test_surface":
    case "uat_test_source_surface":
      return componentTestReasons({
        rows: input.register.componentTestRows,
        manifest: input.manifest,
        report: input.report,
        evidenceRefs: input.evidenceRefs
      });
    case "component_test_qualification_surface":
      return componentTestQualificationReasons({
        rows: input.register.componentTestQualificationRows,
        failureRegister: input.register.componentExecutionFailureRegister,
        evidenceRefs: input.evidenceRefs
      });
    case "component_repair_schedule_surface":
      return componentRepairScheduleReasons({
        schedule: input.register.componentRepairSchedule,
        evidenceRefs: input.evidenceRefs
      });
    case "release_depth_parity_surface":
      return releaseDepthParityReasons({
        register: input.register,
        manifest: input.manifest,
        evidenceRefs: input.evidenceRefs
      });
    default:
      return Object.freeze([]);
  }
}

export function deriveComponentDepthAssuranceLedger(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcAssuranceLedger | null {
  if (input.manifest.graphFunctionName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET) {
    return null;
  }
  const contract = componentDepthContractForTarget(input.manifest.targetAssetType);
  if (contract === null) {
    return null;
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.report.outputFile
  });
  const evidenceRefs = uniqueSorted([
    ...admission.evidenceRefs,
    input.report.outputFile,
    ...input.report.materializedFiles.map((file) => file.absolutePath)
  ]);
  const candidateReasons = [
    ...admissionReasons(admission),
    ...requiredMaterializationReasons({
      report: input.report,
      contract
    }),
    ...(admission.status === "admitted" && admission.register !== null
      ? comparisonReasons({
          manifest: input.manifest,
          report: input.report,
          register: admission.register,
          evidenceRefs
        })
      : [])
  ];
  const reasons = uniqueSorted(candidateReasons.map((item) => item.code)).map((code) => {
    const matching = candidateReasons.find((item) => item.code === code);
    if (matching === undefined) {
      throw new Error(`component depth reason disappeared: ${code}`);
    }
    return matching;
  });
  const repriceReasonCodes = reasons
    .filter((item) => item.lawfulReentryPoint === "design_reframe")
    .map((item) => item.code);
  const blockedReasonCodes = reasons
    .filter((item) => item.lawfulReentryPoint === "operator_blocked")
    .map((item) => item.code);
  const openGapReasonCodes = reasons
    .filter(
      (item) =>
        item.lawfulReentryPoint !== "design_reframe" &&
        item.lawfulReentryPoint !== "operator_blocked"
    )
    .map((item) => item.code);
  return assuranceLedger({
    dimension: "component_depth",
    verdict: verdictFromReasons({
      blockedReasonCodes,
      openGapReasonCodes,
      repriceReasonCodes
    }),
    required: true,
    reasons,
    evidenceRefs,
    carryForwardObligationRefs: reasons.map((item) => item.code)
  });
}
