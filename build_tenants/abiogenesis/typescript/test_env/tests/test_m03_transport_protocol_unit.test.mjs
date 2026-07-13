import test from "node:test";
import assert from "node:assert/strict";

import {
  admitDispatchRequest,
  admitResultArtifact,
  ingestResultArtifact,
  sanitizeEnvironment
} from "../../build/semantic/code/src/abg/m03/transport/index.js";
import {
  claudeStreamJsonArgs,
  composeAgentTransportArgs,
  contractForKnownAgent
} from "../../build/semantic/code/src/shared/abg_library/index.js";

test("M03 transport unit: explicit environment sanitization strips configured prefixes only", () => {
  const request = admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://fp",
    graphFunctionId: "graph-function://fp",
    jobId: "job://fp",
    dispatchRef: "dispatch://claude",
    workerId: "worker://claude",
    backendId: "backend://claude",
    resultRef: "result://fp",
    expectedEdge: "design→code",
    expectedAssessmentIds: ["code_complete"],
    transportContract: {
      agentKey: "claude",
      command: "claude",
      argsTemplate: ["-p", "{prompt}"],
      sanitizedEnvironmentPolicy: {
        prefixes: ["CLAUDE", "CLAUDE_CODE_SSE_"]
      }
    }
  });
  const sanitized = sanitizeEnvironment(
    request,
    Object.freeze({
      CLAUDECODE: "1",
      CLAUDE_CODE_SSE_PORT: "3000",
      PATH: "/usr/bin",
      HOME: "/tmp/demo"
    })
  );

  assert.deepStrictEqual(sanitized, {
    PATH: "/usr/bin",
    HOME: "/tmp/demo"
  });
});

test("M03 transport unit: Claude default contract preserves OAuth auth while stripping nested session markers", () => {
  const request = admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://fp",
    graphFunctionId: "graph-function://fp",
    jobId: "job://fp",
    dispatchRef: "dispatch://claude",
    workerId: "worker://claude",
    backendId: "backend://claude",
    resultRef: "result://fp",
    expectedEdge: "requirements→uat",
    expectedAssessmentIds: ["uat_complete"],
    transportContract: contractForKnownAgent("claude")
  });
  const sanitized = sanitizeEnvironment(
    request,
    Object.freeze({
      CLAUDE_CODE_OAUTH_TOKEN: "token-from-keychain",
      CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL: "1",
      CLAUDE_CODE_SSE_PORT: "3000",
      CLAUDE_CODE_ENTRYPOINT: "parent-session",
      CLAUDE_CODE_EXECPATH: "/tmp/parent",
      PATH: "/usr/bin",
      HOME: "/tmp/demo"
    })
  );

  assert.deepStrictEqual(sanitized, {
    CLAUDE_CODE_OAUTH_TOKEN: "token-from-keychain",
    PATH: "/usr/bin",
    HOME: "/tmp/demo"
  });
});

// B-001 (support/4.6.x): protocol proof is INVARIANT-shaped, not exact-argv.
// Downstream installs lawfully localize argv through the declared append
// binding; an exact-match assertion here froze the tool-less shape as law and
// blocked a consumer's release-snapshot repack over `--append-system-prompt`.
function assertClaudeStreamProtocolInvariants(args, prompt) {
  for (const [flag, value] of [
    ["--output-format", "stream-json"],
    ["--permission-mode", "bypassPermissions"]
  ]) {
    const index = args.indexOf(flag);
    assert.notEqual(index, -1, `missing required flag ${flag}`);
    assert.equal(args[index + 1], value, `${flag} must carry ${value}`);
  }
  for (const flag of [
    "-p",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--verbose"
  ]) {
    assert.ok(args.includes(flag), `missing required flag ${flag}`);
  }
  assert.ok(!args.includes(prompt), "prompt must not leak into argv");
}

test("M03 transport unit: Claude stream transport disables tools for closed prompt proofs", () => {
  const args = claudeStreamJsonArgs("return-json");

  assertClaudeStreamProtocolInvariants(args, "return-json");
  const toolsIndex = args.indexOf("--tools");
  assert.notEqual(toolsIndex, -1, "closed-prompt lane must disable tools");
  assert.equal(args[toolsIndex + 1], "");
  assert.ok(
    args.includes("--safe-mode"),
    "closed-prompt lane keeps the execution-gating safe mode"
  );
});

