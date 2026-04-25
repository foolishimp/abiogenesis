import test from "node:test";
import assert from "node:assert/strict";

import {
  admitDispatchRequest,
  admitResultArtifact,
  ingestResultArtifact,
  sanitizeEnvironment
} from "../../build/semantic/code/src/abg/m03/transport/index.js";

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
