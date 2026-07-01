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
import {
  constructGtlLibraryEntryDeclaration,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructProductRegistryStartupConfig,
  runEngineStart,
  start as publicStart
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

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
