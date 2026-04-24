import test from "node:test";
import assert from "node:assert/strict";

import {
  admitDispatchRequest,
  admitResultArtifact,
  dispatch
} from "../../build/semantic/code/src/abg/m03/transport/index.js";

test("T-026 negative proof: transport dispatch rejects open-object request bypass", () => {
  assert.throws(
    () =>
      dispatch(
        [
          {
            kind: "dispatch_request",
            graphFunctionId: "graph-function-bypass"
          }
        ],
        () => {}
      ),
    /fp_dispatch_request|dispatch request/i
  );
});

test("T-026 negative proof: result artifact admission rejects malformed fulfillment payloads", () => {
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

  assert.throws(
    () =>
      admitResultArtifact(request, {
        edge: "design→code",
        actor: "codex"
      }),
    /fulfillment_assessments/i
  );
});

test("T-026 negative proof: transport failure envelopes reject unsupported failure classes", () => {
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

  assert.throws(
    () =>
      admitResultArtifact(request, {
        kind: "transport_failure",
        failureClass: "policy_config_defect",
        detail: "not supported in first transport slice"
      }),
    /transport_failure|no_output|contract_failure/i
  );
});
