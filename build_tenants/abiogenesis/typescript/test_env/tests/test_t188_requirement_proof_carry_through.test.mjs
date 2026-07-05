// Validates: T-188
// Validates: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-016

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitCompiledPromptPlanAtStartup,
  admitRequirementProofCarryThroughOutput,
  bindInstructionEnvelope,
  compileInstructionAssemblyPlan,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructRequirementProofCandidateClassificationTable,
  constructRequirementProofCarryThroughContract,
  constructRequirementProofCarryThroughOutputEnvelope,
  constructRuntimeBindingSlot,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  projectRequirementProofCoverage,
  requirementAbgTruthRefFromRequirementProofCoverage,
  renderPromptManifest,
  replayPromptManifest
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import {
  constructGtlContractFulfillmentBinding
} from "../../build/semantic/code/src/gtl/m02/contracts/index.js";
import {
  foldRequirementEvidence,
  requirementAbgTruthRefFromAssuranceClosureDecision
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";

function rule(overrides = {}) {
  return constructInstructionAssemblyRule({
    ruleRef: "instruction-rule://t188/software-build/target-work",
    appliesToGraphFunctionRefs: ["graph-function://t188/software-build"],
    appliesToVectorRefs: [
      "vector://t188/software-build/source-to-test",
      "vector://t188/software-build/dependency-disambiguation"
    ],
    sectionRules: [
      {
        sectionRef: "section://t188/current-target",
        required: true,
        policyRefs: ["policy://t188/current-target"]
      }
    ],
    relevanceRules: [
      {
        ruleRef: "relevance://t188/dependency-closed-target",
        requiredInputRefs: ["dependency-graph://t188/app"],
        allowFutureStageRefs: []
      }
    ],
    compressionPolicyRef: "compression://t188/dependency-closed-excerpt",
    proportionalityPolicyRef: "proportionality://t188/p1-worker",
    runtimeBindingSlotClasses: ["graph_call", "vector", "prior_artifact"],
    policyRefs: ["policy://t188/software-build"],
    evidenceRefs: ["evidence://t188/rule"],
    ...overrides
  });
}

function section(overrides = {}) {
  return constructInstructionSectionDecision({
    sectionRef: "section://t188/current-target",
    disposition: "include",
    dependencyRefs: ["dependency-graph://t188/app"],
    carrierRefs: ["dependency-graph://t188/app", "requirement://t188/r1"],
    compressionMode: "excerpt",
    text: "Build only the dependency-closed target slice from admitted requirements and proofs.",
    digestRef: "sha256:t188-section",
    excerptDigest: "sha256:t188-excerpt",
    fullContentAdmitted: false,
    stageRef: "stage://current",
    gapRefs: [],
    ...overrides
  });
}

function derivedTruth(overrides = {}) {
  return {
    kind: "derived_instruction_carrier_truth",
    sourceTypeRefs: ["node-type://t188/design"],
    targetTypeRefs: ["node-type://t188/test-source"],
    outputContractRefs: ["contract://t188/test-source"],
    proofRefs: ["proof://t188/test-source"],
    authorityRefs: ["authority://t188/fp-worker"],
    rendererRefs: ["renderer://abg/instruction-envelope/default"],
    activeRegime: "F_P",
    carrierClassRefs: ["carrier://t188/design", "carrier://t188/test-source"],
    ...overrides
  };
}

function slots() {
  return [
    constructRuntimeBindingSlot({
      slotRef: "slot://t188/graph-call",
      slotClass: "graph_call",
      required: true,
      sourceTruthKind: "replay_event",
      evidenceRefs: ["evidence://t188/slot/graph-call"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t188/vector",
      slotClass: "vector",
      required: true,
      sourceTruthKind: "projection",
      evidenceRefs: ["evidence://t188/slot/vector"]
    }),
    constructRuntimeBindingSlot({
      slotRef: "slot://t188/prior-artifact",
      slotClass: "prior_artifact",
      required: true,
      sourceTruthKind: "admitted_ref",
      evidenceRefs: ["evidence://t188/slot/prior-artifact"]
    })
  ];
}

function dependencyTruth(overrides = {}) {
  return constructDerivedDependencyInstructionTruth({
    truthRef: "dependency-instruction-truth://t188/app/source-to-test",
    workKind: "target_work",
    dependencyGraphRef: "dependency-graph://t188/app",
    dependencyGraphDigest: "sha256:t188-dependency-graph",
    targetRefs: ["target://t188/test-source"],
    prerequisiteNodeRefs: ["requirement://t188/r1", "module://t188/core"],
    prerequisiteEdgeRefs: ["dependency-edge://t188/r1-core"],
    dependencyClosed: true,
    typedPrerequisiteGapRefs: [],
    noDependencyPolicyRef: null,
    sourceProjectionRefs: [
      "requirement-graph-projection://t188",
      "proof-coverage-projection://t188"
    ],
    ...overrides
  });
}

test("T-188 derives dependency sufficiency and ignores caller-asserted closed flag", () => {
  const forged = dependencyTruth({
    dependencyGraphRef: null,
    dependencyGraphDigest: null,
    dependencyClosed: true,
    typedPrerequisiteGapRefs: ["typed-gap://t188/missing_edge/r1-core"],
    noDependencyPolicyRef: null
  });
  assert.equal(forged.dependencyClosed, false);
  const result = compileInstructionAssemblyPlan(
    compileInput({
      dependencyInstructionTruth: forged
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(issueKinds(result).includes("dependency_sufficiency_gap"), true);
});

function proofDepthTruth(overrides = {}) {
  return constructDerivedProofDepthInstructionTruth({
    truthRef: "proof-depth-instruction-truth://t188/app/source-to-test",
    depthPolicyRef: "proof-depth-policy://t188/software-build",
    depthPolicyDigest: "sha256:t188-depth-policy",
    targetRefs: ["target://t188/test-source"],
    requiredDepthClassRefs: [
      "depth-class://positive",
      "depth-class://negative",
      "depth-class://boundary",
      "depth-class://regression",
      "depth-class://invariant",
      "depth-class://integration",
      "depth-class://semantic-adequacy"
    ],
    declaredDepthClassRefs: [
      "depth-class://positive",
      "depth-class://negative",
      "depth-class://boundary",
      "depth-class://regression",
      "depth-class://invariant",
      "depth-class://integration",
      "depth-class://semantic-adequacy"
    ],
    declaredDepthObligationRefs: [
      "proof-obligation://t188/positive",
      "proof-obligation://t188/negative",
      "proof-obligation://t188/boundary",
      "proof-obligation://t188/regression",
      "proof-obligation://t188/invariant",
      "proof-obligation://t188/integration",
      "proof-obligation://t188/semantic-adequacy"
    ],
    notApplicableDepthClassRefs: [],
    typedDepthGapRefs: [],
    proofStrengthAdmissionRefs: ["proof-strength-admission://t188/source-test"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/coverage-strength"],
    adversarialVerificationRefs: [],
    adversarialCounterexampleRefs: [],
    sourceProjectionRefs: [
      "proof-coverage-projection://t188",
      "assurance-fold-projection://t188"
    ],
    depthComplete: true,
    proofStrengthAdmitted: true,
    ...overrides
  });
}

test("T-188 derives proof-depth and strength verdicts from coverage inputs", () => {
  const forged = proofDepthTruth({
    declaredDepthClassRefs: ["depth-class://positive"],
    typedDepthGapRefs: ["typed-depth-gap://t188/missing_depth_obligation_class/negative"],
    proofStrengthAdmissionRefs: [],
    fdStrengthCriterionRefs: [],
    adversarialVerificationRefs: [],
    depthComplete: true,
    proofStrengthAdmitted: true
  });
  assert.equal(forged.depthComplete, false);
  assert.equal(forged.proofStrengthAdmitted, false);
  const result = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: forged
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(issueKinds(result).includes("depth_policy_incomplete"), true);
  assert.equal(issueKinds(result).includes("proof_strength_not_admitted"), true);
});

function compileInput(overrides = {}) {
  return {
    planRef: "compiled-prompt-plan://t188/software-build/source-to-test",
    rule: rule(),
    graphFunctionRef: "graph-function://t188/software-build",
    vectorRef: "vector://t188/software-build/source-to-test",
    registryEntryRefs: ["registry-entry://t188/software-build"],
    sourceNodeRefs: ["node://t188/design"],
    targetNodeRef: "node://t188/test-source",
    derivedTruth: derivedTruth(),
    knownAlgebraRefs: [...INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs: ["dependency-graph://t188/app"],
    availableInputRefs: ["dependency-graph://t188/app"],
    sectionDecisions: [section()],
    bindingSlots: slots(),
    proportionalityClass: "P1",
    instructionWorkKind: "target_work",
    dependencyInstructionTruth: dependencyTruth(),
    proofDepthInstructionTruth: proofDepthTruth(),
    expectedAnswerMarkers: ["release_ready"],
    compilerEvidenceRefs: ["evidence://t188/compiler"],
    ...overrides
  };
}

function compileAccepted(overrides = {}) {
  const result = compileInstructionAssemblyPlan(compileInput(overrides));
  assert.equal(result.accepted, true);
  assert.ok(result.plan);
  return result.plan;
}

function issueKinds(result) {
  return result.issues.map((item) => item.issueKind);
}

function admission(plan) {
  const result = admitCompiledPromptPlanAtStartup({
    plan,
    registryEntryRefs: ["registry-entry://t188/software-build"],
    startupEventRefs: ["event://t188/startup/compiled-plan"]
  });
  assert.equal(result.admitted, true);
  return result;
}

function runtimeFacts() {
  return [
    {
      kind: "runtime_binding_fact",
      slotClass: "graph_call",
      ref: "graph-call://t188/software-build/1",
      digest: "sha256:t188-graph-call",
      sourceEventRefs: ["event://t188/graph-call-opened"],
      admitted: true
    },
    {
      kind: "runtime_binding_fact",
      slotClass: "vector",
      ref: "vector://t188/software-build/source-to-test",
      digest: "sha256:t188-vector",
      sourceEventRefs: ["event://t188/vector-selected"],
      admitted: true
    },
    {
      kind: "runtime_binding_fact",
      slotClass: "prior_artifact",
      ref: "payload://t188/design",
      digest: "sha256:t188-design",
      sourceEventRefs: ["event://t188/payload-admitted"],
      admitted: true
    }
  ];
}

test("T-188 rejects target work when dependency sufficiency is unknown", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      dependencyInstructionTruth: null
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(issueKinds(result).includes("dependency_sufficiency_gap"), true);
});

test("T-188 allows dependency-disambiguation traversal before dependency sufficiency", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      vectorRef: "vector://t188/software-build/dependency-disambiguation",
      requiredInputRefs: [],
      availableInputRefs: [],
      instructionWorkKind: "dependency_disambiguation",
      dependencyInstructionTruth: dependencyTruth({
        workKind: "dependency_disambiguation",
        dependencyGraphRef: null,
        dependencyGraphDigest: null,
        targetRefs: ["target://t188/dependency-graph"],
        prerequisiteNodeRefs: [],
        prerequisiteEdgeRefs: [],
        dependencyClosed: false,
        typedPrerequisiteGapRefs: ["typed-gap://t188/unresolved_requirement_node/r1"],
        sourceProjectionRefs: ["requirement-graph-projection://t188/bootstrap"]
      }),
      sectionDecisions: [
        section({
          dependencyRefs: ["requirement://t188/r1"],
          carrierRefs: ["requirement://t188/r1"],
          text: "Discover candidate dependency nodes and edges for the admitted requirement."
        })
      ]
    })
  );
  assert.equal(result.accepted, true);
  assert.equal(result.plan.dependencyInstructionTruth.workKind, "dependency_disambiguation");
});

test("T-188 rejects target work with typed missing node and edge gaps", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      dependencyInstructionTruth: dependencyTruth({
        dependencyClosed: false,
        typedPrerequisiteGapRefs: [
          "typed-gap://t188/missing_node/r2",
          "typed-gap://t188/missing_edge/r1-core"
        ]
      })
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(issueKinds(result).includes("typed_prerequisite_gap"), true);
  assert.equal(issueKinds(result).includes("unresolved_requirement_node"), true);
  assert.equal(issueKinds(result).includes("missing_dependency_edge"), true);
});

test("T-188 rejects target work when proof-depth policy is absent or incomplete", () => {
  const absent = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: null
    })
  );
  assert.equal(absent.accepted, false);
  assert.equal(issueKinds(absent).includes("depth_policy_incomplete"), true);

  const incomplete = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: proofDepthTruth({
        depthComplete: false,
        declaredDepthClassRefs: ["depth-class://positive"],
        typedDepthGapRefs: ["typed-depth-gap://t188/missing_depth_obligation_class/negative"]
      })
    })
  );
  assert.equal(incomplete.accepted, false);
  assert.equal(issueKinds(incomplete).includes("depth_policy_incomplete"), true);
  assert.equal(issueKinds(incomplete).includes("missing_depth_obligation_class"), true);
});

