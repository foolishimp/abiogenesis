// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS,
  qualifyInstalledLiveScenarioPortfolio,
  qualifyInstalledSandbox
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildInstalledLiveScenarioPortfolioRequest,
  buildInstalledSandboxRequest,
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../tests/support/m05-installed-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TENANT_ROOT = path.dirname(TEST_ENV_ROOT);
const READY_TOKEN = "ABG_TS_READY";
const EXPECTED_STAGE_EVENT_PREFIX = [
  "basis_admitted",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "fp_dispatch_requested",
  "actor_invocation_started",
  "actor_invocation_closed"
];
const EXPECTED_ASSESSMENT_PAYLOAD_EVENT_CHAIN_PER_ID = [
  "payload_observed",
  "payload_validated",
  "evidence_admitted"
];
const SCENARIOS = M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map((obligation) => ({
  scenarioName: obligation.scenarioName,
  authorityRefs: [...obligation.requiredAuthorityRefs],
  mode: obligation.mode,
  stages: obligation.stages.map((stage) => ({
    handle: stage.handle,
    edge: stage.edge,
    sourceKind: stage.sourceKind,
    targetKind: stage.targetKind,
    assetHandle: stage.assetHandle,
    assessmentIds: [...stage.assessmentIds]
  }))
}));
const REQUIRED_SCENARIOS = SCENARIOS.map((scenario) => scenario.scenarioName);

function liveEnabled() {
  return process.env["ABG_TS_LIVE_PORTFOLIO"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "codex";
}

function transportTimeoutMs() {
  const raw = process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "600000";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 600000;
}

function expectedAssessmentEventKinds(count) {
  if (count <= 0) {
    return [];
  }
  return [
    "authority_snapshot_admitted",
    ...Array.from(
      { length: count },
      () => EXPECTED_ASSESSMENT_PAYLOAD_EVENT_CHAIN_PER_ID
    ).flat(),
    ...Array.from({ length: count }, () => "assessed")
  ];
}

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, "").replace("T", "T");
}

function defaultArchiveRoot() {
  return path.join(
    TEST_ENV_ROOT,
    "test_runs",
    "typescript_rc_live_portfolio",
    timestampId()
  );
}

function archiveRoot() {
  const configured = process.env["ABG_TS_LIVE_ARCHIVE_ROOT"];
  return configured === undefined || configured.length === 0
    ? defaultArchiveRoot()
    : path.resolve(configured, "portfolio", timestampId());
}

function safeName(value) {
  return value.replace(/[^A-Za-z0-9._-]+/gu, "_").replace(/^_+|_+$/gu, "") || "unnamed";
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function stringEnv() {
  const out = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function sanitizeEnvironment(contract) {
  const prefixes = contract.sanitizedEnvironmentPolicy.prefixes.filter(
    (prefix) => prefix.length > 0
  );
  const env = {};
  outer: for (const [key, value] of Object.entries(stringEnv())) {
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        continue outer;
      }
    }
    env[key] = value;
  }
  return env;
}

function renderArgs(template, replacements) {
  return template.map((arg) =>
    arg
      .replaceAll("{prompt}", replacements.prompt)
      .replaceAll("{output_path}", replacements.outputPath)
  );
}

function collectTransportText(run, outputPath) {
  if (existsSync(outputPath)) {
    const output = readFileSync(outputPath, "utf8");
    if (output.trim().length > 0) {
      return output;
    }
  }
  return run.stdout;
}