test("M03 transport unit: Claude worker-executes lane keeps tools (execution-default law)", () => {
  const args = claudeStreamJsonArgs("return-json", undefined, {
    lane: "worker_executes"
  });

  assertClaudeStreamProtocolInvariants(args, "return-json");
  assert.ok(
    !args.includes("--tools"),
    "worker-executes lane must not disable tools"
  );
  assert.ok(
    !args.includes("--safe-mode"),
    "worker-executes lane must not carry execution-gating safe mode"
  );
});

test("M03 transport unit: the dispatch-path composition carries the lane (B-001 downstream RCA — plumbed-but-unconnected lane)", () => {
  const claude = contractForKnownAgent("claude");

  // default request: closed-prompt proof, tool-less
  const defaulted = composeAgentTransportArgs(
    { contract: claude, prompt: "return-json", responseJsonSchema: { type: "object" } },
    "/tmp/out.txt"
  );
  assert.ok(defaulted.includes("--tools"), "default lane must stay tool-less");
  assert.ok(defaulted.includes("--safe-mode"));

  // worker-executes request: both execution-gating flags absent
  const executing = composeAgentTransportArgs(
    {
      contract: claude,
      prompt: "return-json",
      responseJsonSchema: { type: "object" },
      lane: "worker_executes"
    },
    "/tmp/out.txt"
  );
  assert.ok(
    !executing.includes("--tools") && !executing.includes("--safe-mode"),
    "worker-executes lane must reach the dispatch argv"
  );
  assert.ok(executing.includes("--json-schema"));

  // non-claude agents: lane is inert, template renders placeholders
  const codex = composeAgentTransportArgs(
    { contract: contractForKnownAgent("codex"), prompt: "p", lane: "worker_executes" },
    "/tmp/out.txt"
  );
  assert.ok(codex.includes("/tmp/out.txt"));
  assert.ok(codex.includes("p"));
});

test("M03 transport unit: downstream append args are admitted and bounded", () => {
  const localized = claudeStreamJsonArgs("return-json", undefined, {
    appendArgs: ["--append-system-prompt", "corp operator guardrail"]
  });

  assertClaudeStreamProtocolInvariants(localized, "return-json");
  assert.ok(localized.includes("--append-system-prompt"));
  const toolsIndex = localized.indexOf("--tools");
  assert.notEqual(toolsIndex, -1, "append args must not change lane posture");
  assert.equal(localized[toolsIndex + 1], "");

  assert.throws(
    () =>
      claudeStreamJsonArgs("return-json", undefined, {
        appendArgs: ["--tools", "Bash"]
      }),
    /protocol-owned flag --tools/u
  );
  assert.throws(
    () =>
      claudeStreamJsonArgs("return-json", undefined, {
        appendArgs: ["{prompt}"]
      }),
    /template placeholders/u
  );
});

test("M03 transport unit: ABG_TS_WORKER_SANDBOX=external drops agent confinement (layered external sandboxes)", () => {
  process.env.ABG_TS_WORKER_SANDBOX = "external";
  try {
    const contract = contractForKnownAgent("codex");
    assert.ok(contract.argsTemplate.includes("--sandbox"));
    assert.ok(contract.argsTemplate.includes("danger-full-access"));
    assert.ok(!contract.argsTemplate.includes("--full-auto"));
  } finally {
    delete process.env.ABG_TS_WORKER_SANDBOX;
  }

  // agent-specific binding wins over the generic declaration
  process.env.ABG_TS_WORKER_SANDBOX = "external";
  process.env.ABG_TS_CODEX_SANDBOX = "workspace-write";
  try {
    const contract = contractForKnownAgent("codex");
    assert.ok(contract.argsTemplate.includes("workspace-write"));
    assert.ok(!contract.argsTemplate.includes("danger-full-access"));
  } finally {
    delete process.env.ABG_TS_WORKER_SANDBOX;
    delete process.env.ABG_TS_CODEX_SANDBOX;
  }

  // unknown value fails closed with a governed diagnostic
  process.env.ABG_TS_WORKER_SANDBOX = "off";
  try {
    assert.throws(
      () => contractForKnownAgent("codex"),
      /ABG_TS_WORKER_SANDBOX must be 'agent_default' or 'external'/u
    );
  } finally {
    delete process.env.ABG_TS_WORKER_SANDBOX;
  }

  // proof-law posture unaffected: claude closed-prompt lane stays tool-less
  process.env.ABG_TS_WORKER_SANDBOX = "external";
  try {
    const args = claudeStreamJsonArgs("return-json");
    const toolsIndex = args.indexOf("--tools");
    assert.notEqual(toolsIndex, -1);
    assert.equal(args[toolsIndex + 1], "");
  } finally {
    delete process.env.ABG_TS_WORKER_SANDBOX;
  }
});

