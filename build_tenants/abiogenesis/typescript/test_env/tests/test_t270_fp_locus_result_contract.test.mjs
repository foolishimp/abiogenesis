// Validates: T-270; REQ-R-ABG3-PLUGIN-SEAMS; REQ-L-GTL3-C-ALGEBRA-018.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  admitModule
} from "../../build/semantic/code/src/index.js";
import {
  resolveAbgFnCompositionSelection
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  projectFpResultLocusContract
} from "../../build/semantic/code/src/abg/m03/contracts/fp_result_contract_admission.js";
import {
  pluginSelectionFromDeclarationAttrs
} from "../../build/semantic/code/src/abg/m03/contracts/plugin_selection.js";

const T223_HELLO_WORLD_MODULE_URL = new URL(
  "../fixtures/t223_hello_world_catalog_product/package/catalog/hello-world.module.json",
  import.meta.url
);

function helloWorldFpLoci() {
  const module = admitModule(
    JSON.parse(readFileSync(T223_HELLO_WORLD_MODULE_URL, "utf8"))
  );
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.id === "graph-function://fixture/hello-world"
  );
  assert.notEqual(graphFunction, undefined);
  assert.equal(graphFunction.template.kind, "inline_graph");
  const graphVector = graphFunction.template.graph.vectors[0];
  assert.notEqual(graphVector, undefined);
  const composition = resolveAbgFnCompositionSelection({
    graphFunction,
    vector: graphVector,
    module
  });
  const pluginSelection = pluginSelectionFromDeclarationAttrs(
    graphFunction.declarations,
    graphFunction.id
  );
  assert.notEqual(pluginSelection, null);
  const fpRows = composition.contract.regimes.filter(
    (row) => row.regime === "F_P"
  );
  assert.deepEqual(
    fpRows.map((row) => row.stageRole),
    ["transform", "evaluate"]
  );
  return Object.freeze({ fpRows, pluginSelection });
}

test("T-270 derives each real Hello World F_P locus from its own declared seam", () => {
  const { fpRows, pluginSelection } = helloWorldFpLoci();
  assert.deepEqual(
    fpRows.map((row) => projectFpResultLocusContract({
      compositionStageRole: row.stageRole,
      pluginSelection,
      sourceRef: row.bindingRef
    })),
    [
      {
        compositionStageRole: "transform",
        requiredPluginSeam: "fpDispatch",
        wireProfile: "attached_result_artifact",
        pluginRef: "plugin://abg/fp-dispatch-live"
      },
      {
        compositionStageRole: "evaluate",
        requiredPluginSeam: "fpEvaluator",
        wireProfile: "standard_live_review",
        pluginRef: "plugin://abg/fp-evaluator-live"
      }
    ]
  );
});

test("T-270 blocks each Hello World F_P locus when its own seam is missing", () => {
  const { fpRows, pluginSelection } = helloWorldFpLoci();
  assert.throws(
    () => projectFpResultLocusContract({
      compositionStageRole: "transform",
      pluginSelection: Object.freeze({
        fpEvaluator: pluginSelection.fpEvaluator
      }),
      sourceRef: fpRows[0].bindingRef
    }),
    /requires declared plugin seam fpDispatch/u
  );
  assert.throws(
    () => projectFpResultLocusContract({
      compositionStageRole: "evaluate",
      pluginSelection: Object.freeze({
        fpDispatch: pluginSelection.fpDispatch
      }),
      sourceRef: fpRows[1].bindingRef
    }),
    /requires declared plugin seam fpEvaluator/u
  );
});

test("T-270 blocks F_P result admission at an unsupported composition role", () => {
  const { pluginSelection } = helloWorldFpLoci();
  assert.throws(
    () => projectFpResultLocusContract({
      compositionStageRole: "consequence",
      pluginSelection,
      sourceRef: "regime-binding://fixture/hello-world/consequence/fp"
    }),
    /unsupported composition stage role "consequence"/u
  );
});
