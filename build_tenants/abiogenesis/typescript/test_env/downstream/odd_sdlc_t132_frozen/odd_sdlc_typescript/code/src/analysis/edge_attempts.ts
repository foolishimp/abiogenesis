// Implements: T-161

import { readFileSync } from "node:fs";
import path from "node:path";
import { isRecord } from "../admission/codecs.js";

import {
  dirMtimeMsOrNull,
  fileSizeOrZero,
  operatorRunRef,
  walkDirectoryFiles,
  type SdlcFdRunAnalysisFileInfo
} from "./archive_reader.js";
import type {
  OperatorRunCarriers,
  PostflightRecord,
  ProductMaterializationFileRecord,
  WorkerResultReportRecord
} from "./carrier_loaders.js";
import type {
  SdlcFdRunAnalysisByteAccount,
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisFrontierSummary,
  SdlcFdRunAnalysisStagedComputeTruth,
  SdlcFdRunAnalysisStageClass
} from "./types.js";

function stringField(
  record: Readonly<Record<string, unknown>>,
  key: string
): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function blockingReasonCodesFromPostflight(
  postflight: PostflightRecord | null
): readonly string[] {
  if (postflight === null) {
    return Object.freeze([]);
  }
  const codes: string[] = [];
  const carriers = postflight.blockingReasonCarriers ?? [];
  for (const entry of carriers) {
    if (isRecord(entry)) {
      const code = stringField(entry, "code");
      if (code !== null) {
        codes.push(code);
      }
    }
  }
  const reasons = postflight.blockingReasons ?? [];
  for (const entry of reasons) {
    if (typeof entry === "string") {
      codes.push(entry);
    } else if (isRecord(entry)) {
      const code = stringField(entry, "code");
      if (code !== null) {
        codes.push(code);
      }
    }
  }
  return Object.freeze(codes);
}

function productFilesFromManifest(
  files: readonly ProductMaterializationFileRecord[] | undefined
): {
  readonly written: readonly string[];
  readonly replayed: readonly string[];
  readonly lineageCount: number;
} {
  const written: string[] = [];
  const replayed: string[] = [];
  let lineageCount = 0;
  for (const entry of files ?? []) {
    if (typeof entry.relativePath !== "string") {
      continue;
    }
    if (entry.materializationSource === "replayed_from_prior_attempt") {
      replayed.push(entry.relativePath);
    } else {
      written.push(entry.relativePath);
    }
    lineageCount += entry.requirementTraceObligationIds?.length ?? 0;
  }
  return Object.freeze({
    written: Object.freeze(written),
    replayed: Object.freeze(replayed),
    lineageCount
  });
}

function obligationCountFromWorkerReport(
  report: WorkerResultReportRecord | null
): number | null {
  if (report === null || !Array.isArray(report.obligationAssessments)) {
    return null;
  }
  return report.obligationAssessments.length;
}

function classifyTraversalStage(input: {
  readonly graphFunctionName: string | null;
  readonly targetAssetType: string | null;
  readonly workerElapsedMs: number | null;
}): SdlcFdRunAnalysisStageClass {
  const edgeName = input.graphFunctionName ?? "";
  const target = input.targetAssetType ?? "";
  if (edgeName.length === 0 && target.length === 0) {
    return "unmapped";
  }
  if (
    target === "code_surface" ||
    target === "release_surface" ||
    target === "release_depth_parity_surface" ||
    edgeName.includes("rollup") ||
    edgeName.includes("aggregate")
  ) {
    return "rollup";
  }
  if (
    input.workerElapsedMs === null &&
    (edgeName.startsWith("project_") ||
      edgeName.startsWith("query_") ||
      edgeName.includes("projection"))
  ) {
    return "projection";
  }
  return "constructive";
}

function fileRef(operatorRunRoot: string, relativePath: string): string | null {
  return fileSizeOrZero(path.join(operatorRunRoot, relativePath)) > 0
    ? `file://${path.join(operatorRunRoot, relativePath)}`
    : null;
}

