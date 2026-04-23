// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-004
// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicControlLoopRequest,
  constructPublicControlLoopOutcome,
  constructPublicStartOutcome
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitExecutionBasis,
  deriveAdvancementTransition,
  runtimeEventsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitRuntimeModule,
  controlLoopPayload,
  jobPayload,
  publishedProfile,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./support/m04-fixtures.mjs";

test("M04 control unit: control-loop request derives from nested completed public-start truth", () => {
  const request = admitPublicControlLoopRequest(
    controlLoopPayload("public_profile", {}, {
      fh_mode: "human-proxy",
      root_mode: "supervised",
      runtime_selector: {
        worker_ref: "worker://typescript-public-start",
        runtime_ref: "runtime://typescript/node"
      }
    })
  );

  assert.equal(request.startRequest.startIntent.target.handle, "public_profile");
  assert.deepStrictEqual(request.startRequest.controlModes, {
    fhMode: "human-proxy",
    rootMode: "supervised"
  });
  assert.deepStrictEqual(request.startRequest.runtimeSelector, {
    workerRef: "worker://typescript-public-start",
    runtimeRef: "runtime://typescript/node"
  });
});

test("M04 control unit: control-loop outcome preserves human-proxy approval hint over explicit public stop detail", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-control-unit-fh",
    name: "public_profile_fh",
    graphId: "graph-m04-control-unit-fh",
    graphName: "design→code:m04-control-unit-fh"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-control-unit-fh",
        name: "public_profile_fh_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const request = admitPublicControlLoopRequest(
    controlLoopPayload(profile.name, {}, {
      fh_mode: "human-proxy"
    })
  );
  const basis = admitExecutionBasis({
    startIntent: request.startRequest.startIntent,
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://public-fh",
      defaultRegime: "F_H",
      approvalSubjectRef: "approval://edge/review"
    }),
    runId: "run://m04-control-unit-fh",
    workKey: "wk://m04-control-unit-fh"
  });
  const transition = deriveAdvancementTransition(basis);
  const publicStartOutcome = constructPublicStartOutcome(
    basis,
    transition,
    runtimeEventsForTransition(basis, transition),
    request.startRequest.startIntent.until
  );
  const outcome = constructPublicControlLoopOutcome(
    [publicStartOutcome],
    request.startRequest.controlModes
  );

  assert.equal(outcome.kind, "human_gate_required");
  assert.equal(outcome.stopDetail.approvalSubjectRef, "approval://edge/review");
  assert.deepStrictEqual(outcome.approvalHint, {
    actor: "human-proxy",
    approvalSubjectRef: "approval://edge/review"
  });
});

test("M04 control unit: repeated advanced public-start truth stays explicit as yielded re-entry truth", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-control-unit-fd",
    name: "public_profile_fd",
    graphId: "graph-m04-control-unit-fd",
    graphName: "design→code:m04-control-unit-fd"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-m04-control-unit-fd",
        name: "public_profile_fd_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const request = admitPublicControlLoopRequest(
    controlLoopPayload(profile.name, {}, {
      root_mode: "supervised"
    })
  );
  const basis = admitExecutionBasis({
    startIntent: request.startRequest.startIntent,
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://public-fd",
      defaultRegime: "F_D"
    }),
    runId: "run://m04-control-unit-fd",
    workKey: "wk://m04-control-unit-fd"
  });
  const transition = deriveAdvancementTransition(basis);
  const first = constructPublicStartOutcome(
    basis,
    transition,
    runtimeEventsForTransition(basis, transition),
    request.startRequest.startIntent.until
  );
  const second = constructPublicStartOutcome(
    basis,
    transition,
    runtimeEventsForTransition(basis, transition),
    request.startRequest.startIntent.until
  );
  const outcome = constructPublicControlLoopOutcome(
    [first, second],
    request.startRequest.controlModes
  );

  assert.equal(outcome.kind, "yielded");
  assert.equal(outcome.stopDetail.kind, "advanced_reentry_required");
  assert.deepStrictEqual(outcome.trace.stepKinds, ["advanced", "advanced"]);
});

test("M04 control unit: gap-stop public-start truth stays explicit inside rejected control stop detail", () => {
  const outcome = constructPublicControlLoopOutcome(
    [
      Object.freeze({
        kind: "blocked",
        stopPredicate: "gap_stop",
        runtimeIdentity: runtimeIdentity(),
        trace: Object.freeze({
          basisId: "basis://m04-control-unit-gap",
          runId: "run://m04-control-unit-gap",
          workKey: "wk://m04-control-unit-gap",
          frameId: null,
          frameLineageId: null,
          eventKinds: Object.freeze(["terminal_reached"])
        }),
        stopDetail: Object.freeze({
          terminalKind: "gap_stop",
          gateReason: null,
          dispatchRef: null,
          approvalSubjectRef: null
        })
      })
    ],
    Object.freeze({
      fhMode: "direct",
      rootMode: "direct"
    })
  );

  assert.equal(outcome.kind, "rejected");
  assert.equal(outcome.stopDetail.kind, "gap_stop");
  assert.equal(outcome.stopDetail.terminalKind, "gap_stop");
});
