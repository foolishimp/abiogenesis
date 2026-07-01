// Validates: T-183
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitCompiledPromptPlanAtStartup,
  bindInstructionEnvelope,
  compileInstructionAssemblyPlan,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructRuntimeBindingSlot,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  renderPromptManifest,
  replayPromptManifest
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

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
    expectedAnswerMarkers: ["release_ready", "closed"],
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
      ]
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

