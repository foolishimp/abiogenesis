// Implements: T-161

import path from "node:path";

import {
  fileRef,
  operatorRunRef,
  resolveSdlcFdRunAnalysisRoot,
  type SdlcFdRunAnalysisResolvedRoot
} from "./archive_reader.js";
import { readOperatorRunCarriers, type OperatorRunCarriers } from "./carrier_loaders.js";
import {
  aggregateOperatorRunBytes,
  computeWallClockMs,
  deriveEdgeAttempt
} from "./edge_attempts.js";
import { deriveActiveRunLiveness } from "./liveness.js";
import { deriveRuntimeArtifactGaps } from "./runtime_gaps.js";
import { scanProductLineage } from "./requirement_lineage.js";
import { deriveBloatAndSlope } from "./bloat_slope.js";
import { deriveRetryForensics } from "./retry_forensics.js";
import { deriveSummaryDrift } from "./summary_drift.js";
import { buildDiagnostics, type DiagnosticDraft } from "./diagnostics.js";
import { resolveSdlcFdRunAnalysisProfile } from "./profiles.js";
import { deriveSdlcExecutiveEdgeAccountingAudit } from "../graph/edge_accounting.js";
import { deriveSdlcTraversalHopSelection } from "../operator/traversal_complexity.js";
import { resolveSdlcTraversalOutcomeClass } from "../contracts/carrier_domain_catalog.js";
import type {
  SdlcDecompositionSummary,
  SdlcTraversalHopSelection,
  SdlcTraversalOutcomeClass
} from "../operator/carriers.js";
import type {
  SdlcFdRunAnalysisConceptualStageCoverage,
  SdlcFdRunAnalysisCurrentStateTelemetry,
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisProfile,
  SdlcFdRunAnalysisProfileCapability,
  SdlcFdRunAnalysisProfileSpec,
  SdlcFdRunAnalysisResult
} from "./types.js";
import {
  SDLC_FD_RUN_ANALYSIS_KIND,
  SDLC_FD_RUN_ANALYSIS_VERSION
} from "./types.js";

export interface SdlcFdRunAnalysisOptions {
  readonly inspectedRoot: string;
  readonly profile?: SdlcFdRunAnalysisProfile;
  readonly profileCapabilityContracts?: readonly SdlcFdRunAnalysisProfileCapability[];
  readonly nowMs?: number;
}

function scenarioNameFromRoot(resolved: SdlcFdRunAnalysisResolvedRoot): string | null {
  if (resolved.scenarioRunRoot !== null) {
    return path.basename(path.dirname(resolved.scenarioRunRoot));
  }
  if (resolved.inspectedKind === "workspace" && resolved.workspaceRoot !== null) {
    return path.basename(resolved.workspaceRoot);
  }
  return null;
}

function evidenceIndexFromCarriers(
  carriers: readonly OperatorRunCarriers[]
): readonly string[] {
  const out: string[] = [];
  for (const carrier of carriers) {
    out.push(operatorRunRef(carrier.operatorRunRoot));
    for (const filename of [
      "operator_summary.json",
      "worker_run.json",
      "postflight.json",
      "sdlc_edge_closure_decision.json",
      "product_materialization_manifest.json"
    ]) {
      out.push(fileRef(path.join(carrier.operatorRunRoot, filename)));
    }
  }
  return Object.freeze(out);
}

function finalClosureDispositionFromAttempts(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): string | null {
  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    const candidate = attempts[index]?.closureDisposition;
    if (typeof candidate === "string") {
      return candidate;
    }
  }
  return null;
}