test("T-188 rejects unjustified not-applicable depth class and missing proof strength admission", () => {
  const result = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: proofDepthTruth({
        notApplicableDepthClassRefs: ["depth-class://negative"],
        typedDepthGapRefs: [
          "typed-depth-gap://t188/not_applicable_unjustified/negative"
        ],
        proofStrengthAdmissionRefs: [],
        proofStrengthAdmitted: false
      })
    })
  );
  assert.equal(result.accepted, false);
  assert.equal(
    issueKinds(result).includes("depth_class_not_applicable_unjustified"),
    true
  );
  assert.equal(issueKinds(result).includes("proof_strength_not_admitted"), true);
});

test("T-188 rejects proof strength without F_D or adversarial basis and with counterexample", () => {
  const unverified = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: proofDepthTruth({
        fdStrengthCriterionRefs: [],
        adversarialVerificationRefs: []
      })
    })
  );
  assert.equal(unverified.accepted, false);
  assert.equal(
    issueKinds(unverified).includes("proof_strength_not_adversarially_verified"),
    true
  );

  const counterexample = compileInstructionAssemblyPlan(
    compileInput({
      proofDepthInstructionTruth: proofDepthTruth({
        fdStrengthCriterionRefs: [],
        adversarialVerificationRefs: ["adversarial-attempt://t188/refute-boundary"],
        adversarialCounterexampleRefs: ["counterexample://t188/boundary-failure"]
      })
    })
  );
  assert.equal(counterexample.accepted, false);
  assert.equal(
    issueKinds(counterexample).includes("adversarial_counterexample_found"),
    true
  );
});