test("M03 transport unit: contract append env binding localizes argv without breaking placeholders", () => {
  process.env.ABG_TS_CODEX_APPEND_ARGS = JSON.stringify([
    "--append-system-prompt",
    "corp operator guardrail"
  ]);
  try {
    const contract = contractForKnownAgent("codex");
    const template = contract.argsTemplate;
    assert.ok(template.includes("--append-system-prompt"));
    assert.ok(
      template.indexOf("--append-system-prompt") < template.indexOf("-o"),
      "append args must land before the output flag/placeholder pair"
    );
    assert.equal(template.at(-1), "{prompt}");
    assert.ok(template.includes("{output_path}"));
  } finally {
    delete process.env.ABG_TS_CODEX_APPEND_ARGS;
  }

  process.env.ABG_TS_CODEX_APPEND_ARGS = JSON.stringify(["--model", "other"]);
  try {
    assert.throws(
      () => contractForKnownAgent("codex"),
      /protocol-owned flag --model/u
    );
  } finally {
    delete process.env.ABG_TS_CODEX_APPEND_ARGS;
  }

  process.env.ABG_TS_CODEX_APPEND_ARGS = "not-json";
  try {
    assert.throws(
      () => contractForKnownAgent("codex"),
      /JSON array of strings/u
    );
  } finally {
    delete process.env.ABG_TS_CODEX_APPEND_ARGS;
  }
});

test("M03 transport unit: Codex default contract pins the live model", () => {
  const contract = contractForKnownAgent("codex");

  assert.equal(contract.command, "codex");
  assert.deepStrictEqual(contract.argsTemplate.slice(0, 4), [
    "exec",
    "--model",
    "gpt-5.5",
    "--full-auto"
  ]);
  assert.ok(contract.argsTemplate.includes("{output_path}"));
  assert.ok(contract.argsTemplate.includes("{prompt}"));
});

test("M03 transport unit: ABG_TS_CODEX_SANDBOX env ingress replaces --full-auto (T-032 campaign BUG #6 — socket-capable toolchain runs)", () => {
  const prior = process.env.ABG_TS_CODEX_SANDBOX;
  try {
    process.env.ABG_TS_CODEX_SANDBOX = "danger-full-access";
    const contract = contractForKnownAgent("codex");
    assert.ok(contract.argsTemplate.includes("--sandbox"));
    assert.ok(contract.argsTemplate.includes("danger-full-access"));
    assert.ok(!contract.argsTemplate.includes("--full-auto"));
    // review D-interim residual #3: a spaces-bearing value stays ONE argv
    // token (no flag smuggling through the env ingress)
    process.env.ABG_TS_CODEX_SANDBOX = "foo --dangerous";
    const smuggle = contractForKnownAgent("codex");
    assert.ok(smuggle.argsTemplate.includes("foo --dangerous"));
    assert.ok(!smuggle.argsTemplate.includes("--dangerous"));
  } finally {
    if (prior === undefined) {
      delete process.env.ABG_TS_CODEX_SANDBOX;
    } else {
      process.env.ABG_TS_CODEX_SANDBOX = prior;
    }
  }
});

