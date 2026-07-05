// Validates: T-183
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitCompiledPromptPlanAtStartup,
  bindInstructionEnvelope,
  compileInstructionAssemblyPlan,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructRuntimeBindingSlot,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  renderPromptManifest,
  replayPromptManifest
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  constructGtlLibraryEntryDeclaration,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructProductRegistryStartupConfig,
  runEngineIterate,
  runEngineStart,
  start as publicStart
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

function rule(overrides = {}) {
  return constructInstructionAssemblyRule({
    ruleRef: "instruction-rule://t183/framework-smoke/current-vector",
    appliesToGraphFunctionRefs: ["graph-function://t183/framework-smoke"],
    appliesToVectorRefs: ["vector://t183/framework-smoke/source-to-test"],
    sectionRules: [
      {
        sectionRef: "section://t183/current-task",
        required: true,
        policyRefs: ["policy://t183/current-task-only"]
      },
      {
        sectionRef: "section://t183/prior-artifact",
        required: true,
        policyRefs: ["policy://t183/causal-carry"]
      }
    ],
    relevanceRules: [
      {
        ruleRef: "relevance://t183/current-vector",
        requiredInputRefs: ["payload://t183/design"],
        allowFutureStageRefs: []
      }
    ],
    compressionPolicyRef: "compression://t183/ref-digest-excerpt",
    proportionalityPolicyRef: "proportionality://t183/p1-worker",
    runtimeBindingSlotClasses: ["graph_call", "vector", "prior_artifact"],
    policyRefs: ["policy://t183/software-build"],
    evidenceRefs: ["evidence://t183/rule"],
    ...overrides
  });
}

function section(overrides = {}) {
  return constructInstructionSectionDecision({
    sectionRef: "section://t183/current-task",
    disposition: "include",
    dependencyRefs: ["vector://t183/framework-smoke/source-to-test"],
    carrierRefs: ["payload://t183/design"],
    compressionMode: "excerpt",
    text: "Write the current test source from the admitted design artifact.",
    digestRef: "sha256:section-current-task",
    excerptDigest: "sha256:excerpt-current-task",
    fullContentAdmitted: false,
    stageRef: "stage://current",
    gapRefs: [],
    ...overrides
  });
}

function slots() {
  return [
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/graph-call",
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/slot/graph-call"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/vector",
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t183/slot/vector"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/prior-artifact",
      slotClass: "prior_artifact",
      required: true,
      sourceTruthKind: "admitted_ref",
      evidenceRefs: ["evidence://t183/slot/prior-artifact"]
    })
  ];
}

function derivedTruth(overrides = {}) {
  return {
    kind: "derived_instruction_carrier_truth",
    sourceTypeRefs: ["node-type://t183/design-artifact"],
    targetTypeRefs: ["node-type://t183/test-source"],
    outputContractRefs: ["contract://t183/test-source"],
    proofRefs: ["proof://t183/test-source"],
    authorityRefs: ["authority://t183/fp-worker"],
    rendererRefs: ["renderer://abg/instruction-envelope/default"],
    activeRegime: "F_P",
    carrierClassRefs: ["carrier://t183/design", "carrier://t183/test-source"],
    ...overrides
  };
}

function dependencyTruth(overrides = {}) {
  return constructDerivedDependencyInstructionTruth({
    truthRef: "dependency-instruction-truth://t183/framework-smoke/source-to-test",
    workKind: "target_work",
    dependencyGraphRef: null,
    dependencyGraphDigest: null,
    targetRefs: ["node://t183/test-source"],
    prerequisiteNodeRefs: [],
    prerequisiteEdgeRefs: [],
    dependencyClosed: true,
    typedPrerequisiteGapRefs: [],
    noDependencyPolicyRef: "policy://t183/no-dependency-graph-required",
    sourceProjectionRefs: ["projection://t183/no-dependency-policy"],
    ...overrides
  });
}

function proofDepthTruth(overrides = {}) {
  return constructDerivedProofDepthInstructionTruth({
    truthRef: "proof-depth-instruction-truth://t183/framework-smoke/source-to-test",
    depthPolicyRef: "proof-depth-policy://t183/framework-smoke",
    depthPolicyDigest: "sha256:t183-proof-depth-policy",
    targetRefs: ["node://t183/test-source"],
    requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
    declaredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
    declaredDepthObligationRefs: [
      "proof-obligation://t183/positive",
      "proof-obligation://t183/negative"
    ],
    notApplicableDepthClassRefs: [],
    typedDepthGapRefs: [],
    proofStrengthAdmissionRefs: ["proof-strength-admission://t183/framework-smoke"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t183/coverage-strength"],
    adversarialVerificationRefs: [],
    adversarialCounterexampleRefs: [],
    sourceProjectionRefs: ["proof-coverage-projection://t183/framework-smoke"],
    depthComplete: true,
    proofStrengthAdmitted: true,
    ...overrides
  });
}

function compileInput(overrides = {}) {
  return {
    planRef: "compiled-prompt-plan://t183/framework-smoke/source-to-test",
    rule: rule(),
    graphFunctionRef: "graph-function://t183/framework-smoke",
    vectorRef: "vector://t183/framework-smoke/source-to-test",
    registryEntryRefs: ["registry-entry://t183/framework-smoke"],
    sourceNodeRefs: ["node://t183/design"],
    targetNodeRef: "node://t183/test-source",
    derivedTruth: derivedTruth(),
    knownAlgebraRefs: [...INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs: ["payload://t183/design"],
    availableInputRefs: ["payload://t183/design"],
    sectionDecisions: [section()],
    bindingSlots: slots(),
    proportionalityClass: "P1",
    instructionWorkKind: "target_work",
    dependencyInstructionTruth: dependencyTruth(),
    proofDepthInstructionTruth: proofDepthTruth(),
    expectedAnswerMarkers: ["release_ready"],
    fpValidationEvidenceRefs: ["semantic-review-gate://t183/compiler-review"],
    compilerEvidenceRefs: ["evidence://t183/compiler"],
    ...overrides
  };
}

function acceptedPlan(overrides = {}) {
  const result = compileInstructionAssemblyPlan(compileInput(overrides));
  assert.equal(result.accepted, true);
  assert.ok(result.plan);
  return result.plan;
}

function publicStartSlots() {
  return [
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/graph-call",
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/start/slot/graph-call"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/frame",
      slotClass: "frame",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/start/slot/frame"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/vector",
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t183/start/slot/vector"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/selected-graph-function",
      slotClass: "selected_graph_function",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/start/slot/selection"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/event-log",
      slotClass: "event_log",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t183/start/slot/event-log"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t183/start/worker",
      slotClass: "worker_invocation",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t183/start/slot/worker"]
    })
  ];
}

