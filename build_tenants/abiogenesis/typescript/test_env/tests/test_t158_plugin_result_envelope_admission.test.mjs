// Validates: T-158

import test from "node:test";
import assert from "node:assert/strict";
import {
  admitPluginResultEnvelope,
  constructAdmittedPluginResultInterfaceCatalog,
  constructAdmittedPluginResultInterfaceContract,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  resolveAbgFnCompositionSelection,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

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
  const resultInterfaceContract =
    constructAdmittedPluginResultInterfaceContract(resultInterface());
  const envelope = admitPluginResultEnvelope({
    resultInterface: resultInterfaceContract,
    result: pluginResult(),
    resultRef: "file:///tmp/t158/fp_evaluate_result.json"
  });

  assert.equal(envelope.kind, "admitted_plugin_result_envelope");
  assert.equal(envelope.resultInterfaceRef, "result-interface://t158/evaluate");
  assert.equal(
    envelope.resultInterfaceContractDigest,
    resultInterfaceContract.resultInterfaceContractDigest
  );
  assert.equal(
    envelope.compositionSelectionRef,
    "abg.fn_composition_selection://t158/evaluate"
  );
});

test("T-158 rejects plugin result envelope with wrong composition", () => {
  assert.throws(
    () =>
      admitPluginResultEnvelope({
        resultInterface: constructAdmittedPluginResultInterfaceContract(
          resultInterface()
        ),
        result: pluginResult({
          compositionRef: "abg.fn_composition://t158/other"
        })
      }),
    /compositionRef does not match result interface/u
  );
});

test("T-158 rejects raw plugin result interface rows at runtime ingress", () => {
  assert.throws(
    () =>
      admitPluginResultEnvelope({
        resultInterface: resultInterface(),
        result: pluginResult()
      }),
    /must be an admitted plugin result interface contract/u
  );
});

test("T-158 rejects plugin result envelope with engine authority payload", () => {
  assert.throws(
    () =>
      admitPluginResultEnvelope({
        resultInterface: constructAdmittedPluginResultInterfaceContract(
          resultInterface()
        ),
        result: pluginResult({
          runtimeEvents: []
        })
      }),
    /cannot own engine authority/u
  );
});

function modulePolicySourceForBasis(basis) {
  return Object.freeze({
    name: basis.moduleName,
    policyHooks: basis.modulePolicyHooks
  });
}

function selectedCompositionForBasis(basis) {
  return resolveAbgFnCompositionSelection({
    vector: basis.graph.vectors[0],
    graphFunction: basis.graphFunction,
    job: basis.job,
    module: modulePolicySourceForBasis(basis)
  });
}

function runtimeResultInterface(input) {
  return Object.freeze({
    resultInterfaceRef:
      input.resultInterfaceRef ??
      `result-interface://t158/runtime/${input.stageRole}/${input.computeMeans}/${input.resultCarrierKind}`,
    stageBindingRef:
      input.stageBindingRef ??
      `stage-binding://t158/runtime/${input.stageRole}.${input.computeMeans}`,
    compositionRef: input.selection.contract.contractRef,
    compositionDigest: input.selection.contract.contractDigest,
    stageRole: input.stageRole,
    computeMeans: input.computeMeans,
    resultEnvelopeContractRef:
      input.resultEnvelopeContractRef ??
      `result-envelope://t158/runtime/${input.stageRole}.${input.computeMeans}/${input.resultCarrierKind}`,
    resultCarrierKind: input.resultCarrierKind,
    outputCarrierRefs: Object.freeze([input.resultCarrierKind]),
    producedCarrierRefs: Object.freeze([
      `carrier://t158/runtime/${input.stageRole}.${input.computeMeans}/${input.resultCarrierKind}`
    ]),
    requiredIdentityFieldRefs: Object.freeze([
      "compositionRef",
      "compositionDigest",
      "compositionSelectionRef",
      "stageRole",
      "computeMeans",
      "outputCarrierRefs"
    ]),
    selectorAuthorityRefs: Object.freeze([
      `gtl://plugin-result-interface/t158/runtime/${input.stageRole}.${input.computeMeans}/${input.resultCarrierKind}`
    ]),
    evidenceRefs: Object.freeze([
      `stage-binding://t158/runtime/${input.stageRole}.${input.computeMeans}`
    ]),
    mayWriteLedgers: false,
    mayEmitRuntimeEvents: false,
    maySelectTraversal: false,
    mayCloseTraversal: false,
    mayOwnIterationLoop: false
  });
}

function fdEvaluatorPlugin() {
  return Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://t158/fd",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    evaluate(input) {
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

test("T-158 runner emits replay-visible admitted plugin result envelopes", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const selection = selectedCompositionForBasis(basis);
  const resultInterfaces = Object.freeze([
    runtimeResultInterface({
      selection,
      stageRole: "evaluate",
      computeMeans: "F_D",
      resultCarrierKind: "FdEvaluationOutcome"
    }),
    runtimeResultInterface({
      selection,
      stageRole: "consequence",
      computeMeans: "F_D",
      resultCarrierKind: "ConsequenceProjectionOutcome"
    })
  ]);
  const resultInterfaceCatalog = constructAdmittedPluginResultInterfaceCatalog({
    subjectRef: "subject://t158/runtime",
    interfaces: resultInterfaces
  });
  const events = [];

  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fdEvaluator: fdEvaluatorPlugin()
    },
    pluginResultInterfaceCatalog: resultInterfaceCatalog
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  const observedEnvelopes = events.filter(
    (event) =>
      event.kind === "payload_observed" &&
      event.payloadClass === "admitted_plugin_result_envelope"
  );
  assert.ok(observedEnvelopes.length >= 3);
  assert.equal(
    observedEnvelopes[0].authorityRef,
    resultInterfaces[0].resultInterfaceRef
  );
  assert.equal(
    observedEnvelopes[0].contractRef,
    resultInterfaces[0].resultEnvelopeContractRef
  );
  assert.ok(
    events.some(
      (event) =>
        event.kind === "payload_validated" &&
        event.payloadRef === observedEnvelopes[0].payloadRef &&
        event.contractRef === resultInterfaces[0].resultEnvelopeContractRef &&
        event.contractDigest ===
          resultInterfaceCatalog.interfaces[0].resultInterfaceContractDigest
    )
  );
  assert.ok(
    events.some(
      (event) =>
        event.kind === "evidence_admitted" &&
        event.payloadRef === observedEnvelopes[0].payloadRef
    )
  );
});

test("T-158 runner rejects plugin output when no declared result interface matches", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const selection = selectedCompositionForBasis(basis);
  const mismatchedInterface = runtimeResultInterface({
    selection: Object.freeze({
      ...selection,
      contract: Object.freeze({
        ...selection.contract,
        contractDigest: "sha256:t158-wrong-composition"
      })
    }),
    stageRole: "evaluate",
    computeMeans: "F_D",
    resultCarrierKind: "FdEvaluationOutcome"
  });
  const resultInterfaceCatalog = constructAdmittedPluginResultInterfaceCatalog({
    subjectRef: "subject://t158/runtime-mismatch",
    interfaces: Object.freeze([mismatchedInterface])
  });

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        eventSink: () => {},
        plugins: {
          fdEvaluator: fdEvaluatorPlugin()
        },
        pluginResultInterfaceCatalog: resultInterfaceCatalog
      }),
    /plugin result interface admission expected exactly one admitted GTL contract/u
  );
});