function runTransport(request, prompt, cwd, root, label) {
  const outputPath = path.join(root, `${label}-output.txt`);
  const args = renderArgs(request.transportContract.argsTemplate, {
    prompt,
    outputPath
  });
  const run = spawnSync(request.transportContract.command, args, {
    cwd,
    encoding: "utf8",
    env: sanitizeEnvironment(request.transportContract),
    timeout: transportTimeoutMs(),
    maxBuffer: 1024 * 1024 * 10
  });
  return {
    command: request.transportContract.command,
    args,
    outputPath,
    status: run.status,
    signal: run.signal,
    error: run.error === undefined ? null : String(run.error),
    stdout: run.stdout,
    stderr: run.stderr,
    text: collectTransportText(run, outputPath)
  };
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced === null ? trimmed : fenced[1].trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) {
      throw new TypeError("transport response did not contain a JSON object");
    }
    return JSON.parse(candidate.slice(first, last + 1));
  }
}

function readinessPrompt() {
  return `Return exactly this token and nothing else: ${READY_TOKEN}`;
}

function resultArtifactPrompt(scenario, stage, stageIndex, request, agentKey) {
  const assessments = request.expectedAssessmentIds.map((id) => ({
    id,
    evaluator: id,
    fulfillment_status: "fulfilled",
    fulfillment_detail:
      `${scenario.scenarioName} stage ${stageIndex + 1} satisfied ${id}`,
    blocking_reasons: [],
    evidence_refs: [
      `live://typescript-rc-portfolio/${scenario.scenarioName}/${stageIndex + 1}/${id}`
    ]
  }));
  const example = {
    edge: request.expectedEdge,
    actor: agentKey,
    fulfillment_assessments: assessments,
    selected_worker_id: request.workerId,
    selected_backend: request.backendId,
    role_id: "role://rc-live-portfolio",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/rc-live-portfolio"
  };
  return [
    "Return only a JSON object. Do not include markdown or commentary.",
    "You are satisfying an Abiogenesis TypeScript RC live sandbox portfolio dispatch contract.",
    `Scenario: ${scenario.scenarioName}`,
    `Scenario mode: ${scenario.mode}`,
    `Stage: ${stageIndex + 1} of ${scenario.stages.length}`,
    `Expected edge: ${request.expectedEdge}`,
    `Required fulfillment assessment ids: ${request.expectedAssessmentIds.join(", ")}`,
    "The JSON object must match this exact shape and include no extra assessment ids:",
    JSON.stringify(example, null, 2)
  ].join("\n");
}