function graphFunctionDeclaration(graphFunctionRef) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t183/start/framework-smoke",
    entryRef: "registry-entry://t183/start/framework-smoke",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t183.start",
    ownerRef: "owner://abg/t183",
    version: "4.2.0-rc.1",
    graphFunctionRef,
    interfaceRef: "interface://t183/start/framework-smoke",
    sourceContractRef: "contract://t183/start/source",
    targetContractRef: "contract://t183/start/target",
    contextRefs: ["context://t183/start"],
    authorityRefs: ["authority://t183/start/abg-runtime"],
    overlayRefs: ["overlay://t183/start/framework-smoke"],
    provenanceRefs: ["provenance://t183/start"],
    readinessRefs: ["readiness://t183/start"],
    proofRefs: ["proof://t183/start"],
    policyRefs: ["policy://t183/start"],
    declarationSourceRefs: ["gtl://module/t183/start"]
  });
}

function productStartupConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t183/start",
    productNamespace: "t183.start",
    ownerRef: "owner://abg/t183",
    version: "4.2.0-rc.1",
    enabledLibraryRefs: [
      "registry-entry://t183/start/framework-smoke",
      "gtl-declaration://t183/start/framework-smoke",
      "gtl://module/t183/start"
    ],
    overlayRefs: ["overlay://t183/start/framework-smoke"],
    pluginRefs: ["plugin://t183/start/fp-worker"],
    readinessRefs: ["readiness://t183/start"],
    proofRefs: ["proof://t183/start"],
    policyRefs: ["policy://t183/start"],
    configSourceRefs: ["config://t183/start"]
  });
}

function startPlanForFirstVector(executive) {
  const vector = executive.template.graph.vectors[0];
  assert.ok(vector);
  return acceptedPlan({
    planRef: "compiled-prompt-plan://t183/start/vector-0",
    rule: rule({
      ruleRef: "instruction-rule://t183/start/vector-0",
      appliesToGraphFunctionRefs: [executive.id],
      appliesToVectorRefs: [vector.name],
      runtimeBindingSlotClasses: [
        "graph_call",
        "frame",
        "vector",
        "selected_graph_function",
        "event_log",
        "worker_invocation"
      ],
      policyRefs: ["policy://t183/start"]
    }),
    graphFunctionRef: executive.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://t183/start/framework-smoke"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: derivedTruth({
      sourceTypeRefs: vector.source.map((node) => node.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: ["contract://t183/start/vector-0/output"],
      proofRefs: ["proof://t183/start/vector-0"],
      authorityRefs: ["authority://t183/start/abg-runtime"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      carrierClassRefs: [
        "carrier://t183/start/source",
        "carrier://t183/start/target"
      ]
    }),
    requiredInputRefs: [],
    availableInputRefs: [],
    sectionDecisions: [
      section({
        sectionRef: "section://t183/start/current-vector",
        dependencyRefs: [vector.name],
        carrierRefs: [vector.source[0]?.id ?? vector.name, vector.target.id],
        compressionMode: "digest",
        text: "Transform the current source node into the declared target node.",
        digestRef: "sha256:t183-start-current-vector",
        excerptDigest: null
      })
    ],
    bindingSlots: publicStartSlots(),
    dependencyInstructionTruth: dependencyTruth({
      truthRef: "dependency-instruction-truth://t183/start/vector-0",
      targetRefs: [vector.target.id],
      sourceProjectionRefs: ["projection://t183/start/no-dependency-policy"]
    }),
    proofDepthInstructionTruth: proofDepthTruth({
      truthRef: "proof-depth-instruction-truth://t183/start/vector-0",
      targetRefs: [vector.target.id],
      sourceProjectionRefs: ["proof-coverage-projection://t183/start/vector-0"]
    }),
    expectedAnswerMarkers: ["gap_stop_without_dispatch"]
  });
}