function executionEvidenceStatusFromReport(
  report: WorkerResultReportRecord | null,
  targetAssetType: string | null,
  operatorRunRoot: string
): {
  readonly status: string | null;
  readonly reportCount: number;
  readonly lane: string | null;
  readonly command: string | null;
  readonly testsObserved: number | null;
  readonly passedCount: number | null;
  readonly failedCount: number | null;
  readonly shardCount: number;
  readonly reportRefs: readonly string[];
  readonly source: "none" | "component_smoke" | "graph_test_execution_result";
} {
  const reportEvidence = report?.executionEvidence ?? null;
  const evidence = isRecord(reportEvidence)
    ? reportEvidence
    : executionEvidenceFromReportOutputFile(report, operatorRunRoot);
  if (evidence === null) {
    return Object.freeze({
      status: null,
      reportCount: 0,
      lane: null,
      command: null,
      testsObserved: null,
      passedCount: null,
      failedCount: null,
      shardCount: 0,
      reportRefs: Object.freeze([]),
      source: "none" as const
    });
  }
  const reportRefs = Array.isArray(evidence.reportRefs)
    ? evidence.reportRefs.filter((ref): ref is string => typeof ref === "string")
    : [];
  const source = targetAssetType === "test_execution_result_surface"
    ? "graph_test_execution_result"
    : "component_smoke";
  return Object.freeze({
    status: typeof evidence.status === "string" ? evidence.status : null,
    reportCount: reportRefs.length,
    lane: typeof evidence.lane === "string" ? evidence.lane : null,
    command: typeof evidence.command === "string" ? evidence.command : null,
    testsObserved:
      typeof evidence.testsObserved === "number" ? evidence.testsObserved : null,
    passedCount:
      typeof evidence.passedCount === "number" ? evidence.passedCount : null,
    failedCount:
      typeof evidence.failedCount === "number" ? evidence.failedCount : null,
    shardCount: Array.isArray(evidence.shardEvidence) ? evidence.shardEvidence.length : 0,
    reportRefs: Object.freeze(reportRefs),
    source
  });
}