function dispatchSource(scenario, stage, stageIndex, agentKey) {
  return `
    import {
      edge,
      graphFunctionForVector,
      admitModule,
      admitNode,
      admitExecutionBasis,
      deriveAdvancementTransition,
      dispatchRequestsForTransition,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      admitOperatorAssetQueryContract,
      admitPublicStartRequest,
      publicStart,
      resolvePublicAssetTarget
    } from "@abiogenesis/typescript-tenant";

    const scenario = ${JSON.stringify(scenario)};
    const stage = ${JSON.stringify(stage)};
    const stageIndex = ${JSON.stringify(stageIndex)};
    const agentKey = ${JSON.stringify(agentKey)};

    function node(kind, role) {
      return admitNode({
        id: \`node-\${scenario.scenarioName}-\${stageIndex}-\${role}-\${kind}\`,
        name: \`\${role} \${kind}\`,
        schema: { kind: "symbolic", ref: \`Vector[\${kind}]\` },
        markov: ["declared"],
        assetSurface: {
          kind,
          requiredContexts: ["workspace"],
          standardsRefs: ["REQ-P-QUAL", "REQ-P-SCENARIOS"],
          outputContractRefs: [\`\${kind}-contract\`]
        },
        tags: [scenario.scenarioName, role, kind]
      });
    }

    const source = node(stage.sourceKind, "source");
    const target = node(stage.targetKind, "target");
    const vector = edge([source], target, {
      id: \`graph-\${scenario.scenarioName}-\${stageIndex}\`,
      name: stage.edge,
      evaluators: stage.assessmentIds.map((id) => ({
        name: id,
        regime: "F_P",
        description: \`\${stage.edge} satisfies \${id}\`,
        binding: \`binding://\${scenario.scenarioName}/\${id}\`,
        tags: ["fulfillment", scenario.mode]
      })),
      declarations: { entries: [] }
    }).vectors[0];
    const graphFunction = graphFunctionForVector(vector, {
      id: \`graph-function-\${scenario.scenarioName}-\${stageIndex}\`,
      name: stage.handle,
      declarations: { entries: [] }
    });
    const module = admitModule({
      name: \`rc_live_portfolio_\${scenario.scenarioName}_\${stageIndex}\`,
      graphs: [graphFunction.template.graph],
      graphFunctions: [graphFunction],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: \`job-\${scenario.scenarioName}-\${stageIndex}\`,
          name: \`\${stage.handle}_job\`,
          contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
          roles: [],
          tags: ["semantic_work", scenario.mode]
        }
      ],
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: { entries: [] }
    });

    let targetHandle = stage.handle;
    let assetResolution = null;
    if (stage.assetHandle !== null) {
      assetResolution = await resolvePublicAssetTarget(
        {
          target: {
            kind: "asset",
            handle: stage.assetHandle
          }
        },
        {
          module,
          workspaceRoot: \`/workspace/\${scenario.scenarioName}\`,
          operatorAssetContract: admitOperatorAssetQueryContract({
            command: ["node", "operator-asset-query.mjs"]
          })
        },
        async () => ({
          assets: [
            {
              asset_id: stage.assetHandle,
              uri: \`file://\${scenario.scenarioName}/\${stage.targetKind}\`,
              operator_target: {
                kind: "graph_function",
                handle: stage.handle
              }
            }
          ]
        })
      );
      if (assetResolution.kind !== "resolved") {
        throw new Error(\`asset target failed to resolve: \${assetResolution.kind}\`);
      }
      targetHandle = assetResolution.target.ownerHandle;
    }

    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: \`worker://rc-live-\${agentKey}\`,
      backendId: \`backend://\${agentKey}\`,
      buildId: "build://typescript-rc-live-portfolio",
      resolvedRuntimeRef: "runtime://typescript/rc-live-portfolio"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://typescript-rc-live-portfolio",
      defaultRegime: "F_P",
      dispatchRef: \`dispatch://\${agentKey}\`
    });
    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: \`/workspace/\${scenario.scenarioName}\`,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: targetHandle
      },
      until: "converged"
    };
    const events = [];
    const runId = \`run://typescript-rc-live-portfolio/\${scenario.scenarioName}/\${stageIndex}\`;
    const workKey = \`wk://typescript-rc-live-portfolio/\${scenario.scenarioName}/\${stageIndex}\`;
    const startOutcome = publicStart(
      startInput,
      {
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId,
        workKey
      },
      (event) => events.push(event)
    );
    const startRequest = admitPublicStartRequest(startInput);
    const dispatchRequest = dispatchRequestsForTransition(
      deriveAdvancementTransition(
        admitExecutionBasis({
          startIntent: startRequest.startIntent,
          module,
          runtimeIdentity,
          resolvedPolicy,
          runId,
          workKey,
          frameId: null,
          frameLineageId: null
        })
      )
    )[0];

    console.log(JSON.stringify({
      scenarioName: scenario.scenarioName,
      scenarioMode: scenario.mode,
      scenarioAuthorityRefs: scenario.authorityRefs,
      stageIndex,
      stage,
      startInput,
      startOutcome,
      dispatchRequest,
      assetResolution,
      eventKinds: events.map((event) => event.kind)
    }));
  `;
}

