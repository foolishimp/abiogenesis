// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicEventIngressRequest,
  constructPublicEventIngressOutcome
} from "../../build/semantic/code/src/app/m04/index.js";
import { approvedEventPayload, resetEventPayload } from "./support/m04-fixtures.mjs";

test("M04 event-ingress unit: approved request admits into closed review command truth", () => {
  const request = admitPublicEventIngressRequest(
    approvedEventPayload({
      approval_kind: "fh_intent",
      actor: "human-proxy",
      run_id: "run://m04-event-approved",
      work_key: "wk://m04-event-approved"
    })
  );

  assert.equal(request.kind, "approved");
  assert.equal(request.payload.approvalKind, "fh_intent");
  assert.equal(request.payload.actor, "human-proxy");
  assert.deepStrictEqual(request.provenance, {
    workflowVersion: "wf://typescript-dev",
    runId: "run://m04-event-approved",
    workKey: "wk://m04-event-approved"
  });
});

test("M04 event-ingress unit: reset request preserves explicit correction target truth", () => {
  const request = admitPublicEventIngressRequest(
    resetEventPayload({
      scope: "edge",
      work_key: "wk://m04-event-reset",
      edge: "design→code"
    })
  );

  assert.equal(request.kind, "reset");
  assert.equal(request.payload.scope, "edge");
  assert.equal(request.payload.workKey, "wk://m04-event-reset");
  assert.equal(request.payload.edge, "design→code");
});

test("M04 event-ingress unit: outcome preserves emitted event trace and reset followup ownership", () => {
  const request = admitPublicEventIngressRequest(
    resetEventPayload({
      scope: "work_key",
      work_key: "wk://m04-event-reset"
    })
  );
  const outcome = constructPublicEventIngressOutcome(
    request,
    Object.freeze([
      Object.freeze({
        kind: "reset",
        scope: "work_key",
        actor: "human",
        reason: "operator reset workspace",
        workflowVersion: "wf://typescript-dev",
        runId: null,
        workKey: "wk://m04-event-reset",
        edge: null
      })
    ])
  );

  assert.equal(outcome.kind, "accepted");
  assert.equal(outcome.commandKind, "reset");
  assert.deepStrictEqual(outcome.trace, {
    workflowVersion: "wf://typescript-dev",
    runId: null,
    workKey: "wk://m04-event-reset",
    emittedKinds: ["reset"]
  });
  assert.deepStrictEqual(outcome.resetFollowup, {
    kind: "canonical_reset_followups_owned_downstream"
  });
});
