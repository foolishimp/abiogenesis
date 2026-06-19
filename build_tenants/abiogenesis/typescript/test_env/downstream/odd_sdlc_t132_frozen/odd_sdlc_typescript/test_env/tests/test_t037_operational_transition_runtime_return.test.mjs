// Validates: REQ-F-ODDSDLC-016
// Validates: REQ-F-ODDSDLC-026
// Validates: REQ-F-ODDSDLC-038
// Validates: REQ-F-ODDSDLC-039
// Investigates: T-037
// Investigates: T-043

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcOperationalResult,
  admitSdlcProjectConstraints,
  advanceSdlcOperationalTransitionOnce,
  observeSdlcRuntimeReturn,
  prepareSdlcOperationalTransition,
  SDLC_OPERATIONAL_LANE_POLICY
} from "../../build/semantic/code/src/index.js";

function constraints(capabilityContracts) {
  return admitSdlcProjectConstraints({
    projectSlug: "t037",
    activeTenant: "typescript",
    selectedOutputRoot: "build_tenants/typescript",
    ambiguityRiskAppetite: "medium",
    capabilityContracts
  });
}

function preparedBuildCommand() {
  const plan = prepareSdlcOperationalTransition({
    projectConstraints: constraints(["build_runner"]),
    lane: "build",
    commandId: "command://t037/build",
    capabilityContract: "build_runner",
    targetAssetIds: ["asset://release_surface"]
  });
  assert.equal(plan.status, "prepared");
  assert(plan.command);
  return plan.command;
}

test("T-037 missing operational capability blocks without false completion", () => {
  const plan = prepareSdlcOperationalTransition({
    projectConstraints: constraints([]),
    lane: "deployment",
    commandId: "command://t037/deploy",
    capabilityContract: "deployment_contract",
    targetAssetIds: ["asset://release_surface"]
  });

  assert.equal(plan.kind, "sdlc_operational_transition_plan");
  assert.equal(plan.status, "blocked");
  assert.equal(plan.command, null);
  assert.equal(plan.blockingReason, "missing_capability");
  assert.deepStrictEqual(plan.emittedRuntimeEventKinds, []);
});

test("T-057 operational lane bindings are declared data", () => {
  assert.deepStrictEqual(
    SDLC_OPERATIONAL_LANE_POLICY.map((entry) => entry.lane),
    ["build", "test_execution", "deployment", "runtime_return"]
  );
  const deployment = SDLC_OPERATIONAL_LANE_POLICY.find(
    (entry) => entry.lane === "deployment"
  );
  assert(deployment);
  assert.equal(deployment.requiredSubstrateBinding, "runtime://deployment");
});

test("T-037 command intent without returned evidence remains pending", () => {
  const command = preparedBuildCommand();
  const advance = advanceSdlcOperationalTransitionOnce({
    command,
    runtimeFactRefs: ["abg://runtime/open-command"]
  });

  assert.equal(command.kind, "sdlc_operational_transition_command");
  assert.equal(advance.stage, "pending_external_evidence");
  assert.equal(advance.result, null);
  assert.equal(advance.projection.state, "pending");
  assert.equal(advance.shouldContinueInTenant, false);
  assert.equal(advance.nextControlOwner, "abg_public_start");
  assert.deepStrictEqual(advance.emittedRuntimeEventKinds, []);
});

test("T-037 admitted result drives projection and rejects foreign command results", () => {
  const command = preparedBuildCommand();
  const result = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t037/build/1",
    commandId: command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://build-log"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const advance = advanceSdlcOperationalTransitionOnce({
    command,
    result,
    runtimeFactRefs: ["abg://runtime/result-admitted"]
  });

  assert.equal(advance.stage, "result_admitted");
  assert.equal(advance.projection.state, "succeeded");
  assert.deepStrictEqual(advance.projection.sourceResultIds, [result.resultId]);
  assert.throws(
    () =>
      advanceSdlcOperationalTransitionOnce({
        command,
        result: {
          ...result,
          commandId: "command://other"
        },
        runtimeFactRefs: []
      }),
    /another command/
  );
});

test("T-037 runtime-return evidence feeds observation and retrofit graph functions", () => {
  const plan = prepareSdlcOperationalTransition({
    projectConstraints: constraints(["runtime_return_channel"]),
    lane: "runtime_return",
    commandId: "command://t037/runtime-return",
    capabilityContract: "runtime_return_channel",
    targetAssetIds: ["asset://deployment_result_surface"]
  });
  assert(plan.command);
  const result = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t037/runtime-return/1",
    commandId: plan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://runtime-observation"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const observation = observeSdlcRuntimeReturn({
    command: plan.command,
    result,
    runtimeFactRefs: ["abg://runtime/returned"]
  });

  assert.equal(observation.kind, "sdlc_runtime_return_observation");
  assert.equal(observation.status, "returned");
  assert.deepStrictEqual(observation.evidenceAssetIds, ["asset://runtime-observation"]);
  assert.deepStrictEqual(observation.feedsGraphFunctions, [
    "derive_runtime_observation_surface",
    "derive_retrofit_plan_surface"
  ]);
  assert.deepStrictEqual(observation.emittedRuntimeEventKinds, []);
});

test("T-043 runtime-return observation rejects foreign results and non-runtime lanes", () => {
  const runtimePlan = prepareSdlcOperationalTransition({
    projectConstraints: constraints(["runtime_return_channel"]),
    lane: "runtime_return",
    commandId: "command://t043/runtime-return",
    capabilityContract: "runtime_return_channel",
    targetAssetIds: ["asset://deployment_result_surface"]
  });
  assert(runtimePlan.command);
  const result = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://t043/runtime-return/1",
    commandId: runtimePlan.command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://runtime-observation"],
    returnedAt: "2026-04-26T00:00:00Z"
  });

  assert.throws(
    () =>
      observeSdlcRuntimeReturn({
        command: runtimePlan.command,
        result: {
          ...result,
          commandId: "command://t043/foreign"
        },
        runtimeFactRefs: []
      }),
    /another command/
  );

  assert.throws(
    () =>
      observeSdlcRuntimeReturn({
        command: preparedBuildCommand(),
        result,
        runtimeFactRefs: []
      }),
    /runtime_return/
  );
});