function assessmentSource(label) {
  return `
    import { readFile } from "node:fs/promises";
    import {
      admitResultArtifact,
      projectLiveStatus,
      resultAssessment
    } from "@abiogenesis/typescript-tenant";

    const dispatchBundle = JSON.parse(
      await readFile(".abiogenesis/${label}-dispatch.json", "utf8")
    );
    const rawArtifact = JSON.parse(
      await readFile(".abiogenesis/${label}-result-artifact.json", "utf8")
    );
    const artifact = admitResultArtifact(
      dispatchBundle.dispatchRequest,
      rawArtifact
    );
    const assessmentRequest = {
      kind: "fp_assessed",
      dispatch_request: dispatchBundle.dispatchRequest,
      result_artifact: rawArtifact,
      manifest_provenance: {
        spec_hash: "spec://typescript-rc-live-portfolio",
        manifest_id: \`manifest://typescript-rc-live-portfolio/\${dispatchBundle.scenarioName}/\${dispatchBundle.stageIndex}\`,
        workflow_version: "wf://typescript-rc-live-portfolio",
        run_id: \`run://typescript-rc-live-portfolio/\${dispatchBundle.scenarioName}/\${dispatchBundle.stageIndex}\`,
        work_key: \`wk://typescript-rc-live-portfolio/\${dispatchBundle.scenarioName}/\${dispatchBundle.stageIndex}\`,
        authority_ref: dispatchBundle.scenarioAuthorityRefs.join(","),
        selected_worker_id: dispatchBundle.dispatchRequest.workerId,
        selected_backend: dispatchBundle.dispatchRequest.backendId,
        role_id: "role://rc-live-portfolio",
        assignment_source: "policy_resolution",
        resolved_runtime_ref: "runtime://typescript/rc-live-portfolio"
      },
      published_ledger_ref: {
        ref: \`ledger://typescript-rc-live-portfolio/\${dispatchBundle.scenarioName}/\${dispatchBundle.stageIndex}\`
      }
    };
    const events = [];
    const assessmentOutcome = resultAssessment(
      assessmentRequest,
      (event) => events.push(event)
    );
    const projection = projectLiveStatus({
      start_request: dispatchBundle.startInput,
      start_outcome: dispatchBundle.startOutcome,
      control_request: null,
      control_outcome: null,
      result_assessment_request: assessmentRequest,
      result_assessment_outcome: assessmentOutcome
    });

    console.log(JSON.stringify({
      artifact,
      assessmentRequest,
      assessmentOutcome,
      projection,
      eventKinds: events.map((event) => event.kind)
    }));
  `;
}

