// Validates: T-183 live closure gate
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as publicRoot from "@abiogenesis/typescript-tenant";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildThreeStageStartContext } from "../tests/support/m03-iteration-fixtures.mjs";
import { executorProfileFields } from "../live/support/executor_profile.mjs";

const SANDBOX_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(SANDBOX_DIR, "..");
const TENANT_ROOT = path.resolve(SANDBOX_DIR, "..", "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t183_instruction_assembly_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T183_INSTRUCTION_ASSEMBLY_LIVE"] === "1" ||
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

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: TENANT_ROOT,
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function stableJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`;
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/iu);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`live F_P worker did not return JSON: ${text}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function rule(overrides = {}) {
  return publicRoot.constructInstructionAssemblyRule({
    ruleRef: "instruction-rule://t183/live/framework-smoke",
    appliesToGraphFunctionRefs: ["graph-function://t183/live/framework-smoke"],
    appliesToVectorRefs: ["vector://t183/live/source-to-target"],
    sectionRules: [
      {
        sectionRef: "section://t183/live/current-vector",
        required: true,
        policyRefs: ["policy://t183/live/current-vector"]
      }
    ],
    relevanceRules: [
      {
        ruleRef: "relevance://t183/live/current-vector",
        requiredInputRefs: [],
        allowFutureStageRefs: []
      }
    ],
    compressionPolicyRef: "compression://t183/live/digest",
    proportionalityPolicyRef: "proportionality://t183/live/p1-worker",
    runtimeBindingSlotClasses: [
      "graph_call",
      "frame",
      "vector",
      "selected_graph_function",
      "event_log",
      "worker_invocation"
    ],
    policyRefs: ["policy://t183/live/software-build"],
    evidenceRefs: ["evidence://t183/live/rule"],
    ...overrides
  });
}

function section(overrides = {}) {
  return publicRoot.constructInstructionSectionDecision({
    sectionRef: "section://t183/live/current-vector",
    disposition: "include",
    dependencyRefs: ["vector://t183/live/source-to-target"],
    carrierRefs: ["node://t183/live/source", "node://t183/live/target"],
    compressionMode: "digest",
    text: [
      "Return only one JSON object. Do not include markdown or commentary.",
      "You are executing the ABG T-183 instruction-assembly live proof.",
      "Confirm that the compiled prompt envelope reached the F_P worker.",
      "Return exactly these fields:",
      "{",
      '  "status": "fulfilled",',
      '  "task": "t183_instruction_assembly_live",',
      '  "outputContractRef": "contract://t183/live/vector-0/output",',
      '  "summary": string',
      "}"
    ].join("\n"),
    digestRef: "sha256:t183-live-current-vector",
    excerptDigest: null,
    fullContentAdmitted: false,
    stageRef: "stage://t183/live/current",
    gapRefs: [],
    ...overrides
  });
}

function bindingSlots() {
  return [
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/graph-call",
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/live/slot/graph-call"]
    }),
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/frame",
      slotClass: "frame",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/live/slot/frame"]
    }),
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/vector",
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t183/live/slot/vector"]
    }),
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/selected-graph-function",
      slotClass: "selected_graph_function",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/live/slot/selection"]
    }),
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/event-log",
      slotClass: "event_log",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t183/live/slot/event-log"]
    }),
    publicRoot.constructRuntimeBindingSlot({
      slotRef: "slot://t183/live/worker",
      slotClass: "worker_invocation",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/live/slot/worker"]
    })
  ];
}

function graphFunctionDeclaration(graphFunctionRef) {
  return publicRoot.constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t183/live/framework-smoke",
    entryRef: "registry-entry://t183/live/framework-smoke",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t183.live",
    ownerRef: "owner://abg/t183",
    version: "4.2.0-rc.1",
    graphFunctionRef,
    interfaceRef: "interface://t183/live/framework-smoke",
    sourceContractRef: "contract://t183/live/source",
    targetContractRef: "contract://t183/live/target",
    contextRefs: ["context://t183/live"],
    authorityRefs: ["authority://t183/live/abg-runtime"],
    overlayRefs: ["overlay://t183/live/framework-smoke"],
    provenanceRefs: ["provenance://t183/live"],
    readinessRefs: ["readiness://t183/live"],
    proofRefs: ["proof://t183/live"],
    policyRefs: ["policy://t183/live"],
    declarationSourceRefs: ["gtl://module/t183/live"]
  });
}