test("T-188 sufficient dependency truth is rendered and replayed by manifest digest", () => {
  const plan = compileAccepted();
  assert.equal(plan.dependencyInstructionTruth.dependencyClosed, true);
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t188/software-build/source-to-test",
    plan,
    startupAdmission: admission(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t188/software-build/source-to-test",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, true);
  assert.deepEqual(rendered.manifest.dependencyInstructionTruthRefs, [
    "dependency-instruction-truth://t188/app/source-to-test"
  ]);
  assert.deepEqual(rendered.manifest.dependencyGraphRefs, [
    "dependency-graph://t188/app"
  ]);
  assert.deepEqual(rendered.manifest.proofDepthInstructionTruthRefs, [
    "proof-depth-instruction-truth://t188/app/source-to-test"
  ]);
  assert.deepEqual(rendered.manifest.depthPolicyRefs, [
    "proof-depth-policy://t188/software-build"
  ]);
  assert.deepEqual(rendered.manifest.proofStrengthAdmissionRefs, [
    "proof-strength-admission://t188/source-test"
  ]);
  assert.match(rendered.manifest.renderedPrompt, /dependencyClosed: true/u);
  assert.match(rendered.manifest.renderedPrompt, /depthComplete: true/u);

  const replay = replayPromptManifest({
    plan,
    envelope: envelopeResult.envelope,
    manifest: rendered.manifest
  });
  assert.equal(replay.passed, true);

  const drift = replayPromptManifest({
    plan: {
      ...plan,
      dependencyInstructionTruth: dependencyTruth({
        dependencyGraphDigest: "sha256:drifted"
      }),
      proofDepthInstructionTruth: plan.proofDepthInstructionTruth
    },
    envelope: envelopeResult.envelope,
    manifest: rendered.manifest
  });
  assert.equal(drift.passed, false);
  assert.equal(issueKinds(drift).includes("manifest_replay_mismatch"), true);

  const depthDrift = replayPromptManifest({
    plan: {
      ...plan,
      proofDepthInstructionTruth: proofDepthTruth({
        depthPolicyDigest: "sha256:depth-drift"
      })
    },
    envelope: envelopeResult.envelope,
    manifest: rendered.manifest
  });
  assert.equal(depthDrift.passed, false);
  assert.equal(issueKinds(depthDrift).includes("manifest_replay_mismatch"), true);
});

test("T-188 P0 dependency closure does not render an F_P prompt", () => {
  const plan = compileAccepted({
    proportionalityClass: "P0",
    derivedTruth: derivedTruth({
      activeRegime: "F_D",
      rendererRefs: []
    })
  });
  assert.equal(plan.shouldDispatchFp, false);
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t188/p0",
    plan,
    startupAdmission: admission(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t188/p0",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, false);
  assert.equal(rendered.issues[0].issueKind, "p0_dispatch_forbidden");
});

function classificationTable(overrides = {}) {
  return constructRequirementProofCandidateClassificationTable({
    tableRef: "classification-table://t188/plugin-output",
    sourceRef: "gtl-overlay://t188/software-build",
    rules: [
      {
        kind: "requirement_proof_candidate_classification_rule",
        ruleRef: "classification-rule://t188/transform/source-artifact",
        stageRole: "transform",
        outputCandidateKind: "candidate-kind://t188/source-artifact",
        admissionTargetKind: "admission-target://abg/payload",
        evidenceRoleRefs: ["evidence-role://t188/realization"]
      }
    ],
    ...overrides
  });
}

function carryContract(overrides = {}) {
  const table = overrides.classificationTable ?? classificationTable();
  return constructRequirementProofCarryThroughContract({
    contractRef: "plugin-proof-contract://t188/transform/source",
    pluginRef: "plugin://t188/transform/source",
    stageRole: "transform",
    resultInterfaceRef: "result-interface://t188/source",
    responseContractRefs: ["response-contract://t188/source"],
    selectedCompositionRef: "composition://t188/transform/source",
    selectedCompositionDigest: "sha256:t188-composition",
    fulfillmentBindings: [
      constructGtlContractFulfillmentBinding({
        bindingRef: "gtl-contract-fulfillment-binding://t188/r1-source",
        obligationRef: "requirement-obligation://t188/r1",
        requirementRef: "requirement://t188/r1",
        productRequirementRef: "product-requirement://t188/r1",
        designObligationRef: "design-obligation://t188/source",
        componentRef: "component://t188/source",
        productTargetRef: "target://t188/source",
        outputSurfaceRef: "output-surface://t188/source",
        functionOrEntrypointRef: "function://t188/transform/source",
        realizationEvidenceRefs: ["evidence://t188/source/artifact"],
        testOrExecutionEvidenceRefs: ["proof-obligation://t188/source-build"],
        evaluatorFindingRef: "evaluator-finding://t188/source-build",
        authorityRefs: ["authority://t188/fp-worker"],
        evidenceRefs: ["evidence://t188/source/artifact"]
      })
    ],
    proofPolicyRefs: ["proof-policy://t188/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/positive",
      "evidence-shape://t188/negative"
    ],
    proofStrengthRefs: ["proof-strength://t188/execution-plus-test"],
    depthPolicyRefs: ["proof-depth-policy://t188/software-build"],
    requiredDepthClassRefs: [
      "depth-class://positive",
      "depth-class://negative"
    ],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/coverage-strength"],
    requiredAdversarialCheckRefs: [],
    evidenceRoleRefs: ["evidence-role://t188/realization"],
    outputCandidateKinds: ["candidate-kind://t188/source-artifact"],
    admissionTargetKinds: ["admission-target://abg/payload"],
    classificationTableRef: table.tableRef,
    classificationTableDigest: table.tableDigest,
    ...overrides
  });
}

function carryEnvelope(overrides = {}) {
  return constructRequirementProofCarryThroughOutputEnvelope({
    envelopeRef: "plugin-output-envelope://t188/source/1",
    contractRef: "plugin-proof-contract://t188/transform/source",
    stageRole: "transform",
    taskRole: "task-role://t188/build-source",
    outputCandidateKind: "candidate-kind://t188/source-artifact",
    admissionTargetKind: "admission-target://abg/payload",
    sourceRequirementObligationRefs: ["requirement-obligation://t188/r1"],
    evidenceRoleRefs: ["evidence-role://t188/realization"],
    proofObligationRefs: ["proof-obligation://t188/source-build"],
    proofPolicyRefs: ["proof-policy://t188/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/positive",
      "evidence-shape://t188/negative"
    ],
    positiveEvidenceShapeRefs: ["evidence-shape://t188/positive"],
    negativeEvidenceShapeRefs: ["evidence-shape://t188/negative"],
    proofStrengthRefs: ["proof-strength://t188/execution-plus-test"],
    depthPolicyRefs: ["proof-depth-policy://t188/software-build"],
    depthClassRefs: ["depth-class://positive", "depth-class://negative"],
    proofStrengthAdmissionRefs: ["proof-strength-admission://t188/source-test"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/coverage-strength"],
    adversarialAttemptRefs: [],
    counterexampleRefs: [],
    responseContractRef: "response-contract://t188/source",
    resultInterfaceRef: "result-interface://t188/source",
    selectedCompositionRef: "composition://t188/transform/source",
    selectedCompositionDigest: "sha256:t188-composition",
    replayIdentity: "replay://t188/source/1",
    evidenceRefs: ["evidence://t188/source/artifact"],
    ...overrides
  });
}

function requirementFoldFixture() {
  const requirementId = "requirement://t188/r1";
  const projectionRef = "requirement-projection://t188/r1/source";
  const evidenceRef = "evidence://t188/source/artifact";
  return {
    requirementId,
    environment: {
      kind: "edge_requirement_environment",
      environmentRef: "edge-requirement-environment://t188/source-to-test",
      edge: {
        graphFunctionRef: "graph-function://t188/software-build",
        graphVectorRef: "vector://t188/software-build/source-to-test",
        vectorIndex: 0,
        edge: "edge://t188/source-to-test"
      },
      activeTerms: [
        {
          kind: "requirement_term",
          requirementId,
          termKind: "requirement",
          stableId: "REQ-T188-R1",
          sourceRef: "requirement-source://t188/r1",
          sourceDigest: "sha256:t188-r1",
          text: "Build source and proof for the selected dependency-closed slice.",
          relationRefs: [],
          spanRefs: ["span://t188/source-to-test"],
          contextRefs: [],
          evidencePolicyRefs: ["proof-policy://t188/positive-negative"],
          projectionRefs: [projectionRef]
        }
      ],
      activeRelations: [],
      activeSpans: [
        {
          kind: "traversal_span",
          spanId: "span://t188/source-to-test",
          graphFunctionRef: "graph-function://t188/software-build",
          graphVectorRefs: ["vector://t188/software-build/source-to-test"],
          vectorIndexes: [0],
          sourceNodeRef: "node://t188/design",
          targetNodeRef: "node://t188/test-source",
          frameRefs: [],
          zoomRefs: [],
          foldbackRefs: [],
          aliasRefs: []
        }
      ],
      activeContextFragments: [],
      activeDestinationTopologies: [],
      activeTestRelations: [],
      priorFolds: [],
      carriedResiduals: []
    },
    projections: [
      {
        kind: "requirement_projection",
        projectionRef,
        requirementId,
        spanId: "span://t188/source-to-test",
        projectionRole: "obligation",
        authorityRole: "requirement",
        targetPath: null,
        command: null,
        fallbackCommand: null,
        evidenceRole: "asset",
        current: true,
        sourceRefs: ["requirement-source://t188/r1"],
        supersedesProjectionRefs: []
      }
    ],
    evidenceBindings: [
      {
        kind: "requirement_evidence_binding",
        evidenceRef,
        requirementId,
        projectionRef,
        evidenceRole: "asset",
        bindingStatus: "admitted",
        path: null,
        digest: "sha256:t188-source-artifact",
        current: true,
        supersedesEvidenceRefs: [],
        reason: "admitted plugin output proof carry-through"
      }
    ]
  };
}

function assuranceCloseTruthRef() {
  return requirementAbgTruthRefFromAssuranceClosureDecision({
    kind: "assurance_closure_decision",
    decision: "close",
    projectionRef: "assurance-projection://t188/source-to-test"
  });
}

test("T-188 admits requirement proof carry-through with explicit proof shape and replay identity", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope()
  });
  assert.equal(result.accepted, true);
  assert.equal(
    result.categoryKey,
    "replay://t188/source/1|transform|candidate-kind://t188/source-artifact|admission-target://abg/payload"
  );
});