async function runLiveStage({
  scenario,
  stage,
  stageIndex,
  agentKey,
  targetRoot,
  root,
  readinessState
}) {
  const stageLabel = `${safeName(scenario.scenarioName)}_${String(stageIndex + 1).padStart(2, "0")}`;
  const stageRoot = path.join(root, scenario.scenarioName, stageLabel);
  await mkdir(stageRoot, { recursive: true });

  const dispatchRun = await runInstalledNodeScript(
    targetRoot,
    dispatchSource(scenario, stage, stageIndex, agentKey)
  );
  await writeJson(path.join(stageRoot, "dispatch-script.json"), {
    status: dispatchRun.status,
    stderr: dispatchRun.stderr
  });
  assert.equal(dispatchRun.status, 0, dispatchRun.stderr);

  const dispatchBundle = JSON.parse(dispatchRun.stdout);
  await writeJson(path.join(stageRoot, "dispatch_projection.json"), {
    scenarioName: dispatchBundle.scenarioName,
    stageIndex: dispatchBundle.stageIndex,
    stage: dispatchBundle.stage,
    startOutcome: dispatchBundle.startOutcome,
    assetResolution: dispatchBundle.assetResolution,
    eventKinds: dispatchBundle.eventKinds
  });
  await writeJson(path.join(stageRoot, "dispatch_request.json"), dispatchBundle.dispatchRequest);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", `${stageLabel}-dispatch.json`),
    `${JSON.stringify(dispatchBundle, null, 2)}\n`,
    "utf8"
  );

  const request = dispatchBundle.dispatchRequest;
  assert.equal(dispatchBundle.startOutcome.kind, "blocked");
  assert.equal(dispatchBundle.startOutcome.stopPredicate, "dispatch_required");
  assert.equal(request.expectedEdge, stage.edge);
  assert.deepStrictEqual(request.expectedAssessmentIds, stage.assessmentIds);
  assert.deepStrictEqual(dispatchBundle.eventKinds, EXPECTED_STAGE_EVENT_PREFIX);

  if (!readinessState.ready) {
    const readiness = runTransport(
      request,
      readinessPrompt(),
      targetRoot,
      root,
      "readiness"
    );
    await writeJson(path.join(root, "readiness.json"), readiness);
    if (readiness.status !== 0 || !readiness.text.includes(READY_TOKEN)) {
      assert.fail(
        `configured live backend is not ready for ${agentKey}; diagnostic archived at ${root}`
      );
    }
    readinessState.ready = true;
  }

  const prompt = resultArtifactPrompt(
    scenario,
    stage,
    stageIndex,
    request,
    agentKey
  );
  await writeFile(path.join(stageRoot, "prompt.txt"), prompt, "utf8");
  const transport = runTransport(request, prompt, targetRoot, stageRoot, "dispatch");
  await writeJson(path.join(stageRoot, "transport.json"), transport);
  await writeFile(path.join(stageRoot, "raw_response.txt"), transport.text, "utf8");
  assert.equal(
    transport.status,
    0,
    `live transport failed; archive: ${stageRoot}\n${transport.stderr}`
  );

  let rawArtifact;
  try {
    rawArtifact = extractJsonObject(transport.text);
  } catch (error) {
    await writeJson(path.join(stageRoot, "contract_failure.json"), {
      message: error instanceof Error ? error.message : String(error),
      rawResponse: transport.text
    });
    assert.fail(`live transport returned non-JSON artifact; archive: ${stageRoot}`);
  }

  await writeJson(path.join(stageRoot, "result_artifact.json"), rawArtifact);
  await writeFile(
    path.join(targetRoot, ".abiogenesis", `${stageLabel}-result-artifact.json`),
    `${JSON.stringify(rawArtifact, null, 2)}\n`,
    "utf8"
  );

  const assessmentRun = await runInstalledNodeScript(
    targetRoot,
    assessmentSource(stageLabel)
  );
  await writeJson(path.join(stageRoot, "assessment-script.json"), {
    status: assessmentRun.status,
    stderr: assessmentRun.stderr
  });
  assert.equal(assessmentRun.status, 0, assessmentRun.stderr);

  const assessment = JSON.parse(assessmentRun.stdout);
  await writeJson(path.join(stageRoot, "assessment_projection.json"), assessment);
  assert.equal(assessment.assessmentOutcome.kind, "accepted");
  assert.equal(assessment.projection.kind, "ready");
  assert.equal(assessment.projection.runStatus, "assessed");
  assert.deepStrictEqual(
    assessment.eventKinds,
    expectedAssessmentEventKinds(request.expectedAssessmentIds.length)
  );
  assert.deepStrictEqual(
    [...dispatchBundle.eventKinds, ...assessment.eventKinds],
    [
      ...EXPECTED_STAGE_EVENT_PREFIX,
      ...expectedAssessmentEventKinds(request.expectedAssessmentIds.length)
    ]
  );

  return {
    stageLabel,
    stageRoot,
    scenarioName: scenario.scenarioName,
    handle: stage.handle,
    edge: stage.edge,
    sourceKind: stage.sourceKind,
    targetKind: stage.targetKind,
    assetHandle: stage.assetHandle,
    expectedAssessmentIds: request.expectedAssessmentIds,
    backendId: request.backendId,
    workerId: request.workerId,
    eventKinds: [...dispatchBundle.eventKinds, ...assessment.eventKinds],
    finalRunStatus: assessment.projection.runStatus,
    assessmentKind: assessment.assessmentOutcome.kind
  };
}

