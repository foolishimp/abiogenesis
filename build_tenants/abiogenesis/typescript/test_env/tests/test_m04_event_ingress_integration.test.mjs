// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-EVENTS-001

import test from "node:test";
import assert from "node:assert/strict";

import { eventIngress } from "../../build/semantic/code/src/app/m04/index.js";
import {
  approvedEventPayload,
  resetEventPayload,
  revokedEventPayload
} from "./support/m04-fixtures.mjs";

test("M04 event-ingress integration: approved command routes through canonical emit and root exports", async () => {
  const events = [];
  const outcome = eventIngress(
    approvedEventPayload({
      run_id: "run://m04-event-approved",
      work_key: "wk://m04-event-approved"
    }),
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "accepted");
  assert.equal(outcome.commandKind, "approved");
  assert.deepStrictEqual(events, [
    {
      kind: "approved",
      approvalKind: "fh_review",
      edge: "design→code",
      actor: "human",
      workflowVersion: "wf://typescript-dev",
      runId: "run://m04-event-approved",
      workKey: "wk://m04-event-approved"
    }
  ]);

  const root = await import("@abiogenesis/typescript-tenant");
  const eventIngressModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/event-ingress"
  );
  assert.equal(root.eventIngress, eventIngress);
  assert.equal(eventIngressModule.eventIngress, eventIngress);
});

test("M04 event-ingress integration: revoked command preserves explicit review revocation truth", () => {
  const events = [];
  const outcome = eventIngress(
    revokedEventPayload({
      run_id: "run://m04-event-revoked"
    }),
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "accepted");
  assert.equal(outcome.commandKind, "revoked");
  assert.deepStrictEqual(events.map((event) => event.kind), ["revoked"]);
  assert.equal(events[0].approvalKind, "fh_approval");
  assert.equal(events[0].reason, "operator revoked approval");
});

test("M04 event-ingress integration: reset command preserves explicit correction seam without direct append bypass", () => {
  const events = [];
  const outcome = eventIngress(
    resetEventPayload({
      scope: "edge",
      work_key: "wk://m04-event-reset",
      edge: "design→code"
    }),
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "accepted");
  assert.equal(outcome.commandKind, "reset");
  assert.deepStrictEqual(events, [
    {
      kind: "reset",
      scope: "edge",
      actor: "human",
      reason: "operator reset workspace",
      workflowVersion: "wf://typescript-dev",
      runId: null,
      workKey: "wk://m04-event-reset",
      edge: "design→code"
    }
  ]);
  assert.deepStrictEqual(outcome.resetFollowup, {
    kind: "canonical_reset_followups_owned_downstream"
  });
});
