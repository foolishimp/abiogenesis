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
  constructAbgFnCompositionDeclarations,
  constructConsequenceProjectionOutcome,
  constructFdEvaluationOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  constructFhAdmissionOutcome,
  constructFpDispatchOutcome,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceClosureDecision,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  derivePayloadLedgerProjection,
  deriveRuntimeAggregateProjection,
  enginePluginInventory,
  loadGtlTargetCarrierDefaultsBundle,
  loadAbgFallbackBundleFromFile,
  resolveAbgFnCompositionSelection,
  runEngineIterate,
  selectedAbgFnRegimeBindingForCompute
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";
import { loadFallbackBundleFromConfig } from "./support/abg_config_fallback.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TYPESCRIPT_ROOT = path.resolve(TEST_DIR, "..", "..");
const REFERENCE_FALLBACK_PATH = path.join(
  TYPESCRIPT_ROOT,
  "config",
  "abg.config.json"
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
        : pluginKind === "fp_evaluator"
          ? "FpEvaluationOutcome"
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
    abgFallbackBundle: loadFallbackBundleFromConfig(REFERENCE_FALLBACK_PATH),
    pluginTraversalObserverFallbackKinds: fallbackKinds
  });
}

function modulePolicySourceForBasis(basis) {
  return Object.freeze({
    name: basis.moduleName,
    policyHooks: basis.modulePolicyHooks
  });
}

function selectionForFirstVector(basis, graphFunction = basis.graphFunction) {
  return resolveAbgFnCompositionSelection({
    vector: basis.graph.vectors[0],
    graphFunction,
    job: basis.job,
    module: modulePolicySourceForBasis(basis)
  });
}

function compositionAttrsForRegimes(regimes) {
  return constructAbgFnCompositionDeclarations({
    contractRef: "abg.fn_composition://t144/composed-evaluate-negative",
    hookRef: "hook://t144/composed-evaluate-negative",
    regimes,
    standardsContextRefs: ["standard://t144/composed-evaluate"],
    policyContextRefs: ["policy://t144/composed-evaluate"],
    carrierContextRefs: ["carrier://t144/composed-evaluate"],
    assuranceContextRefs: ["assurance://t144/composed-evaluate"],
    closureContractRef: "closure://t144/composed-evaluate"
  });
}

function withGraphFunctionDeclarations(graphFunction, declarations) {
  return Object.freeze({
    ...graphFunction,
    declarations
  });
}

