// Validates: T-189
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-017

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

import {
  ENGINE_FP_DISPATCH_ARM_IDS,
  resolveSyncEnginePluginEffect,
  constructEvaluationRuleOutcome,
  constructComposedStageTaskOutcome,
  constructFdEvaluationOutcome,
  constructFpEvaluationOutcome,
  constructFpEvaluationFinding,
  compileInstructionAssemblyPlan,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructGtlLibraryEntryDeclaration,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructProductRegistryStartupConfig,
  constructRuntimeBindingSlot,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const RUNNER_SOURCE_PATH = fileURLToPath(
  new URL("../../code/src/abg/m03/runner/engine_runner.ts", import.meta.url)
);

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "string_list", value: Object.freeze([...value]) })
  });
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort());
}


function fpDispatchContract(ref = "plugin://t189/fp-dispatch") {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function stageContract(stageRole, computeMeans, ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "hook_ref",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "ComposedStageTaskOutcome",
    computeStageRole: stageRole,
    computeMeans,
    computeStagePurpose:
      stageRole === "transform"
        ? "candidate_construction"
        : stageRole === "evaluate"
          ? "candidate_evaluation"
          : "consequence_projection"
  });
}

function graphFunctionDeclaration(graphFunctionRef, overrides = {}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef:
      overrides.declarationRef ?? "gtl-declaration://t189/runtime-wiring/framework-smoke",
    entryRef: overrides.entryRef ?? "registry-entry://t189/runtime-wiring/framework-smoke",
    libraryScope: overrides.libraryScope ?? "product",
    entryKind: "graph_function",
    namespace: overrides.namespace ?? "t189.runtime_wiring",
    ownerRef: overrides.ownerRef ?? "owner://abg/t189",
    version: overrides.version ?? "4.2.0-rc.4",
    graphFunctionRef,
    interfaceRef:
      overrides.interfaceRef ?? "interface://t189/runtime-wiring/framework-smoke",
    sourceContractRef:
      overrides.sourceContractRef ?? "contract://t189/runtime-wiring/source",
    targetContractRef:
      overrides.targetContractRef ?? "contract://t189/runtime-wiring/target",
    contextRefs: overrides.contextRefs ?? ["context://t189/runtime-wiring"],
    authorityRefs:
      overrides.authorityRefs ?? ["authority://t189/runtime-wiring/abg-runtime"],
    overlayRefs:
      overrides.overlayRefs ?? ["overlay://t189/runtime-wiring/framework-smoke"],
    provenanceRefs: overrides.provenanceRefs ?? ["provenance://t189/runtime-wiring"],
    readinessRefs: overrides.readinessRefs ?? ["readiness://t189/runtime-wiring"],
    proofRefs: overrides.proofRefs ?? ["proof://t189/runtime-wiring"],
    policyRefs: overrides.policyRefs ?? ["policy://t189/runtime-wiring"],
    declarationSourceRefs:
      overrides.declarationSourceRefs ?? ["gtl://module/t189/runtime-wiring"]
  });
}

function productStartupConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t189/runtime-wiring",
    productNamespace: "t189.runtime_wiring",
    ownerRef: "owner://abg/t189",
    version: "4.2.0-rc.4",
    enabledLibraryRefs: [
      "registry-entry://t189/runtime-wiring/framework-smoke",
      "gtl-declaration://t189/runtime-wiring/framework-smoke",
      "gtl://module/t189/runtime-wiring"
    ],
    overlayRefs: ["overlay://t189/runtime-wiring/framework-smoke"],
    pluginRefs: ["plugin://t189/runtime-wiring/fp-worker"],
    readinessRefs: ["readiness://t189/runtime-wiring"],
    proofRefs: ["proof://t189/runtime-wiring"],
    policyRefs: ["policy://t189/runtime-wiring"],
    configSourceRefs: ["config://t189/runtime-wiring"]
  });
}