function executionEvidenceFromReportOutputFile(
  report: WorkerResultReportRecord | null,
  operatorRunRoot: string
): Readonly<Record<string, unknown>> | null {
  const outputFile = typeof report?.outputFile === "string" ? report.outputFile : null;
  if (outputFile === null) {
    return null;
  }
  const workspaceRoot = workspaceRootForOperatorRun(operatorRunRoot);
  if (
    workspaceRoot === null ||
    !pathIsInside(path.resolve(outputFile), workspaceRoot)
  ) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(outputFile, "utf8"));
    if (
      isRecord(parsed) &&
      parsed["kind"] === "sdlc_worker_execution_evidence"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function workspaceRootForOperatorRun(operatorRunRoot: string): string | null {
  const marker = `${path.sep}.ai-workspace${path.sep}runtime${path.sep}odd_sdlc${path.sep}operator-runs${path.sep}`;
  const normalized = path.resolve(operatorRunRoot);
  const markerIndex = normalized.lastIndexOf(marker);
  return markerIndex < 0 ? null : normalized.slice(0, markerIndex);
}

function pathIsInside(childPath: string, parentPath: string): boolean {
  const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function residualPressureRefs(carriers: OperatorRunCarriers): readonly string[] {
  const fromGain =
    carriers.edgeGain.status === "present" &&
    Array.isArray(carriers.edgeGain.data.residualPressureRefs)
      ? carriers.edgeGain.data.residualPressureRefs
      : [];
  if (fromGain.length > 0) {
    return Object.freeze(fromGain.filter((ref): ref is string => typeof ref === "string"));
  }
  const fromLedger =
    carriers.edgeFulfillmentLedger.status === "present" &&
    Array.isArray(carriers.edgeFulfillmentLedger.data.edgeResidualPressureRefs)
      ? carriers.edgeFulfillmentLedger.data.edgeResidualPressureRefs
      : [];
  return Object.freeze(fromLedger.filter((ref): ref is string => typeof ref === "string"));
}

function residualPressureTransition(input: {
  readonly closureDisposition: string | null;
  readonly residualPressureRefCount: number;
}): "none" | "preserved" | "cleared" | "unknown" {
  if (input.residualPressureRefCount > 0) {
    return "preserved";
  }
  if (input.closureDisposition === "close") {
    return "cleared";
  }
  if (input.closureDisposition === "retry" || input.closureDisposition === "repair") {
    return "none";
  }
  return "unknown";
}

function frontierSummaryFromCarriers(
  carriers: OperatorRunCarriers
): SdlcFdRunAnalysisFrontierSummary | null {
  if (carriers.liveFpParallelMaterializationFrontier.status !== "present") {
    return null;
  }
  const frontier = carriers.liveFpParallelMaterializationFrontier.data;
  return Object.freeze({
    graphTruthSource: frontier.graphTruthSource,
    selectedMethod: frontier.selectedMethod,
    dependencyMapRefs: frontier.dependencyMapRefs,
    traversalSelectionRefs: frontier.traversalSelectionRefs,
    dagRef: frontier.dagRef,
    startNodes: frontier.startNodes,
    frontierRef: frontier.frontierRef,
    policyRef: frontier.policyRef,
    laneCount: frontier.laneCount,
    devLaneCount: frontier.devLaneCount,
    testLaneCount: frontier.testLaneCount,
    fanInCount: frontier.fanInCount,
    batchCount: frontier.batchCount,
    batchSizes: frontier.batchSizes,
    maxActive: frontier.maxActive,
    readyBranchRefs: frontier.readyBranchRefs,
    compiledReadyBranchRefs: frontier.compiledReadyBranchRefs,
    completedBranchRefs: frontier.completedBranchRefs,
    failedBranchRefs: frontier.failedBranchRefs,
    writeTerritoryConflictRefs: frontier.writeTerritoryConflictRefs,
    outputAllocationConflictRefs: frontier.outputAllocationConflictRefs,
    branchRows: frontier.branchRows,
    fanInRows: frontier.fanInRows
  });
}

function stagedComputeTruthFromCarriers(
  carriers: OperatorRunCarriers
): SdlcFdRunAnalysisStagedComputeTruth {
  const inputs = [
    carriers.fpEvaluateResult,
    carriers.gtlAdmittedStateRef,
    carriers.gtlConsequenceProjectionRef,
    carriers.edgeClosure,
    carriers.edgeFulfillmentLedger,
    carriers.nextActionProjection
  ] as const;
  const malformed = inputs.find((input) => input.status === "malformed");
  if (malformed !== undefined && malformed.status === "malformed") {
    return Object.freeze({
      status: "malformed" as const,
      selectedCompositionRef: null,
      selectedCompositionDigest: null,
      selectedCompositionSelectionRef: null,
      selectedRegimeBindingRef: null,
      evaluateRef: null,
      admittedStateGraphCallRef: null,
      consequenceRef: null,
      domainReadModelRefs: Object.freeze([]),
      detail: malformed.detail
    });
  }
  if (inputs.some((input) => input.status === "missing")) {
    return Object.freeze({
      status: "missing" as const,
      selectedCompositionRef: null,
      selectedCompositionDigest: null,
      selectedCompositionSelectionRef: null,
      selectedRegimeBindingRef: null,
      evaluateRef: null,
      admittedStateGraphCallRef: null,
      consequenceRef: null,
      domainReadModelRefs: Object.freeze([]),
      detail: "required staged compute truth artifact missing"
    });
  }
  if (
    carriers.fpEvaluateResult.status !== "present" ||
    carriers.gtlAdmittedStateRef.status !== "present" ||
    carriers.gtlConsequenceProjectionRef.status !== "present" ||
    carriers.edgeClosure.status !== "present" ||
    carriers.edgeFulfillmentLedger.status !== "present" ||
    carriers.nextActionProjection.status !== "present"
  ) {
    return Object.freeze({
      status: "malformed" as const,
      selectedCompositionRef: null,
      selectedCompositionDigest: null,
      selectedCompositionSelectionRef: null,
      selectedRegimeBindingRef: null,
      evaluateRef: null,
      admittedStateGraphCallRef: null,
      consequenceRef: null,
      domainReadModelRefs: Object.freeze([]),
      detail: "required staged compute truth artifact not admitted"
    });
  }
  const fpEvaluate = carriers.fpEvaluateResult.data;
  const admitted = carriers.gtlAdmittedStateRef.data;
  const consequence = carriers.gtlConsequenceProjectionRef.data;
  const compositionRefs = [
    fpEvaluate.compositionRef,
    admitted.compositionRef,
    consequence.compositionRef,
    carriers.edgeClosure.data.compositionRef,
    carriers.edgeFulfillmentLedger.data.compositionRef,
    carriers.nextActionProjection.data.compositionRef
  ];
  const compositionDigests = [
    fpEvaluate.compositionDigest,
    admitted.compositionDigest,
    consequence.compositionDigest,
    carriers.edgeClosure.data.compositionDigest,
    carriers.edgeFulfillmentLedger.data.compositionDigest,
    carriers.nextActionProjection.data.compositionDigest
  ];
  const compositionSelectionRefs = [
    fpEvaluate.compositionSelectionRef,
    admitted.compositionSelectionRef,
    consequence.compositionSelectionRef,
    carriers.edgeClosure.data.compositionSelectionRef,
    carriers.edgeFulfillmentLedger.data.compositionSelectionRef,
    carriers.nextActionProjection.data.compositionSelectionRef
  ];
  const selectedRegimeBindingRefs = [
    fpEvaluate.selectedRegimeBindingRef,
    carriers.edgeClosure.data.selectedRegimeBindingRef,
    carriers.edgeFulfillmentLedger.data.selectedRegimeBindingRef,
    carriers.nextActionProjection.data.selectedRegimeBindingRef
  ];
  if (
    new Set(compositionRefs).size !== 1 ||
    new Set(compositionDigests).size !== 1 ||
    new Set(compositionSelectionRefs).size !== 1 ||
    new Set(selectedRegimeBindingRefs).size !== 1
  ) {
    return Object.freeze({
      status: "drift" as const,
      selectedCompositionRef: fpEvaluate.compositionRef,
      selectedCompositionDigest: fpEvaluate.compositionDigest,
      selectedCompositionSelectionRef: fpEvaluate.compositionSelectionRef,
      selectedRegimeBindingRef: fpEvaluate.selectedRegimeBindingRef,
      evaluateRef: fpEvaluate.evaluationRef ?? null,
      admittedStateGraphCallRef: admitted.graphCallRef,
      consequenceRef: consequence.consequenceRef,
      domainReadModelRefs: consequence.domainReadModelRefs,
      detail:
        "Selected composition drift across evaluate/admission/consequence carriers"
    });
  }
  return Object.freeze({
    status: "present" as const,
    selectedCompositionRef: fpEvaluate.compositionRef,
    selectedCompositionDigest: fpEvaluate.compositionDigest,
    selectedCompositionSelectionRef: fpEvaluate.compositionSelectionRef,
    selectedRegimeBindingRef: fpEvaluate.selectedRegimeBindingRef,
    evaluateRef: fpEvaluate.evaluationRef ?? null,
    admittedStateGraphCallRef: admitted.graphCallRef,
    consequenceRef: consequence.consequenceRef,
    domainReadModelRefs: consequence.domainReadModelRefs,
    detail: null
  });
}

function operatorRunStartMs(operatorRunRoot: string): number | null {
  const baseName = path.basename(operatorRunRoot);
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\d{3})Z/u.exec(baseName);
  if (match === null) {
    return null;
  }
  const [, y, mo, d, h, mi, s, ms] = match;
  if (
    y === undefined ||
    mo === undefined ||
    d === undefined ||
    h === undefined ||
    mi === undefined ||
    s === undefined ||
    ms === undefined
  ) {
    return null;
  }
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}Z`;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

function edgeWindowElapsedMs(operatorRunRoot: string): number | null {
  const start = operatorRunStartMs(operatorRunRoot);
  const end = dirMtimeMsOrNull(operatorRunRoot);
  if (start === null || end === null) {
    return null;
  }
  return Math.max(0, end - start);
}

export function deriveEdgeAttempt(
  carriers: OperatorRunCarriers,
  attemptOrdinal: number
): SdlcFdRunAnalysisEdgeAttempt {
  const operatorSummary = carriers.operatorSummary.status === "present"
    ? carriers.operatorSummary.data
    : null;
  const handoff = carriers.handoffManifest.status === "present"
    ? carriers.handoffManifest.data
    : null;
  const workerRun = carriers.workerRun.status === "present"
    ? carriers.workerRun.data
    : null;
  const postflight = carriers.postflight.status === "present"
    ? carriers.postflight.data
    : null;
  const edgeClosure = carriers.edgeClosure.status === "present"
    ? carriers.edgeClosure.data
    : null;
  const fpEvaluate = carriers.fpEvaluateResult.status === "present"
    ? carriers.fpEvaluateResult.data
    : null;
  const nextAction = carriers.nextActionProjection.status === "present"
    ? carriers.nextActionProjection.data
    : null;
  const productManifest = carriers.productManifest.status === "present"
    ? carriers.productManifest.data
    : null;
  const workerReport = carriers.workerResultReport.status === "present"
    ? carriers.workerResultReport.data
    : null;
  const workerConstructionBrief = carriers.workerConstructionBrief.status === "present"
    ? carriers.workerConstructionBrief.data
    : null;
  const graphFunctionName =
    operatorSummary?.graphFunctionName ?? handoff?.graphFunctionName ?? null;
  const targetAssetType = handoff?.targetAssetType ?? null;
  const productFiles = productFilesFromManifest(productManifest?.files);
  const blockingReasonCodes = blockingReasonCodesFromPostflight(postflight);
  const workerElapsedMs = workerRun?.elapsedMs ?? null;
  const edgeWindowMs = edgeWindowElapsedMs(carriers.operatorRunRoot);
  const deterministicMs =
    edgeWindowMs !== null && workerElapsedMs !== null
      ? Math.max(0, edgeWindowMs - workerElapsedMs)
      : null;
  const eventBytes =
    carriers.fileSizes.runtimeEvents + carriers.fileSizes.workerProcessEvents;
  const promptContextBytes =
    carriers.fileSizes.workerPrompt +
    carriers.fileSizes.workerInvocationPackage +
    carriers.fileSizes.traversalIntentPackage +
    carriers.fileSizes.workerConstructionBrief;
  const executionEvidence = executionEvidenceStatusFromReport(
    workerReport,
    targetAssetType,
    carriers.operatorRunRoot
  );
  const residualRefs = residualPressureRefs(carriers);
  const closureDisposition = edgeClosure?.disposition ?? null;
  const canonicalPromptCarrierPath =
    typeof workerConstructionBrief?.canonicalPromptCarrierPath === "string"
      ? workerConstructionBrief.canonicalPromptCarrierPath
      : null;
  return Object.freeze({
    attemptOrdinal,
    operatorRunRef: operatorRunRef(carriers.operatorRunRoot),
    graphFunctionName,
    graphVectorRef: handoff?.edgeName ?? null,
    targetAssetType,
    traversalClass: classifyTraversalStage({
      graphFunctionName,
      targetAssetType,
      workerElapsedMs
    }),
    workerElapsedMs,
    edgeWindowElapsedMs: edgeWindowMs,
    deterministicElapsedMs: deterministicMs,
    fpEvaluateStatus: fpEvaluate?.status ?? null,
    postflightStatus: postflight?.status ?? null,
    executionEvidenceStatus: executionEvidence.status,
    executionEvidenceReportCount: executionEvidence.reportCount,
    executionEvidenceLane: executionEvidence.lane,
    executionEvidenceCommand: executionEvidence.command,
    executionEvidenceTestsObserved: executionEvidence.testsObserved,
    executionEvidencePassedCount: executionEvidence.passedCount,
    executionEvidenceFailedCount: executionEvidence.failedCount,
    executionEvidenceShardCount: executionEvidence.shardCount,
    executionEvidenceReportRefs: executionEvidence.reportRefs,
    executionEvidenceSource: executionEvidence.source,
    residualPressureRefCount: residualRefs.length,
    residualPressureTransition: residualPressureTransition({
      closureDisposition,
      residualPressureRefCount: residualRefs.length
    }),
    promptSourceCarrierRef:
      canonicalPromptCarrierPath === null
        ? fileRef(carriers.operatorRunRoot, "worker_construction_brief.json")
        : `workspace://${canonicalPromptCarrierPath}`,
    promptSourceCarrierDigest:
      typeof workerConstructionBrief?.packageDigest === "string"
        ? workerConstructionBrief.packageDigest
        : null,
    promptRenderingRef: fileRef(carriers.operatorRunRoot, "worker_prompt.md"),
    promptSourcePolicyRef:
      typeof workerConstructionBrief?.promptSourcePolicyRef === "string"
        ? workerConstructionBrief.promptSourcePolicyRef
        : null,
    closureDisposition,
    selectedNextActionRef: nextAction?.selectedActionRef ?? null,
    predecessorAttemptRef: null,
    blockingReasonCodes,
    productFilesWritten: productFiles.written,
    productFilesReplayed: productFiles.replayed,
    requirementObligationCount: obligationCountFromWorkerReport(workerReport),
    productLineageCount: productFiles.lineageCount,
    promptContextBytes,
    handoffBytes: carriers.fileSizes.handoffManifest,
    stdoutBytes: carriers.fileSizes.workerStdout,
    eventBytes,
    frontierSummary: frontierSummaryFromCarriers(carriers),
    stagedComputeTruth: stagedComputeTruthFromCarriers(carriers),
    workerDispatched: workerRun !== null,
    workerStatus: operatorSummary?.status ?? null
  });
}

