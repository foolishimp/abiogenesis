// Validates: T-144
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-R-ABG3-RUN
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ENGINE_COMPUTE_STAGE_PURPOSE_VALUES,
  ENGINE_COMPUTE_STAGE_ROLE_VALUES,
  admitAbgFallbackBundle,
  constructEnginePluginContract,
  constructEnginePluginInput,
  constructConsequenceProjectionOutcome,
  constructFhAdmissionOutcome,
  deriveRuntimeAggregateProjection,
  enginePluginInventory,
  loadAbgFallbackBundleFromFile,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TYPESCRIPT_ROOT = path.resolve(TEST_DIR, "..", "..");
const REFERENCE_FALLBACK_PATH = path.join(
  TYPESCRIPT_ROOT,
  "config",
  "abg.reference-fallbacks.json"
);

function pluginContract(pluginKind) {
  return constructEnginePluginContract({
    ref: `plugin://t144/${pluginKind}`,
    pluginKind,
    authority:
      pluginKind === "projection_consumer" ? "projection_consumer" : "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier:
      pluginKind === "fd_evaluator"
        ? "FdEvaluationOutcome"
        : pluginKind === "fp_dispatch"
          ? "FpDispatchOutcome"
          : pluginKind === "fh_admission"
            ? "FhAdmissionOutcome"
            : pluginKind === "consequence_projection"
              ? "ConsequenceProjectionOutcome"
            : "ProjectionReadModel",
    eventAuthority: pluginKind === "projection_consumer" ? "none" : undefined
  });
}

function firstVectorInput({ basis, contract, regime, fallbackKinds = [] }) {
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const vector = basis.graph.vectors[0];
  return constructEnginePluginInput({
    contract,
    basis,
    projection,
    vectorIndex: 0,
    edge: vector.name,
    regime,
    actorInvocationRef:
      regime === "F_P"
        ? {
            actorInvocationId: "actor://t144/fp",
            attemptIndex: 1,
            dispatchRef: "dispatch://t144/fp",
            resultRef: "result://t144/fp"
          }
        : null,
    abgFallbackBundle: loadAbgFallbackBundleFromFile(REFERENCE_FALLBACK_PATH),
    pluginTraversalObserverFallbackKinds: fallbackKinds
  });
}

test("T-144 engine plugin inventory has explicit compute-stage categories", () => {
  assert.ok(ENGINE_COMPUTE_STAGE_ROLE_VALUES.includes("transform"));
  assert.ok(ENGINE_COMPUTE_STAGE_ROLE_VALUES.includes("evaluate"));
  assert.ok(ENGINE_COMPUTE_STAGE_ROLE_VALUES.includes("consequence"));
  assert.ok(ENGINE_COMPUTE_STAGE_ROLE_VALUES.includes("human_callout"));
  assert.ok(ENGINE_COMPUTE_STAGE_PURPOSE_VALUES.includes("candidate_evaluation"));

  const byKind = new Map(
    enginePluginInventory().map((entry) => [entry.contract.pluginKind, entry])
  );

  assert.deepEqual(
    {
      role: byKind.get("fp_dispatch").contract.computeStageRole,
      means: byKind.get("fp_dispatch").contract.computeMeans,
      purpose: byKind.get("fp_dispatch").contract.computeStagePurpose
    },
    {
      role: "transform",
      means: "F_P",
      purpose: "candidate_construction"
    }
  );
  assert.deepEqual(
    {
      role: byKind.get("fd_evaluator").contract.computeStageRole,
      means: byKind.get("fd_evaluator").contract.computeMeans,
      purpose: byKind.get("fd_evaluator").contract.computeStagePurpose
    },
    {
      role: "evaluate",
      means: "F_D",
      purpose: "candidate_evaluation"
    }
  );
  assert.deepEqual(
    {
      status: byKind.get("consequence_projection").runtimeBindingStatus,
      role: byKind.get("consequence_projection").contract.computeStageRole,
      means: byKind.get("consequence_projection").contract.computeMeans,
      purpose: byKind.get("consequence_projection").contract.computeStagePurpose
    },
    {
      status: "runner_consumed",
      role: "consequence",
      means: "F_D",
      purpose: "consequence_projection"
    }
  );
  assert.deepEqual(
    {
      role: byKind.get("projection_consumer").contract.computeStageRole,
      means: byKind.get("projection_consumer").contract.computeMeans,
      purpose: byKind.get("projection_consumer").contract.computeStagePurpose
    },
    {
      role: "consequence",
      means: "F_D",
      purpose: "consequence_projection"
    }
  );

  const fh = byKind.get("fh_admission").contract;
  assert.equal(fh.computeStageRole, "human_callout");
  assert.equal(fh.computeMeans, "F_H");
  assert.equal(fh.computeStagePurpose, "external_human_callout");
  assert.equal(fh.humanBoundary, "external_callout");
});

