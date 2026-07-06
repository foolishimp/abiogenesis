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

import { publicStart } from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitRuntimeModule,
  jobPayload,
  publishedProfile,
  publicInstructionAssemblyFields,
  requestPayload,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./support/m04-fixtures.mjs";

test("M04 integration: publicStart routes through engine-owned M03 iteration for F_D and stays stable through package exports", async () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-fd",
    name: "public_profile_fd",
    graphId: "graph-m04-int-fd",
    graphName: "design→code:m04-int-fd"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-int-fd",
        name: "public_profile_fd_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      }),
      runId: "run://m04-int-fd",
      workKey: "wk://m04-int-fd"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "lever_resolution_admitted",
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "c_call_opened",
    "c_call_fibre_selected",
    "payload_observed",
    "payload_validated",
    "fd_authority_outcome_admitted",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "vector_evaluated",
    "c_call_opened",
    "c_call_fibre_selected",
    "payload_observed",
    "payload_validated",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "vector_closed",
    "fd_advance_ready",
    "terminal_reached"
  ]);
  assert.equal(outcome.runtimeIdentity.resolvedRuntimeRef, "runtime://typescript/node");

  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  assert.equal(root.publicStart, publicStart);
  assert.equal(m04.publicStart, publicStart);
});

test("M04 integration: publicStart preserves kernel dispatch truth as a blocked public outcome", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-fp",
    name: "public_profile_fp",
    graphId: "graph-m04-int-fp",
    graphName: "design→code:m04-int-fp"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-int-fp",
        name: "public_profile_fp_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const input = requestPayload(profile.name);
  const context = {
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://public-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://public-fp"
    }),
    runId: "run://m04-int-fp",
    workKey: "wk://m04-int-fp"
  };
  const outcome = publicStart(
    input,
    {
      ...context,
      ...publicInstructionAssemblyFields({
        startIntent: input,
        module,
        runtimeIdentity: context.runtimeIdentity,
        resolvedPolicy: context.resolvedPolicy,
        runId: context.runId,
        workKey: context.workKey
      })
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "lever_resolution_admitted",
    "basis_admitted",
    "registry_entry_admitted",
    "graph_function_selected",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "instruction_prompt_manifest_projected",
    "c_call_opened",
    "c_call_fibre_selected",
    "fp_dispatch_requested",
    "actor_invocation_started",
    "payload_observed",
    "payload_validated",
    "actor_invocation_closed",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged"
  ]);
  assert.equal(outcome.stopDetail.dispatchRef, "dispatch://public-fp");
});

test("M04 integration: explicit runtime selector mismatch rejects before kernel routing", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-mismatch",
    name: "public_profile_mismatch",
    graphId: "graph-m04-int-mismatch",
    graphName: "design→code:m04-int-mismatch"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-int-mismatch",
        name: "public_profile_mismatch_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name, {
      runtime_selector: {
        worker_ref: "worker://different-runtime"
      }
    }),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: resolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      })
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "rejected");
  assert.match(outcome.reason, /configured worker selector/i);
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "lever_resolution_admitted"
  ]);
  assert.equal(
    outcome.runtimeIdentity?.resolvedRuntimeRef,
    "runtime://typescript/node"
  );
});
