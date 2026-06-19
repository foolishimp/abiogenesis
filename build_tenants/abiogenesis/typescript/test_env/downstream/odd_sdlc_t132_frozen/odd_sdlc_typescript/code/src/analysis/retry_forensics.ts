// Implements: T-161

import path from "node:path";

import { operatorRunRef } from "./archive_reader.js";
import type { OperatorRunCarriers } from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";
import type {
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisRetryCauseClass,
  SdlcFdRunAnalysisRetryForensic
} from "./types.js";

function classifyCause(input: {
  readonly blockingReasonCodes: readonly string[];
  readonly closureDisposition: string | null;
  readonly outsideWorkspaceReadCount: number;
  readonly schemaViolationCount: number;
  readonly targetCarrierAdmissionStatus: string | null;
}): SdlcFdRunAnalysisRetryCauseClass {
  const codes = input.blockingReasonCodes;
  if (input.outsideWorkspaceReadCount > 0) {
    return "worker_policy_violation";
  }
  if (
    codes.some((code) =>
      code === "worker_authority_read_outside_workspace" ||
      code === "worker_report_admission_failed"
    )
  ) {
    return "worker_policy_violation";
  }
  if (
    codes.some((code) =>
      code.startsWith("component_depth_register_invalid") ||
      code.startsWith("design_depth_register_invalid") ||
      code.startsWith("test_design_register_invalid") ||
      code.startsWith("target_carrier_contract_invalid")
    )
  ) {
    return "framework_carrier_parser_drift";
  }
  if (
    codes.some((code) =>
      code.startsWith("output_") ||
      code.startsWith("adr_output_") ||
      code === "context_expected_files_not_materialization_authority"
    )
  ) {
    return "prompt_schema_gap";
  }
  if (
    codes.some((code) =>
      code === "obligation_payload_insufficient" ||
      code === "obligation_unassessed" ||
      code === "obligation_status_unassessed" ||
      code === "obligation_blocked_without_evidence"
    )
  ) {
    return "deterministic_evaluator_bug";
  }
  if (
    codes.some((code) =>
      code === "worker_process_failed" ||
      code === "worker_connection_failed" ||
      code === "worker_hard_timeout" ||
      code === "worker_lost_terminal" ||
      code === "silent_worker_inactivity" ||
      code === "worker_output_limit_exceeded" ||
      code === "worker_rate_limited"
    )
  ) {
    return "runtime_bug";
  }
  if (
    codes.some((code) =>
      code === "install_failed" ||
      code === "abg_install_rejected" ||
      code === "command_binding_missing"
    )
  ) {
    return "harness_bug";
  }
  if (
    codes.some((code) =>
      code === "stale_query_domain" ||
      code === "project_conformance_gaps" ||
      code === "project_conformance_blocked"
    )
  ) {
    return "tenant_source_defect";
  }
  if (
    input.closureDisposition === "block" &&
    input.targetCarrierAdmissionStatus === "missing"
  ) {
    return "target_carrier_admission_missing";
  }
  return "unknown";
}

function targetCarrierAdmissionStatus(carriers: OperatorRunCarriers): string | null {
  if (carriers.edgeFulfillmentLedger.status !== "present") {
    return null;
  }
  const status = carriers.edgeFulfillmentLedger.data.targetCarrierAdmissionStatus;
  return typeof status === "string" ? status : null;
}

function outsideWorkspaceReadCount(carriers: OperatorRunCarriers): number {
  if (carriers.postflight.status !== "present") {
    return 0;
  }
  const reasons = carriers.postflight.data.blockingReasonCarriers ?? [];
  let count = 0;
  for (const reason of reasons) {
    if (
      typeof reason === "object" &&
      reason !== null &&
      !Array.isArray(reason) &&
      Reflect.get(reason, "code") === "worker_authority_read_outside_workspace"
    ) {
      count += 1;
    }
  }
  return count;
}

function schemaViolationCount(carriers: OperatorRunCarriers): number {
  if (carriers.postflight.status !== "present") {
    return 0;
  }
  const reasons = carriers.postflight.data.blockingReasonCarriers ?? [];
  let count = 0;
  for (const reason of reasons) {
    if (typeof reason !== "object" || reason === null || Array.isArray(reason)) {
      continue;
    }
    const codeValue: unknown = Reflect.get(reason, "code");
    if (typeof codeValue !== "string") {
      continue;
    }
    if (
      codeValue.startsWith("output_") ||
      codeValue.startsWith("adr_output_") ||
      codeValue.startsWith("materialized_product_") ||
      codeValue.startsWith("component_depth_register_invalid") ||
      codeValue.startsWith("design_depth_register_invalid") ||
      codeValue.startsWith("test_design_register_invalid") ||
      codeValue.startsWith("target_carrier_contract_invalid") ||
      codeValue === "context_expected_files_not_materialization_authority"
    ) {
      count += 1;
    }
  }
  return count;
}

