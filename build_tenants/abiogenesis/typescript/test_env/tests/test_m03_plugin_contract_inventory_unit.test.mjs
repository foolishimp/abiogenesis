// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-RUN
// Validates: T-072
// Validates: B-016

import test from "node:test";
import assert from "node:assert/strict";

import {
  ENGINE_PLUGIN_AUTHORITY_VALUES,
  ENGINE_PLUGIN_KIND_VALUES,
  ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES,
  admitEnginePluginContract,
  enginePluginInventory
} from "../../build/semantic/code/src/index.js";

test("T-072 plugin inventory: every declared ABG plugin seam has one governed contract", () => {
  const inventory = enginePluginInventory();
  const expectedKinds = [...ENGINE_PLUGIN_KIND_VALUES].sort();
  const actualKinds = inventory
    .map((entry) => entry.contract.pluginKind)
    .sort();

  assert.deepStrictEqual(actualKinds, expectedKinds);
  assert.equal(new Set(actualKinds).size, expectedKinds.length);

  for (const entry of inventory) {
    assert.equal(entry.kind, "engine_plugin_inventory_entry");
    assert.ok(
      ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES.includes(
        entry.runtimeBindingStatus
      )
    );
    assert.notEqual(entry.proofScope.length, 0);
    assert.notEqual(entry.engineOwnedLaw.length, 0);
    assert.notEqual(entry.pluginOwnedScope.length, 0);
    assert.notEqual(entry.positiveProof.length, 0);
    assert.notEqual(entry.negativeProof.length, 0);
    assert.ok(ENGINE_PLUGIN_AUTHORITY_VALUES.includes(entry.collapseFamily));
    assert.deepStrictEqual(
      admitEnginePluginContract(entry.contract),
      entry.contract
    );
    assert.equal(entry.contract.maySelectNextVector, false);
    assert.equal(entry.contract.mayEmitRuntimeEvents, false);
    assert.equal(entry.contract.mayCloseTraversal, false);
    assert.equal(entry.contract.mayOwnIterationLoop, false);
  }
});

test("T-072 plugin inventory: repeated seams collapse into common authority families", () => {
  const inventory = enginePluginInventory();
  const familyCounts = new Map();

  for (const entry of inventory) {
    familyCounts.set(
      entry.collapseFamily,
      (familyCounts.get(entry.collapseFamily) ?? 0) + 1
    );
  }

  assert.ok((familyCounts.get("effect_plugin") ?? 0) >= 5);
  assert.ok((familyCounts.get("provider") ?? 0) >= 3);
  assert.ok((familyCounts.get("resolver") ?? 0) >= 2);
  assert.equal(familyCounts.get("sink"), 1);
  assert.equal(familyCounts.get("projection_consumer"), 1);
  assert.equal(familyCounts.get("declaration_ref"), 1);
});

test("B-016 plugin inventory: every current TS hook has a closed binding lane", () => {
  const inventory = enginePluginInventory();
  const runtimeConsumed = inventory
    .filter((entry) => entry.runtimeBindingStatus === "runner_consumed")
    .map((entry) => entry.contract.pluginKind)
    .sort();
  const publicRuntimeConsumed = inventory
    .filter((entry) => entry.runtimeBindingStatus === "public_runtime_consumed")
    .map((entry) => entry.contract.pluginKind)
    .sort();
  const engineLawConsumed = inventory
    .filter((entry) => entry.runtimeBindingStatus === "engine_law_consumed")
    .map((entry) => entry.contract.pluginKind)
    .sort();
  const readModelConsumed = inventory
    .filter((entry) => entry.runtimeBindingStatus === "read_model_consumed")
    .map((entry) => entry.contract.pluginKind)
    .sort();
  const declarativeContracts = inventory
    .filter((entry) => entry.runtimeBindingStatus === "declarative_contract")
    .map((entry) => entry.contract.pluginKind)
    .sort();

  assert.deepStrictEqual(runtimeConsumed, [
    "fd_evaluator",
    "fh_admission",
    "fp_dispatch",
    "runtime_event_sink"
  ]);
  assert.deepStrictEqual(publicRuntimeConsumed, [
    "event_ingress",
    "operator_asset_resolver",
    "policy_provider",
    "result_assessment",
    "runtime_identity_provider"
  ]);
  assert.deepStrictEqual(engineLawConsumed, ["continuation_repair"]);
  assert.deepStrictEqual(readModelConsumed, ["projection_consumer"]);
  assert.deepStrictEqual(declarativeContracts, [
    "context_resolver",
    "hook_ref"
  ]);
  assert.equal(
    inventory.some(
      (entry) => entry.runtimeBindingStatus === "classified_hook_family"
    ),
    false
  );
});