function evaluatePlanForFirstVector(executive) {
  const vector = executive.template.graph.vectors[0];
  assert.ok(vector);
  return acceptedPlan({
    planRef: "compiled-prompt-plan://t183/start/vector-0/evaluate",
    computeStageRole: "evaluate",
    rule: rule({
      ruleRef: "instruction-rule://t183/start/vector-0/evaluate",
      appliesToGraphFunctionRefs: [executive.id],
      appliesToVectorRefs: [vector.name],
      runtimeBindingSlotClasses: [
        "graph_call",
        "frame",
        "vector",
        "selected_graph_function",
        "event_log",
        "worker_invocation",
        "payload"
      ],
      policyRefs: ["policy://t183/start/evaluate"]
    }),
    graphFunctionRef: executive.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://t183/start/framework-smoke"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: derivedTruth({
      sourceTypeRefs: vector.source.map((node) => node.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: ["contract://t183/start/vector-0/evaluate-output"],
      proofRefs: ["proof://t183/start/vector-0/evaluate"],
      authorityRefs: ["authority://t183/start/abg-runtime"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      carrierClassRefs: [
        "carrier://t183/start/source",
        "carrier://t183/start/target",
        "carrier://t183/start/candidate-payload"
      ]
    }),
    requiredInputRefs: [],
    availableInputRefs: [],
    sectionDecisions: [
      section({
        sectionRef: "section://t183/start/evaluate-candidate",
        dependencyRefs: [vector.name],
        carrierRefs: [vector.target.id, "carrier://t183/start/candidate-payload"],
        compressionMode: "digest",
        text: "Evaluate the worker candidate payload against the current typed vector and close only if the evidence satisfies the declared output contract.",
        digestRef: "sha256:t183-start-evaluate-candidate",
        excerptDigest: null
      })
    ],
    bindingSlots: [
      ...publicStartSlots(),
      constructRuntimeBindingSlot({
        slotRef: "slot://t183/start/evaluate-payload",
        slotClass: "payload",
        required: true,
        sourceTruthKind: "admitted_ref",
        evidenceRefs: ["evidence://t183/start/slot/evaluate-payload"]
      })
    ],
    dependencyInstructionTruth: dependencyTruth({
      truthRef: "dependency-instruction-truth://t183/start/vector-0/evaluate",
      targetRefs: [vector.target.id],
      sourceProjectionRefs: ["projection://t183/start/evaluate/no-dependency-policy"]
    }),
    proofDepthInstructionTruth: proofDepthTruth({
      truthRef: "proof-depth-instruction-truth://t183/start/vector-0/evaluate",
      targetRefs: [vector.target.id],
      sourceProjectionRefs: ["proof-coverage-projection://t183/start/vector-0/evaluate"]
    }),
    expectedAnswerMarkers: ["reviewAccepted true"]
  });
}

function vectorPlan(executive, vectorIndex, computeStageRole, options = {}) {
  const vector = executive.template.graph.vectors[vectorIndex];
  assert.ok(vector);
  const includePrior = options.includePrior === true;
  const isEvaluate = computeStageRole === "evaluate";
  const slotClasses = [
    "graph_call",
    "frame",
    "vector",
    "selected_graph_function",
    "event_log",
    "worker_invocation",
    ...(includePrior ? ["prior_artifact", "evidence"] : []),
    ...(isEvaluate ? ["payload"] : [])
  ];
  const planRef = [
    "compiled-prompt-plan://t183/start",
    `vector-${vectorIndex}`,
    computeStageRole
  ].join("/");
  const requiredInputRefs = includePrior
    ? [`prior://t183/start/vector-${vectorIndex - 1}`]
    : [];
  return acceptedPlan({
    planRef,
    computeStageRole,
    rule: rule({
      ruleRef: [
        "instruction-rule://t183/start",
        `vector-${vectorIndex}`,
        computeStageRole
      ].join("/"),
      appliesToGraphFunctionRefs: [executive.id],
      appliesToVectorRefs: [vector.name],
      runtimeBindingSlotClasses: slotClasses,
      policyRefs: [`policy://t183/start/${computeStageRole}`]
    }),
    graphFunctionRef: executive.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://t183/start/framework-smoke"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: derivedTruth({
      sourceTypeRefs: vector.source.map((node) => node.schema.ref),
      targetTypeRefs: [vector.target.schema.ref],
      outputContractRefs: [
        `contract://t183/start/vector-${vectorIndex}/${computeStageRole}/output`
      ],
      proofRefs: [`proof://t183/start/vector-${vectorIndex}/${computeStageRole}`],
      authorityRefs: ["authority://t183/start/abg-runtime"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      carrierClassRefs: [
        ...vector.source.map((node) => node.assetSurface.kind),
        vector.target.assetSurface.kind,
        ...(isEvaluate ? ["carrier://t183/start/candidate-payload"] : [])
      ]
    }),
    requiredInputRefs,
    availableInputRefs: requiredInputRefs,
    sectionDecisions: [
      section({
        sectionRef: [
          "section://t183/start",
          `vector-${vectorIndex}`,
          computeStageRole
        ].join("/"),
        dependencyRefs: [
          vector.name,
          ...vector.source.map((node) => node.id),
          vector.target.id
        ],
        carrierRefs: [
          ...vector.source.map((node) => node.id),
          vector.target.id,
          ...(isEvaluate ? ["carrier://t183/start/candidate-payload"] : [])
        ],
        compressionMode: "digest",
        text: isEvaluate
          ? "Evaluate the worker candidate payload against admitted prior artifacts and current typed obligations."
          : "Transform the current source node into the declared target node using admitted prior artifacts when required.",
        digestRef: `sha256:t183-start-vector-${vectorIndex}-${computeStageRole}`,
        excerptDigest: null
      })
    ],
    bindingSlots: [
      ...publicStartSlots(),
      ...(includePrior
        ? [
            constructRuntimeBindingSlot({
              slotRef: `slot://t183/start/vector-${vectorIndex}/${computeStageRole}/prior-artifact`,
              slotClass: "prior_artifact",
              required: true,
              sourceTruthKind: "admitted_ref",
              evidenceRefs: [
                `evidence://t183/start/vector-${vectorIndex}/${computeStageRole}/prior-artifact`
              ]
            }),
            constructRuntimeBindingSlot({
              slotRef: `slot://t183/start/vector-${vectorIndex}/${computeStageRole}/evidence`,
              slotClass: "evidence",
              required: true,
              sourceTruthKind: "admitted_ref",
              evidenceRefs: [
                `evidence://t183/start/vector-${vectorIndex}/${computeStageRole}/evidence`
              ]
            })
          ]
        : []),
      ...(isEvaluate
        ? [
            constructRuntimeBindingSlot({
              slotRef: `slot://t183/start/vector-${vectorIndex}/${computeStageRole}/payload`,
              slotClass: "payload",
              required: true,
              sourceTruthKind: "admitted_ref",
              evidenceRefs: [
                `evidence://t183/start/vector-${vectorIndex}/${computeStageRole}/payload`
              ]
            })
          ]
        : [])
    ],
    dependencyInstructionTruth: dependencyTruth({
      truthRef: `dependency-instruction-truth://t183/start/vector-${vectorIndex}/${computeStageRole}`,
      targetRefs: [vector.target.id],
      prerequisiteNodeRefs: includePrior ? vector.source.map((node) => node.id) : [],
      prerequisiteEdgeRefs: includePrior
        ? [executive.template.graph.vectors[vectorIndex - 1]?.name].filter(Boolean)
        : [],
      dependencyGraphRef: includePrior ? "dependency-graph://t183/start" : null,
      dependencyGraphDigest: includePrior ? "sha256:t183-start-dependency-graph" : null,
      noDependencyPolicyRef: includePrior
        ? null
        : "policy://t183/start/no-dependency-policy",
      sourceProjectionRefs: [
        `dependency-projection://t183/start/vector-${vectorIndex}/${computeStageRole}`
      ]
    }),
    proofDepthInstructionTruth: proofDepthTruth({
      truthRef: `proof-depth-instruction-truth://t183/start/vector-${vectorIndex}/${computeStageRole}`,
      targetRefs: [vector.target.id],
      sourceProjectionRefs: [
        `proof-coverage-projection://t183/start/vector-${vectorIndex}/${computeStageRole}`
      ]
    }),
    expectedAnswerMarkers: ["gap_stop_without_dispatch"]
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fpEvaluatorContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpEvaluationOutcome"
  });
}

function attachedArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length === 0
      ? ["instruction_response_admitted"]
      : input.expectedAssessmentIds;
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "runtime output accepted under derived output contract",
      blocking_reasons: [],
      evidence_refs: [`evidence://t183/response/${assessmentId}`]
    })),
    selected_worker_id: "worker://t183",
    selected_backend: "backend://node",
    role_id: "role://t183",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function admitted(plan) {
  const admission = admitCompiledPromptPlanAtStartup({
    plan,
    registryEntryRefs: ["registry-entry://t183/framework-smoke"],
    startupEventRefs: ["event://t183/startup/registry-entry-admitted"]
  });
  assert.equal(admission.admitted, true);
  return admission;
}

function runtimeFacts() {
  return [
    {
      kind: "runtime_binding_fact",
      slotClass: "graph_call",
      ref: "graph-call://t183/framework-smoke/1",
      digest: "sha256:graph-call",
      sourceEventRefs: ["event://t183/graph-call-opened"],
      admitted: true
    },
    {
      kind: "runtime_binding_fact",
      slotClass: "vector",
      ref: "vector://t183/framework-smoke/source-to-test",
      digest: "sha256:vector",
      sourceEventRefs: ["event://t183/vector-selected"],
      admitted: true
    },
    {
      kind: "runtime_binding_fact",
      slotClass: "prior_artifact",
      ref: "payload://t183/design",
      digest: "sha256:design-payload",
      sourceEventRefs: ["event://t183/payload-admitted"],
      admitted: true
    }
  ];
}

test("T-183 compiles, admits, binds, renders, and replays a prompt manifest", () => {
  const plan = acceptedPlan();
  assert.equal(plan.shouldDispatchFp, true);
  assert.deepEqual(plan.fpValidationEvidenceRefs, [
    "semantic-review-gate://t183/compiler-review"
  ]);
  assert.equal(plan.derivedTruth.outputContractRefs[0], "contract://t183/test-source");

  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t183/framework-smoke/source-to-test",
    plan,
    startupAdmission: admitted(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const envelope = envelopeResult.envelope;
  assert.ok(envelope);

  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t183/framework-smoke/source-to-test",
    plan,
    envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, true);
  const manifest = rendered.manifest;
  assert.ok(manifest);
  assert.equal(manifest.includedCarrierRefs.includes("payload://t183/design"), true);
  assert.equal(manifest.promptDigest.startsWith("sha256:"), true);
  assert.equal(manifest.renderedPrompt.includes("Write the current test source"), true);

  const replay = replayPromptManifest({ plan, envelope, manifest });
  assert.equal(replay.passed, true);
  assert.equal(replay.issues.length, 0);
});

test("T-183 rejects duplicate carrier truth on instruction assembly rules", () => {
  assert.throws(
    () =>
      constructInstructionAssemblyRule({
        ...rule(),
        sourceNodeTypeRefs: ["node-type://t183/local-duplicate"]
      }),
    /shall not redeclare carrier truth field sourceNodeTypeRefs/u
  );
});

test("T-183 F_P validation evidence cannot approve a plan without F_D algebra", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      knownAlgebraRefs: ["field_cut"],
      fpValidationEvidenceRefs: ["semantic-review-gate://t183/positive-review"]
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(
    result.issues.some((item) => item.issueKind === "missing_known_algebra"),
    true
  );
});

