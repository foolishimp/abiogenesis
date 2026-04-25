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
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../tests/support/m05-installed-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TENANT_ROOT = path.dirname(TEST_ENV_ROOT);
const SCENARIO_NAME = "requirements_to_uat";
const READY_TOKEN = "ABG_TS_READY";
const EXPECTED_FULL_EVENT_CHAIN = [
  "basis_admitted",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "fp_dispatch_requested",
  "assessed"
];

function liveEnabled() {
  return process.env["ABG_TS_LIVE_UAT"] === "1" || process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "codex";
}

function transportTimeoutMs() {
  const raw = process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "600000";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 600000;
}

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, "").replace("T", "T");
}

function defaultArchiveRoot() {
  return path.join(
    TEST_ENV_ROOT,
    "test_runs",
    "typescript_rc_live",
    SCENARIO_NAME,
    timestampId()
  );
}

function archiveRoot() {
  const configured = process.env["ABG_TS_LIVE_ARCHIVE_ROOT"];
  return configured === undefined || configured.length === 0
    ? defaultArchiveRoot()
    : path.resolve(configured, SCENARIO_NAME, timestampId());
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

function resultArtifactPrompt(request, agentKey) {
  const requiredIds = request.expectedAssessmentIds.length === 0
    ? ["uat_tests_complete"]
    : request.expectedAssessmentIds;
  return [
    "Return only a JSON object. Do not include markdown or commentary.",
    "You are satisfying an Abiogenesis TypeScript RC live sandbox UAT dispatch contract.",
    `Scenario: ${SCENARIO_NAME}`,
    `Expected edge: ${request.expectedEdge}`,
    `Required fulfillment assessment ids: ${requiredIds.join(", ")}`,
    "The JSON object must have this shape:",
    "{",
    `  "edge": ${JSON.stringify(request.expectedEdge)},`,
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "fulfillment_assessments": [',
    "    {",
    `      "id": ${JSON.stringify(requiredIds[0])},`,
    `      "evaluator": ${JSON.stringify(requiredIds[0])},`,
    '      "fulfillment_status": "fulfilled",',
    '      "fulfillment_detail": "live sandbox UAT worker accepted the requirements-to-UAT traversal",',
    '      "blocking_reasons": [],',
    '      "evidence_refs": ["live://typescript-rc-uat"]',
    "    }",
    "  ],",
    `  "selected_worker_id": ${JSON.stringify(request.workerId)},`,
    `  "selected_backend": ${JSON.stringify(request.backendId)},`,
    '  "role_id": "role://rc-live-uat",',
    '  "assignment_source": "policy_resolution",',
    '  "resolved_runtime_ref": "runtime://typescript/rc-live"',
    "}"
  ].join("\n");
}

function rcLiveDispatchSource(agentKey) {
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
      admitPublicStartRequest,
      publicStart
    } from "@abiogenesis/typescript-tenant";

    const agentKey = ${JSON.stringify(agentKey)};

    const requirements = admitNode({
      id: "node-rc-live-requirements",
      name: "Requirements",
      schema: { kind: "symbolic", ref: "Vector[requirements]" },
      markov: ["approved"],
      assetSurface: {
        kind: "requirements",
        requiredContexts: ["workspace"],
        standardsRefs: ["REQ-P-SCENARIOS"],
        outputContractRefs: ["requirements-contract"]
      },
      tags: ["input"]
    });

    const uatTests = admitNode({
      id: "node-rc-live-uat-tests",
      name: "UAT Tests",
      schema: { kind: "symbolic", ref: "Vector[uat_tests]" },
      markov: ["accepted"],
      assetSurface: {
        kind: "uat_tests",
        requiredContexts: ["workspace"],
        standardsRefs: ["REQ-P-QUAL"],
        outputContractRefs: ["uat-contract"]
      },
      tags: ["output"]
    });

    const graphFunction = graphFunctionForVector(
      edge([requirements], uatTests, {
        id: "graph-rc-live-requirements-to-uat",
        name: "requirements→uat_tests",
        evaluators: [
          {
            name: "uat_tests_complete",
            regime: "F_P",
            description: "UAT test artifact satisfies the declared acceptance contract",
            binding: "binding://rc-live/uat_tests_complete",
            tags: ["fulfillment", "uat"]
          }
        ],
        declarations: { entries: [] }
      }).vectors[0],
      {
        id: "graph-function-rc-live-requirements-to-uat",
        name: "requirements_to_uat",
        declarations: { entries: [] }
      }
    );

    const module = admitModule({
      name: "rc_live_uat",
      graphs: [graphFunction.template.graph],
      graphFunctions: [graphFunction],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-rc-live-requirements-to-uat",
          name: "requirements_to_uat_job",
          contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
          roles: [],
          tags: ["semantic_work", "uat"]
        }
      ],
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: { entries: [] }
    });

    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: \`worker://rc-live-\${agentKey}\`,
      backendId: \`backend://\${agentKey}\`,
      buildId: "build://typescript-rc-live",
      resolvedRuntimeRef: "runtime://typescript/rc-live"
    });

    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://typescript-rc-live",
      defaultRegime: "F_P",
      dispatchRef: \`dispatch://\${agentKey}\`
    });

    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/rc-live",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    };

    const events = [];
    const startOutcome = publicStart(
      startInput,
      {
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId: "run://typescript-rc-live",
        workKey: "wk://requirements-to-uat"
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
          runId: "run://typescript-rc-live",
          workKey: "wk://requirements-to-uat",
          frameId: null,
          frameLineageId: null
        })
      )
    )[0];

    console.log(JSON.stringify({
      scenarioName: "requirements_to_uat",
      startInput,
      startOutcome,
      dispatchRequest,
      eventKinds: events.map((event) => event.kind)
    }));
  `;
}