test("T-188 rejects weaker-contract proof and missing source obligation", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      sourceRequirementObligationRefs: [],
      proofStrengthRefs: ["proof-strength://t188/static-review-only"]
    })
  });
  assert.equal(result.accepted, false);
  assert.equal(result.issues.some((item) => item.issueKind === "source_obligation_gap"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "weaker_contract_proof"), true);
});

test("T-188 rejects wrong admission target, evidence role, proof shape, and candidate kind", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      outputCandidateKind: "candidate-kind://t188/unmapped-summary",
      admissionTargetKind: "admission-target://abg/evidence",
      evidenceRoleRefs: ["evidence-role://t188/unmapped"],
      proofObligationRefs: [],
      proofPolicyRefs: [],
      expectedEvidenceShapeRefs: [],
      positiveEvidenceShapeRefs: [],
      negativeEvidenceShapeRefs: []
    })
  });
  assert.equal(result.accepted, false);
  assert.equal(result.issues.some((item) => item.issueKind === "candidate_kind_not_allowed"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "admission_target_not_allowed"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "evidence_role_gap"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "proof_obligation_gap"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "proof_policy_gap"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "proof_shape_gap"), true);
});

test("T-188 rejects allowed but misclassified output candidate", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract({
      outputCandidateKinds: [
        "candidate-kind://t188/source-artifact",
        "candidate-kind://t188/verifier-finding"
      ],
      admissionTargetKinds: [
        "admission-target://abg/payload",
        "admission-target://abg/evidence"
      ]
    }),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      outputCandidateKind: "candidate-kind://t188/verifier-finding",
      admissionTargetKind: "admission-target://abg/payload",
      evidenceRoleRefs: ["evidence-role://t188/realization"]
    })
  });
  assert.equal(result.accepted, false);
  assert.equal(
    result.issues.some((item) => item.issueKind === "candidate_classification_mismatch"),
    true
  );
});