test("T-183 blocks missing required causal input before dispatch", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      availableInputRefs: []
    })
  );
  assert.equal(result.accepted, false);
  assert.deepEqual(
    result.issues.map((item) => item.issueKind).filter((kind) => kind === "relevance_gap"),
    ["relevance_gap"]
  );
});

test("T-183 rejects answer-shaped prompt content differentially", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      sectionDecisions: [
        section({
          text: "The disposition is closed; write the proof around that answer."
        })
      ],
      expectedAnswerMarkers: ["closed"]
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(
    result.issues.some((item) => item.issueKind === "answer_shaped_content"),
    true
  );
});

test("T-183 P0 plans do not render F_P prompts", () => {
  const plan = acceptedPlan({
    proportionalityClass: "P0",
    derivedTruth: derivedTruth({
      activeRegime: "F_D",
      rendererRefs: []
    })
  });
  assert.equal(plan.shouldDispatchFp, false);
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t183/p0",
    plan,
    startupAdmission: admitted(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t183/p0",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, false);
  assert.equal(rendered.issues[0].issueKind, "p0_dispatch_forbidden");
});

test("T-183 runtime binding rejects unadmitted or non-digest refs", () => {
  const plan = acceptedPlan();
  const result = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t183/stale",
    plan,
    startupAdmission: admitted(plan),
    runtimeFacts: [
      ...runtimeFacts().slice(0, 2),
      {
        kind: "runtime_binding_fact",
        slotClass: "prior_artifact",
        ref: "payload://t183/design",
        digest: "not-a-sha",
        sourceEventRefs: ["event://t183/payload-admitted"],
        admitted: false
      }
    ]
  });
  assert.equal(result.accepted, false);
  assert.equal(
    result.issues.some((item) => item.issueKind === "runtime_binding_gap"),
    true
  );
});