function countAttemptsByDisposition(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): {
  readonly sameEdgeRetryCount: number;
  readonly blockedAttemptCount: number;
  readonly repairAttemptCount: number;
  readonly yieldedAttemptCount: number;
  readonly abortedAttemptCount: number;
  readonly retryAndRepairCount: number;
} {
  let sameEdgeRetryCount = 0;
  let blockedAttemptCount = 0;
  let repairAttemptCount = 0;
  let yieldedAttemptCount = 0;
  let abortedAttemptCount = 0;
  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    if (attempt === undefined) {
      continue;
    }
    const isBlockedPostflight = attempt.postflightStatus === "blocked";
    switch (attempt.closureDisposition) {
      case "retry":
        sameEdgeRetryCount += 1;
        break;
      case "repair":
        repairAttemptCount += 1;
        break;
      case "yield":
        yieldedAttemptCount += 1;
        break;
      case "block":
        blockedAttemptCount += 1;
        break;
      case null:
      case undefined:
        if (attempt.postflightStatus === null) {
          abortedAttemptCount += 1;
        }
        break;
      default:
        break;
    }
    if (isBlockedPostflight && attempt.closureDisposition !== "block") {
      blockedAttemptCount += 1;
    }
  }
  return Object.freeze({
    sameEdgeRetryCount,
    blockedAttemptCount,
    repairAttemptCount,
    yieldedAttemptCount,
    abortedAttemptCount,
    retryAndRepairCount: sameEdgeRetryCount + repairAttemptCount
  });
}

function totalWorkerElapsedMsFromAttempts(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): number {
  let total = 0;
  for (const attempt of attempts) {
    if (typeof attempt.workerElapsedMs === "number" && attempt.workerElapsedMs > 0) {
      total += attempt.workerElapsedMs;
    }
  }
  return total;
}