test("T-188 rejects output that carries only part of a fulfillment binding proof pair", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract({
      fulfillmentBindings: [
        constructGtlContractFulfillmentBinding({
          bindingRef: "gtl-contract-fulfillment-binding://t188/r1-source-two-proofs",
          obligationRef: "requirement-obligation://t188/r1",
          requirementRef: "requirement://t188/r1",
          productRequirementRef: "product-requirement://t188/r1",
          designObligationRef: "design-obligation://t188/source",
          componentRef: "component://t188/source",
          productTargetRef: "target://t188/source",
          outputSurfaceRef: "output-surface://t188/source",
          functionOrEntrypointRef: "function://t188/transform/source",
          realizationEvidenceRefs: ["evidence://t188/source/artifact"],
          testOrExecutionEvidenceRefs: [
            "proof-obligation://t188/source-build",
            "proof-obligation://t188/source-regression"
          ],
          evaluatorFindingRef: "evaluator-finding://t188/source-build",
          authorityRefs: ["authority://t188/fp-worker"],
          evidenceRefs: ["evidence://t188/source/artifact"]
        })
      ]
    }),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      proofObligationRefs: ["proof-obligation://t188/source-build"]
    })
  });
  assert.equal(result.accepted, false);
  assert.equal(
    result.issues.some((item) => item.issueKind === "proof_pairing_mismatch"),
    true
  );
});

