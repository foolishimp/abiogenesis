// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-004
// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013
// Validates: REQ-R-ABG3-BINDING
// Validates: REQ-R-ABG3-BINDING-002
// Validates: REQ-R-ABG3-BINDING-003
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-EVENTS-001

import test from "node:test";
import assert from "node:assert/strict";

import { publicControlLoop } from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitRuntimeModule,
  controlLoopPayload,
  jobPayload,
  publishedProfile,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./support/m04-fixtures.mjs";

test("M04 control integration: supervised control loop re-enters canonical publicStart from replay-derived truth", async () => {
  const profile = publishedProfile({
    id: "graph-function-m04-control-int-fd",
    name: "public_profile_fd",
    graphId: "graph-m04-control-int-fd",
    graphName: "design→code:m04-control-int-fd"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-control-int-fd",
        name: "public_profile_fd_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const outcome = publicControlLoop(
    controlLoopPayload(profile.name, {}, {
      root_mode: "supervised"
    }),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      }),
      runId: "run://m04-control-int-fd",
      workKey: "wk://m04-control-int-fd"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "converged");
  assert.deepStrictEqual(outcome.trace.stepKinds, ["advanced", "converged"]);
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed",
    "fd_advance_ready",
    "basis_admitted",
    "terminal_reached"
  ]);

  const root = await import("@abiogenesis/typescript-tenant");
  const control = await import("@abiogenesis/typescript-tenant/app/m04/control");
  assert.equal(root.publicControlLoop, publicControlLoop);
  assert.equal(control.publicControlLoop, publicControlLoop);
  assert.equal("constructControlLoopRouteBinding" in root, false);
  assert.equal("constructControlLoopRouteBinding" in control, false);
});

test("M04 control integration: dispatch-required seam remains explicit control truth", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-control-int-fp",
    name: "public_profile_fp",
    graphId: "graph-m04-control-int-fp",
    graphName: "design→code:m04-control-int-fp"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-control-int-fp",
        name: "public_profile_fp_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const outcome = publicControlLoop(
    controlLoopPayload(profile.name),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fp",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://public-fp"
      }),
      runId: "run://m04-control-int-fp",
      workKey: "wk://m04-control-int-fp"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "dispatch_required");
  assert.equal(outcome.stopDetail.dispatchRef, "dispatch://public-fp");
  assert.deepStrictEqual(outcome.trace.stepKinds, ["blocked"]);
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fp_dispatch_requested"
  ]);
});

test("M04 control integration: human-proxy mode preserves human-gate seam without direct event append", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-control-int-fh",
    name: "public_profile_fh",
    graphId: "graph-m04-control-int-fh",
    graphName: "design→code:m04-control-int-fh"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-control-int-fh",
        name: "public_profile_fh_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const outcome = publicControlLoop(
    controlLoopPayload(profile.name, {}, {
      fh_mode: "human-proxy"
    }),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fh",
        defaultRegime: "F_H",
        approvalSubjectRef: "approval://edge/review"
      }),
      runId: "run://m04-control-int-fh",
      workKey: "wk://m04-control-int-fh"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "human_gate_required");
  assert.equal(outcome.stopDetail.approvalSubjectRef, "approval://edge/review");
  assert.deepStrictEqual(outcome.approvalHint, {
    actor: "human-proxy",
    approvalSubjectRef: "approval://edge/review"
  });
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fh_escalated"
  ]);
});
