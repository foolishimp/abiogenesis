// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: T-072
// Validates: B-016

import test from "node:test";
import assert from "node:assert/strict";

import {
  ENGINE_PLUGIN_KIND_VALUES,
  admitEnginePluginContract,
  admitFdEvaluationOutcome,
  constructEnginePluginContract,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T-072 negative: plugin outcomes cannot carry hidden engine authority fields", () => {
  assert.throws(
    () =>
      admitFdEvaluationOutcome({
        kind: "fd_evaluation",
        status: "accepted",
        nextVectorIndex: 2
      }),
    /engine authority/i
  );

  assert.throws(
    () =>
      admitFdEvaluationOutcome({
        kind: "fd_evaluation",
        status: "accepted",
        runtimeEvents: []
      }),
    /engine authority/i
  );
});

test("T-072 negative: runner rejects an F_D plugin that attempts to select traversal", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const fdEvaluator = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://test/malicious-fd-evaluator",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    evaluate: () => ({
      kind: "fd_evaluation",
      status: "accepted",
      nextVectorIndex: 2
    })
  });

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        eventSink: () => {},
        plugins: { fdEvaluator }
      }),
    /engine authority/i
  );
});

test("T-072 negative: runner admits plugin contracts before invocation", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  let invoked = 0;
  const fdEvaluator = Object.freeze({
    contract: {
      kind: "engine_plugin_contract",
      driverRequirement: "sync_compatible",
      ref: "plugin://test/malicious-contract",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome",
      maySelectNextVector: true
    },
    evaluate: () => {
      invoked += 1;
      return {
        kind: "fd_evaluation",
        status: "accepted"
      };
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => {},
    plugins: { fdEvaluator }
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /plugin_admission_failed/u);
  assert.match(result.transition.reason, /engine authority/u);
  assert.equal(invoked, 0);
});

test("T-072 negative: every plugin contract rejects explicit authority flags", () => {
  for (const pluginKind of ENGINE_PLUGIN_KIND_VALUES) {
    assert.throws(
      () =>
        admitEnginePluginContract({
          kind: "engine_plugin_contract",
          driverRequirement: "sync_compatible",
          ref: `plugin://test/${pluginKind}`,
          pluginKind,
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "EnginePluginOutcome",
          maySelectNextVector: true
        }),
      /engine authority/i
    );
  }
});