test("T-144 plugin input preserves selected composition identity for each stage", () => {
  const fpBasis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const fpInput = firstVectorInput({
    basis: fpBasis,
    contract: pluginContract("fp_dispatch"),
    regime: "F_P",
    fallbackKinds: ["transform"]
  });

  assert.match(fpInput.selectedCompositionDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(
    fpInput.selectedCompositionRef,
    "abg.fn_composition://m03-iteration/default"
  );
  assert.equal(
    fpInput.selectedRegimeBindingRef,
    "regime-binding://m03-iteration/transform/fp"
  );
  assert.equal(
    fpInput.computeStageBinding.selectedCompositionRef,
    fpInput.selectedCompositionRef
  );
  assert.equal(fpInput.computeStageBinding.stageRole, "transform");
  assert.equal(fpInput.computeStageBinding.computeMeans, "F_P");
  assert.equal(fpInput.computeStageBinding.purpose, "candidate_construction");
  assert.equal(fpInput.computeStageBinding.mayWriteLedgers, false);
  assert.equal(fpInput.computeStageBinding.mayEmitRuntimeEvents, false);
  assert.equal(fpInput.computeStageBinding.maySelectTraversal, false);
  assert.equal(fpInput.computeStageBinding.mayCloseTraversal, false);
  assert.equal(fpInput.pluginTraversalObserverBinding.traversalKind, "transform");

  const fdBasis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const fdInput = firstVectorInput({
    basis: fdBasis,
    contract: pluginContract("fd_evaluator"),
    regime: "F_D",
    fallbackKinds: ["evaluate"]
  });
  assert.equal(fdInput.computeStageBinding.stageRole, "evaluate");
  assert.equal(fdInput.computeStageBinding.computeMeans, "F_D");
  assert.equal(
    fdInput.selectedRegimeBindingRef,
    "regime-binding://m03-iteration/evaluate/fd"
  );
  assert.equal(fdInput.pluginTraversalObserverBinding.traversalKind, "evaluate");
  assert.equal(
    fdInput.pluginTraversalObserverBinding.binding.observerPromptRef,
    "prompt://abg/reference/generic-evaluate-observer"
  );

  const consequenceInput = firstVectorInput({
    basis: fdBasis,
    contract: pluginContract("consequence_projection"),
    regime: "F_D",
    fallbackKinds: ["consequence"]
  });
  assert.equal(consequenceInput.computeStageBinding.stageRole, "consequence");
  assert.equal(consequenceInput.computeStageBinding.purpose, "consequence_projection");
  assert.equal(
    consequenceInput.selectedRegimeBindingRef,
    "regime-binding://m03-iteration/consequence/fd"
  );
  assert.equal(
    consequenceInput.pluginTraversalObserverBinding.binding.observerPromptRef,
    "prompt://abg/reference/generic-consequence-observer"
  );
});

test("T-144 selected composition fails closed when contract truth is absent", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    includeComposition: false
  });
  assert.throws(
    () =>
      firstVectorInput({
        basis,
        contract: pluginContract("fd_evaluator"),
        regime: "F_D"
      }),
    /selected abg\.fn_composition is required/u
  );
});

