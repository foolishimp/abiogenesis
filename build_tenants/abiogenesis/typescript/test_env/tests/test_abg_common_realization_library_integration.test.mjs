import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveAdvancementTransition,
  dispatchRequestsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";
import { publicStart } from "../../build/semantic/code/src/app/m04/index.js";
import {
  contractForKnownAgent,
  constructDispatchExpectation,
  constructProofFixtureProfile,
  projectDispatchAssessmentIds,
  projectDispatchExpectedEdge
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";
import {
  admitRuntimeModule,
  jobPayload,
  publishedProfile,
  requestPayload,
  resolvedPolicyIdentity,
  runtimeIdentity
} from "./support/m04-fixtures.mjs";

test("ABG common library integration: M03 transport adapter consumes canonical expectation and contract carriers", () => {
  const { basis, profile } = buildFpBasis();
  const transition = deriveAdvancementTransition(basis);
  const request = dispatchRequestsForTransition(transition)[0];
  const expected = constructDispatchExpectation({
    expectedEdge: "design→code:fp",
    assessmentIds: ["code_complete"]
  });
  const codexContract = contractForKnownAgent("codex");

  assert.equal(request.graphFunctionId, profile.id);
  assert.equal(request.expectedEdge, projectDispatchExpectedEdge(expected));
  assert.deepStrictEqual(
    request.expectedAssessmentIds,
    projectDispatchAssessmentIds(expected)
  );
  assert.deepStrictEqual(request.transportContract, codexContract);
});

test("ABG common library integration: M04 proof adapter consumes reusable profile truth and still drives public start", () => {
  const sharedProfile = constructProofFixtureProfile({
    kind: "m04_public_runtime_profile",
    publishedWork: {
      moduleName: "abiogenesis.public_runtime",
      graphFunctionName: "public_profile",
      jobName: "public_profile_job"
    },
    runtimeContext: {
      workerId: "worker://typescript-public-start",
      backendId: "backend://node",
      resolvedPolicyBundleRef: "policy://public-fd"
    }
  });
  const profile = publishedProfile({
    id: "graph-function-t027-m04-fd",
    name: "public_profile_t027",
    graphId: "graph-t027-m04-fd",
    graphName: "design→code:t027"
  });
  const module = admitRuntimeModule({
    graphFunctions: [profile],
    jobs: [
      jobPayload({
        id: "job-t027-m04-fd",
        name: "public_profile_t027_job",
        graphFunctionId: profile.id
      })
    ]
  });
  const runtime = runtimeIdentity();
  const resolvedPolicy = resolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://public-fd",
    defaultRegime: "F_D"
  });
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name),
    {
      module,
      runtimeIdentity: runtime,
      resolvedPolicy
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(runtime.workerId, sharedProfile.runtimeContext.workerId);
  assert.equal(runtime.backendId, sharedProfile.runtimeContext.backendId);
  assert.equal(
    resolvedPolicy.resolvedPolicyBundleRef,
    sharedProfile.runtimeContext.resolvedPolicyBundleRef
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
});