function attachedArtifact(input, options = {}) {
  const fulfillmentStatus = options.fulfillmentStatus ?? "fulfilled";
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["t144_steel_thread"];
  return {
    edge: options.edge ?? input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "T-144 steel thread accepted"
          : "T-144 steel thread blocked",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["T-144 steel thread blocked"],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function observedStage(input) {
  return {
    edge: input.edge,
    pluginKind: input.contract.pluginKind,
    stageRole: input.computeStageBinding.stageRole,
    computeMeans: input.computeStageBinding.computeMeans,
    regimeBindingRef: input.selectedRegimeBindingRef,
    compositionRef: input.selectedCompositionRef,
    digestPresent: /^sha256:[a-f0-9]{64}$/u.test(input.selectedCompositionDigest)
  };
}

function runDownstreamSteelThread() {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    vectorRegimes: ["F_P", "F_D", "F_H"],
    dispatchRef: "dispatch://t144/steel-thread",
    approvalSubjectRef: "approval://t144/steel-thread/human"
  });
  const observed = [];
  const emitted = [];

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      emitted.push(event);
    },
    plugins: {
      fpDispatch: {
        contract: pluginContract("fp_dispatch"),
        dispatch(input) {
          observed.push(observedStage(input));
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t144/steel-thread/${encodeURIComponent(input.edge)}`,
            attachedResultArtifact: attachedArtifact(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      },
      fdEvaluator: {
        contract: pluginContract("fd_evaluator"),
        evaluate(input) {
          observed.push(observedStage(input));
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      },
      fpEvaluator: {
        contract: pluginContract("fp_evaluator"),
        evaluate(input) {
          observed.push(observedStage(input));
          return constructFpEvaluationOutcome({
            status: "evaluated",
            findings: [
              constructFpEvaluationFinding({
                findingRef: `finding://t144/steel-thread/${input.vectorIndex}`,
                evaluatorRef: input.contract.ref,
                gainReportRef: `gain://t144/steel-thread/${input.vectorIndex}`,
                metricRefs: [`metric://t144/steel-thread/${input.vectorIndex}`],
                closeDisposition: "close",
                evidenceRefs: [`evidence://t144/steel-thread/${input.vectorIndex}`],
                authorityRefs: Object.freeze([
                  ...new Set([
                    ...input.expectedAssessmentIds,
                    `authority://t144/steel-thread/${input.vectorIndex}`
                  ])
                ]),
                compositionContributionRef:
                  input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
                compositionRef: input.selectedCompositionRef,
                compositionDigest: input.selectedCompositionDigest
              })
            ],
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      },
      consequenceProjection: {
        contract: pluginContract("consequence_projection"),
        project(input) {
          observed.push(observedStage(input));
          return constructConsequenceProjectionOutcome({
            status: "projected",
            consequenceRef: `consequence://t144/steel-thread/${input.vectorIndex}`,
            domainReadModelRefs: [`read-model://t144/steel-thread/${input.vectorIndex}`],
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      },
      fhAdmission: {
        contract: pluginContract("fh_admission"),
        admit(input) {
          observed.push(observedStage(input));
          return constructFhAdmissionOutcome({
            status: "escalated",
            reason: "T-144 steel thread external human callout",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }
    }
  });

  return { basis, observed, emitted, result };
}

function fpDispatchAcceptingPlugin(resultScope = "runner-negative") {
  return {
    contract: pluginContract("fp_dispatch"),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t144/${resultScope}/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  };
}

function fpEvaluationFindingForInput(input, overrides = {}) {
  return constructFpEvaluationFinding({
    findingRef:
      overrides.findingRef ??
      `finding://t144/${encodeURIComponent(input.edge)}/${input.vectorIndex}`,
    evaluatorRef: input.contract.ref,
    gainReportRef: `gain://t144/${input.vectorIndex}`,
    metricRefs: [`metric://t144/${input.vectorIndex}`],
    closeDisposition: overrides.closeDisposition ?? "close",
    evidenceRefs:
      overrides.evidenceRefs ?? [`evidence://t144/${input.vectorIndex}`],
    authorityRefs:
      overrides.authorityRefs ??
      Object.freeze([
        ...new Set([
          ...input.expectedAssessmentIds,
          `authority://t144/${input.vectorIndex}`
        ])
      ]),
    compositionContributionRef:
      overrides.compositionContributionRef ??
      input.selectedRegimeBindingRef ??
      input.selectedCompositionRef,
    compositionRef: overrides.compositionRef ?? input.selectedCompositionRef,
    compositionDigest:
      overrides.compositionDigest ?? input.selectedCompositionDigest
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
      status: byKind.get("fp_evaluator").runtimeBindingStatus,
      role: byKind.get("fp_evaluator").contract.computeStageRole,
      means: byKind.get("fp_evaluator").contract.computeMeans,
      purpose: byKind.get("fp_evaluator").contract.computeStagePurpose
    },
    {
      status: "runner_consumed",
      role: "evaluate",
      means: "F_P",
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

test("T-144 evaluate.C plugins are composed through GTL regime bindings", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const selection = selectionForFirstVector(basis);
  const bindings = selection.contract.regimes.map((binding) => ({
    ref: binding.bindingRef,
    stageRole: binding.stageRole,
    regime: binding.regime,
    role: binding.role,
    order: binding.order,
    authority: binding.authority,
    outputs: binding.outputCarrierRefs
  }));

  assert.equal(basis.graph.vectors.length, 3);
  assert.equal(selection.source, "graph_function_declarations");
  assert.match(selection.sourceRef, /^graph_function:/u);
  assert.equal(
    basis.graphFunction.template.ref,
    "compose:capture_requirements;synthesize_design;implement_code"
  );
  assert.deepEqual(
    bindings.filter((binding) => binding.stageRole === "evaluate"),
    [
      {
        ref: "regime-binding://m03-iteration/evaluate/fd",
        stageRole: "evaluate",
        regime: "F_D",
        role: "validate",
        order: 2,
        authority: "closure",
        outputs: ["FdEvaluationOutcome"]
      },
      {
        ref: "regime-binding://m03-iteration/evaluate/fp",
        stageRole: "evaluate",
        regime: "F_P",
        role: "validate",
        order: 3,
        authority: "judgment",
        outputs: ["FpEvaluationOutcome"]
      }
    ]
  );
  assert.deepEqual(
    bindings.find((binding) => binding.stageRole === "human_callout"),
    {
      ref: "regime-binding://m03-iteration/human-callout/fh",
      stageRole: "human_callout",
      regime: "F_H",
      role: "escalate",
      order: 5,
      authority: "judgment",
      outputs: ["FhAdmissionOutcome"]
    }
  );

  const fdEvaluate = selectedAbgFnRegimeBindingForCompute({
    selection,
    stageRole: "evaluate",
    computeMeans: "F_D"
  });
  const fpEvaluate = selectedAbgFnRegimeBindingForCompute({
    selection,
    stageRole: "evaluate",
    computeMeans: "F_P"
  });
  const fhCallout = selectedAbgFnRegimeBindingForCompute({
    selection,
    stageRole: "human_callout",
    computeMeans: "F_H"
  });

  assert.equal(fdEvaluate.bindingRef, "regime-binding://m03-iteration/evaluate/fd");
  assert.equal(fpEvaluate.bindingRef, "regime-binding://m03-iteration/evaluate/fp");
  assert.equal(
    fpEvaluate.outputCarrierRefs[0],
    "FpEvaluationOutcome"
  );
  assert.equal(
    fhCallout.bindingRef,
    "regime-binding://m03-iteration/human-callout/fh"
  );
});

test("T-144 GTL compose syntax keeps F_P transform dispatch distinct from evaluate.C", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const fpTransformInput = firstVectorInput({
    basis,
    contract: pluginContract("fp_dispatch"),
    regime: "F_P",
    fallbackKinds: ["transform"]
  });
  const fdEvaluateInput = firstVectorInput({
    basis: buildThreeStageBasis({
      defaultRegime: "F_D",
      dispatchRef: null
    }),
    contract: pluginContract("fd_evaluator"),
    regime: "F_D",
    fallbackKinds: ["evaluate"]
  });

  assert.deepEqual(
    {
      pluginKind: fpTransformInput.contract.pluginKind,
      stageRole: fpTransformInput.computeStageBinding.stageRole,
      computeMeans: fpTransformInput.computeStageBinding.computeMeans,
      regimeBindingRef: fpTransformInput.selectedRegimeBindingRef
    },
    {
      pluginKind: "fp_dispatch",
      stageRole: "transform",
      computeMeans: "F_P",
      regimeBindingRef: "regime-binding://m03-iteration/transform/fp"
    }
  );
  assert.deepEqual(
    {
      pluginKind: fdEvaluateInput.contract.pluginKind,
      stageRole: fdEvaluateInput.computeStageBinding.stageRole,
      computeMeans: fdEvaluateInput.computeStageBinding.computeMeans,
      regimeBindingRef: fdEvaluateInput.selectedRegimeBindingRef
    },
    {
      pluginKind: "fd_evaluator",
      stageRole: "evaluate",
      computeMeans: "F_D",
      regimeBindingRef: "regime-binding://m03-iteration/evaluate/fd"
    }
  );

  assert.throws(
    () =>
      constructEnginePluginContract({
        ref: "plugin://t144/bad-fp-dispatch-as-evaluate",
        pluginKind: "fp_dispatch",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome",
        computeStageRole: "evaluate",
        computeMeans: "F_P",
        computeStagePurpose: "candidate_evaluation"
      }),
    /contradicts pluginKind/u
  );
});

test("T-144 GTL-composed evaluate.C rejects non-F_D closure and internal F_H evaluation", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const baseRegime = {
    bindingRef: "regime-binding://t144/evaluate/fp",
    stageRole: "evaluate",
    regime: "F_P",
    role: "validate",
    order: 0,
    authority: "judgment",
    inputCarrierRefs: ["EnginePluginInput"],
    outputCarrierRefs: ["FpEvaluationOutcome"],
    evidenceRefs: ["evidence://t144/evaluate/fp"]
  };

  assert.throws(
    () =>
      selectionForFirstVector(
        basis,
        withGraphFunctionDeclarations(
          basis.graphFunction,
          compositionAttrsForRegimes([
            {
              ...baseRegime,
              role: "close",
              authority: "closure"
            }
          ])
        )
      ),
    /non-F_D regime binding cannot claim closure/u
  );
  assert.throws(
    () =>
      selectionForFirstVector(
        basis,
        withGraphFunctionDeclarations(
          basis.graphFunction,
          compositionAttrsForRegimes([
            {
              ...baseRegime,
              bindingRef: "regime-binding://t144/evaluate/fh",
              regime: "F_H",
              role: "validate",
              authority: "judgment",
              outputCarrierRefs: ["FhAdmissionOutcome"]
            }
          ])
        )
      ),
    /F_H compute is only lawful as human_callout/u
  );
});

test("T-144 downstream steel thread constructs GTL-composed C for ABG plugin stages", () => {
  const { basis, observed, emitted, result } = runDownstreamSteelThread();

  assert.equal(basis.graphFunction.template.ref, "compose:capture_requirements;synthesize_design;implement_code");
  assert.equal(result.transition.kind, "fh_escalation");
  assert.deepEqual(
    observed.map((entry) => ({
      edge: entry.edge,
      pluginKind: entry.pluginKind,
      stageRole: entry.stageRole,
      computeMeans: entry.computeMeans,
      regimeBindingRef: entry.regimeBindingRef
    })),
    [
      {
        edge: "input_set→requirements",
        pluginKind: "fp_dispatch",
        stageRole: "transform",
        computeMeans: "F_P",
        regimeBindingRef: "regime-binding://m03-iteration/transform/fp"
      },
      {
        edge: "input_set→requirements",
        pluginKind: "fp_evaluator",
        stageRole: "evaluate",
        computeMeans: "F_P",
        regimeBindingRef: "regime-binding://m03-iteration/evaluate/fp"
      },
      {
        edge: "input_set→requirements",
        pluginKind: "consequence_projection",
        stageRole: "consequence",
        computeMeans: "F_D",
        regimeBindingRef: "regime-binding://m03-iteration/consequence/fd"
      },
      {
        edge: "requirements→design",
        pluginKind: "fd_evaluator",
        stageRole: "evaluate",
        computeMeans: "F_D",
        regimeBindingRef: "regime-binding://m03-iteration/evaluate/fd"
      },
      {
        edge: "requirements→design",
        pluginKind: "consequence_projection",
        stageRole: "consequence",
        computeMeans: "F_D",
        regimeBindingRef: "regime-binding://m03-iteration/consequence/fd"
      },
      {
        edge: "design→code",
        pluginKind: "fh_admission",
        stageRole: "human_callout",
        computeMeans: "F_H",
        regimeBindingRef: "regime-binding://m03-iteration/human-callout/fh"
      }
    ]
  );
  assert.equal(observed.every((entry) => entry.compositionRef === "abg.fn_composition://m03-iteration/default"), true);
  assert.equal(observed.every((entry) => entry.digestPresent), true);
  assert.deepEqual(
    [
      ...new Set(
        emitted
          .filter((event) =>
            [
              "fp_dispatch_requested",
              "evidence_admitted",
              "closure_input_published",
              "fd_authority_outcome_admitted",
              "fh_escalated"
            ].includes(event.kind)
          )
          .map((event) => event.kind)
      )
    ],
    [
      "fp_dispatch_requested",
      "evidence_admitted",
      "closure_input_published",
      "fd_authority_outcome_admitted",
      "fh_escalated"
    ]
  );
});

test("T-144 downstream steel thread projects ABG ledgers for composed C", () => {
  const { result } = runDownstreamSteelThread();
  const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();
  const runtimeLedgerKinds = result.replayEvents.map((event) => event.kind);
  const payloadLedger = derivePayloadLedgerProjection({
    basis: result.basis,
    runtimeProjection: result.projection,
    events: result.replayEvents,
    vectorIndex: 0,
    targetCarrierDefaults
  });
  const assuranceScope = deriveAssuranceScopeRef({
    basis: result.basis,
    projection: result.projection,
    vectorIndex: 0
  });
  const authoritySnapshot = deriveAssuranceAuthoritySnapshotFromPayloadLedger({
    assuranceScope,
    ledger: payloadLedger
  });
  const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
    assuranceScope,
    ledger: payloadLedger
  });
  const assuranceProjection = deriveAssuranceProjection({
    basis: result.basis,
    runtimeProjection: result.projection,
    authoritySnapshot,
    evidenceRows
  });
  const assuranceDecision = deriveAssuranceClosureDecision(assuranceProjection);

  assert.deepEqual(
    [
      runtimeLedgerKinds.includes("basis_admitted"),
      runtimeLedgerKinds.includes("fp_dispatch_requested"),
      runtimeLedgerKinds.includes("payload_observed"),
      runtimeLedgerKinds.includes("payload_validated"),
      runtimeLedgerKinds.includes("authority_snapshot_admitted"),
      runtimeLedgerKinds.includes("evidence_admitted"),
      runtimeLedgerKinds.includes("ambiguity_observation_admitted"),
      runtimeLedgerKinds.includes("closure_input_published"),
      runtimeLedgerKinds.includes("fd_authority_outcome_admitted"),
      runtimeLedgerKinds.includes("fh_escalated")
    ],
    [true, true, true, true, true, true, true, true, true, true]
  );
  assert.ok(payloadLedger.observedPayloads.length >= 2);
  assert.ok(payloadLedger.validatedPayloads.length >= 2);
  assert.ok(payloadLedger.authoritySnapshots.length >= 2);
  assert.ok(payloadLedger.evidenceRows.length >= 2);
  assert.equal(payloadLedger.ambiguityObservations.length, 1);
  assert.equal(payloadLedger.closureInputs.length, 1);
  assert.ok(assuranceProjection.evidenceRows.length >= 2);
  assert.equal(
    assuranceProjection.ambiguityRows.every((row) => row.status === "fulfilled"),
    true
  );
  assert.equal(assuranceDecision.decision, "close");
});