test("T-188 rejects plugin output with shallow depth and unadmitted strength", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      depthPolicyRefs: [],
      depthClassRefs: ["depth-class://positive"],
      proofStrengthAdmissionRefs: [],
      fdStrengthCriterionRefs: []
    })
  });
  assert.equal(result.accepted, false);
  assert.equal(result.issues.some((item) => item.issueKind === "depth_policy_gap"), true);
  assert.equal(
    result.issues.some((item) => item.issueKind === "missing_depth_obligation_class"),
    true
  );
  assert.equal(
    result.issues.some((item) => item.issueKind === "proof_strength_not_admitted"),
    true
  );
});

test("T-188 rejects plugin output when strength lacks basis or adversarial refutes it", () => {
  const unverified = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      fdStrengthCriterionRefs: [],
      adversarialAttemptRefs: []
    })
  });
  assert.equal(unverified.accepted, false);
  assert.equal(
    unverified.issues.some(
      (item) => item.issueKind === "proof_strength_not_adversarially_verified"
    ),
    true
  );

  const counterexample = admitRequirementProofCarryThroughOutput({
    contract: carryContract({
      fdStrengthCriterionRefs: [],
      requiredAdversarialCheckRefs: ["adversarial-attempt://t188/refute-negative"]
    }),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      fdStrengthCriterionRefs: [],
      adversarialAttemptRefs: ["adversarial-attempt://t188/refute-negative"],
      counterexampleRefs: ["counterexample://t188/negative-case-passes"]
    })
  });
  assert.equal(counterexample.accepted, false);
  assert.equal(
    counterexample.issues.some(
      (item) => item.issueKind === "adversarial_counterexample_found"
    ),
    true
  );
});

