// Validates: T-160 live closure gate

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import {
  sha256Text,
  stableJson
} from "../tests/support/requirements-route-replay-artifact.mjs";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";
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

function firstTraversalBasis(basis) {
  return Object.freeze({
    ...basis,
    startIntent: Object.freeze({
      ...basis.startIntent,
      until: "first_traversal"
    })
  });
}

function fpDispatchContract(ref) {
  return publicRoot.constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fpEvaluatorContract(ref) {
  return publicRoot.constructEnginePluginContract({
    ref,
    pluginKind: "fp_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpEvaluationOutcome"
  });
}

function executiveObservationInput(basis) {
  const vector = basis.graph.vectors[0];
  return Object.freeze({
    observerGraphFunctionRef: "graph-function://abg/executive/live-observer",
    targetWorkspaceContextRef: "context://t160/live/target-workspace",
    targetWorkspaceLocator: "workspace://t160/live-target",
    targetWorkspaceDigest: "sha256:t160-live-workspace",
    targetWorkRef: "work://t160/live-target/requirements-gap",
    selectedCompositionRef: "abg.fn-composition://t160/live/evaluate",
    selectedCompositionDigest: "sha256:t160-live-composition",
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    frameRefs: [basis.frameId ?? `frame:${basis.id}:root`],
    replayEventRefs: ["runtime-event://t160/live/fp-evaluation"],
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
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRefs: [vector.id],
        vectorIndexes: [0],
        sourceNodeRef: vector.source[0].id,
        targetNodeRef: vector.target.id,
        frameRefs: [basis.frameId ?? `frame:${basis.id}:root`],
        zoomRefs: [],
        foldbackRefs: [],
        aliasRefs: [],
        active: true,
        sourceRefs: ["specification://t160/live"]
      })
    ],
    policyRefs: ["policy://t160/live/default-executive"],
    hookRefs: ["hook://abg/fp-consciousness/default"]
  });
}

function dispatchPlugin() {
  return Object.freeze({
    contract: fpDispatchContract("plugin://t160/live/fp-dispatch"),
    dispatch(input) {
      const assessmentIds =
        input.expectedAssessmentIds.length > 0
          ? input.expectedAssessmentIds
          : ["t160_live_candidate"];
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t160/live/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: Object.freeze({
          edge: input.edge,
          actor: "live-worker",
          candidate: Object.freeze({
            kind: "executive_observer_live_candidate",
            unresolvedPressure: "pressure://t160/live/original-gap",
            repairSurface: "requirements boundary may need nonlocal re-entry",
            localEdgeEvidence: "current edge did not clear the requirement pressure"
          }),
          fulfillment_assessments: assessmentIds.map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "candidate admitted for live executive observer assessment",
              blocking_reasons: [],
              evidence_refs: [`proof://t160/live/${id}`]
            })
          ),
          selected_worker_id: "worker://t160/live-dispatch",
          selected_backend: "backend://node",
          role_id: "role://t160/live",
          assignment_source: "installed_live_proof",
          resolved_runtime_ref: "runtime://typescript/node"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function executivePrompt(input) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P evaluator for ABI T-160 executive pressure observation.",
    "Assess the attached candidate and decide how the residual pressure should be classified.",
    "You must not claim runtime authority, event emission, ledger writes, graph/frame mutation, or workspace mutation.",
    "",
    "Executive observation input:",
    JSON.stringify(input.observation, null, 2),
    "",
    "Attached candidate:",
    JSON.stringify(input.candidate, null, 2),
    "",
    "Choose disposition from: local_repair, nonlocal_reentry, reprice, block, close_candidate.",
    "Return continuationRefs only when your disposition requires continuation or re-entry.",
    "Return diagnosticRefs only for facts you judged from the observation and candidate.",
    "",
    "Output contract:",
    "{",
    '  "disposition": "local_repair|nonlocal_reentry|reprice|block|close_candidate",',
    '  "closeDisposition": "no_close|human_required|block|close",',
    '  "residualPressureRefs": string[],',
    '  "continuationRefs": string[],',
    '  "evidenceRefs": string[],',
    '  "diagnosticRefs": string[],',
    '  "reason": string',
    "}"
  ].join("\n");
}

function evaluatorPlugin(input) {
  return Object.freeze({
    contract: fpEvaluatorContract("plugin://t160/live/fp-evaluator"),
    async evaluate(evaluationInput) {
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(input.agentKey),
        prompt: executivePrompt({
          observation: input.observation,
          candidate: evaluationInput.attachedResultArtifact
        }),
        cwd: input.runRoot,
        archiveRoot: input.runRoot,
        label: "t160-recursive-executive-observer-live-fp",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(input.runRoot, "t160-live-executive-output.txt"),
        promptPath: path.join(input.runRoot, "t160-live-executive-prompt.txt"),
        stdoutPath: path.join(input.runRoot, "t160-live-executive-stdout.log"),
        stderrPath: path.join(input.runRoot, "t160-live-executive-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const assessment = extractJsonObject(transport.text);
      const allowedDispositions = new Set([
        "local_repair",
        "nonlocal_reentry",
        "reprice",
        "block",
        "close_candidate"
      ]);
      assert.equal(allowedDispositions.has(assessment.disposition), true);
      assert.equal(Array.isArray(assessment.residualPressureRefs), true);
      assert.equal(assessment.residualPressureRefs.length > 0, true);
      const closeDisposition =
        assessment.closeDisposition === "human_required" ||
        assessment.closeDisposition === "block" ||
        assessment.closeDisposition === "close"
          ? assessment.closeDisposition
          : "no_close";
      const diagnosticRefs = Array.isArray(assessment.diagnosticRefs)
        ? assessment.diagnosticRefs
        : [];
      const translatedDiagnosticRefs =
        assessment.disposition === "nonlocal_reentry" &&
        !diagnosticRefs.some((ref) => ref.includes("reentry"))
          ? [...diagnosticRefs, "diagnostic://t160/live/llm-nonlocal-reentry"]
          : diagnosticRefs;
      const evidenceRefs =
        Array.isArray(assessment.evidenceRefs) &&
        assessment.evidenceRefs.length > 0
          ? assessment.evidenceRefs
          : ["evidence://t160/live/executive-finding"];
      return publicRoot.constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: "partial",
        findings: [
          publicRoot.constructFpEvaluationFinding({
            findingRef: "finding://t160/live/executive-pressure",
            evaluatorRef: evaluationInput.contract.ref,
            gainReportRef: "gain://t160/live/executive-pressure",
            metricRefs: ["metric://t160/live/non-attenuation"],
            closeDisposition,
            residualPressureRefs: assessment.residualPressureRefs,
            continuationRefs: Array.isArray(assessment.continuationRefs)
              ? assessment.continuationRefs
              : [],
            evidenceRefs,
            authorityRefs: [REQUIREMENT_ID, input.observation.targetWorkRef],
            compositionContributionRef:
              evaluationInput.selectedRegimeBindingRef ??
              evaluationInput.selectedCompositionRef,
            compositionRef: evaluationInput.selectedCompositionRef,
            compositionDigest: evaluationInput.selectedCompositionDigest,
            diagnosticRefs: translatedDiagnosticRefs
          })
        ],
        evidenceRefs: [evaluationInput.sourceProjectionRef],
        reason: assessment.reason
      });
    }
  });
}

