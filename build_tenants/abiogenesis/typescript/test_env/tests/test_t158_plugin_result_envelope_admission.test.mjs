// Validates: T-158

import test from "node:test";
import assert from "node:assert/strict";
import {
  admitPluginResultEnvelope
} from "../../build/semantic/code/src/index.js";

function resultInterface(overrides = {}) {
  return Object.freeze({
    resultInterfaceRef: "result-interface://t158/evaluate",
    stageBindingRef: "stage-binding://t158/evaluate.C",
    compositionRef: "abg.fn_composition://t158/evaluate",
    compositionDigest: "sha256:t158-composition",
    stageRole: "evaluate",
    computeMeans: "F_P",
    resultEnvelopeContractRef: "result-envelope://t158/evaluate",
    resultCarrierKind: "FpEvaluationOutcome",
    outputCarrierRefs: Object.freeze([
      "FpEvaluationOutcome",
      "SdlcDesignDepthRegister"
    ]),
    producedCarrierRefs: Object.freeze([
      "carrier://t158/fp-evaluation",
      "carrier://t158/design-depth-register"
    ]),
    requiredIdentityFieldRefs: Object.freeze([
      "compositionRef",
      "compositionDigest",
      "compositionSelectionRef",
      "stageRole",
      "computeMeans",
      "outputCarrierRefs",
      "evidenceRefs"
    ]),
    selectorAuthorityRefs: Object.freeze([
      "gtl://plugin-result-interface/t158/evaluate"
    ]),
    evidenceRefs: Object.freeze(["stage-binding://t158/evaluate.C"]),
    mayWriteLedgers: false,
    mayEmitRuntimeEvents: false,
    maySelectTraversal: false,
    mayCloseTraversal: false,
    mayOwnIterationLoop: false,
    ...overrides
  });
}

function pluginResult(overrides = {}) {
  return Object.freeze({
    kind: "sdlc_fp_evaluate_result",
    stage: "F_P.evaluate",
    computeNotationStage: "evaluate.C",
    stageAuthority: "typed_fp_stage_carriers",
    compositionRef: "abg.fn_composition://t158/evaluate",
    compositionDigest: "sha256:t158-composition",
    compositionSelectionRef: "abg.fn_composition_selection://t158/evaluate",
    selectedRegimeBindingRef: "fp://t158/evaluate",
    evidenceRefs: Object.freeze([
      "file:///tmp/t158/design-depth-content-register.json",
      "file:///tmp/t158/design-depth-rule-outcome.json"
    ]),
    findings: Object.freeze([]),
    status: "evaluated",
    postflightStatus: "passed",
    ...overrides
  });
}

test("T-158 admits plugin result envelope from GTL interface and top-level identity", () => {
  const envelope = admitPluginResultEnvelope({
    resultInterface: resultInterface(),
    result: pluginResult(),
    resultRef: "file:///tmp/t158/fp_evaluate_result.json"
  });

  assert.equal(envelope.kind, "admitted_plugin_result_envelope");
  assert.equal(envelope.resultInterfaceRef, "result-interface://t158/evaluate");
  assert.equal(envelope.stageRole, "evaluate");
  assert.equal(envelope.computeMeans, "F_P");
  assert.equal(
    envelope.compositionSelectionRef,
    "abg.fn_composition_selection://t158/evaluate"
  );
  assert.deepEqual(envelope.outputCarrierRefs, [
    "FpEvaluationOutcome",
    "SdlcDesignDepthRegister"
  ]);
  assert.deepEqual(envelope.producedCarrierRefs, [
    "carrier://t158/fp-evaluation",
    "carrier://t158/design-depth-register"
  ]);
  assert.deepEqual(envelope.selectorAuthorityRefs, [
    "gtl://plugin-result-interface/t158/evaluate"
  ]);
});

test("T-158 rejects plugin result envelope with wrong composition", () => {
  assert.throws(
    () =>
      admitPluginResultEnvelope({
        resultInterface: resultInterface(),
        result: pluginResult({
          compositionRef: "abg.fn_composition://t158/other"
        })
      }),
    /compositionRef does not match result interface/u
  );
});

test("T-158 rejects plugin result envelope with engine authority payload", () => {
  assert.throws(
    () =>
      admitPluginResultEnvelope({
        resultInterface: resultInterface(),
        result: pluginResult({
          runtimeEvents: []
        })
      }),
    /cannot own engine authority/u
  );
});