export function deriveRetryForensics(input: {
  readonly carriers: readonly OperatorRunCarriers[];
  readonly attempts: readonly SdlcFdRunAnalysisEdgeAttempt[];
}): {
  readonly forensics: readonly SdlcFdRunAnalysisRetryForensic[];
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  const forensics: SdlcFdRunAnalysisRetryForensic[] = [];
  const diagnostics: DiagnosticDraft[] = [];
  let previousAttempt: SdlcFdRunAnalysisEdgeAttempt | null = null;
  for (let index = 0; index < input.attempts.length; index += 1) {
    const attempt = input.attempts[index];
    const carriers = input.carriers[index];
    if (attempt === undefined || carriers === undefined) {
      continue;
    }
    const disposition = attempt.closureDisposition;
    const isRetry = disposition === "retry" || disposition === "repair";
    const isBlocked =
      attempt.postflightStatus === "blocked" ||
      attempt.blockingReasonCodes.length > 0;
    const isAbortedShape =
      carriers.postflight.status === "missing" &&
      carriers.workerRun.status === "missing";
    const operatorRunRefValue = operatorRunRef(carriers.operatorRunRoot);
    if (isAbortedShape) {
      diagnostics.push({
        code: "aborted_run_observed",
        severity: "warn",
        detail: `${operatorRunRefValue} ended without postflight or worker_run`,
        evidenceRefs: Object.freeze([operatorRunRefValue]),
        operatorRunRef: operatorRunRefValue,
        edgeName: attempt.graphFunctionName
      });
    }
    if (isRetry || isBlocked || disposition === "block") {
      const outsideReadCount = outsideWorkspaceReadCount(carriers);
      const schemaCount = schemaViolationCount(carriers);
      const forensic: SdlcFdRunAnalysisRetryForensic = Object.freeze({
        edgeName: attempt.graphFunctionName ?? "unknown_edge",
        attemptRef: operatorRunRefValue,
        predecessorAttemptRef: previousAttempt
          ? previousAttempt.operatorRunRef
          : null,
        workerSecondsBefore:
          attempt.workerElapsedMs === null
            ? null
            : Math.round((attempt.workerElapsedMs / 1_000) * 100) / 100,
        blockingReasonCodes: attempt.blockingReasonCodes,
        changedFiles: Object.freeze([]),
        productFilesObserved: Object.freeze([
          ...attempt.productFilesWritten,
          ...attempt.productFilesReplayed
        ]),
        productFilesMaterialized: attempt.productFilesWritten,
        productFilesReplayed: attempt.productFilesReplayed,
        lineageStatus:
          attempt.productLineageCount > 0
            ? ("present" as const)
            : attempt.productFilesWritten.length > 0
              ? ("absent" as const)
              : ("unknown" as const),
        outsideWorkspaceReadCount: outsideReadCount,
        schemaViolationCount: schemaCount,
        likelyCauseClass: classifyCause({
          blockingReasonCodes: attempt.blockingReasonCodes,
          closureDisposition: disposition,
          outsideWorkspaceReadCount: outsideReadCount,
          schemaViolationCount: schemaCount,
          targetCarrierAdmissionStatus: targetCarrierAdmissionStatus(carriers)
        })
      });
      forensics.push(forensic);
      if (disposition === "retry") {
        diagnostics.push({
          code: "retry_observed",
          severity: "warn",
          detail: `${attempt.graphFunctionName ?? "unknown_edge"} reentered via retry`,
          evidenceRefs: Object.freeze([operatorRunRefValue]),
          operatorRunRef: operatorRunRefValue,
          edgeName: attempt.graphFunctionName
        });
      }
      if (disposition === "repair") {
        diagnostics.push({
          code: "repair_observed",
          severity: "warn",
          detail: `${attempt.graphFunctionName ?? "unknown_edge"} reentered via repair`,
          evidenceRefs: Object.freeze([operatorRunRefValue]),
          operatorRunRef: operatorRunRefValue,
          edgeName: attempt.graphFunctionName
        });
      }
      if (isBlocked) {
        diagnostics.push({
          code: "blocked_attempt_observed",
          severity: "warn",
          detail: `${attempt.graphFunctionName ?? "unknown_edge"} attempt blocked: ${attempt.blockingReasonCodes.join(",") || "no-codes"}`,
          evidenceRefs: Object.freeze([operatorRunRefValue]),
          operatorRunRef: operatorRunRefValue,
          edgeName: attempt.graphFunctionName
        });
      }
      if (outsideReadCount > 0) {
        diagnostics.push({
          code: "worker_authority_read_outside_workspace_observed",
          severity: "warn",
          detail: `${attempt.graphFunctionName ?? "unknown_edge"} read authority outside workspace ${outsideReadCount} times`,
          evidenceRefs: Object.freeze([
            path.join(carriers.operatorRunRoot, "postflight.json")
          ]),
          operatorRunRef: operatorRunRefValue,
          edgeName: attempt.graphFunctionName
        });
      }
    }
    previousAttempt = attempt;
  }
  return Object.freeze({
    forensics: Object.freeze(forensics),
    diagnostics: Object.freeze(diagnostics)
  });
}