test("T-144 runner rejects F_P evaluation findings for the wrong selected composition", () => {
  const badCases = [
    {
      name: "composition_ref",
      overrides: { compositionRef: "abg.fn_composition://t144/wrong" },
      pattern: /compositionRef does not match selected/u
    },
    {
      name: "composition_digest",
      overrides: {
        compositionDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      },
      pattern: /compositionDigest does not match selected/u
    },
    {
      name: "regime_binding",
      overrides: {
        compositionContributionRef: "regime-binding://t144/wrong/evaluate/fp"
      },
      pattern: /compositionContributionRef does not match selected regime binding/u
    }
  ];

  for (const badCase of badCases) {
    const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
    assert.throws(
      () =>
        runEngineIterate({
          basis,
          eventSink: () => undefined,
          plugins: {
            fpDispatch: fpDispatchAcceptingPlugin(badCase.name),
            fpEvaluator: {
              contract: pluginContract("fp_evaluator"),
              evaluate(input) {
                return constructFpEvaluationOutcome({
                  status: "evaluated",
                  findings: [
                    fpEvaluationFindingForInput(input, badCase.overrides)
                  ],
                  evidenceRefs: [input.sourceProjectionRef]
                });
              }
            }
          }
        }),
      badCase.pattern
    );
  }
});

