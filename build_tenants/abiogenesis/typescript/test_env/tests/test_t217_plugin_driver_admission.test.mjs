// Validates: T-217 S2.3 R5 section 1 plugin driver admission

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitEnginePluginContract,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  resolveSyncEnginePluginEffect,
  runEngineIterate,
  runEngineIterateAsync
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function rawContract(overrides = {}) {
  return {
    kind: "engine_plugin_contract",
    ref: "plugin://t217/r5/admission",
    driverRequirement: "sync_compatible",
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome",
    ...overrides
  };
}

function syncFdPlugin(contract, observe = () => undefined) {
  return Object.freeze({
    contract,
    evaluate(input) {
      observe(input);
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function runSyncWith(plugins) {
  return runEngineIterate({
    basis: buildThreeStageBasis({ defaultRegime: "F_D", dispatchRef: null }),
    eventSink: () => undefined,
    plugins
  });
}

function assertTypedStartupRefusal(result, detail) {
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(result.iterationCount, 0);
  assert.match(result.transition.reason, /plugin_admission_failed/u);
  assert.match(result.transition.reason, detail);
  const failure = result.replayEvents.find(
    (event) => event.kind === "runtime_failure_observed"
  );
  assert.notEqual(failure, undefined);
  assert.equal(failure.surface, "plugin_selection");
  assert.equal(failure.failureClass, "contract_failure");
}

test("R5 section 1: driverRequirement is mandatory and strict at construction and admission", () => {
  const withoutRequirement = rawContract();
  delete withoutRequirement.driverRequirement;
  assert.throws(
    () => constructEnginePluginContract(withoutRequirement),
    /driverRequirement/u
  );
  assert.throws(
    () => admitEnginePluginContract(withoutRequirement),
    /driverRequirement/u
  );
  assert.throws(
    () => constructEnginePluginContract(rawContract({ driverRequirement: "sometimes" })),
    /driverRequirement/u
  );
  assert.throws(
    () => admitEnginePluginContract(rawContract({ driverRequirement: "sometimes" })),
    /driverRequirement/u
  );
});

test("R5 section 1: contract round-trip preserves explicit async metadata", () => {
  const contract = constructEnginePluginContract({
    driverRequirement: "async_required",
    ref: "plugin://t217/r5/roundtrip",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
  const admitted = admitEnginePluginContract(JSON.parse(JSON.stringify(contract)));
  assert.equal(admitted.driverRequirement, "async_required");
  assert.deepEqual(admitted, contract);
  assert.equal(Object.isFrozen(admitted), true);
});

test("R5 section 1: missing or invalid arbitrary-ref metadata fails typed before invocation", () => {
  for (const [label, contract] of [
    ["missing", (() => {
      const value = rawContract({ ref: "plugin://t217/r5/missing" });
      delete value.driverRequirement;
      return value;
    })()],
    ["invalid", rawContract({
      ref: "plugin://t217/r5/invalid",
      driverRequirement: "maybe"
    })]
  ]) {
    let invoked = 0;
    const result = runSyncWith({
      fdEvaluator: syncFdPlugin(contract, () => {
        invoked += 1;
      })
    });
    assertTypedStartupRefusal(result, /driverRequirement/u);
    assert.equal(invoked, 0, `${label} metadata must fail before invocation`);
  }
});

test("R5 section 1: arbitrary async-required ref cannot board the sync driver", async () => {
  let invoked = 0;
  let continued = false;
  const plugin = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "async_required",
      ref: "plugin://t217/r5/arbitrary-async",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    async evaluate(input) {
      invoked += 1;
      await Promise.resolve();
      continued = true;
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const result = runSyncWith({ fdEvaluator: plugin });
  await Promise.resolve();
  assertTypedStartupRefusal(result, /async_required/u);
  assert.equal(invoked, 0);
  assert.equal(continued, false);
});

test("R5 section 1: scalar kind, authority, carriers, and method fail before invocation", () => {
  const cases = [
    ["kind", rawContract({ pluginKind: "fp_evaluator" }), /pluginKind/u],
    ["authority", rawContract({ authority: "provider" }), /authority/u],
    ["input", rawContract({ inputCarrier: "UnknownInput" }), /inputCarrier/u],
    ["output", rawContract({ outputCarrier: "UnknownOutcome" }), /outputCarrier/u]
  ];
  for (const [label, contract, detail] of cases) {
    let invoked = 0;
    const result = runSyncWith({
      fdEvaluator: syncFdPlugin(contract, () => {
        invoked += 1;
      })
    });
    assertTypedStartupRefusal(result, detail);
    assert.equal(invoked, 0, `${label} mismatch must fail before invocation`);
  }
  const missingMethod = runSyncWith({
    fdEvaluator: Object.freeze({ contract: rawContract() })
  });
  assertTypedStartupRefusal(missingMethod, /callable evaluate/u);
  const nonObject = runSyncWith({ fdEvaluator: 7 });
  assertTypedStartupRefusal(nonObject, /expected plugin object/u);
});

function asyncStageContract(stageRole, outputCarrier) {
  return constructEnginePluginContract({
    driverRequirement: "async_required",
    ref: `plugin://t217/r5/${stageRole}`,
    pluginKind: "hook_ref",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier,
    computeStageRole: stageRole,
    computeMeans: "F_D",
    computeStagePurpose:
      stageRole === "transform"
        ? "candidate_construction"
        : stageRole === "evaluate"
          ? "candidate_evaluation"
          : "consequence_projection"
  });
}

function syncStageContract(stageRole, outputCarrier) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref: `plugin://t217/r5/sync-${stageRole}`,
    pluginKind: "hook_ref",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier,
    computeStageRole: stageRole,
    computeMeans: "F_D",
    computeStagePurpose:
      stageRole === "transform"
        ? "candidate_construction"
        : stageRole === "evaluate"
          ? "candidate_evaluation"
          : "consequence_projection"
  });
}

test("R5 section 1: every composed collection rejects async work before invocation", () => {
  const cases = [
    {
      label: "transformTasks[0]",
      plugins: (run) => ({
        transformTasks: [{
          contract: asyncStageContract("transform", "ComposedStageTaskOutcome"),
          taskRef: "task://t217/r5/transform",
          taskRole: "candidate",
          run
        }]
      })
    },
    {
      label: "evaluationRules[0]",
      plugins: (evaluate) => ({
        evaluationRules: [{
          contract: asyncStageContract("evaluate", "EvaluationRuleOutcome"),
          ruleRef: "rule://t217/r5/evaluate",
          ruleRole: "register",
          evaluate
        }]
      })
    },
    {
      label: "consequenceTasks[0]",
      plugins: (run) => ({
        consequenceTasks: [{
          contract: asyncStageContract("consequence", "ComposedStageTaskOutcome"),
          taskRef: "task://t217/r5/consequence",
          taskRole: "projection",
          run
        }]
      })
    }
  ];
  for (const { label, plugins } of cases) {
    let invoked = 0;
    const result = runSyncWith(
      plugins(async () => {
        invoked += 1;
        return {};
      })
    );
    assertTypedStartupRefusal(result, new RegExp(label.replace("[", "\\[").replace("]", "\\]"), "u"));
    assert.equal(invoked, 0, `${label} must be admitted before invocation`);
  }
});

test("R5 diff witness: composed collection row shape fails before invocation", () => {
  const run = () => {
    throw new Error("must not invoke");
  };
  const evaluate = () => {
    throw new Error("must not invoke");
  };
  const cases = [
    {
      detail: /computeStageRole/u,
      plugins: {
        transformTasks: [{
          contract: syncStageContract(
            "consequence",
            "ComposedStageTaskOutcome"
          ),
          taskRef: "task://t217/r5/wrong-stage",
          taskRole: "candidate",
          run
        }]
      }
    },
    {
      detail: /taskRef must be non-empty/u,
      plugins: {
        transformTasks: [{
          contract: syncStageContract(
            "transform",
            "ComposedStageTaskOutcome"
          ),
          taskRole: "candidate",
          run
        }]
      }
    },
    {
      detail: /taskRole.*not lawful/u,
      plugins: {
        transformTasks: [{
          contract: syncStageContract(
            "transform",
            "ComposedStageTaskOutcome"
          ),
          taskRef: "task://t217/r5/wrong-role",
          taskRole: "projection",
          run
        }]
      }
    },
    {
      detail: /ruleRef must be non-empty/u,
      plugins: {
        evaluationRules: [{
          contract: syncStageContract(
            "evaluate",
            "EvaluationRuleOutcome"
          ),
          ruleRole: "register",
          evaluate
        }]
      }
    }
  ];
  for (const { detail, plugins } of cases) {
    assertTypedStartupRefusal(runSyncWith(plugins), detail);
  }
});

test("R5 section 1: direct sync effect resolution cannot bypass admission", () => {
  let invoked = 0;
  const plugin = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "async_required",
      ref: "plugin://t217/r5/direct-resolver",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    async evaluate() {
      invoked += 1;
      return constructFdEvaluationOutcome({ status: "accepted", evidenceRefs: [] });
    }
  });
  assert.throws(
    () => resolveSyncEnginePluginEffect(
      { kind: "fd_evaluate", input: {} },
      { fdEvaluator: plugin }
    ),
    /plugin_admission_failed.*async_required/u
  );
  assert.equal(invoked, 0);
});

test("R5 section 1: async driver admits and awaits an async-required arbitrary ref", async () => {
  let invocations = 0;
  const plugin = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "async_required",
      ref: "plugin://t217/r5/async-accepted",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    async evaluate(input) {
      invocations += 1;
      await Promise.resolve();
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const result = await runEngineIterateAsync({
    basis: buildThreeStageBasis({ defaultRegime: "F_D", dispatchRef: null }),
    eventSink: () => undefined,
    plugins: { fdEvaluator: plugin }
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(invocations, 3);
});