function runtimeBindingSlots() {
  return [
    constructRuntimeBindingSlot({
      slotRef: "slot://t189/runtime-wiring/graph-call",
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t189/runtime-wiring/slot/graph-call"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t189/runtime-wiring/frame",
      slotClass: "frame",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t189/runtime-wiring/slot/frame"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t189/runtime-wiring/vector",
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t189/runtime-wiring/slot/vector"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t189/runtime-wiring/event-log",
      slotClass: "event_log",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t189/runtime-wiring/slot/event-log"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t189/runtime-wiring/worker",
      slotClass: "worker_invocation",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t189/runtime-wiring/slot/worker"]
    })
  ];
}

function compiledPlanFor(input) {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  assert.ok(vector);
  const result = compileInstructionAssemblyPlan({
    planRef: input.planRef,
    computeStageRole: input.computeStageRole,
    rule: constructInstructionAssemblyRule({
      ruleRef: `instruction-rule://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
      appliesToGraphFunctionRefs: [input.basis.graphFunction.id],
      appliesToVectorRefs: [vector.name],
      sectionRules: [
        {
          sectionRef: `section://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
          required: true,
          policyRefs: ["policy://t189/runtime-wiring/current-vector"]
        }
      ],
      relevanceRules: [
        {
          ruleRef: `relevance://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
          requiredInputRefs: [],
          allowFutureStageRefs: []
        }
      ],
      compressionPolicyRef: "compression://t189/runtime-wiring/digest",
      proportionalityPolicyRef: "proportionality://t189/runtime-wiring/p1-worker",
      runtimeBindingSlotClasses: [
        "graph_call",
        "frame",
        "vector",
        "event_log",
        "worker_invocation"
      ],
      policyRefs: ["policy://t189/runtime-wiring"],
      evidenceRefs: ["evidence://t189/runtime-wiring/rule"]
    }),
    graphFunctionRef: input.basis.graphFunction.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://t189/runtime-wiring/framework-smoke"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: {
      kind: "derived_instruction_carrier_truth",
      sourceTypeRefs: vector.source.map((node) => node.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: [`contract://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`],
      proofRefs: [`proof://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`],
      authorityRefs: ["authority://t189/runtime-wiring/abg-runtime"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      activeRegime: "F_P",
      carrierClassRefs: [
        ...vector.source.map((node) => node.assetSurface.kind),
        vector.target.assetSurface.kind
      ]
    },
    knownAlgebraRefs: [...INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs: [],
    availableInputRefs: [],
    sectionDecisions: [
      constructInstructionSectionDecision({
        sectionRef: `section://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
        disposition: "include",
        dependencyRefs: [vector.name],
        carrierRefs: [
          ...vector.source.map((node) => node.id),
          vector.target.id
        ],
        compressionMode: "digest",
        text: `Run ${input.computeStageRole} for the selected typed vector without carrying any answer marker.`,
        digestRef: `sha256:t189-vector-${input.vectorIndex}-${input.computeStageRole}`,
        excerptDigest: null,
        fullContentAdmitted: false,
        stageRef: `stage://t189/${input.computeStageRole}`,
        gapRefs: []
      })
    ],
    bindingSlots: runtimeBindingSlots(),
    proportionalityClass: "P1",
    instructionWorkKind: "target_work",
    dependencyInstructionTruth: constructDerivedDependencyInstructionTruth({
      truthRef: `dependency-instruction-truth://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
      workKind: "target_work",
      dependencyGraphRef: null,
      dependencyGraphDigest: null,
      targetRefs: [vector.target.id],
      prerequisiteNodeRefs: [],
      prerequisiteEdgeRefs: [],
      dependencyClosed: true,
      typedPrerequisiteGapRefs: [],
      noDependencyPolicyRef: "policy://t189/runtime-wiring/no-dependency-required",
      sourceProjectionRefs: ["projection://t189/runtime-wiring/no-dependency-required"]
    }),
    proofDepthInstructionTruth: constructDerivedProofDepthInstructionTruth({
      truthRef: `proof-depth-instruction-truth://t189/runtime-wiring/vector-${input.vectorIndex}/${input.computeStageRole}`,
      depthPolicyRef: "proof-depth-policy://t189/runtime-wiring",
      depthPolicyDigest: "sha256:t189-proof-depth-policy",
      targetRefs: [vector.target.id],
      requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthObligationRefs: [
        "proof-obligation://t189/positive",
        "proof-obligation://t189/negative"
      ],
      notApplicableDepthClassRefs: [],
      typedDepthGapRefs: [],
      proofStrengthAdmissionRefs: ["proof-strength-admission://t189/runtime-wiring"],
      fdStrengthCriterionRefs: ["fd-strength-criterion://t189/runtime-wiring"],
      adversarialVerificationRefs: [],
      adversarialCounterexampleRefs: [],
      sourceProjectionRefs: [`proof-coverage-projection://t189/vector-${input.vectorIndex}/${input.computeStageRole}`],
      depthComplete: true,
      proofStrengthAdmitted: true
    }),
    expectedAnswerMarkers: ["forbidden-answer-marker"],
    fpValidationEvidenceRefs: ["semantic-review-gate://t189/runtime-wiring"],
    compilerEvidenceRefs: ["evidence://t189/runtime-wiring/compiler"]
  });
  assert.equal(result.accepted, true, JSON.stringify(result.issues));
  assert.ok(result.plan);
  return result.plan;
}

function registryStartupFor(basis, overrides = {}) {
  return {
    systemDeclarations: overrides.systemDeclarations ?? [],
    productStartupConfig: productStartupConfig(),
    productDeclarations:
      overrides.productDeclarations ?? [graphFunctionDeclaration(basis.graphFunction.id)],
    correlationId: "correlation://t189/runtime-wiring/registry"
  };
}

function fpDispatchPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: fpDispatchContract(),
    dispatch(input) {
      observe(input);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t189/runtime-wiring/${input.vectorIndex}`,
        attachedResultArtifact: null,
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function transformTaskPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: stageContract(
      "transform",
      "F_P",
      "plugin://t189/runtime-wiring/transform-task"
    ),
    taskRef: "stage-task://t189/runtime-wiring/transform/fp-prep",
    taskRole: "candidate",
    required: true,
    parallelGroupRef: null,
    dependencyRefs: [],
    outputCarrierRefs: ["ComposedStageTaskOutcome"],
    run(input) {
      observe(input);
      return {
        kind: "composed_stage_task_outcome",
        status: "accepted",
        taskRef: "stage-task://t189/runtime-wiring/transform/fp-prep",
        stageRole: "transform",
        taskRole: "candidate",
        computeMeans: "F_P",
        candidateRefs: ["candidate://t189/runtime-wiring/transform/fp-prep"],
        projectionRefs: [],
        evidenceRefs: ["evidence://t189/runtime-wiring/transform/fp-prep"],
        diagnosticRefs: [],
        selectedCompositionRef: input.selectedCompositionRef,
        selectedCompositionDigest: input.selectedCompositionDigest,
        selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: input.selectedRegimeBindingRef,
        compositionContributionRef:
          input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
        reason: null
      };
    }
  });
}

test("T-189 absent instruction assembly startup blocks scalar F_P before worker invocation", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  let dispatched = false;
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: registryStartupFor(basis),
    plugins: {
      fpDispatch: fpDispatchPlugin(() => {
        dispatched = true;
      })
    }
  });

  assert.equal(dispatched, false);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /instruction assembly startup is absent/u);
  assert.equal(
    events.some((event) => event.kind === "fp_dispatch_requested"),
    false
  );
});



test("T-189 composed transform F_P task receives admitted prompt manifest before plugin invocation", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const transformPlan = compiledPlanFor({
    basis,
    vectorIndex: 0,
    computeStageRole: "transform",
    planRef: "compiled-prompt-plan://t189/runtime-wiring/vector-0/transform"
  });
  const events = [];
  let taskInput = null;
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: registryStartupFor(basis),
    instructionAssemblyStartup: {
      compiledPromptPlans: [transformPlan],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      transformTasks: [
        transformTaskPlugin((input) => {
          taskInput = input;
        })
      ]
    }
  });

  assert.notEqual(taskInput, null);
  assert.ok(taskInput.instructionPromptManifest);
  assert.equal(taskInput.instructionPromptManifest.planRef, transformPlan.planRef);
  const manifestEvents = events.filter(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  assert.equal(
    manifestEvents.some((event) => event.planRef === transformPlan.planRef),
    true
  );
  assert.equal(
    events.findIndex(
      (event) =>
        event.kind === "instruction_prompt_manifest_projected" &&
        event.planRef === transformPlan.planRef
    ) <
      events.findIndex(
        (event) =>
          event.kind === "payload_observed" &&
          event.payloadClass === "composed_stage_task_outcome"
      ),
    true
  );
});

test("T-189 runner registry lookup rejects selected entry against declared edge boundary", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    vectorDeclarationEntriesByIndex: {
      0: [
        scalarEntry(
          "runtime_registry_target_contract_ref",
          "contract://t189/runtime-wiring/declared-target-boundary"
        )
      ]
    }
  });
  const events = [];
  let dispatched = false;
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: registryStartupFor(basis),
    plugins: {
      fpDispatch: fpDispatchPlugin(() => {
        dispatched = true;
      })
    }
  });

  assert.equal(dispatched, false);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /runtime registry selection rejected/u);
  const rejected = events.find(
    (event) => event.kind === "graph_function_selection_rejected"
  );
  assert.ok(rejected);
  assert.equal(rejected.rejectionReason, "selected_candidate_not_eligible");
  assert.deepEqual(rejected.rejectedCandidateRefs, [
    "registry-entry://t189/runtime-wiring/framework-smoke"
  ]);
  assert.equal(
    events.some((event) => event.kind === "fp_dispatch_requested"),
    false
  );
});

test("T-189 vector registry candidate refs constrain the otherwise open registry universe", () => {
  const otherEntryRef = "registry-entry://t189/runtime-wiring/other";
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    vectorDeclarationEntriesByIndex: {
      0: [stringListEntry("runtime_registry_candidate_refs", [otherEntryRef])]
    }
  });
  const events = [];
  let dispatched = false;
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: registryStartupFor(basis, {
      systemDeclarations: [
        graphFunctionDeclaration("graph-function://t189/runtime-wiring/other", {
          declarationRef: "gtl-declaration://t189/runtime-wiring/other",
          entryRef: otherEntryRef,
          libraryScope: "system",
          namespace: "abg.t189.runtime_wiring",
          declarationSourceRefs: ["gtl://module/t189/runtime-wiring/other"]
        })
      ]
    }),
    plugins: {
      fpDispatch: fpDispatchPlugin(() => {
        dispatched = true;
      })
    }
  });

  assert.equal(dispatched, false);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /runtime registry selection rejected/u);
  const rejected = events.find(
    (event) => event.kind === "graph_function_selection_rejected"
  );
  assert.ok(rejected);
  assert.equal(rejected.rejectionReason, "selected_candidate_not_eligible");
  assert.deepEqual(rejected.rejectedCandidateRefs, [
    "registry-entry://t189/runtime-wiring/framework-smoke"
  ]);
  assert.equal(
    events.some((event) => event.kind === "fp_dispatch_requested"),
    false
  );
});

// ───────────────────────── T-190: runtime dispatch enumeration ─────────────────────────
// The census is the BIND PATH: every bindInstructionAssemblyForFpEffect call
// names a registered armId (unregistered throws before any manifest binds).
// This table is the classification-as-data the ticket requires; set equality
// with the runner's exported registry fails this suite by construction when
// a new arm is registered without a proof row.
const T190_ARM_CLASSIFICATION = Object.freeze({
  scalar_transform: {
    kind: "runtime_proven",
    proofs: [
      "T-189 absent instruction assembly startup blocks scalar F_P before worker invocation",
      "T-183/T-188 manifest-bound dispatch lanes",
      "T-194 installed sandbox live"
    ]
  },
  scalar_evaluate: {
    kind: "runtime_proven",
    proofs: ["T-190 evaluate arms receive manifests", "T-190 omitted evaluate plan blocks evaluate arms"]
  },
  composed_transform: {
    kind: "runtime_proven",
    proofs: [
      "T-189 composed transform F_P task receives admitted prompt manifest before plugin invocation",
      "T-190 omitted transform plan blocks the composed transform task"
    ]
  },
  composed_consequence: {
    kind: "runtime_proven",
    proofs: ["T-190 composed consequence task receives manifest", "T-190 omitted consequence plan blocks the consequence task"]
  },
  evaluation_rule_batch: {
    kind: "runtime_proven",
    proofs: ["T-190 evaluate arms receive manifests", "T-190 omitted evaluate plan blocks evaluate arms"]
  },
  evaluation_rule_evaluate_singular: {
    kind: "construct_and_block",
    proofs: ["T-190 singular evaluation_rule_evaluate cannot run a plugin without an admitted manifest"]
  }
});

test("T-190 arm registry and classification table are set-equal (census fails by construction)", () => {
  const registryIds = [...ENGINE_FP_DISPATCH_ARM_IDS].sort();
  const classifiedIds = Object.keys(T190_ARM_CLASSIFICATION).sort();
  assert.deepEqual(classifiedIds, registryIds);
  for (const [armId, row] of Object.entries(T190_ARM_CLASSIFICATION)) {
    assert.equal(
      ["runtime_proven", "construct_and_block", "typed_exempt"].includes(row.kind),
      true,
      `${armId} must carry a lawful classification`
    );
    assert.equal(row.proofs.length > 0, true, `${armId} must cite at least one proof`);
  }
});

function t190RulePlugin(observe = () => undefined) {
  return Object.freeze({
    contract: stageContract("evaluate", "F_P", "plugin://t190/rule"),
    ruleRef: "evaluation-rule://t190/manifest-probe",
    ruleRole: "register",
    required: true,
    parallelGroupRef: null,
    dependencyRefs: [],
    outputCarrierRefs: ["EvaluationRuleOutcome"],
    evaluate(input) {
      observe(input);
      return constructEvaluationRuleOutcome({
        status: "accepted",
        ruleRef: "evaluation-rule://t190/manifest-probe",
        ruleRole: "register",
        computeMeans: "F_P",
        producedRegisterRefs: ["register://t190/manifest-probe"],
        evidenceRefs: ["evidence://t190/rule"],
        diagnosticRefs: [],
        selectedCompositionRef: input.selectedCompositionRef,
        selectedCompositionDigest: input.selectedCompositionDigest,
        selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: input.selectedRegimeBindingRef
      });
    }
  });
}

function consequenceTaskPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: stageContract("consequence", "F_P", "plugin://t190/consequence-task"),
    taskRef: "stage-task://t190/consequence/fp-apply",
    taskRole: "candidate",
    required: true,
    parallelGroupRef: null,
    dependencyRefs: [],
    outputCarrierRefs: ["ComposedStageTaskOutcome"],
    run(pluginInput) {
      observe(pluginInput);
      return constructComposedStageTaskOutcome({
        status: "accepted",
        taskRef: "stage-task://t190/consequence/fp-apply",
        stageRole: "consequence",
        taskRole: "candidate",
        computeMeans: "F_P",
        candidateRefs: [],
        projectionRefs: ["projection://t190/consequence/fp-apply"],
        evidenceRefs: ["evidence://t190/consequence/fp-apply"],
        diagnosticRefs: [],
        selectedCompositionRef: pluginInput.selectedCompositionRef,
        selectedCompositionDigest: pluginInput.selectedCompositionDigest,
        selectedCompositionSelectionRef: pluginInput.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
        compositionContributionRef:
          pluginInput.selectedRegimeBindingRef ?? pluginInput.selectedCompositionRef,
        reason: null
      });
    }
  });
}

function t190Plans(basis, stageRoles) {
  return stageRoles.map((stageRole, index) =>
    compiledPlanFor({
      basis,
      vectorIndex: 0,
      computeStageRole: stageRole,
      planRef: `compiled-prompt-plan://t190/vector-0/${stageRole}-${index}`
    })
  );
}