test("T-188 rejects output classification collision and digest drift", () => {
  const result = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope({
      replayDigest: "sha256:not-the-replay-digest"
    }),
    existingReplayIdentities: ["replay://t188/source/1"]
  });
  assert.equal(result.accepted, false);
  assert.equal(result.issues.some((item) => item.issueKind === "category_collision"), true);
  assert.equal(result.issues.some((item) => item.issueKind === "replay_digest_mismatch"), true);
});

test("T-188 proof coverage gate allows assurance close only when depth and strength are admitted", () => {
  const fixture = requirementFoldFixture();
  const admission = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope()
  });
  assert.equal(admission.accepted, true);
  const coverage = projectRequirementProofCoverage({
    projectionRef: "requirement-proof-coverage://t188/r1/eligible",
    requirementId: fixture.requirementId,
    requiredRequirementObligationRefs: ["requirement-obligation://t188/r1"],
    admissions: [admission],
    dependencyInstructionTruth: dependencyTruth(),
    proofDepthInstructionTruth: proofDepthTruth()
  });
  assert.equal(coverage.closureEligible, true);
  const folds = foldRequirementEvidence({
    environment: fixture.environment,
    projections: fixture.projections,
    evidenceBindings: fixture.evidenceBindings,
    sourceAbgTruthRefs: [],
    sourceAbgTruthRefsByRequirementId: {
      [fixture.requirementId]: [
        requirementAbgTruthRefFromRequirementProofCoverage(coverage),
        assuranceCloseTruthRef()
      ]
    }
  });
  assert.equal(folds.length, 1);
  assert.equal(folds[0].state, "satisfied");
  assert.equal(folds[0].residualPressureRefs.length, 0);
});

