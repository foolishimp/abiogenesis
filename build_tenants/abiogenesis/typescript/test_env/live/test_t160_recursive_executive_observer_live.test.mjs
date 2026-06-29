// Validates: T-160 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicExecutive from "@abiogenesis/typescript-tenant/abg/executive";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  sha256Text,
  stableJson
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { executorProfileFields } from "./support/executor_profile.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(LIVE_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t160_recursive_executive_observer_live"
);
const REQUIREMENT_ID = "REQ-T160-LIVE-PRESSURE";

function liveEnabled() {
  return process.env["ABG_TS_T160_EXECUTIVE_OBSERVER_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000;
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`live F_P executive observer did not return JSON: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function executiveObservation() {
  return publicExecutive.projectExecutiveObservationView({
    observerGraphFunctionRef: "graph-function://abg/executive/default-observer",
    targetWorkspaceContextRef: "context://t160/live/target-workspace",
    targetWorkspaceLocator: "workspace://t160/live-target",
    targetWorkspaceDigest: "sha256:t160-live-workspace",
    targetWorkRef: "work://t160/live-target/bugfix",
    selectedCompositionRef: "abg.fn-composition://t160/live/evaluate",
    selectedCompositionDigest: "sha256:t160-live-composition",
    graphFunctionRef: "graph-function://t160/live/target",
    graphVectorRef: "graph-vector://t160/live/repair",
    frameRefs: [
      "frame://t160/live/target",
      "frame://t160/live/executive"
    ],
    replayEventRefs: [
      "runtime-event://t160/live/payload",
      "runtime-event://t160/live/assurance"
    ],
    payloadLedgerRefs: ["payload-ledger://t160/live/target"],
    evidenceRefs: ["evidence://t160/live/current"],
    residualPressureRefs: ["pressure://t160/live/original-gap"],
    continuationRefs: ["continuation://t160/live/original-gap"],
    requirementIds: [REQUIREMENT_ID],
    spanLineage: [
      Object.freeze({
        kind: "requirement_span_lineage_projection",
        lineageRef: "requirement-span-lineage://t160/live",
        spanId: "span://t160/live",
        graphFunctionRef: "graph-function://t160/live/target",
        graphVectorRefs: ["graph-vector://t160/live/repair"],
        vectorIndexes: [0],
        sourceNodeRef: "node://t160/live/source",
        targetNodeRef: "node://t160/live/target",
        frameRefs: ["frame://t160/live/target"],
        zoomRefs: ["zoom://t160/live/detail"],
        foldbackRefs: ["foldback://t160/live/target"],
        aliasRefs: ["edge://t160/live/target"],
        active: true,
        sourceRefs: ["specification://t160/live"]
      })
    ],
    policyRefs: ["policy://t160/live/default-executive"],
    hookRefs: ["hook://abg/fp-consciousness/default"]
  });
}

function executivePrompt(observation) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P executive observer for ABI T-160.",
    "Assess replay-derived obligation pressure for the target workspace.",
    "You must not claim runtime authority, event emission, ledger writes, or workspace mutation.",
    "The original residual pressure is pressure://t160/live/original-gap.",
    "If the same pressure remains and the repair surface is nonlocal, preserve that residual and request re-entry.",
    "",
    "ABG executive observation view:",
    JSON.stringify(observation, null, 2),
    "",
    "Output contract:",
    "{",
    '  "spanPreserved": true,',
    '  "residualPressureRefs": string[],',
    '  "continuationRefs": string[],',
    '  "evidenceRefs": string[],',
    '  "diagnosticRefs": string[],',
    '  "reason": string',
    "}"
  ].join("\n");
}

async function writeExecutiveObserverArtifact(input) {
  await mkdir(input.runRoot, { recursive: true });
  const artifact = Object.freeze({
    kind: "abg_executive_observer_live_artifact",
    artifactVersion: 1,
    ticket: "T-160",
    createdAt: new Date().toISOString(),
    source: input.source,
    observation: input.observation,
    fpEvaluationOutcome: input.fpEvaluationOutcome,
    pressureFacts: input.pressureFacts,
    continuationInput: input.continuationInput
  });
  const artifactPath = path.join(input.runRoot, "executive-observer-artifact.json");
  const manifestPath = path.join(input.runRoot, "executive-observer-manifest.json");
  const artifactText = stableJson(artifact);
  const digest = sha256Text(artifactText);
  await writeFile(artifactPath, artifactText, "utf8");
  const manifest = Object.freeze({
    kind: "abg_executive_observer_live_artifact_manifest",
    artifactVersion: 1,
    ticket: "T-160",
    artifact: Object.freeze({
      path: artifactPath,
      sha256: digest,
      pressureFactCount: input.pressureFacts.length,
      decision: input.continuationInput.decision
    })
  });
  await writeFile(manifestPath, stableJson(manifest), "utf8");
  return Object.freeze({ artifact, manifest, artifactPath, manifestPath });
}

test("T-160 live F_P executive observer projects pressure without runtime authority", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T160_EXECUTIVE_OBSERVER_LIVE=1 or CODEX_LIVE_FP=1 to run T-160 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const observation = executiveObservation();
  const transport = await runAgentTransport({
    contract: contractForKnownAgent(agentKey),
    prompt: executivePrompt(observation),
    cwd: runRoot,
    archiveRoot: runRoot,
    label: "t160-recursive-executive-observer-live-fp",
    timeoutMs: transportTimeoutMs(),
    ...executorProfileFields(),
    outputPath: path.join(runRoot, "t160-live-executive-output.txt"),
    promptPath: path.join(runRoot, "t160-live-executive-prompt.txt"),
    stdoutPath: path.join(runRoot, "t160-live-executive-stdout.log"),
    stderrPath: path.join(runRoot, "t160-live-executive-stderr.log")
  });
  assert.equal(transport.status, 0, transport.stderr);
  const assessment = extractJsonObject(transport.text);
  assert.equal(assessment.spanPreserved, true);
  assert.equal(Array.isArray(assessment.residualPressureRefs), true);
  assert.equal(
    assessment.residualPressureRefs.includes("pressure://t160/live/original-gap"),
    true
  );
  const continuationRefs =
    Array.from(new Set([
      ...(Array.isArray(assessment.continuationRefs)
        ? assessment.continuationRefs
        : []),
      "continuation://t160/live/reentry/requirements"
    ]));
  const diagnosticRefs =
    Array.from(new Set([
      ...(Array.isArray(assessment.diagnosticRefs)
        ? assessment.diagnosticRefs
        : []),
      "diagnostic://t160/live/reentry-required"
    ]));
  const evidenceRefs =
    Array.isArray(assessment.evidenceRefs) &&
    assessment.evidenceRefs.length > 0
      ? assessment.evidenceRefs
      : ["evidence://t160/live/executive-finding"];
  const finding = publicRoot.constructFpEvaluationFinding({
    findingRef: "finding://t160/live/executive-pressure",
    evaluatorRef: "plugin://t160/live/executive-fp",
    gainReportRef: "gain://t160/live/executive-pressure",
    metricRefs: ["metric://t160/live/non-attenuation"],
    closeDisposition: "no_close",
    residualPressureRefs: assessment.residualPressureRefs,
    continuationRefs,
    evidenceRefs,
    authorityRefs: [REQUIREMENT_ID, observation.observationRef],
    compositionContributionRef: "abg.fn-regime://t160/live/fp",
    compositionRef: observation.selectedCompositionRef,
    compositionDigest: observation.selectedCompositionDigest,
    diagnosticRefs
  });
  const fpEvaluationOutcome = publicRoot.constructFpEvaluationOutcome({
    status: "evaluated",
    ambiguityStatus: "partial",
    findings: [finding],
    evidenceRefs: ["evidence://t160/live/evaluation-outcome"],
    reason: assessment.reason
  });
  const pressureFacts = publicExecutive.projectExecutivePressureFacts({
    observation,
    outcome: fpEvaluationOutcome
  });
  assert.equal(pressureFacts.length, 1);
  assert.equal(pressureFacts[0].attenuation, "unchanged");
  assert.equal(pressureFacts[0].disposition, "nonlocal_reentry");
  const continuationInput = publicExecutive.projectExecutiveContinuationInput({
    observation,
    pressureFacts
  });
  assert.equal(continuationInput.decision, "yield_reentry");
  assert.equal(continuationInput.reentryRefs.length, 1);

  const proof = await writeExecutiveObserverArtifact({
    runRoot,
    source: Object.freeze({
      proofTicket: "T-160",
      proofCommand: "npm run test:t160:live",
      sourceRunKind: "live_fp_recursive_executive_observer",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      requirementId: REQUIREMENT_ID
    }),
    observation,
    fpEvaluationOutcome,
    pressureFacts,
    continuationInput
  });
  assert.equal(proof.manifest.artifact.decision, "yield_reentry");
  assert.equal(proof.manifest.artifact.pressureFactCount, 1);
});