function productStartupConfig() {
  return publicRoot.constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t183/live",
    productNamespace: "t183.live",
    ownerRef: "owner://abg/t183",
    version: "4.2.0-rc.1",
    enabledLibraryRefs: [
      "registry-entry://t183/live/framework-smoke",
      "gtl-declaration://t183/live/framework-smoke",
      "gtl://module/t183/live"
    ],
    overlayRefs: ["overlay://t183/live/framework-smoke"],
    pluginRefs: ["plugin://t183/live/fp-worker"],
    readinessRefs: ["readiness://t183/live"],
    proofRefs: ["proof://t183/live"],
    policyRefs: ["policy://t183/live"],
    configSourceRefs: ["config://t183/live"]
  });
}

function acceptedPlan(input) {
  const result = publicRoot.compileInstructionAssemblyPlan(input);
  assert.equal(result.accepted, true);
  assert.ok(result.plan);
  return result.plan;
}

function startPlanForFirstVector(executive) {
  const vector = executive.template.graph.vectors[0];
  assert.ok(vector);
  return acceptedPlan({
    planRef: "compiled-prompt-plan://t183/live/vector-0",
    rule: rule({
      ruleRef: "instruction-rule://t183/live/vector-0",
      appliesToGraphFunctionRefs: [executive.id],
      appliesToVectorRefs: [vector.name]
    }),
    graphFunctionRef: executive.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://t183/live/framework-smoke"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: {
      kind: "derived_instruction_carrier_truth",
      sourceTypeRefs: vector.source.map((node) => node.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: ["contract://t183/live/vector-0/output"],
      proofRefs: ["proof://t183/live/vector-0"],
      authorityRefs: ["authority://t183/live/abg-runtime"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      activeRegime: "F_P",
      carrierClassRefs: [
        "carrier://t183/live/source",
        "carrier://t183/live/target"
      ]
    },
    knownAlgebraRefs: [...publicRoot.INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs: [],
    availableInputRefs: [],
    sectionDecisions: [section()],
    bindingSlots: bindingSlots(),
    proportionalityClass: "P1",
    expectedAnswerMarkers: ["blocked", "closed", "release_ready"],
    fpValidationEvidenceRefs: ["semantic-review-gate://t183/live/compiler-review"],
    compilerEvidenceRefs: ["evidence://t183/live/compiler"]
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

async function writeLiveArtifact(input) {
  const manifestEvents = input.result.replayEvents.filter(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  const responseEvents = input.result.replayEvents.filter(
    (event) => event.kind === "instruction_response_contract_admitted"
  );
  const artifact = Object.freeze({
    kind: "t183_instruction_assembly_live_artifact",
    artifactVersion: 1,
    ticket: "T-183",
    createdAt: new Date().toISOString(),
    source: input.source,
    durationMs: input.durationMs,
    agentKey: input.agentKey,
    workerAssessment: input.workerAssessment,
    manifestEvents,
    responseEvents,
    replayEvents: input.result.replayEvents,
    emittedEvents: input.result.emittedEvents,
    sinkEvents: input.sinkEvents,
    liveTransport: input.liveTransport
  });
  const artifactText = stableJson(artifact);
  const digest = sha256Text(artifactText);
  const artifactPath = path.join(input.runRoot, "instruction-assembly-live-artifact.json");
  const manifestPath = path.join(input.runRoot, "instruction-assembly-live-manifest.json");
  await writeFile(artifactPath, artifactText, "utf8");
  await writeFile(
    manifestPath,
    stableJson({
      kind: "t183_instruction_assembly_live_artifact_manifest",
      artifactVersion: 1,
      ticket: "T-183",
      artifact: {
        path: artifactPath,
        sha256: digest,
        promptManifestCount: manifestEvents.length,
        responseAdmissionCount: responseEvents.length
      },
      source: input.source,
      agentKey: input.agentKey,
      durationMs: input.durationMs
    }),
    "utf8"
  );
  return Object.freeze({ artifact, artifactPath, manifestPath, digest });
}

test("T-183 live F_P dispatch receives ABG-compiled instruction manifest", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T183_INSTRUCTION_ASSEMBLY_LIVE=1 or CODEX_LIVE_FP=1 to run T-183 live proof");
    return;
  }

  const agentKey = liveAgentKey();
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(runRoot, { recursive: true });
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const plan = startPlanForFirstVector(executive);
  const declaration = graphFunctionDeclaration(executive.id);
  const sinkEvents = [];
  const liveArtifacts = [];
  const startedAt = Date.now();

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/live/fp-dispatch"),
    async dispatch(pluginInput) {
      assert.ok(
        pluginInput.instructionPromptManifest,
        "live dispatch must receive the ABG-projected prompt manifest"
      );
      assert.equal(pluginInput.instructionPromptManifest.planRef, plan.planRef);
      assert.equal(
        pluginInput.instructionPromptManifest.outputContractRefs.includes(
          "contract://t183/live/vector-0/output"
        ),
        true
      );
      const transport = await runAgentTransport({
        contract: contractForKnownAgent(agentKey),
        prompt: pluginInput.instructionPromptManifest.renderedPrompt,
        cwd: runRoot,
        archiveRoot: runRoot,
        label: "t183-instruction-assembly-live-fp-dispatch",
        timeoutMs: transportTimeoutMs(),
        ...executorProfileFields(),
        outputPath: path.join(runRoot, "instruction-assembly-output.txt"),
        promptPath: path.join(runRoot, "instruction-assembly-prompt.txt"),
        stdoutPath: path.join(runRoot, "instruction-assembly-stdout.log"),
        stderrPath: path.join(runRoot, "instruction-assembly-stderr.log")
      });
      assert.equal(transport.status, 0, transport.stderr);
      const assessment = extractJsonObject(transport.text);
      assert.equal(assessment.status, "fulfilled");
      assert.equal(assessment.task, "t183_instruction_assembly_live");
      assert.equal(
        assessment.outputContractRef,
        "contract://t183/live/vector-0/output"
      );
      const attachedResultArtifact = Object.freeze({
        ...assessment,
        manifestRef: pluginInput.instructionPromptManifest.manifestRef,
        promptDigest: pluginInput.instructionPromptManifest.promptDigest,
        edge: pluginInput.edge,
        actor: "live-worker",
        fulfillment_assessments: Object.freeze(
          (pluginInput.expectedAssessmentIds.length > 0
            ? pluginInput.expectedAssessmentIds
            : ["t183_live_instruction_assembly"]).map((id) =>
            Object.freeze({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail:
                "live worker responded to the ABG-compiled instruction manifest",
              blocking_reasons: [],
              evidence_refs: [`proof://t183/live/${id}`]
            })
          )
        ),
        selected_worker_id: `worker://t183/live/${agentKey}`,
        selected_backend: "backend://live-agent",
        role_id: "role://t183/live/fp-dispatch",
        assignment_source: "compiled_instruction_manifest",
        resolved_runtime_ref: `runtime://agent/${agentKey}`,
        liveTransport: Object.freeze({
          status: transport.status,
          traceResultPath: transport.traceResultPath,
          outputPath: transport.outputPath
        })
      });
      liveArtifacts.push(attachedResultArtifact);
      return publicRoot.constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/live/${encodeURIComponent(pluginInput.edge)}`,
        attachedResultArtifact,
        evidenceRefs: [
          pluginInput.sourceProjectionRef,
          pluginInput.instructionPromptManifest.manifestRef,
          `file://${transport.outputPath}`
        ]
      });
    }
  });

  const result = await publicRoot.runEngineStartAsync({
    startIntent: input,
    ...context,
    eventSink: (event) => {
      sinkEvents.push(event);
    },
    plugins: {
      fpDispatch
    },
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/live/start-registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [plan],
      rendererRef: "renderer://abg/instruction-envelope/default"
    }
  });
  const durationMs = Date.now() - startedAt;

  assert.equal(liveArtifacts.length, 1);
  const manifestEvents = result.replayEvents.filter(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  const responseEvents = result.replayEvents.filter(
    (event) => event.kind === "instruction_response_contract_admitted"
  );
  assert.equal(manifestEvents.length, 1);
  assert.equal(responseEvents.length, 1);
  assert.equal(responseEvents[0].manifestRef, manifestEvents[0].manifestRef);
  assert.equal(responseEvents[0].planRef, plan.planRef);
  assert.equal(
    result.replayEvents.findIndex(
      (event) => event.kind === "instruction_prompt_manifest_projected"
    ) <
      result.replayEvents.findIndex(
        (event) => event.kind === "fp_dispatch_requested"
      ),
    true
  );
  assert.equal(
    result.replayEvents.findIndex(
      (event) => event.kind === "actor_result_artifact_observed"
    ) <
      result.replayEvents.findIndex(
        (event) => event.kind === "instruction_response_contract_admitted"
      ),
    true
  );

  const source = Object.freeze({
    commit: gitOutput(["rev-parse", "HEAD"]),
    dirtyStatus: gitOutput(["status", "--short"])
  });
  const written = await writeLiveArtifact({
    runRoot,
    result,
    sinkEvents,
    workerAssessment: liveArtifacts[0],
    liveTransport: liveArtifacts[0].liveTransport,
    source,
    agentKey,
    durationMs
  });
  assert.match(written.digest, /^sha256:[a-f0-9]{64}$/u);
});