test(
  "M05 RC live portfolio: all Python live scenario families cross real TypeScript F_P transport",
  { timeout: 1800000 },
  async () => {
    if (!liveEnabled()) {
      assert.fail("set ABG_TS_LIVE_PORTFOLIO=1 or CODEX_LIVE_FP=1 to run TypeScript RC live portfolio");
    }

    const agentKey = liveAgentKey();
    const root = archiveRoot();
    await mkdir(root, { recursive: true });

    const { targetRoot, writer, installOutcome, bootloaderOutcome } =
      await provisionInstalledRoot();
    const packageInstall = await installPackedTenantPackage(targetRoot);

    await writeJson(path.join(root, "run.json"), {
      runKind: "typescript_rc_live_portfolio",
      tenantRoot: TENANT_ROOT,
      targetRoot,
      packageRoot: packageInstall.packageRoot,
      packageTarball: packageInstall.tarballPath,
      agentKey,
      scenarioNames: REQUIRED_SCENARIOS,
      startedAt: new Date().toISOString(),
      command: "npm run test:live"
    });

    const installedQualification = qualifyInstalledSandbox(
      buildInstalledSandboxRequest({
        lane: "install",
        installOutcome,
        bootloaderOutcome,
        rootPath: targetRoot,
        packageBinding: await writer.isDirectory(
          path.join(targetRoot, "node_modules/@abiogenesis")
        ),
        bootstrapImportPassed: true,
        exportedSurface: [
          "deliverBootloader",
          "installBootstrap",
          "projectLiveStatus",
          "publicStart",
          "resultAssessment"
        ],
        liveScenarioPassed: false
      })
    );

    assert.equal(installedQualification.kind, "passed");

    const readinessState = {
      ready: false
    };
    const scenarioSummaries = [];
    const stageResults = [];

    for (const scenario of SCENARIOS) {
      const scenarioStages = [];
      for (let index = 0; index < scenario.stages.length; index += 1) {
        const stage = scenario.stages[index];
        const stageResult = await runLiveStage({
          scenario,
          stage,
          stageIndex: index,
          agentKey,
          targetRoot,
          root,
          readinessState
        });
        stageResults.push(stageResult);
        scenarioStages.push(stageResult);
      }

      const emittedEventKinds = [
        ...new Set(scenarioStages.flatMap((entry) => entry.eventKinds))
      ];
      scenarioSummaries.push({
        scenarioName: scenario.scenarioName,
        scenarioAuthorityRefs: scenario.authorityRefs,
        mode: scenario.mode,
        stages: scenarioStages.map((entry) => ({
          handle: entry.handle,
          edge: entry.edge,
          sourceKind: entry.sourceKind,
          targetKind: entry.targetKind,
          assetHandle: entry.assetHandle,
          assessmentIds: entry.expectedAssessmentIds
        })),
        stageCount: scenario.stages.length,
        maxAssessmentCount: Math.max(
          ...scenario.stages.map((entry) => entry.assessmentIds.length)
        ),
        passed: scenarioStages.every(
          (entry) =>
            entry.assessmentKind === "accepted" &&
            entry.finalRunStatus === "assessed"
        ),
        emittedEventKinds,
        finalRunStatus: scenarioStages.at(-1)?.finalRunStatus ?? "idle"
      });
    }

    const outcome = qualifyInstalledLiveScenarioPortfolio(
      buildInstalledLiveScenarioPortfolioRequest({
        installedQualification,
        scenarios: scenarioSummaries
      })
    );

    const report = {
      runKind: "typescript_rc_live_portfolio",
      sourceLineage: "python/test_env/tests/test_sandbox_usecases_live.py",
      targetRoot,
      packageRoot: packageInstall.packageRoot,
      packageTarball: packageInstall.tarballPath,
      agentKey,
      scenarioCount: scenarioSummaries.length,
      stageCount: stageResults.length,
      outcome,
      scenarios: scenarioSummaries,
      stages: stageResults
    };
    await writeJson(path.join(root, "portfolio_report.json"), report);

    assert.deepStrictEqual(outcome, {
      kind: "passed",
      scenarioNames: REQUIRED_SCENARIOS
    });
  }
);
