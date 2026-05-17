// Validates: REQ-P-POLICY
// Validates: REQ-R-ABG3-RUN

import test from "node:test";
import assert from "node:assert/strict";

import {
  publicCallableStart
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  publicStartContext,
  requestPayload
} from "./support/m04-fixtures.mjs";

test("M04 complete-start integration: package export surface stays aligned at root, m04, and max-autonomy subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const maxAutonomy = await import(
    "@abiogenesis/typescript-tenant/app/m04/max-autonomy"
  );

  assert.equal(root.publicCallableStart, publicCallableStart);
  assert.equal(m04.publicCallableStart, publicCallableStart);
  assert.equal(maxAutonomy.publicCallableStart, publicCallableStart);
});

test("M04 complete-start integration: bare callable start advances through substrate public control without wrapper flags", () => {
  const { profile, context } = publicStartContext();
  const { until: _until, ...bareStart } = requestPayload(profile.name);
  const events = [];

  const outcome = publicCallableStart(bareStart, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.request.startRequest.controlModes.rootMode, "supervised");
  assert.equal(outcome.controlOutcome.kind, "converged");
  assert.equal(outcome.stopClass.kind, "converged");
  assert.equal(outcome.stopClass.detail, "converged");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached"
    ]
  );
});

test("M04 complete-start integration: F_P bare callable start projects worker dispatch stop taxonomy without folklore bundle", () => {
  const { profile, context } = publicStartContext({
    policyOverrides: {
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex"
    }
  });
  const { until: _until, ...bareStart } = requestPayload(profile.name);
  const events = [];

  const outcome = publicCallableStart(bareStart, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.controlOutcome.kind, "dispatch_required");
  assert.equal(outcome.liveStatus.kind, "attention");
  assert.equal(outcome.liveStatus.runStatus, "blocked");
  assert.equal(outcome.stopClass.kind, "worker_dispatch_required");
  assert.equal(outcome.stopClass.detail, "dispatch_required");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_invocation_closed"
    ]
  );
});