test("T-183 prompt manifest replay catches digest drift", () => {
  const plan = acceptedPlan();
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t183/replay",
    plan,
    startupAdmission: admitted(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t183/replay",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, true);
  const replay = replayPromptManifest({
    plan,
    envelope: envelopeResult.envelope,
    manifest: {
      ...rendered.manifest,
      promptDigest: "sha256:tampered"
    }
  });
  assert.equal(replay.passed, false);
  assert.equal(
    replay.issues.some((item) => item.issueKind === "manifest_replay_mismatch"),
    true
  );
});

test("T-183 prompt rendering keeps runtime refs bounded while preserving digest and excerpt", () => {
  const plan = acceptedPlan();
  const longRuntimeRef = `runtime_projection:${"x".repeat(5000)}`;
  const longNodeRef = `node:${JSON.stringify({
    name: "HugeNode",
    typeRef: "node-type://t183/huge",
    schema: { kind: "symbolic", ref: `schema://${"y".repeat(2000)}` },
    tags: ["fixture"]
  })}`;
  const longExcerpt = `excerpt-start:${"z".repeat(20000)}:excerpt-end`;
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t183/bounded-rendering",
    plan,
    startupAdmission: admitted(plan),
    runtimeFacts: [
      ...runtimeFacts(),
      {
        kind: "runtime_binding_fact",
        slotClass: "source_node",
        ref: longNodeRef,
        digest: stableSha256Digest({
          slotClass: "source_node",
          ref: longNodeRef,
          sourceEventRefs: [longRuntimeRef]
        }),
        sourceEventRefs: [longRuntimeRef],
        admitted: true
      },
      {
        kind: "runtime_binding_fact",
        slotClass: "prior_artifact",
        ref: "payload://t183/large-design",
        digest: stableSha256Digest({
          slotClass: "prior_artifact",
          ref: "payload://t183/large-design",
          sourceEventRefs: [longRuntimeRef],
          contentExcerpt: longExcerpt
        }),
        sourceEventRefs: [longRuntimeRef],
        admitted: true,
        contentExcerpt: longExcerpt
      }
    ]
  });
  assert.equal(envelopeResult.accepted, true);

  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t183/bounded-rendering",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, true);

  assert.equal(rendered.manifest.renderedPrompt.includes(longRuntimeRef), false);
  assert.equal(rendered.manifest.renderedPrompt.includes(longNodeRef), false);
  assert.equal(
    rendered.manifest.renderedPrompt.includes(stableSha256Digest(longRuntimeRef)),
    true
  );
  assert.equal(
    rendered.manifest.renderedPrompt.includes(stableSha256Digest(longNodeRef)),
    true
  );
  assert.equal(rendered.manifest.renderedPrompt.includes("excerpt-start:"), true);
  assert.equal(rendered.manifest.renderedPrompt.includes(":excerpt-end"), false);
  assert.match(rendered.manifest.renderedPrompt, /\[truncated:\d+\]/u);
});

test("T-183 public ABG start emits replay-visible instruction prompt manifest before F_P dispatch", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const plan = startPlanForFirstVector(executive);
  const declaration = graphFunctionDeclaration(executive.id);
  const events = [];
  const outcome = publicStart(
    input,
    {
      ...context,
      runtimeRegistryStartup: {
        systemDeclarations: [],
        productStartupConfig: productStartupConfig(),
        productDeclarations: [declaration],
        correlationId: "correlation://t183/start/registry"
      },
      instructionAssemblyStartup: {
        compiledPromptPlans: [plan],
        rendererRef: "renderer://abg/instruction-envelope/default"
      }
    },
    (event) => {
      events.push(event);
    }
  );
  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.equal(outcome.stopDetail.dispatchRef, "dispatch://m03-iteration");
  const manifestEvents = events.filter(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  assert.equal(manifestEvents.length, 1);
  assert.equal(manifestEvents[0].planRef, plan.planRef);
  assert.equal(manifestEvents[0].planDigest, plan.planDigest);
  assert.equal(
    manifestEvents[0].includedCarrierRefs.includes("node-m03-input-set"),
    true
  );
  assert.equal(
    events.findIndex((event) => event.kind === "instruction_prompt_manifest_projected") <
      events.findIndex((event) => event.kind === "fp_dispatch_requested"),
    true
  );
  assert.deepEqual(outcome.trace.eventKinds, events.map((event) => event.kind));
});

test("T-183 active instruction assembly blocks F_P dispatch when startup admits no matching plan", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const declaration = graphFunctionDeclaration(executive.id);
  const events = [];
  const outcome = publicStart(
    input,
    {
      ...context,
      runtimeRegistryStartup: {
        systemDeclarations: [],
        productStartupConfig: productStartupConfig(),
        productDeclarations: [declaration],
        correlationId: "correlation://t183/start/registry/no-plan"
      },
      instructionAssemblyStartup: {
        compiledPromptPlans: [],
        rendererRef: "renderer://abg/instruction-envelope/default"
      }
    },
    (event) => {
      events.push(event);
    }
  );
  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "gap_stop");
  assert.match(
    events.find((event) => event.kind === "terminal_reached")?.reason ?? "",
    /no admitted plan/u
  );
  assert.equal(
    events.some((event) => event.kind === "instruction_prompt_manifest_projected"),
    false
  );
  assert.equal(
    events.some((event) => event.kind === "fp_dispatch_requested"),
    false
  );
});

test("T-183 runner admits F_P response against the derived output contract after worker transport", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const plan = startPlanForFirstVector(executive);
  const declaration = graphFunctionDeclaration(executive.id);
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/instruction-response"),
    dispatch: (pluginInput) => {
      assert.ok(pluginInput.instructionPromptManifest);
      assert.equal(pluginInput.instructionPromptManifest.planRef, plan.planRef);
      assert.match(
        pluginInput.instructionPromptManifest.renderedPrompt,
        /Transform the current source node/u
      );
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/instruction-response/${encodeURIComponent(pluginInput.edge)}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });
  const result = runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/start/response-registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [plan],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: { fpDispatch }
  });
  const manifestEvent = events.find(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  const responseEvent = events.find(
    (event) => event.kind === "instruction_response_contract_admitted"
  );
  assert.ok(manifestEvent);
  assert.ok(responseEvent);
  assert.equal(responseEvent.manifestRef, manifestEvent.manifestRef);
  assert.equal(responseEvent.planRef, plan.planRef);
  assert.deepEqual(responseEvent.outputContractRefs, [
    "contract://t183/start/vector-0/output"
  ]);
  assert.equal(
    events.findIndex((event) => event.kind === "actor_result_artifact_observed") <
      events.findIndex((event) => event.kind === "instruction_response_contract_admitted"),
    true
  );
  assert.equal(
    result.projection.instructionResponseAdmissionRefs[0].responseAdmissionRef,
    responseEvent.responseAdmissionRef
  );
  assert.equal(
    result.projection.instructionResponseAdmissionRefs[0].artifactContentDigest,
    responseEvent.artifactContentDigest
  );
});

test("T-183 runner binds instruction manifests for F_P semantic evaluation", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const transformPlan = startPlanForFirstVector(basis.graphFunction);
  const evaluatePlan = evaluatePlanForFirstVector(basis.graphFunction);
  const declaration = graphFunctionDeclaration(basis.graphFunction.id);
  const events = [];
  let evaluatorInput = null;
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/evaluate-binding/dispatch"),
    dispatch: (pluginInput) => {
      assert.ok(pluginInput.instructionPromptManifest);
      assert.equal(pluginInput.instructionPromptManifest.planRef, transformPlan.planRef);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/evaluate-binding/${encodeURIComponent(pluginInput.edge)}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });
  const fpEvaluator = Object.freeze({
    contract: fpEvaluatorContract("plugin://t183/evaluate-binding/fp-evaluator"),
    evaluate: (pluginInput) => {
      evaluatorInput = pluginInput;
      assert.ok(pluginInput.instructionPromptManifest);
      assert.equal(pluginInput.instructionPromptManifest.planRef, evaluatePlan.planRef);
      assert.match(
        pluginInput.instructionPromptManifest.renderedPrompt,
        /Evaluate the worker candidate payload/u
      );
      assert.match(
        pluginInput.instructionPromptManifest.renderedPrompt,
        /slot: payload/u
      );
      return constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t183/evaluate-binding/${pluginInput.vectorIndex}`,
            evaluatorRef: pluginInput.contract.ref,
            gainReportRef: `gain://t183/evaluate-binding/${pluginInput.vectorIndex}`,
            metricRefs: [`metric://t183/evaluate-binding/${pluginInput.vectorIndex}`],
            closeDisposition: "close",
            evidenceRefs: [`evidence://t183/evaluate-binding/${pluginInput.vectorIndex}`],
            authorityRefs: [
              ...pluginInput.expectedAssessmentIds,
              `authority://t183/evaluate-binding/${pluginInput.vectorIndex}`
            ],
            compositionContributionRef:
              pluginInput.selectedRegimeBindingRef ?? pluginInput.selectedCompositionRef,
            compositionRef: pluginInput.selectedCompositionRef,
            compositionDigest: pluginInput.selectedCompositionDigest
          })
        ],
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/evaluate-binding/registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [transformPlan, evaluatePlan],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: { fpDispatch, fpEvaluator }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(
    result.transition.terminalKind,
    "gap_stop",
    JSON.stringify(result.transition)
  );
  assert.match(
    result.transition.reason,
    /no admitted plan for transform requirements→design/u
  );
  assert.notEqual(evaluatorInput, null);
  const manifestEvents = events.filter(
    (event) => event.kind === "instruction_prompt_manifest_projected"
  );
  assert.equal(manifestEvents.length, 2);
  assert.deepEqual(
    manifestEvents.map((event) => event.planRef),
    [transformPlan.planRef, evaluatePlan.planRef]
  );
  assert.notEqual(manifestEvents[0].manifestRef, manifestEvents[1].manifestRef);
  assert.equal(
    events.findIndex((event) => event.kind === "instruction_prompt_manifest_projected" && event.planRef === evaluatePlan.planRef) <
      events.findIndex((event) => event.kind === "payload_observed" && event.payloadClass === "fp_evaluation_finding"),
    true
  );
});