type ByteAccountCategory =
  | "runtimeEventBytes"
  | "stdoutBytes"
  | "stderrBytes"
  | "promptContextBytes"
  | "handoffBytes"
  | "workerProcessEventBytes"
  | "workerResultReportBytes"
  | "consequenceCarrierBytes"
  | "productMaterializationManifestBytes"
  | "otherCarrierBytes";

function byteAccountForFile(
  file: SdlcFdRunAnalysisFileInfo,
  parentOperatorRunRoot: string | null
): {
  readonly category: ByteAccountCategory;
  readonly inOperatorRun: boolean;
} {
  const inOperatorRun =
    parentOperatorRunRoot !== null &&
    file.absolutePath.startsWith(`${parentOperatorRunRoot}/`);
  const base = path.basename(file.absolutePath);
  if (base === "runtime_events.json") {
    return { category: "runtimeEventBytes", inOperatorRun };
  }
  if (base === "worker_stdout.log") {
    return { category: "stdoutBytes", inOperatorRun };
  }
  if (base === "worker_stderr.log") {
    return { category: "stderrBytes", inOperatorRun };
  }
  if (
    base === "worker_prompt.md" ||
    base === "worker_construction_brief.json" ||
    base === "worker_invocation_package.json" ||
    base === "traversal_intent_package.json"
  ) {
    return { category: "promptContextBytes", inOperatorRun };
  }
  if (base === "handoff_manifest.json") {
    return { category: "handoffBytes", inOperatorRun };
  }
  if (base === "worker_process_events.jsonl") {
    return { category: "workerProcessEventBytes", inOperatorRun };
  }
  if (base === "worker_result_report.json") {
    return { category: "workerResultReportBytes", inOperatorRun };
  }
  if (
    base === "sdlc_edge_closure_decision.json" ||
    base === "sdlc_edge_fulfillment_ledger.json" ||
    base === "sdlc_next_action_projection.json"
  ) {
    return { category: "consequenceCarrierBytes", inOperatorRun };
  }
  if (base === "product_materialization_manifest.json") {
    return { category: "productMaterializationManifestBytes", inOperatorRun };
  }
  return { category: "otherCarrierBytes", inOperatorRun };
}