test("T-144 F_H is an external callout boundary, not internal human work", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_H",
    dispatchRef: null,
    approvalSubjectRef: "approval://t144/human"
  });
  const observedInputs = [];
  const emitted = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => emitted.push(event),
    plugins: {
      fhAdmission: {
        contract: pluginContract("fh_admission"),
        admit(input) {
          observedInputs.push(input);
          return constructFhAdmissionOutcome({
            status: "escalated",
            reason: "external human callout required",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }
    }
  });

  assert.equal(result.transition.kind, "fh_escalation");
  assert.equal(observedInputs.length, 1);
  assert.equal(observedInputs[0].computeStageBinding.stageRole, "human_callout");
  assert.equal(observedInputs[0].computeStageBinding.computeMeans, "F_H");
  assert.equal(observedInputs[0].computeStageBinding.externalHumanCallout, true);
  assert.equal(
    observedInputs[0].computeStageBinding.responseAdmissionRequired,
    true
  );
  assert.equal(observedInputs[0].pluginTraversalObserverBinding, null);
  assert.equal(observedInputs[0].fpTransformRequest, null);
  assert.equal(emitted.some((event) => event.kind === "fh_escalated"), true);
});

test("T-144 runner invokes consequence.C as a runner-consumed plugin stage", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const observed = [];
  const result = runEngineIterate({
    basis,
    eventSink: () => undefined,
    plugins: {
      consequenceProjection: {
        contract: pluginContract("consequence_projection"),
        project(input) {
          observed.push(input);
          return constructConsequenceProjectionOutcome({
            status: "projected",
            consequenceRef: "consequence://t144/runner",
            domainReadModelRefs: ["read-model://t144/runner"],
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(observed.length, 3);
  assert.equal(observed[0].computeStageBinding.stageRole, "consequence");
  assert.equal(
    observed[0].selectedRegimeBindingRef,
    "regime-binding://m03-iteration/consequence/fd"
  );
});

test("T-144 malformed compute categories and fallback surfaces fail closed", () => {
  assert.throws(
    () =>
      constructEnginePluginContract({
        ref: "plugin://t144/bad-fh",
        pluginKind: "fh_admission",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FhAdmissionOutcome",
        computeStageRole: "transform",
        computeMeans: "F_P",
        computeStagePurpose: "candidate_construction"
      }),
    /contradicts pluginKind/u
  );
  assert.throws(
    () =>
      constructEnginePluginContract({
        ref: "plugin://t144/bad-purpose",
        pluginKind: "runtime_event_sink",
        authority: "sink",
        inputCarrier: "RuntimeEvent",
        outputCarrier: "void",
        eventAuthority: "sink_receive_only",
        computeStageRole: "evaluate",
        computeMeans: "F_D",
        computeStagePurpose: "candidate_construction"
      }),
    /computeStagePurpose contradicts/u
  );
  assert.throws(
    () =>
      constructEnginePluginContract({
        ref: "plugin://t144/internal-human",
        pluginKind: "runtime_event_sink",
        authority: "sink",
        inputCarrier: "RuntimeEvent",
        outputCarrier: "void",
        eventAuthority: "sink_receive_only",
        computeStageRole: "evaluate",
        computeMeans: "F_H",
        computeStagePurpose: "candidate_evaluation"
      }),
    /F_H compute is only lawful as human_callout/u
  );

  const raw = JSON.parse(readFileSync(REFERENCE_FALLBACK_PATH, "utf8"));
  delete raw.pluginTraversalObserverBindings.consequence;
  assert.throws(
    () => admitAbgFallbackBundle(raw),
    /pluginTraversalObserverBindings.consequence/u
  );
});