function uniqueGraphEdgeSequence(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const attempt of attempts) {
    const name = attempt.graphFunctionName;
    if (typeof name === "string" && name.length > 0 && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return Object.freeze(out);
}

function observedWorkerDispatchedEdgeNames(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const attempt of attempts) {
    if (!attempt.workerDispatched) {
      continue;
    }
    const name = attempt.graphVectorRef ?? attempt.graphFunctionName;
    if (typeof name === "string" && name.length > 0 && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return Object.freeze(out);
}

function aggregateProductFileCount(
  carriers: readonly OperatorRunCarriers[]
): number {
  const seen = new Set<string>();
  for (const carrier of carriers) {
    if (carrier.productManifest.status !== "present") {
      continue;
    }
    for (const file of carrier.productManifest.data.files ?? []) {
      if (typeof file.relativePath === "string") {
        seen.add(file.relativePath);
      }
    }
  }
  return seen.size;
}

const SDLC_CONCEPTUAL_STAGES = Object.freeze([
  Object.freeze({
    conceptualStageRef: "sdlc://stage/project-conformance",
    expectedEdgeName: "Fg_conform_project_authority",
    expectedTargetAssetType: "project_bootstrap_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/feature-decomposition",
    expectedEdgeName: "derive_feature_decomp_surface",
    expectedTargetAssetType: "feature_decomp_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/scenario-uat-pressure",
    expectedEdgeName: "derive_scenario_surface",
    expectedTargetAssetType: "scenario_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/uat-testcases",
    expectedEdgeName: "derive_uat_testcases_surface",
    expectedTargetAssetType: "uat_testcases_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/implementation-design",
    expectedEdgeName: "derive_implementation_design_surface",
    expectedTargetAssetType: "implementation_design_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/component-code",
    expectedEdgeName: "derive_component_code_surface",
    expectedTargetAssetType: "component_code_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/test-design",
    expectedEdgeName: "derive_test_design_surface",
    expectedTargetAssetType: "test_design_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/component-test",
    expectedEdgeName: "derive_component_test_surface",
    expectedTargetAssetType: "component_test_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/test-execution-prep",
    expectedEdgeName: "prepare_test_execution_surface",
    expectedTargetAssetType: "test_execution_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/test-execution-result",
    expectedEdgeName: "derive_test_execution_result_surface",
    expectedTargetAssetType: "test_execution_result_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/test-run-archive",
    expectedEdgeName: "derive_test_run_archive_surface",
    expectedTargetAssetType: "test_run_archive_surface",
    stageClass: "constructive" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/code-rollup",
    expectedEdgeName: "derive_code_surface",
    expectedTargetAssetType: "code_surface",
    stageClass: "rollup" as const
  }),
  Object.freeze({
    conceptualStageRef: "sdlc://stage/release-preparation",
    expectedEdgeName: "prepare_release_surface",
    expectedTargetAssetType: "release_surface",
    stageClass: "rollup" as const
  })
]);

function attemptMatchesStage(
  attempt: SdlcFdRunAnalysisEdgeAttempt,
  stage: {
    readonly expectedEdgeName: string;
    readonly expectedTargetAssetType: string;
  }
): boolean {
  return (
    attempt.graphVectorRef === stage.expectedEdgeName ||
    attempt.graphFunctionName === stage.expectedEdgeName ||
    attempt.targetAssetType === stage.expectedTargetAssetType
  );
}

function deriveConceptualStageCoverage(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): readonly SdlcFdRunAnalysisConceptualStageCoverage[] {
  const rows: SdlcFdRunAnalysisConceptualStageCoverage[] = [];
  const mappedAttemptRefs = new Set<string>();
  for (const stage of SDLC_CONCEPTUAL_STAGES) {
    const matches = attempts.filter((attempt) => attemptMatchesStage(attempt, stage));
    for (const match of matches) {
      mappedAttemptRefs.add(match.operatorRunRef);
    }
    const first = matches[0] ?? null;
    rows.push(Object.freeze({
      kind: "sdlc_fd_run_analysis_conceptual_stage_coverage" as const,
      conceptualStageRef: stage.conceptualStageRef,
      expectedEdgeName: stage.expectedEdgeName,
      expectedTargetAssetType: stage.expectedTargetAssetType,
      mappedEdgeName: first?.graphVectorRef ?? first?.graphFunctionName ?? null,
      mappedTargetAssetType: first?.targetAssetType ?? null,
      stageClass: first?.traversalClass ?? "missing",
      operatorRunRefs: Object.freeze(matches.map((attempt) => attempt.operatorRunRef))
    }));
  }
  for (const attempt of attempts) {
    if (mappedAttemptRefs.has(attempt.operatorRunRef)) {
      continue;
    }
    rows.push(Object.freeze({
      kind: "sdlc_fd_run_analysis_conceptual_stage_coverage" as const,
      conceptualStageRef: "sdlc://stage/unmapped-runtime-edge",
      expectedEdgeName: "unmapped",
      expectedTargetAssetType: "unmapped",
      mappedEdgeName: attempt.graphVectorRef ?? attempt.graphFunctionName,
      mappedTargetAssetType: attempt.targetAssetType,
      stageClass: "unmapped" as const,
      operatorRunRefs: Object.freeze([attempt.operatorRunRef])
    }));
  }
  return Object.freeze(rows);
}

function maxRequirementObligationCount(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): number {
  let max = 0;
  for (const attempt of attempts) {
    if (typeof attempt.requirementObligationCount === "number" && attempt.requirementObligationCount > max) {
      max = attempt.requirementObligationCount;
    }
  }
  return max;
}

function outcomeClassForAnalysisProfile(
  profileSpec: SdlcFdRunAnalysisProfileSpec
): SdlcTraversalOutcomeClass {
  return resolveSdlcTraversalOutcomeClass({
    explicitValue: profileCapabilityValue(profileSpec, "sdlc_outcome_class"),
    trivialProduct: truthyProfileCapability(profileSpec, "trivial_product")
  }).outcomeClass;
}

function profileCapabilityValue(
  profileSpec: SdlcFdRunAnalysisProfileSpec,
  name: string
): string | null {
  return profileSpec.capabilityContracts.find((contract) => contract.name === name)
    ?.value ?? null;
}

function truthyProfileCapability(
  profileSpec: SdlcFdRunAnalysisProfileSpec,
  name: string
): boolean {
  const normalized = profileCapabilityValue(profileSpec, name)?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function loadedDecompositionSummary(
  carrier: OperatorRunCarriers
): SdlcDecompositionSummary | null {
  if (carrier.decompositionSummary.status === "present") {
    return carrier.decompositionSummary.data;
  }
  if (carrier.testDecompositionSummary.status === "present") {
    return carrier.testDecompositionSummary.data;
  }
  if (carrier.implementationDecompositionSummary.status === "present") {
    return carrier.implementationDecompositionSummary.data;
  }
  return null;
}

function archivedTraversalSelection(
  carriers: readonly OperatorRunCarriers[]
): SdlcTraversalHopSelection | null {
  let fallback: SdlcTraversalHopSelection | null = null;
  for (let index = carriers.length - 1; index >= 0; index -= 1) {
    const carrier = carriers[index];
    if (carrier?.traversalHopSelection.status !== "present") {
      continue;
    }
    const selection = carrier.traversalHopSelection.data;
    fallback = fallback ?? selection;
    if (
      selection.hopClass !== "blocked" ||
      selection.complexityAssessment.decompositionSummaryRef !== null
    ) {
      return selection;
    }
  }
  return fallback;
}

function deriveTraversalSelectionForAnalysis(input: {
  readonly carriers: readonly OperatorRunCarriers[];
  readonly profileSpec: SdlcFdRunAnalysisProfileSpec;
}): SdlcTraversalHopSelection {
  const archived = archivedTraversalSelection(input.carriers);
  if (archived !== null) {
    return archived;
  }
  let summary: SdlcDecompositionSummary | null = null;
  for (let index = input.carriers.length - 1; index >= 0; index -= 1) {
    const candidate = input.carriers[index];
    if (candidate === undefined) {
      continue;
    }
    summary = loadedDecompositionSummary(candidate);
    if (summary !== null) {
      break;
    }
  }
  return deriveSdlcTraversalHopSelection({
    selectionRef: "analysis://odd-sdlc/traversal-hop-selection",
    outcomeClass: outcomeClassForAnalysisProfile(input.profileSpec),
    decompositionSummary: summary
  });
}

export function analyzeSdlcFdRunArchive(
  options: SdlcFdRunAnalysisOptions
): SdlcFdRunAnalysisResult {
  const resolved = resolveSdlcFdRunAnalysisRoot(options.inspectedRoot);
  const profile: SdlcFdRunAnalysisProfile = options.profile ?? "generic";
  const profileSpec =
    options.profileCapabilityContracts === undefined
      ? resolveSdlcFdRunAnalysisProfile(profile)
      : resolveSdlcFdRunAnalysisProfile({
        profile,
        capabilityContracts: options.profileCapabilityContracts
      });
  const nowMs = options.nowMs ?? Date.now();
  const operatorRunRootsOrdered = Object.freeze(
    [...resolved.operatorRunRoots].reverse()
  );
  const carriers: OperatorRunCarriers[] = operatorRunRootsOrdered.map((root) =>
    readOperatorRunCarriers(root)
  );
  const attempts: SdlcFdRunAnalysisEdgeAttempt[] = carriers.map((carrier, index) =>
    deriveEdgeAttempt(carrier, index)
  );
  const archiveBytes = aggregateOperatorRunBytes(operatorRunRootsOrdered);
  const totals = countAttemptsByDisposition(attempts);
  const totalWorkerElapsedMs = totalWorkerElapsedMsFromAttempts(attempts);
  const totalWallClockMs = computeWallClockMs(operatorRunRootsOrdered);
  const unattributedElapsedMs =
    totalWallClockMs === null ? null : Math.max(0, totalWallClockMs - totalWorkerElapsedMs);
  const lineageOutcome = scanProductLineage({
    carriers,
    forbidRawDisplayIds: profileSpec.forbidRawDisplayIdRequirementTagsInProductFiles
  });
  const runtimeGaps = deriveRuntimeArtifactGaps({ carriers });
  const livenessCarrier = carriers[carriers.length - 1] ?? null;
  const livenessOutcome = deriveActiveRunLiveness({
    carriers: livenessCarrier,
    thresholds: profileSpec.thresholds,
    nowMs
  });
  const retry = deriveRetryForensics({ carriers, attempts });
  const conceptualStageCoverage = deriveConceptualStageCoverage(attempts);
  const edgeAccounting = deriveSdlcExecutiveEdgeAccountingAudit({
    observedDispatchedEdgeNames: observedWorkerDispatchedEdgeNames(attempts)
  });
  const requirementObligationCount = maxRequirementObligationCount(attempts);
  const productFileCount = aggregateProductFileCount(carriers);
  const bloat = deriveBloatAndSlope({
    carriers,
    attempts,
    archiveBytes,
    retryCount: totals.retryAndRepairCount,
    productFileCount,
    componentCount: 0,
    requirementObligationCount,
    lineage: lineageOutcome.scan,
    thresholds: profileSpec.thresholds
  });
  const summaryDrift = deriveSummaryDrift({ carriers, attempts });
  const traversalHopSelection = deriveTraversalSelectionForAnalysis({
    carriers,
    profileSpec
  });
  const allDiagnosticDrafts: readonly DiagnosticDraft[] = Object.freeze([
    ...runtimeGaps.diagnostics,
    ...lineageOutcome.diagnostics,
    ...retry.diagnostics,
    ...bloat.diagnostics,
    ...summaryDrift.diagnostics,
    ...livenessOutcome.diagnostics,
    ...maybeEdgeSequenceIncomplete({ resolved, carriers, attempts })
  ]);
  const diagnostics = buildDiagnostics(
    allDiagnosticDrafts,
    profileSpec.policy.policyStatus
  );
  const telemetry: SdlcFdRunAnalysisCurrentStateTelemetry = Object.freeze({
    inspectedRoot: resolved.inspectedRoot,
    inspectedKind: resolved.inspectedKind,
    scenarioName: scenarioNameFromRoot(resolved),
    profile,
    operatorRunCount: operatorRunRootsOrdered.length,
    graphEdgeSequence: uniqueGraphEdgeSequence(attempts),
    sameEdgeRetryCount: totals.sameEdgeRetryCount,
    blockedAttemptCount: totals.blockedAttemptCount,
    repairAttemptCount: totals.repairAttemptCount,
    yieldedAttemptCount: totals.yieldedAttemptCount,
    abortedAttemptCount: totals.abortedAttemptCount,
    finalClosureDisposition: finalClosureDispositionFromAttempts(attempts),
    totalWallClockMs,
    totalWorkerElapsedMs,
    unattributedElapsedMs,
    archiveBytes,
    productFileCount,
    requirementObligationCount,
    productFileLineageCount: lineageOutcome.scan.canonicalRequirementIdCount
  });
  return Object.freeze({
    kind: SDLC_FD_RUN_ANALYSIS_KIND,
    version: SDLC_FD_RUN_ANALYSIS_VERSION,
    inspectedRoot: resolved.inspectedRoot,
    inspectedKind: resolved.inspectedKind,
    profile,
    profilePolicyRef: profileSpec.policy.profilePolicyRef,
    thresholdPolicyRef: profileSpec.policy.thresholdPolicyRef,
    policyStatus: profileSpec.policy.policyStatus,
    readOnly: true as const,
    currentStateTelemetrySummary: telemetry,
    edgeTraversal: Object.freeze(attempts),
    activeRunLiveness: livenessOutcome.liveness,
    runtimeArtifactGaps: runtimeGaps.gaps,
    diagnostics,
    bloatAndSlopeAnalysis: bloat.bloat,
    retryForensics: retry.forensics,
    conceptualStageCoverage,
    edgeAccounting,
    traversalHopSelection,
    summaryDrift: summaryDrift.report,
    evidenceIndex: evidenceIndexFromCarriers(carriers)
  });
}

function maybeEdgeSequenceIncomplete(input: {
  readonly resolved: SdlcFdRunAnalysisResolvedRoot;
  readonly carriers: readonly OperatorRunCarriers[];
  readonly attempts: readonly SdlcFdRunAnalysisEdgeAttempt[];
}): readonly DiagnosticDraft[] {
  if (input.attempts.length === 0) {
    return Object.freeze([]);
  }
  const lastAttempt = input.attempts[input.attempts.length - 1];
  if (lastAttempt === undefined) {
    return Object.freeze([]);
  }
  if (
    lastAttempt.closureDisposition !== null ||
    lastAttempt.postflightStatus === "passed"
  ) {
    return Object.freeze([]);
  }
  const lastCarrier = input.carriers[input.carriers.length - 1];
  if (lastCarrier === undefined) {
    return Object.freeze([]);
  }
  return Object.freeze([
    {
      code: "edge_sequence_incomplete" as const,
      severity: "warn" as const,
      detail: `final operator-run ${path.basename(lastCarrier.operatorRunRoot)} has no closure decision`,
      evidenceRefs: Object.freeze([operatorRunRef(lastCarrier.operatorRunRoot)]),
      operatorRunRef: operatorRunRef(lastCarrier.operatorRunRoot),
      edgeName: lastAttempt.graphFunctionName
    }
  ]);
}
