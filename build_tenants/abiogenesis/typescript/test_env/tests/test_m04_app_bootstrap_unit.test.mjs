// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  deriveAdvancementTransition,
  runtimeEventsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitPublicStartRequest,
  constructPublicStartOutcome
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitRuntimeModule,
  jobPayload,
  publishedProfile,
  requestPayload,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./support/m04-fixtures.mjs";

test("M04 unit: public-start request preserves traversal grammar while keeping control modes orthogonal", () => {
  const request = admitPublicStartRequest(requestPayload("public_profile", {
    fh_mode: "human-proxy",
    root_mode: "supervised",
    runtime_selector: {
      worker_ref: "worker://typescript-public-start",
      runtime_ref: "runtime://typescript/node"
    }
  }));

  assert.equal(request.startIntent.scope.workspaceRoot, "/workspace/demo");
  assert.equal(request.startIntent.target.handle, "public_profile");
  assert.equal(request.startIntent.until, "converged");
  assert.deepStrictEqual(request.controlModes, {
    fhMode: "human-proxy",
    rootMode: "supervised"
  });
  assert.deepStrictEqual(request.runtimeSelector, {
    workerRef: "worker://typescript-public-start",
    runtimeRef: "runtime://typescript/node"
  });
});

test("M04 unit: non-default control modes are unlawful when until is not converged", () => {
  assert.throws(
    () =>
      admitPublicStartRequest({
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/demo",
          moduleName: "abiogenesis.public_runtime"
        },
        target: {
          kind: "graph_function",
          handle: "public_profile"
        },
        until: "blocked",
        root_mode: "supervised"
      }),
    /until = "converged"|root_mode/i
  );
});

test("M04 unit: public-start outcome closes F_P runtime truth into one blocked outcome family", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-unit-fp",
    name: "public_profile_fp",
    graphId: "graph-m04-unit-fp",
    graphName: "design→code:m04-unit-fp"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-unit-fp",
        name: "public_profile_fp_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const request = admitPublicStartRequest(requestPayload(profile.name));
  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://public-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://public-fp"
    }),
    runId: "run://m04-unit",
    workKey: "wk://m04-unit"
  });
  const transition = deriveAdvancementTransition(basis);
  const outcome = constructPublicStartOutcome(
    basis,
    transition,
    runtimeEventsForTransition(basis, transition),
    request.startIntent.until
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.equal(outcome.runtimeIdentity.workerId, "worker://typescript-public-start");
  assert.deepStrictEqual(outcome.trace.eventKinds, [
    "basis_admitted",
    "fp_dispatch_requested"
  ]);
  assert.equal(outcome.stopDetail.dispatchRef, "dispatch://public-fp");
});