async function writeExecutiveObserverArtifact(input) {
  await mkdir(input.runRoot, { recursive: true });
  const pressureEvents = input.result.replayEvents.filter((event) =>
    event.kind === "executive_pressure_fact_projected"
  );
  const artifact = Object.freeze({
    kind: "abg_executive_observer_live_artifact",
    artifactVersion: 2,
    ticket: "T-160",
    createdAt: new Date().toISOString(),
    source: input.source,
    observation: input.observation,
    replayEvents: input.result.replayEvents,
    emittedEvents: input.result.emittedEvents,
    sinkEvents: input.sinkEvents,
    pressureEvents
  });
  const artifactPath = path.join(input.runRoot, "executive-observer-artifact.json");
  const manifestPath = path.join(input.runRoot, "executive-observer-manifest.json");
  const artifactText = stableJson(artifact);
  const digest = sha256Text(artifactText);
  await writeFile(artifactPath, artifactText, "utf8");
  const manifest = Object.freeze({
    kind: "abg_executive_observer_live_artifact_manifest",
    artifactVersion: 2,
    ticket: "T-160",
    artifact: Object.freeze({
      path: artifactPath,
      sha256: digest,
      pressureEventCount: pressureEvents.length,
      disposition: pressureEvents[0]?.executivePressureFact?.disposition ?? null
    })
  });
  await writeFile(manifestPath, stableJson(manifest), "utf8");
  return Object.freeze({ artifact, manifest, artifactPath, manifestPath });
}

test("T-160 live F_P executive observer emits pressure through engine replay", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T160_EXECUTIVE_OBSERVER_LIVE=1 or CODEX_LIVE_FP=1 to run T-160 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const basis = firstTraversalBasis(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t160/live",
      runId: "run://t160/live"
    })
  );
  const observation = executiveObservationInput(basis);
  const sinkEvents = [];
  const result = await publicRoot.runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch: dispatchPlugin(),
      fpEvaluator: evaluatorPlugin({
        agentKey,
        runRoot,
        observation
      })
    },
    executiveObserver: {
      observation
    }
  });

  assert.equal(result.transition.kind, "terminal");
  const pressureEvents = result.replayEvents.filter((event) =>
    event.kind === "executive_pressure_fact_projected"
  );
  assert.equal(pressureEvents.length, 1);
  assert.equal(
    sinkEvents.some((event) => event.kind === "executive_pressure_fact_projected"),
    true
  );
  assert.equal(
    pressureEvents[0].executivePressureFact.kind,
    "abg_executive_pressure_fact_projection"
  );
  assert.equal(
    pressureEvents[0].pressureFactRef,
    pressureEvents[0].executivePressureFact.pressureFactRef
  );

  const proof = await writeExecutiveObserverArtifact({
    runRoot,
    source: Object.freeze({
      proofTicket: "T-160",
      proofCommand: "npm run test:t160:live",
      sourceRunKind: "live_fp_recursive_executive_observer_engine_replay",
      proofRunRoot: runRoot,
      liveAgent: agentKey,
      requirementId: REQUIREMENT_ID
    }),
    observation,
    result,
    sinkEvents
  });
  assert.equal(proof.manifest.artifact.pressureEventCount, 1);
});