test("T-188 proof coverage gate preserves residual despite assurance close when depth is incomplete", () => {
  const fixture = requirementFoldFixture();
  const admission = admitRequirementProofCarryThroughOutput({
    contract: carryContract(),
    classificationTable: classificationTable(),
    envelope: carryEnvelope()
  });
  assert.equal(admission.accepted, true);
  const coverage = projectRequirementProofCoverage({
    projectionRef: "requirement-proof-coverage://t188/r1/residual",
    requirementId: fixture.requirementId,
    requiredRequirementObligationRefs: ["requirement-obligation://t188/r1"],
    admissions: [admission],
    dependencyInstructionTruth: dependencyTruth(),
    proofDepthInstructionTruth: proofDepthTruth({
      depthComplete: false,
      declaredDepthClassRefs: ["depth-class://positive"],
      typedDepthGapRefs: ["typed-depth-gap://t188/missing_depth_obligation_class/negative"]
    })
  });
  assert.equal(coverage.closureEligible, false);
  assert.equal(coverage.status, "residual");
  assert.equal(coverage.issueKinds.includes("missing_depth_obligation_class"), true);
  const folds = foldRequirementEvidence({
    environment: fixture.environment,
    projections: fixture.projections,
    evidenceBindings: fixture.evidenceBindings,
    sourceAbgTruthRefs: [],
    sourceAbgTruthRefsByRequirementId: {
      [fixture.requirementId]: [
        requirementAbgTruthRefFromRequirementProofCoverage(coverage),
        assuranceCloseTruthRef()
      ]
    }
  });
  assert.equal(folds.length, 1);
  assert.equal(folds[0].state, "no_close_preserved");
  assert.equal(folds[0].residualPressureRefs.length, 1);
});

// ─── T-191 acceptance 4: declared latitude renders into manifests as permission ───

test("T-191 declared latitude renders into the manifest as permission", () => {
  const plan = compileAccepted({
    declaredLatitude: [
      {
        scopeRef: "scope://t191/naming",
        ownerRoute: "F_P",
        latitudeNote: "worker may choose identifier naming within the module convention"
      }
    ]
  });
  assert.deepEqual(plan.declaredLatitude.length, 1);
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t191/latitude",
    plan,
    startupAdmission: admission(plan),
    runtimeFacts: runtimeFacts()
  });
  assert.equal(envelopeResult.accepted, true);
  const rendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t191/latitude",
    plan,
    envelope: envelopeResult.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(rendered.accepted, true);
  assert.equal(rendered.manifest.renderedPrompt.includes("## abg.declared_latitude"), true);
  assert.equal(
    rendered.manifest.renderedPrompt.includes("grants PERMISSION within the named scope"),
    true
  );
  assert.equal(
    rendered.manifest.renderedPrompt.includes("worker may choose identifier naming"),
    true
  );
  // absence differential: no latitude -> no section
  const plain = compileAccepted();
  const plainEnvelope = bindInstructionEnvelope({
    envelopeRef: "instruction-envelope://t191/latitude-plain",
    plan: plain,
    startupAdmission: admission(plain),
    runtimeFacts: runtimeFacts()
  });
  const plainRendered = renderPromptManifest({
    manifestRef: "prompt-manifest://t191/latitude-plain",
    plan: plain,
    envelope: plainEnvelope.envelope,
    rendererRef: "renderer://abg/instruction-envelope/default"
  });
  assert.equal(
    plainRendered.manifest.renderedPrompt.includes("## abg.declared_latitude"),
    false
  );
});

test("T-191 declared latitude fails closed on F_D owner route and empty notes", () => {
  const fd = compileInstructionAssemblyPlan(
    compileInput({
      declaredLatitude: [
        { scopeRef: "scope://t191/bad", ownerRoute: "F_D", latitudeNote: "x" }
      ]
    })
  );
  assert.equal(fd.accepted, false);
  assert.equal(
    fd.issues.some((row) => row.issueKind === "declared_latitude_invalid"),
    true
  );
  const empty = compileInstructionAssemblyPlan(
    compileInput({
      declaredLatitude: [
        { scopeRef: "scope://t191/hole", ownerRoute: "F_P", latitudeNote: "  " }
      ]
    })
  );
  assert.equal(empty.accepted, false);
  assert.equal(
    empty.issues.some((row) => row.issueKind === "declared_latitude_invalid"),
    true
  );
});
