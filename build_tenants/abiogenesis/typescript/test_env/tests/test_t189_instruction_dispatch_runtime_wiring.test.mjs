// Validates: T-189
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-017

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
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

function runnerInstructionAssemblyDispatchSiteCensus() {
  const source = readFileSync(RUNNER_SOURCE_PATH, "utf8");
  const bindingSiteRoles = [
    ...source.matchAll(
      /bindInstructionAssemblyForFpEffect\(\{[\s\S]{0,1200}?computeStageRole:\s*"([^"]+)"/gu
    )
  ].map((match) => match[1]);
  const fPRegimeSites = [...source.matchAll(/resolvedRegime === "F_P"/gu)].map(
    (match) => match.index ?? -1
  );
  const fPRegimeSitesWithoutBinding = fPRegimeSites.filter((index) => {
    if (index < 0) {
      return true;
    }
    return !/bindInstructionAssemblyForFpEffect\(/u.test(
      source.slice(index, index + 4000)
    );
  });
  const fpEffectYields = [
    ...source.matchAll(/yield Object\.freeze\(\{\s*kind:\s*"(fp_dispatch|fp_evaluate)"/gu)
  ].map((match) => match[1]);
  const fpEffectYieldsWithoutManifest = [
    ...source.matchAll(/yield Object\.freeze\(\{\s*kind:\s*"(fp_dispatch|fp_evaluate)"/gu)
  ].filter((match) => {
    const index = match.index ?? -1;
    return index < 0 || !/instructionPromptManifest/u.test(source.slice(index - 2000, index));
  });

  return Object.freeze({
    bindingSiteRoles,
    bindingSiteRoleCounts: countBy(bindingSiteRoles),
    fPRegimeSiteCount: fPRegimeSites.length,
    fPRegimeSitesWithoutBinding,
    fpEffectYields,
    fpEffectYieldCounts: countBy(fpEffectYields),
    fpEffectYieldsWithoutManifest
  });
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

test("T-189 dispatch-site census is derived from live runner F_P binding sites", () => {
  const census = runnerInstructionAssemblyDispatchSiteCensus();

  assert.deepEqual(census.bindingSiteRoleCounts, {
    consequence: 2,
    evaluate: 3,
    transform: 2
  });
  assert.equal(census.fPRegimeSiteCount, 10);
  assert.deepEqual(census.fPRegimeSitesWithoutBinding, []);
  assert.deepEqual(census.fpEffectYieldCounts, {
    fp_dispatch: 1,
    fp_evaluate: 1
  });
  assert.deepEqual(census.fpEffectYieldsWithoutManifest, []);
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
