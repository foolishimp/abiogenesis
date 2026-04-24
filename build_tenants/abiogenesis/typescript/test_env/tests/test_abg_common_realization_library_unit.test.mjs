import test from "node:test";
import assert from "node:assert/strict";

import {
  constructAgentTransportContract,
  constructDispatchExpectation,
  constructFixtureJobPayload,
  constructProofFixtureProfile,
  constructRuntimeIdentityPayload,
  constructSanitizedEnvironmentPolicy,
  deriveDispatchExpectation,
  projectDispatchAssessmentIds,
  projectDispatchExpectedEdge
} from "../../build/semantic/code/src/shared/abg_library/index.js";

test("ABG common library unit: dispatch expectation derives one closed canonical family", () => {
  const expectation = deriveDispatchExpectation({
    sourceKinds: ["design", "review"],
    targetKind: "code",
    assessmentIds: ["code_complete", "review_complete"]
  });

  assert.equal(projectDispatchExpectedEdge(expectation), "design&review→code");
  assert.deepStrictEqual(projectDispatchAssessmentIds(expectation), [
    "code_complete",
    "review_complete"
  ]);
  assert.ok(Object.isFrozen(expectation));
  assert.ok(Object.isFrozen(expectation.assessments));
  assert.ok(Object.isFrozen(expectation.assessments[0]));
});

test("ABG common library unit: transport contract keeps nested sanitization policy explicit", () => {
  const contract = constructAgentTransportContract({
    agentKey: "claude",
    command: "claude",
    argsTemplate: ["-p", "{prompt}"],
    sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([
      "CLAUDE",
      "",
      "CLAUDE_CODE_SSE_"
    ])
  });

  assert.equal(contract.agentKey, "claude");
  assert.deepStrictEqual(contract.argsTemplate, ["-p", "{prompt}"]);
  assert.deepStrictEqual(contract.sanitizedEnvironmentPolicy.prefixes, [
    "CLAUDE",
    "CLAUDE_CODE_SSE_"
  ]);
  assert.ok(Object.isFrozen(contract));
  assert.ok(Object.isFrozen(contract.argsTemplate));
  assert.ok(Object.isFrozen(contract.sanitizedEnvironmentPolicy));
});

test("ABG common library unit: proof fixture profile stays reusable without leaking module ownership", () => {
  const profile = constructProofFixtureProfile({
    kind: "abg_library_profile",
    publishedWork: {
      moduleName: "abiogenesis.library_runtime",
      graphFunctionName: "shared_profile",
      jobName: "shared_profile_job"
    },
    runtimeContext: {
      workerId: "worker://library",
      backendId: "backend://node",
      resolvedPolicyBundleRef: "policy://library"
    }
  });
  const job = constructFixtureJobPayload({
    id: "job://shared_profile",
    graphFunctionId: "graph-function://shared_profile",
    rolePayload: Object.freeze({ id: "role://reviewer" })
  });
  const runtimeIdentity = constructRuntimeIdentityPayload({
    profile,
    resolvedRuntimeRef: "runtime://typescript/node"
  });

  assert.equal(profile.publishedWork.moduleName, "abiogenesis.library_runtime");
  assert.equal(job.contracts[0].targetId, "graph-function://shared_profile");
  assert.equal(runtimeIdentity.workerId, "worker://library");
  assert.equal(runtimeIdentity.buildId, "build://typescript-dev");
  assert.ok(Object.isFrozen(profile));
  assert.ok(Object.isFrozen(profile.publishedWork));
  assert.ok(Object.isFrozen(profile.runtimeContext));
});

test("ABG common library unit: explicit construction preserves null edge and empty assessment family", () => {
  const expectation = constructDispatchExpectation({
    expectedEdge: null,
    assessmentIds: []
  });

  assert.equal(projectDispatchExpectedEdge(expectation), null);
  assert.deepStrictEqual(projectDispatchAssessmentIds(expectation), []);
});