test("M03 transport unit: valid result artifact normalizes payload and ingests as accepted truth", () => {
  const request = admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://fp",
    graphFunctionId: "graph-function://fp",
    jobId: "job://fp",
    dispatchRef: "dispatch://codex",
    workerId: "worker://codex",
    backendId: "backend://codex",
    resultRef: "result://fp",
    expectedEdge: "design→code",
    expectedAssessmentIds: ["code_complete"],
    transportContract: {
      agentKey: "codex",
      command: "codex",
      argsTemplate: ["exec", "{prompt}"],
      sanitizedEnvironmentPolicy: {
        prefixes: []
      }
    }
  });

  const artifact = admitResultArtifact(request, {
    edge: "design→code",
    actor: "codex",
    worker_id: "worker://codex",
    backend_id: "backend://codex",
    role_id: "role://constructor",
    assignment_source: "runtime://session",
    resolved_runtime_ref: "runtime://resolved/codex",
    fulfillment_assessments: [
      {
        id: "code_complete",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "code path closed",
        blocking_reasons: [],
        evidence_refs: ["proof://code"]
      }
    ]
  });
  const outcome = ingestResultArtifact(request, artifact);

  assert.equal(artifact.kind, "result_artifact");
  assert.equal(artifact.artifactPayload.edge, "design→code");
  assert.equal(artifact.artifactPayload.fulfillmentAssessments[0].evaluator, "code_complete");
  assert.equal(artifact.artifactPayload.workerId, "worker://codex");
  assert.deepStrictEqual(artifact.identityIssues, []);
  assert.equal(outcome.kind, "accepted");
});

test("M03 transport unit: contradictory artifact identity fails closed as rejected ingest truth", () => {
  const request = admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://fp",
    graphFunctionId: "graph-function://fp",
    jobId: "job://fp",
    dispatchRef: "dispatch://codex",
    workerId: "worker://codex",
    backendId: "backend://codex",
    resultRef: "result://fp",
    expectedEdge: "design→code",
    expectedAssessmentIds: ["code_complete"],
    transportContract: {
      agentKey: "codex",
      command: "codex",
      argsTemplate: ["exec", "{prompt}"],
      sanitizedEnvironmentPolicy: {
        prefixes: []
      }
    }
  });

  const artifact = admitResultArtifact(request, {
    edge: "review→code",
    actor: "codex",
    fulfillment_assessments: [
      {
        id: "different_obligation",
        fulfillment_status: "partial",
        fulfillment_detail: "wrong edge and wrong obligation",
        blocking_reasons: ["mismatch"],
        evidence_refs: []
      }
    ]
  });
  const outcome = ingestResultArtifact(request, artifact);

  assert.deepStrictEqual(artifact.identityIssues, [
    "result edge \"review→code\" does not match expected edge \"design→code\"",
    "missing declared fulfillment assessments: code_complete",
    "unexpected fulfillment assessments: different_obligation"
  ]);
  assert.equal(outcome.kind, "rejected");
  assert.match(outcome.detail, /missing declared fulfillment assessments/i);
});

test("M03 transport unit: runtime failure classes are canonical through ingest", () => {
  const request = admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://fp",
    graphFunctionId: "graph-function://fp",
    jobId: "job://fp",
    dispatchRef: "dispatch://codex",
    workerId: "worker://codex",
    backendId: "backend://codex",
    resultRef: "result://fp",
    expectedEdge: null,
    expectedAssessmentIds: [],
    transportContract: {
      agentKey: "codex",
      command: "codex",
      argsTemplate: ["exec", "{prompt}"],
      sanitizedEnvironmentPolicy: {
        prefixes: []
      }
    }
  });

  for (const failureClass of [
    "runtime_unavailable",
    "capability_missing",
    "runtime_failure",
    "payload_contract_failure"
  ]) {
    const artifact = admitResultArtifact(request, {
      kind: "runtime_failure",
      failureClass,
      detail: `${failureClass} detail`
    });
    const outcome = ingestResultArtifact(request, artifact);

    assert.equal(artifact.runtimeFailure.failureClass, failureClass);
    assert.equal(outcome.kind, "runtime_failure");
    assert.equal(outcome.failureClass, failureClass);
  }
});