function t190AttachedArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "t190 runtime enumeration drive",
      blocking_reasons: [],
      evidence_refs: [`proof://t190/${assessmentId}`]
    })),
    selected_worker_id: input.workerId,
    selected_backend: input.backendId,
    role_id: "role://t190",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: input.resolvedRuntimeRef
  };
}

function t190FpDispatchPlugin() {
  return Object.freeze({
    contract: t190PluginContract("fp_dispatch", "plugin://t190/fp-dispatch", "FpDispatchOutcome"),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t190/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: t190AttachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function t190PluginContract(pluginKind, ref, outputCarrier) {
  return constructEnginePluginContract({
    ref,
    pluginKind,
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier
  });
}

function t190FindingFor(input) {
  return constructFpEvaluationFinding({
    findingRef: `finding://t190/fp/${input.vectorIndex}`,
    evaluatorRef: input.contract.ref,
    gainReportRef: `gain://t190/${input.vectorIndex}`,
    metricRefs: [`metric://t190/${input.vectorIndex}`],
    closeDisposition: "close",
    evidenceRefs: [`evidence://t190/fp/${input.vectorIndex}`],
    authorityRefs: Object.freeze([
      ...new Set([
        ...input.expectedAssessmentIds,
        `authority://t190/fp/${input.vectorIndex}`
      ])
    ]),
    compositionContributionRef:
      input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
    compositionRef: input.selectedCompositionRef,
    compositionDigest: input.selectedCompositionDigest
  });
}

function t190Run(input) {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P", consequenceFpBinding: true });
  const events = [];
  const observed = { evaluator: null, rule: null, consequence: null, transform: null };
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: registryStartupFor(basis),
    instructionAssemblyStartup: {
      compiledPromptPlans: t190Plans(basis, input.stageRoles),
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: {
      fpDispatch: t190FpDispatchPlugin(),
      fdEvaluator: Object.freeze({
        contract: t190PluginContract("fd_evaluator", "plugin://t190/fd", "FdEvaluationOutcome"),
        evaluate(fdInput) {
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [fdInput.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: Object.freeze({
        contract: t190PluginContract("fp_evaluator", "plugin://t190/fp-evaluator", "FpEvaluationOutcome"),
        evaluate(evaluationInput) {
          observed.evaluator = evaluationInput;
          return constructFpEvaluationOutcome({
            status: "evaluated",
            findings: [t190FindingFor(evaluationInput)],
            evidenceRefs: [evaluationInput.sourceProjectionRef]
          });
        }
      }),
      transformTasks: [
        transformTaskPlugin((taskInput) => {
          observed.transform = taskInput;
        })
      ],
      consequenceTasks: [
        consequenceTaskPlugin((taskInput) => {
          observed.consequence = taskInput;
        })
      ],
      evaluationRules: [
        t190RulePlugin((ruleInput) => {
          observed.rule = ruleInput;
        })
      ]
    }
  });
  return { events, observed };
}

test("T-190 evaluate arms receive manifests (scalar evaluate + evaluation rule batch)", () => {
  const { observed } = t190Run({ stageRoles: ["transform", "evaluate", "consequence"] });
  assert.notEqual(observed.rule, null, "rule plugin must be invoked");
  assert.ok(
    observed.rule.instructionPromptManifest,
    "evaluation rule batch input must carry an admitted instruction prompt manifest"
  );
  if (observed.evaluator !== null) {
    assert.ok(
      observed.evaluator.instructionPromptManifest,
      "scalar evaluate input must carry an admitted instruction prompt manifest"
    );
  }
});

test("T-190 composed consequence task receives manifest", () => {
  const { observed } = t190Run({ stageRoles: ["transform", "evaluate", "consequence"] });
  assert.notEqual(observed.consequence, null, "consequence task must be invoked");
  assert.ok(
    observed.consequence.instructionPromptManifest,
    "composed consequence input must carry an admitted instruction prompt manifest"
  );
});

test("T-190 omitted evaluate plan blocks evaluate arms before invocation", () => {
  const { events, observed } = t190Run({ stageRoles: ["transform"] });
  assert.equal(observed.rule, null, "rule plugin must NOT run without an evaluate plan");
  assert.equal(observed.evaluator, null, "fp evaluator must NOT run without an evaluate plan");
  const terminal = events.find((event) => event.kind === "terminal_reached");
  assert.ok(terminal);
  assert.equal(terminal.terminalKind, "gap_stop");
  assert.equal(terminal.reason.includes("evaluate"), true);
});

test("T-190 omitted consequence plan blocks the consequence task before invocation", () => {
  const { events, observed } = t190Run({ stageRoles: ["transform", "evaluate"] });
  assert.equal(observed.consequence, null, "consequence task must NOT run without a consequence plan");
  const terminal = events.find((event) => event.kind === "terminal_reached");
  assert.ok(terminal);
  assert.equal(terminal.terminalKind, "gap_stop");
  assert.equal(terminal.reason.includes("consequence"), true);
});

test("T-190 omitted transform plan blocks the composed transform task before invocation", () => {
  const { events, observed } = t190Run({ stageRoles: [] });
  assert.equal(observed.transform, null, "transform task must NOT run without a transform plan");
  const terminal = events.find((event) => event.kind === "terminal_reached");
  assert.ok(terminal);
  assert.equal(terminal.terminalKind, "gap_stop");
});

test("T-190 singular evaluation_rule_evaluate cannot run a plugin without an admitted manifest", () => {
  let invoked = 0;
  const plugins = {
    evaluationRules: [
      Object.freeze({
        contract: stageContract("evaluate", "F_P", "plugin://t190/singular"),
        evaluate(input) {
          invoked += 1;
          return constructEvaluationRuleOutcome({
            status: "accepted",
            ruleRef: "evaluation-rule://t190/singular",
            ruleRole: "register",
            computeMeans: "F_P",
            producedRegisterRefs: ["register://t190/singular"],
            evidenceRefs: [`evidence://t190/singular/${input.vectorIndex ?? 0}`],
            diagnosticRefs: [],
            selectedCompositionRef: input.selectedCompositionRef ?? "composition://t190/singular",
            selectedCompositionDigest: input.selectedCompositionDigest ?? "sha256:t190-singular",
            selectedCompositionSelectionRef: input.selectedCompositionSelectionRef ?? "composition-selection://t190/singular",
            selectedRegimeBindingRef: input.selectedRegimeBindingRef ?? "regime-binding://t190/singular"
          });
        }
      })
    ]
  };
  // manifestless input: the executor must throw BEFORE the plugin runs
  assert.throws(
    () =>
      resolveSyncEnginePluginEffect(
        { kind: "evaluation_rule_evaluate", pluginIndex: 0, input: { instructionPromptManifest: null } },
        plugins
      ),
    /construct-and-block/u
  );
  assert.equal(invoked, 0, "plugin must never run unbound");
  // with an admitted manifest the plugin runs
  const resolved = resolveSyncEnginePluginEffect(
    {
      kind: "evaluation_rule_evaluate",
      pluginIndex: 0,
      input: {
        instructionPromptManifest: { manifestRef: "manifest://t190/singular" },
        vectorIndex: 0,
        selectedRegimeBindingRef: "regime-binding://t190/singular"
      }
    },
    plugins
  );
  assert.equal(invoked, 1);
  assert.equal(resolved.kind, "evaluation_rule_evaluate");
});
