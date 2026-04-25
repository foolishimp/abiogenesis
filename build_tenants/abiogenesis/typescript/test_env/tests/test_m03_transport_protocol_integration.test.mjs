import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveAdvancementTransition,
  dispatch,
  dispatchRequestsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitResultArtifact,
  ingestResultArtifact
} from "../../build/semantic/code/src/abg/m03/transport/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";

test("M03 transport integration: package export surface stays aligned at root, m03, and transport subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m03 = await import("@abiogenesis/typescript-tenant/abg/m03");
  const transport = await import("@abiogenesis/typescript-tenant/abg/m03/transport");

  assert.equal(root.dispatch, m03.dispatch);
  assert.equal(root.dispatchRequestsForTransition, m03.dispatchRequestsForTransition);
  assert.equal(m03.dispatch, transport.dispatch);
  assert.equal(m03.dispatchRequestsForTransition, transport.dispatchRequestsForTransition);
  assert.equal(m03.ingestResultArtifact, transport.ingestResultArtifact);
});

test("M03 transport integration: fp dispatch derives one request and one accepted ingest outcome", () => {
  const { basis, profile } = buildFpBasis();
  const transition = deriveAdvancementTransition(basis);
  const requests = dispatchRequestsForTransition(transition);
  const dispatched = [];
  const written = dispatch(requests, (request) => {
    dispatched.push(request);
  });
  const request = requests[0];
  const artifact = admitResultArtifact(request, {
    edge: request.expectedEdge,
    actor: "codex",
    fulfillment_assessments: [
      {
        id: "code_complete",
        evaluator: "code_complete",
        fulfillment_status: "fulfilled",
        fulfillment_detail: "fp dispatch completed",
        blocking_reasons: [],
        evidence_refs: ["proof://runtime"]
      }
    ]
  });
  const outcome = ingestResultArtifact(request, artifact);

  assert.equal(transition.kind, "fp_dispatch");
  assert.equal(requests.length, 1);
  assert.deepStrictEqual(written, requests);
  assert.deepStrictEqual(dispatched, requests);
  assert.equal(request.graphFunctionId, profile.id);
  assert.equal(request.expectedEdge, "design→code");
  assert.deepStrictEqual(request.expectedAssessmentIds, ["code_complete"]);
  assert.equal(request.transportContract.command, "codex");
  assert.equal(outcome.kind, "accepted");
});

test("M03 transport integration: runtime failure envelope remains closed and typed through ingest", () => {
  const { basis } = buildFpBasis({ dispatchRef: "dispatch://claude" });
  const transition = deriveAdvancementTransition(basis);
  const request = dispatchRequestsForTransition(transition)[0];
  const artifact = admitResultArtifact(request, {
    kind: "runtime_failure",
    failureClass: "runtime_failure",
    detail: "agent timed out under supervision lease"
  });
  const outcome = ingestResultArtifact(request, artifact);

  assert.equal(artifact.runtimeFailure.failureClass, "runtime_failure");
  assert.equal(outcome.kind, "runtime_failure");
  assert.match(outcome.detail, /timed out/i);
});