export function aggregateOperatorRunBytes(
  operatorRunRoots: readonly string[]
): SdlcFdRunAnalysisByteAccount {
  let totalBytes = 0;
  let operatorRunBytes = 0;
  let runtimeEventBytes = 0;
  let stdoutBytes = 0;
  let stderrBytes = 0;
  let promptContextBytes = 0;
  let handoffBytes = 0;
  let traversalIntentBytes = 0;
  let workerInvocationBytes = 0;
  let workerProcessEventBytes = 0;
  let workerResultReportBytes = 0;
  let consequenceCarrierBytes = 0;
  let productMaterializationManifestBytes = 0;
  let otherCarrierBytes = 0;
  for (const root of operatorRunRoots) {
    const files = walkDirectoryFiles(root);
    for (const file of files) {
      totalBytes += file.byteSize;
      operatorRunBytes += file.byteSize;
      const account = byteAccountForFile(file, root);
      switch (account.category) {
        case "runtimeEventBytes":
          runtimeEventBytes += file.byteSize;
          break;
        case "stdoutBytes":
          stdoutBytes += file.byteSize;
          break;
        case "stderrBytes":
          stderrBytes += file.byteSize;
          break;
        case "promptContextBytes":
          promptContextBytes += file.byteSize;
          if (path.basename(file.absolutePath) === "traversal_intent_package.json") {
            traversalIntentBytes += file.byteSize;
          }
          if (path.basename(file.absolutePath) === "worker_invocation_package.json") {
            workerInvocationBytes += file.byteSize;
          }
          break;
        case "handoffBytes":
          handoffBytes += file.byteSize;
          break;
        case "workerProcessEventBytes":
          workerProcessEventBytes += file.byteSize;
          break;
        case "workerResultReportBytes":
          workerResultReportBytes += file.byteSize;
          break;
        case "consequenceCarrierBytes":
          consequenceCarrierBytes += file.byteSize;
          break;
        case "productMaterializationManifestBytes":
          productMaterializationManifestBytes += file.byteSize;
          break;
        case "otherCarrierBytes":
          otherCarrierBytes += file.byteSize;
          break;
      }
    }
  }
  return Object.freeze({
    totalBytes,
    operatorRunBytes,
    runtimeEventBytes,
    stdoutBytes,
    stderrBytes,
    promptContextBytes,
    handoffBytes,
    traversalIntentBytes,
    workerInvocationBytes,
    workerProcessEventBytes,
    workerResultReportBytes,
    consequenceCarrierBytes,
    productMaterializationManifestBytes,
    otherCarrierBytes
  });
}

export function computeWallClockMs(
  operatorRunRoots: readonly string[]
): number | null {
  if (operatorRunRoots.length === 0) {
    return null;
  }
  const earliest = operatorRunRoots
    .map((root) => operatorRunStartMs(root))
    .filter((value): value is number => value !== null)
    .reduce<number | null>((acc, current) => (acc === null || current < acc ? current : acc), null);
  const latest = operatorRunRoots
    .map((root) => dirMtimeMsOrNull(root))
    .filter((value): value is number => value !== null)
    .reduce<number | null>((acc, current) => (acc === null || current > acc ? current : acc), null);
  if (earliest === null || latest === null) {
    return null;
  }
  return Math.max(0, latest - earliest);
}