function rcLiveAssessmentSource() {
  return `
    import { readFile } from "node:fs/promises";
    import {
      admitResultArtifact,
      projectLiveStatus,
      resultAssessment
    } from "@abiogenesis/typescript-tenant";

    const dispatchBundle = JSON.parse(
      await readFile(".abiogenesis/rc-live-dispatch.json", "utf8")
    );
    const rawArtifact = JSON.parse(
      await readFile(".abiogenesis/rc-live-result-artifact.json", "utf8")
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
        spec_hash: "spec://typescript-rc-live",
        manifest_id: "manifest://typescript-rc-live-requirements-to-uat",
        workflow_version: "wf://typescript-rc-live",
        run_id: "run://typescript-rc-live",
        work_key: "wk://requirements-to-uat",
        authority_ref: "authority://REQ-P-SCENARIOS",
        selected_worker_id: dispatchBundle.dispatchRequest.workerId,
        selected_backend: dispatchBundle.dispatchRequest.backendId,
        role_id: "role://rc-live-uat",
        assignment_source: "policy_resolution",
        resolved_runtime_ref: "runtime://typescript/rc-live"
      },
      published_ledger_ref: {
        ref: "ledger://typescript-rc-live-requirements-to-uat"
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

test("M05 RC live sandbox UAT: real F_P transport artifact is ingested through the installed package surface", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_LIVE_UAT=1 or CODEX_LIVE_FP=1 to run TypeScript RC live sandbox UAT");
    return;
  }

  const agentKey = liveAgentKey();
  const root = archiveRoot();
  await mkdir(root, { recursive: true });

  const { targetRoot } = await provisionInstalledRoot();
  const packageInstall = await installPackedTenantPackage(targetRoot);

  await writeJson(path.join(root, "run.json"), {
    scenarioName: SCENARIO_NAME,
    tenantRoot: TENANT_ROOT,
    targetRoot,
    packageRoot: packageInstall.packageRoot,
    packageTarball: packageInstall.tarballPath,
    agentKey,
    startedAt: new Date().toISOString(),
    command: "npm run test:live"
  });

  const dispatchRun = await runInstalledNodeScript(
    targetRoot,
    rcLiveDispatchSource(agentKey)
  );
  await writeJson(path.join(root, "dispatch-script.json"), {
    status: dispatchRun.status,
    stderr: dispatchRun.stderr
  });
  assert.equal(dispatchRun.status, 0, dispatchRun.stderr);

  const dispatchBundle = JSON.parse(dispatchRun.stdout);
  await writeJson(path.join(root, "dispatch_projection.json"), {
    scenarioName: dispatchBundle.scenarioName,
    startOutcome: dispatchBundle.startOutcome,
    eventKinds: dispatchBundle.eventKinds
  });
  await writeJson(path.join(root, "dispatch_request.json"), dispatchBundle.dispatchRequest);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "rc-live-dispatch.json"),
    `${JSON.stringify(dispatchBundle, null, 2)}\n`,
    "utf8"
  );

  const request = dispatchBundle.dispatchRequest;
  assert.equal(dispatchBundle.startOutcome.kind, "blocked");
  assert.equal(dispatchBundle.startOutcome.stopPredicate, "dispatch_required");
  assert.equal(request.expectedEdge, "requirements→uat_tests");
  assert.deepStrictEqual(request.expectedAssessmentIds, ["uat_tests_complete"]);
  assert.deepStrictEqual(dispatchBundle.eventKinds, EXPECTED_FULL_EVENT_CHAIN.slice(0, -1));

  const readiness = runTransport(
    request,
    readinessPrompt(),
    targetRoot,
    root,
    "readiness"
  );
  await writeJson(path.join(root, "readiness.json"), readiness);
  if (readiness.status !== 0 || !readiness.text.includes(READY_TOKEN)) {
    t.skip(
      `configured live backend is not ready for ${agentKey}; diagnostic archived at ${root}`
    );
    return;
  }

  const prompt = resultArtifactPrompt(request, agentKey);
  await writeFile(path.join(root, "prompt.txt"), prompt, "utf8");
  const transport = runTransport(request, prompt, targetRoot, root, "dispatch");
  await writeJson(path.join(root, "transport.json"), transport);
  await writeFile(path.join(root, "raw_response.txt"), transport.text, "utf8");

  assert.equal(
    transport.status,
    0,
    `live transport failed; archive: ${root}\n${transport.stderr}`
  );

  let rawArtifact;
  try {
    rawArtifact = extractJsonObject(transport.text);
  } catch (error) {
    await writeJson(path.join(root, "contract_failure.json"), {
      message: error instanceof Error ? error.message : String(error),
      rawResponse: transport.text
    });
    assert.fail(`live transport returned non-JSON artifact; archive: ${root}`);
  }

  await writeJson(path.join(root, "result_artifact.json"), rawArtifact);
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "rc-live-result-artifact.json"),
    `${JSON.stringify(rawArtifact, null, 2)}\n`,
    "utf8"
  );

  const assessmentRun = await runInstalledNodeScript(
    targetRoot,
    rcLiveAssessmentSource()
  );
  await writeJson(path.join(root, "assessment-script.json"), {
    status: assessmentRun.status,
    stderr: assessmentRun.stderr
  });
  assert.equal(assessmentRun.status, 0, assessmentRun.stderr);

  const assessment = JSON.parse(assessmentRun.stdout);
  await writeJson(path.join(root, "assessment_projection.json"), assessment);

  assert.equal(assessment.assessmentOutcome.kind, "accepted");
  assert.equal(assessment.projection.kind, "ready");
  assert.equal(assessment.projection.runStatus, "assessed");
  assert.deepStrictEqual(assessment.eventKinds, ["assessed"]);
  assert.deepStrictEqual(
    [...dispatchBundle.eventKinds, ...assessment.eventKinds],
    EXPECTED_FULL_EVENT_CHAIN
  );
});