test("T-144 F_P evaluation close dispositions cannot close by omission", () => {
  const cases = [
    {
      disposition: "no_close",
      expectedAmbiguityStatus: "partial",
      expectedDecision: "retry"
    },
    {
      disposition: "human_required",
      expectedAmbiguityStatus: "deferred",
      expectedDecision: "qualified_defer"
    }
  ];

  for (const testCase of cases) {
    const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
    const emitted = [];
    const result = runEngineIterate({
      basis,
      eventSink: (event) => emitted.push(event),
      plugins: {
        fpDispatch: fpDispatchAcceptingPlugin(testCase.disposition),
        fpEvaluator: {
          contract: pluginContract("fp_evaluator"),
          evaluate(input) {
            return constructFpEvaluationOutcome({
              status: "evaluated",
              ambiguityStatus: "fulfilled",
              findings: [
                fpEvaluationFindingForInput(input, {
                  closeDisposition: testCase.disposition
                })
              ],
              evidenceRefs: [input.sourceProjectionRef]
            });
          }
        }
      }
    });

    const closureInput = emitted.find(
      (event) => event.kind === "closure_input_published"
    );
    const ambiguity = emitted.find(
      (event) =>
        event.kind === "ambiguity_observation_admitted" &&
        event.reason.includes(testCase.disposition)
    );

    assert.equal(result.transition.kind, "terminal");
    assert.equal(result.transition.terminalKind, "yielded");
    assert.equal(closureInput.closureDecision, testCase.expectedDecision);
    assert.equal(ambiguity.ambiguityStatus, testCase.expectedAmbiguityStatus);
    assert.equal(
      emitted.some((event) => event.kind === "vector_closed"),
      false
    );
  }
});

test("T-144 missing product F_P evaluator fails closed instead of closing by fallback", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const emitted = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => emitted.push(event),
    plugins: {
      fpDispatch: fpDispatchAcceptingPlugin("missing-fp-evaluator")
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /missing fp_evaluator plugin/u);
  assert.equal(
    emitted.some(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "fp_evaluation_finding"
    ),
    false
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
  assert.throws(
    () =>
      constructFpEvaluationFinding({
        findingRef: "finding://t144/missing-authority",
        evaluatorRef: "plugin://t144/fp-evaluator",
        closeDisposition: "close",
        evidenceRefs: ["evidence://t144/finding"],
        authorityRefs: [],
        compositionContributionRef: "regime-binding://t144/evaluate/fp",
        compositionRef: "abg.fn_composition://t144/composition",
        compositionDigest:
          "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      }),
    /authorityRefs must not be empty/u
  );

  const raw = JSON.parse(readFileSync(REFERENCE_FALLBACK_PATH, "utf8")).fallbacks;
  delete raw.pluginTraversalObserverBindings.consequence;
  assert.throws(
    () => admitAbgFallbackBundle(raw),
    /pluginTraversalObserverBindings.consequence/u
  );
});