test("T-183 runner carries admitted prior artifacts into the next vector instruction manifest", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const vector0TransformPlan = vectorPlan(basis.graphFunction, 0, "transform");
  const vector0EvaluatePlan = vectorPlan(basis.graphFunction, 0, "evaluate");
  const vector1TransformPlan = vectorPlan(basis.graphFunction, 1, "transform", {
    includePrior: true
  });
  const declaration = graphFunctionDeclaration(basis.graphFunction.id);
  const events = [];
  const vector1Prompts = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/next-vector-causal/dispatch"),
    dispatch: (pluginInput) => {
      assert.ok(pluginInput.instructionPromptManifest);
      if (pluginInput.vectorIndex === 1) {
        vector1Prompts.push(pluginInput.instructionPromptManifest.renderedPrompt);
        assert.match(
          pluginInput.instructionPromptManifest.renderedPrompt,
          /slot: prior_artifact/u
        );
        assert.match(
          pluginInput.instructionPromptManifest.renderedPrompt,
          /slot: evidence/u
        );
        assert.match(
          pluginInput.instructionPromptManifest.renderedPrompt,
          /Product section text, stage policy data, templates, and worker instructions may narrow or strengthen admitted prior obligations/u
        );
        assert.match(
          pluginInput.instructionPromptManifest.renderedPrompt,
          /The F_P evaluator must reject a candidate that follows a weaker product instruction/u
        );
        assert.equal(pluginInput.instructionCausalContext?.status, "bound");
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/next-vector-causal/${pluginInput.vectorIndex}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });
  const fpEvaluator = Object.freeze({
    contract: fpEvaluatorContract("plugin://t183/next-vector-causal/fp-evaluator"),
    evaluate: (pluginInput) =>
      constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t183/next-vector-causal/${pluginInput.vectorIndex}`,
            evaluatorRef: pluginInput.contract.ref,
            gainReportRef: `gain://t183/next-vector-causal/${pluginInput.vectorIndex}`,
            metricRefs: [`metric://t183/next-vector-causal/${pluginInput.vectorIndex}`],
            closeDisposition: "close",
            evidenceRefs: [`evidence://t183/next-vector-causal/${pluginInput.vectorIndex}`],
            authorityRefs: [
              ...pluginInput.expectedAssessmentIds,
              `authority://t183/next-vector-causal/${pluginInput.vectorIndex}`
            ],
            compositionContributionRef:
              pluginInput.selectedRegimeBindingRef ?? pluginInput.selectedCompositionRef,
            compositionRef: pluginInput.selectedCompositionRef,
            compositionDigest: pluginInput.selectedCompositionDigest
          })
        ],
        evidenceRefs: [pluginInput.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/next-vector-causal/registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [
        vector0TransformPlan,
        vector0EvaluatePlan,
        vector1TransformPlan
      ],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: { fpDispatch, fpEvaluator }
  });

  assert.equal(
    vector1Prompts.length,
    1,
    result.transition.kind === "terminal"
      ? result.transition.reason
      : JSON.stringify(result.transition)
  );
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /no admitted plan for evaluate/u);
  assert.equal(
    events.some(
      (event) =>
        event.kind === "instruction_causal_context_bound" &&
        event.vectorIndex === 1 &&
        event.status === "bound"
    ),
    true
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "instruction_prompt_manifest_projected")
      .map((event) => event.planRef),
    [
      vector0TransformPlan.planRef,
      vector0EvaluatePlan.planRef,
      vector1TransformPlan.planRef
    ]
  );
});

