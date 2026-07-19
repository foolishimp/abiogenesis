// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import {
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { executorProfileFields } from "./support/executor_profile.mjs";
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
const EXPECTED_DISPATCH_EVENT_CHAIN = [
  "basis_admitted",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "fp_dispatch_requested",
  "actor_invocation_started",
  "payload_observed",
  "payload_validated",
  "actor_invocation_closed"
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

async function runTransport(request, prompt, cwd, root, label) {
  const outputPath = path.join(root, `${label}-output.txt`);
  return await runAgentTransport({
    contract: request.transportContract,
    prompt,
    cwd,
    archiveRoot: root,
    label,
    timeoutMs: transportTimeoutMs(),
    ...executorProfileFields(),
    outputPath
  });
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

function semanticChallenge(nonce) {
  return Object.freeze({
    nonce,
    product: "data_mapper",
    requirements: Object.freeze([
      Object.freeze({
        id: "REQ-DM-INGEST",
        statement: "Ingest CSV mapping files with declared source_digest values before transformation."
      }),
      Object.freeze({
        id: "REQ-DM-REJECT-UNMAPPED",
        statement: "Reject unmapped target fields and report the missing mapping as a blocking UAT failure."
      }),
      Object.freeze({
        id: "REQ-DM-LINEAGE",
        statement: "Publish lineage linking source_digest to derived_artifact identifiers for every generated mapping."
      })
    ])
  });
}

function semanticResultArtifactPrompt(request, agentKey, challenge) {
  return [
    "Return only a JSON object. Do not include markdown or commentary.",
    "You are satisfying an Abiogenesis TypeScript RC live semantic-generation challenge.",
    "Do not copy a completed fulfillment_detail from this prompt; synthesize it from the source requirements.",
    `Scenario: ${SCENARIO_NAME}`,
    `Nonce: ${challenge.nonce}`,
    `Expected edge: ${request.expectedEdge}`,
    `Required fulfillment assessment id: ${request.expectedAssessmentIds[0]}`,
    `Product: ${challenge.product}`,
    "Source requirements:",
    ...challenge.requirements.map(
      (requirement) => `- ${requirement.id}: ${requirement.statement}`
    ),
    "The artifact must use the normal Abiogenesis result-artifact shape.",
    "The single fulfillment_detail value must be a JSON string, not an object.",
    "That JSON string must contain these keys: nonce, coverage, test_cases, negative_case, lineage_assertion.",
    "coverage must list the requirement ids covered by the generated UAT plan.",
    "test_cases must contain one generated UAT case per source requirement.",
    "Each test case must include requirement_id, title, steps, and expected_result.",
    "Use title for the case name; do not substitute objective for title.",
    "negative_case must describe the unmapped-target-field rejection.",
    "negative_case must include the literal words unmapped and blocking.",
    "lineage_assertion must mention source_digest and derived_artifact.",
    "lineage_assertion must include the literal words source_digest and derived_artifact.",
    "Use this top-level artifact shape, but synthesize fulfillment_detail:",
    "{",
    `  "edge": ${JSON.stringify(request.expectedEdge)},`,
    `  "actor": ${JSON.stringify(agentKey)},`,
    '  "fulfillment_assessments": [',
    "    {",
    `      "id": ${JSON.stringify(request.expectedAssessmentIds[0])},`,
    `      "evaluator": ${JSON.stringify(request.expectedAssessmentIds[0])},`,
    '      "fulfillment_status": "fulfilled",',
    '      "fulfillment_detail": "<JSON string containing the generated UAT plan>",',
    '      "blocking_reasons": [],',
    `      "evidence_refs": [${JSON.stringify(`live://typescript-rc-uat-semantic/${challenge.nonce}`)}]`,
    "    }",
    "  ],",
    `  "selected_worker_id": ${JSON.stringify(request.workerId)},`,
    `  "selected_backend": ${JSON.stringify(request.backendId)},`,
    '  "role_id": "role://rc-live-uat-semantic",',
    '  "assignment_source": "policy_resolution",',
    '  "resolved_runtime_ref": "runtime://typescript/rc-live-semantic"',
    "}"
  ].join("\n");
}

function assertString(value, label) {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.notEqual(value.trim(), "", `${label} must be non-empty`);
  return value;
}

function parseSemanticDetail(value) {
  const detailText = assertString(value, "fulfillment_detail");
  try {
    return JSON.parse(detailText);
  } catch (error) {
    assert.fail(
      `semantic fulfillment_detail must be parseable JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function semanticFieldText(value, label) {
  if (typeof value === "string") {
    return assertString(value, label);
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const text = JSON.stringify(value);
    assert.notEqual(text, "{}", `${label} must be non-empty`);
    return text;
  }
  assert.fail(`${label} must be a string or a non-empty object`);
}

function stringIncludesAll(haystack, terms) {
  const lowered = haystack.toLowerCase();
  return terms.every((term) => lowered.includes(term.toLowerCase()));
}

function evaluateSemanticArtifact(rawArtifact, request, challenge) {
  assert.equal(rawArtifact.edge, request.expectedEdge);
  assert.equal(rawArtifact.actor, liveAgentKey());
  assert.equal(rawArtifact.selected_worker_id, request.workerId);
  assert.equal(rawArtifact.selected_backend, request.backendId);
  assert.equal(rawArtifact.role_id, "role://rc-live-uat-semantic");
  assert.equal(rawArtifact.assignment_source, "policy_resolution");
  assert.equal(rawArtifact.resolved_runtime_ref, "runtime://typescript/rc-live-semantic");
  assert.deepStrictEqual(
    Object.keys(rawArtifact).sort(),
    [
      "actor",
      "assignment_source",
      "edge",
      "fulfillment_assessments",
      "resolved_runtime_ref",
      "role_id",
      "selected_backend",
      "selected_worker_id"
    ]
  );

  assert.equal(Array.isArray(rawArtifact.fulfillment_assessments), true);
  assert.equal(rawArtifact.fulfillment_assessments.length, 1);
  const assessment = rawArtifact.fulfillment_assessments[0];
  assert.equal(assessment.id, request.expectedAssessmentIds[0]);
  assert.equal(assessment.evaluator, request.expectedAssessmentIds[0]);
  assert.equal(assessment.fulfillment_status, "fulfilled");
  assert.deepStrictEqual(assessment.blocking_reasons, []);
  assert.deepStrictEqual(assessment.evidence_refs, [
    `live://typescript-rc-uat-semantic/${challenge.nonce}`
  ]);

  const detail = parseSemanticDetail(assessment.fulfillment_detail);
  assert.equal(detail.nonce, challenge.nonce);
  assert.equal(Array.isArray(detail.coverage), true);
  assert.deepStrictEqual(
    [...detail.coverage].sort(),
    challenge.requirements.map((requirement) => requirement.id).sort()
  );
  assert.equal(Array.isArray(detail.test_cases), true);
  assert.equal(detail.test_cases.length, challenge.requirements.length);

  const detailText = JSON.stringify(detail);
  const caseRequirementIds = new Set();
  for (const [index, testCase] of detail.test_cases.entries()) {
    const label = `test_cases[${index}]`;
    const requirementId = assertString(testCase.requirement_id, `${label}.requirement_id`);
    caseRequirementIds.add(requirementId);
    assertString(testCase.title ?? testCase.name, `${label}.title_or_name`);
    assertString(testCase.expected_result, `${label}.expected_result`);
    const steps = Array.isArray(testCase.steps)
      ? testCase.steps
      : typeof testCase.procedure === "string"
        ? [testCase.procedure]
        : [];
    assert.ok(steps.length > 0, `${label}.steps_or_procedure must be non-empty`);
    for (const [stepIndex, step] of steps.entries()) {
      assertString(step, `${label}.steps[${stepIndex}]`);
    }
  }
  assert.deepStrictEqual(
    [...caseRequirementIds].sort(),
    challenge.requirements.map((requirement) => requirement.id).sort()
  );
  const negativeCaseText = semanticFieldText(detail.negative_case, "negative_case");
  const lineageAssertionText = semanticFieldText(
    detail.lineage_assertion,
    "lineage_assertion"
  );
  assert.equal(stringIncludesAll(detailText, ["csv", "source_digest"]), true);
  assert.equal(stringIncludesAll(detailText, ["unmapped", "blocking"]), true);
  assert.equal(stringIncludesAll(detailText, ["lineage", "derived_artifact"]), true);
  assert.equal(stringIncludesAll(negativeCaseText, ["unmapped", "blocking"]), true);
  assert.equal(
    stringIncludesAll(lineageAssertionText, ["source_digest", "derived_artifact"]),
    true
  );

  return Object.freeze({
    kind: "semantic_generation_evaluation",
    nonce: challenge.nonce,
    coveredRequirementIds: Object.freeze([...detail.coverage].sort()),
    generatedCaseCount: detail.test_cases.length,
    detailCharCount: assessment.fulfillment_detail.length,
    evidenceRefs: Object.freeze([...assessment.evidence_refs])
  });
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
      constructDefaultAbgFnCompositionDeclarations,
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
        declarations: constructDefaultAbgFnCompositionDeclarations({
          scopeRef: "m05/rc-live-uat/requirements-to-uat",
          hostGraphVectorRef: "graph-rc-live-requirements-to-uat"
        })
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
      admitResultArtifact
    } from "@abiogenesis/typescript-tenant";
    import {
      invokeCanonicalResultAssessmentWithoutReplayEvidence
    } from "./canonical-result-assessment-fixture.mjs";

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
      assessment_contract: {
        ref: "contract://abg/result-assessment/fp@5",
        digest: "sha256:649d023ba4c782f19be3305dbeaf3594e2db1b243ab8305f750993bf502e7c20"
      },
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
    const { outcome: assessmentOutcome } =
      await invokeCanonicalResultAssessmentWithoutReplayEvidence({
        assessmentRequest,
        events
      });

    console.log(JSON.stringify({
      artifact,
      assessmentRequest,
      assessmentOutcome,
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
  assert.deepStrictEqual(dispatchBundle.eventKinds, EXPECTED_DISPATCH_EVENT_CHAIN);

  const readiness = await runTransport(
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
  const transport = await runTransport(request, prompt, targetRoot, root, "dispatch");
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

  assert.equal(assessment.assessmentOutcome.outcomeKind, "refusal");
  assert.equal(
    assessment.assessmentOutcome.value.code,
    "assessment_contract_mismatch"
  );
  assert.deepStrictEqual(assessment.eventKinds, ["public_operation_admitted"]);
});

test("M05 RC live sandbox UAT: live F_P worker synthesizes challenge-specific UAT content", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_LIVE_UAT=1 or CODEX_LIVE_FP=1 to run TypeScript RC live semantic UAT");
    return;
  }

  const agentKey = liveAgentKey();
  const challenge = semanticChallenge(`semantic-${randomUUID()}`);
  const root = archiveRoot();
  await mkdir(root, { recursive: true });

  const { targetRoot } = await provisionInstalledRoot();
  const packageInstall = await installPackedTenantPackage(targetRoot);

  await writeJson(path.join(root, "run.json"), {
    scenarioName: `${SCENARIO_NAME}_semantic_generation`,
    tenantRoot: TENANT_ROOT,
    targetRoot,
    packageRoot: packageInstall.packageRoot,
    packageTarball: packageInstall.tarballPath,
    agentKey,
    challenge,
    startedAt: new Date().toISOString(),
    command: "npm run test:live:uat"
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
  await writeJson(path.join(root, "semantic_challenge.json"), challenge);
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
  assert.deepStrictEqual(dispatchBundle.eventKinds, EXPECTED_DISPATCH_EVENT_CHAIN);

  const readiness = await runTransport(
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

  const prompt = semanticResultArtifactPrompt(request, agentKey, challenge);
  await writeFile(path.join(root, "prompt.txt"), prompt, "utf8");
  const transport = await runTransport(request, prompt, targetRoot, root, "dispatch");
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

  const semanticEvaluation = evaluateSemanticArtifact(rawArtifact, request, challenge);
  await writeJson(path.join(root, "semantic_evaluation.json"), semanticEvaluation);
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

  assert.equal(assessment.assessmentOutcome.outcomeKind, "refusal");
  assert.equal(
    assessment.assessmentOutcome.value.code,
    "assessment_contract_mismatch"
  );
  assert.deepStrictEqual(assessment.eventKinds, ["public_operation_admitted"]);
});