test("T-183 evaluator retry carries rejection pressure into same-vector retry prompt", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const vector0TransformPlan = vectorPlan(basis.graphFunction, 0, "transform");
  const vector0EvaluatePlan = vectorPlan(basis.graphFunction, 0, "evaluate");
  const vector1TransformPlan = vectorPlan(basis.graphFunction, 1, "transform", {
    includePrior: true
  });
  const vector1EvaluatePlan = vectorPlan(basis.graphFunction, 1, "evaluate", {
    includePrior: true
  });
  const declaration = graphFunctionDeclaration(basis.graphFunction.id);
  const vector1Prompts = [];
  let vector1EvaluationCount = 0;
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/evaluator-retry-pressure/dispatch"),
    dispatch: (pluginInput) => {
      assert.ok(pluginInput.instructionPromptManifest);
      if (pluginInput.vectorIndex === 1) {
        vector1Prompts.push(pluginInput.instructionPromptManifest.renderedPrompt);
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}/${vector1Prompts.length}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });
  const fpEvaluator = Object.freeze({
    contract: fpEvaluatorContract("plugin://t183/evaluator-retry-pressure/fp-evaluator"),
    evaluate: (pluginInput) => {
      const isVector1 = pluginInput.vectorIndex === 1;
      if (isVector1) {
        vector1EvaluationCount += 1;
      }
      const shouldRetry = isVector1 && vector1EvaluationCount === 1;
      return constructFpEvaluationOutcome({
        status: "evaluated",
        reason: shouldRetry
          ? "missing Spark SQL Provided dependency in candidate source surface"
          : null,
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}/${vector1EvaluationCount}`,
            evaluatorRef: pluginInput.contract.ref,
            gainReportRef: `gain://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}`,
            metricRefs: [
              `metric://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}`
            ],
            closeDisposition: shouldRetry ? "retry" : "close",
            continuationRefs: shouldRetry
              ? ["repair://t183/evaluator-retry-pressure/same-vector"]
              : [],
            evidenceRefs: [
              `evidence://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}/${vector1EvaluationCount}`
            ],
            authorityRefs: [
              ...pluginInput.expectedAssessmentIds,
              `authority://t183/evaluator-retry-pressure/${pluginInput.vectorIndex}`
            ],
            compositionContributionRef:
              pluginInput.selectedRegimeBindingRef ?? pluginInput.selectedCompositionRef,
            compositionRef: pluginInput.selectedCompositionRef,
            compositionDigest: pluginInput.selectedCompositionDigest
          })
        ],
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => {},
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/evaluator-retry-pressure/registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [
        vector0TransformPlan,
        vector0EvaluatePlan,
        vector1TransformPlan,
        vector1EvaluatePlan
      ],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: { fpDispatch, fpEvaluator }
  });

  assert.equal(
    vector1Prompts.length,
    2,
    result.transition.kind === "terminal"
      ? result.transition.reason
      : JSON.stringify(result.transition)
  );
  assert.notEqual(vector1Prompts[0], vector1Prompts[1]);
  assert.doesNotMatch(vector1Prompts[0], /Rejected same-vector candidate payload/u);
  assert.match(vector1Prompts[1], /Rejected same-vector candidate payload/u);
  assert.match(
    vector1Prompts[1],
    /missing Spark SQL Provided dependency in candidate source surface/u
  );
});

test("T-183 runner filters prior artifacts through dependency instruction truth", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const vector0TransformPlan = vectorPlan(basis.graphFunction, 0, "transform");
  const vector0EvaluatePlan = vectorPlan(basis.graphFunction, 0, "evaluate");
  const vector1TransformPlan = vectorPlan(basis.graphFunction, 1, "transform", {
    includePrior: true
  });
  const vector1EvaluatePlan = vectorPlan(basis.graphFunction, 1, "evaluate", {
    includePrior: true
  });
  const vector2TransformPlan = vectorPlan(basis.graphFunction, 2, "transform", {
    includePrior: true
  });
  const declaration = graphFunctionDeclaration(basis.graphFunction.id);
  const vector2Prompts = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t183/dependency-filter/dispatch"),
    dispatch: (pluginInput) => {
      assert.ok(pluginInput.instructionPromptManifest);
      if (pluginInput.vectorIndex === 2) {
        vector2Prompts.push(pluginInput.instructionPromptManifest.renderedPrompt);
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t183/dependency-filter/${pluginInput.vectorIndex}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });
  const fpEvaluator = Object.freeze({
    contract: fpEvaluatorContract("plugin://t183/dependency-filter/fp-evaluator"),
    evaluate: (pluginInput) =>
      constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t183/dependency-filter/${pluginInput.vectorIndex}`,
            evaluatorRef: pluginInput.contract.ref,
            gainReportRef: `gain://t183/dependency-filter/${pluginInput.vectorIndex}`,
            metricRefs: [`metric://t183/dependency-filter/${pluginInput.vectorIndex}`],
            closeDisposition: "close",
            evidenceRefs: [`evidence://t183/dependency-filter/${pluginInput.vectorIndex}`],
            authorityRefs: [
              ...pluginInput.expectedAssessmentIds,
              `authority://t183/dependency-filter/${pluginInput.vectorIndex}`
            ],
            compositionContributionRef:
              pluginInput.selectedRegimeBindingRef ?? pluginInput.selectedCompositionRef,
            compositionRef: pluginInput.selectedCompositionRef,
            compositionDigest: pluginInput.selectedCompositionDigest
          })
        ],
        evidenceRefs: [pluginInput.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => {},
    runtimeRegistryStartup: {
      systemDeclarations: [],
      productStartupConfig: productStartupConfig(),
      productDeclarations: [declaration],
      correlationId: "correlation://t183/dependency-filter/registry"
    },
    instructionAssemblyStartup: {
      compiledPromptPlans: [
        vector0TransformPlan,
        vector0EvaluatePlan,
        vector1TransformPlan,
        vector1EvaluatePlan,
        vector2TransformPlan
      ],
      rendererRef: "renderer://abg/instruction-envelope/default"
    },
    plugins: { fpDispatch, fpEvaluator }
  });

  assert.equal(
    vector2Prompts.length,
    1,
    result.transition.kind === "terminal"
      ? result.transition.reason
      : JSON.stringify(result.transition)
  );
  const vector2Prompt = vector2Prompts[0];
  assert.equal(
    (vector2Prompt.match(/^- slot: prior_artifact$/gmu) ?? []).length,
    1
  );
  assert.match(vector2Prompt, /requirements→design/u);
  assert.doesNotMatch(vector2Prompt, /input_set→requirements/u);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /no admitted plan for evaluate/u);
});
