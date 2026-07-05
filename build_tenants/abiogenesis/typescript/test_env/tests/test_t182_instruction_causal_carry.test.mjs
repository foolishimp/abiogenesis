// Validates: T-182
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-RUN
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructActorResultArtifactObservedEvent,
  constructEnginePluginInput,
  constructEvidenceAdmittedEvent,
  constructInstructionCausalContextBoundEvent,
  constructPayloadObservedEvent,
  constructPayloadRejectedEvent,
  constructPayloadValidatedEvent,
  constructVectorClosedEvent,
  defaultFpDispatchPlugin,
  deriveInstructionCausalContextProjection,
  deriveRuntimeAggregateProjection,
  emit,
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();

function captureEmit(events) {
  const captured = [];
  const emitted = emit(events, (event) => {
    captured.push(event);
  });
  assert.deepEqual(emitted, captured);
  return emitted;
}

function actorInvocationRef(vectorIndex = 1) {
  return Object.freeze({
    actorInvocationId: `actor-invocation://t182/${vectorIndex}`,
    attemptIndex: 0,
    dispatchRef: "dispatch://m03-iteration",
    resultRef: `result://t182/${vectorIndex}`
  });
}

function actorInvocation(basis, vectorIndex, resultRef) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: `actor-invocation://t182/${vectorIndex}`,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: `graph-call:${basis.id}`,
    frameId: basis.frameId ?? `frame:${basis.id}:root`,
    vectorIndex,
    edge: vector.name,
    attemptIndex: 0,
    dispatchRef: "dispatch://m03-iteration",
    workerId: "worker://t182",
    backendId: "backend://node",
    resultRef,
    causationEventRefs: [`dispatch://m03-iteration/${vectorIndex}`],
    correlationId: `correlation://t182/${vectorIndex}`
  });
}

function targetCarrierForVector(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  return resolveTargetCarrierContractBinding({
    vector,
    defaults: targetCarrierDefaults
  });
}

function withTargetAssetSurface(basis, vectorIndex, patch) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  const target = Object.freeze({
    ...vector.target,
    assetSurface: Object.freeze({
      ...vector.target.assetSurface,
      ...patch
    })
  });
  const nextVector = Object.freeze({
    ...vector,
    target
  });
  const graph = Object.freeze({
    ...basis.graph,
    vectors: Object.freeze(
      basis.graph.vectors.map((candidate, index) =>
        index === vectorIndex ? nextVector : candidate
      )
    )
  });
  return Object.freeze({
    ...basis,
    graph
  });
}

function firstVectorOutputEvents(basis, options = {}) {
  const targetCarrier = targetCarrierForVector(basis, 0);
  const payloadRef = "payload://t182/requirements";
  const evidenceRef = "evidence://t182/requirements";
  const digest = "digest://t182/requirements";
  const observedDigest = options.observedDigest ?? digest;
  const validationDigest = options.validationDigest ?? digest;
  const events = [];
  if (options.includeArtifactContent === true) {
    events.push(
      constructActorResultArtifactObservedEvent({
        invocation: actorInvocation(basis, 0, "result://t182/requirements"),
        artifactRef: "result://t182/requirements",
        artifactPayload: {
          kind: "t182_requirements_artifact",
          source: "requirements artifact body for excerpt causal carry"
        }
      })
    );
  }
  events.push(
    constructPayloadObservedEvent({
      basis,
      vectorIndex: 0,
      payloadRef,
      payloadClass: targetCarrier.outputCarrierKind,
      contractRef: targetCarrier.contractRef,
      digest: observedDigest,
      producerRef: "worker://t182",
      sourceEventRef: "result://t182/requirements",
      authorityRef: "authority://t182/requirements",
      inputDigest: "source-projection://t182/vector-0",
      policyRefs: ["policy://t182"]
    }),
    constructPayloadValidatedEvent({
      basis,
      vectorIndex: 0,
      payloadRef,
      contractRef: targetCarrier.contractRef,
      contractDigest: targetCarrier.configDigest,
      digest: validationDigest,
      validationRef: "validation://t182/requirements",
      evidenceRef,
      policyRefs: ["policy://t182"]
    }),
    constructEvidenceAdmittedEvent({
      basis,
      vectorIndex: 0,
      evidenceRef,
      payloadRef,
      authorityRef: "authority://t182/requirements",
      authorityDigest: "authority-digest://t182/requirements",
      inputDigest: "source-projection://t182/vector-0",
      providerRefs: ["worker://t182"],
      policyRefs: ["policy://t182"]
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  );
  return captureEmit(events);
}

function secondVectorFpInput(basis, events) {
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, events);
  return constructEnginePluginInput({
    contract: defaultFpDispatchPlugin.contract,
    basis,
    projection: runtimeProjection,
    replayEvents: events,
    vectorIndex: 1,
    edge: basis.graph.vectors[1].name,
    regime: "F_P",
    actorInvocationRef: actorInvocationRef(1),
    targetCarrierDefaults
  });
}

test("T-182 binds prior admitted output into the next F_P instruction context", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = firstVectorOutputEvents(basis);
  const input = secondVectorFpInput(basis, events);

  assert.equal(input.instructionCausalContext.status, "bound");
  assert.equal(input.instructionCausalContext.bindings.length, 1);
  const [binding] = input.instructionCausalContext.bindings;
  assert.equal(binding.sourceVectorIndex, 0);
  assert.equal(binding.targetVectorIndex, 1);
  assert.equal(binding.sourceAssetKind, "requirements");
  assert.equal(binding.targetAssetKind, "design");
  assert.equal(binding.bindingRole, "prior_target_output");
  assert.equal(binding.contentMode, "ref_digest_only");
  assert.equal(binding.contentRef, null);
  assert.equal(binding.contentDigest, null);
  assert.equal(binding.required, false);
  assert.equal(binding.payloadRef, "payload://t182/requirements");
  assert.deepEqual(binding.evidenceRefs, [
    "evidence://t182/requirements",
    "validation://t182/requirements"
  ]);
  assert.equal(input.fpTransformRequest.instructionCausalStatus, "bound");
  assert.deepEqual(input.fpTransformRequest.causalInputBindingRefs, [
    binding.bindingRef
  ]);
  assert.deepEqual(input.fpTransformRequest.causalInputBindingPolicyRefs, [
    binding.bindingPolicyRef
  ]);
  assert.deepEqual(input.fpTransformRequest.causalInputContentModes, [
    "ref_digest_only"
  ]);
  assert.deepEqual(input.fpTransformRequest.causalInputContentRefs, []);
  assert.deepEqual(input.fpTransformRequest.causalInputPayloadDigests, [
    "digest://t182/requirements"
  ]);

  const bound = constructInstructionCausalContextBoundEvent({
    basis,
    context: input.instructionCausalContext,
    causationEventRefs: [input.sourceProjectionRef],
    correlationId: "correlation://t182/bound"
  });
  assertRuntimeEvent(bound);
  assert.equal(bound.status, "bound");
  assert.deepEqual(bound.bindingPolicyRefs, [binding.bindingPolicyRef]);
  assert.deepEqual(bound.contentModes, ["ref_digest_only"]);
  assert.deepEqual(bound.contentRefs, []);
  assert.deepEqual(bound.payloadRefs, ["payload://t182/requirements"]);
});

test("T-182 marks declared constructor inputs as required causal inputs", () => {
  const basis = withTargetAssetSurface(
    buildThreeStageBasis({ defaultRegime: "F_P" }),
    1,
    { constructorInputAssetKinds: ["requirements"] }
  );
  const events = firstVectorOutputEvents(basis);
  const input = secondVectorFpInput(basis, events);

  assert.equal(input.instructionCausalContext.status, "bound");
  assert.deepEqual(input.instructionCausalContext.requiredInputRefs, [
    `instruction_causal_required_input:${basis.id}:1:asset_kind=requirements`
  ]);
  const [binding] = input.instructionCausalContext.bindings;
  assert.equal(binding.required, true);
  assert.equal(binding.sourceAssetKind, "requirements");
  assert.deepEqual(input.fpTransformRequest.causalRequiredInputRefs, [
    `instruction_causal_required_input:${basis.id}:1:asset_kind=requirements`
  ]);
  assert.deepEqual(input.fpTransformRequest.causalMissingInputRefs, []);
});

test("T-182 blocks when a declared required causal input is absent", () => {
  const basis = withTargetAssetSurface(
    buildThreeStageBasis({ defaultRegime: "F_P" }),
    1,
    { constructorInputAssetKinds: ["requirements"] }
  );
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const causal = deriveInstructionCausalContextProjection({
    basis,
    runtimeProjection: projection,
    events: [],
    vectorIndex: 1,
    targetCarrierDefaults
  });

  assert.equal(causal.status, "blocked");
  assert.deepEqual(causal.bindingRefs, []);
  assert.deepEqual(causal.requiredInputRefs, [
    `instruction_causal_required_input:${basis.id}:1:asset_kind=requirements`
  ]);
  assert.equal(causal.missingInputRefs.length, 1);
  assert.match(causal.missingInputRefs[0], /required_input_missing/u);
});

test("T-182 blocks declared excerpt mode until admitted content is available", () => {
  const basis = withTargetAssetSurface(
    buildThreeStageBasis({ defaultRegime: "F_P" }),
    1,
    { renderedViewDigestPolicyRef: "policy://abg/instruction-causal/excerpt" }
  );
  const events = firstVectorOutputEvents(basis);
  const projection = deriveRuntimeAggregateProjection(basis, events);
  const causal = deriveInstructionCausalContextProjection({
    basis,
    runtimeProjection: projection,
    events,
    vectorIndex: 1,
    targetCarrierDefaults
  });

  assert.equal(causal.status, "blocked");
  assert.deepEqual(causal.bindings, []);
  assert.equal(causal.missingInputRefs.length, 1);
  assert.match(causal.missingInputRefs[0], /content_unavailable/u);
  assert.match(causal.missingInputRefs[0], /content_mode=excerpt/u);
});

test("T-182 binds declared excerpt mode from admitted actor artifact content", () => {
  const basis = withTargetAssetSurface(
    buildThreeStageBasis({ defaultRegime: "F_P" }),
    1,
    { renderedViewDigestPolicyRef: "policy://abg/instruction-causal/excerpt" }
  );
  const events = firstVectorOutputEvents(basis, {
    includeArtifactContent: true
  });
  const input = secondVectorFpInput(basis, events);

  assert.equal(input.instructionCausalContext.status, "bound");
  const [binding] = input.instructionCausalContext.bindings;
  assert.equal(binding.contentMode, "excerpt");
  assert.equal(binding.contentRef, "result://t182/requirements");
  assert.match(binding.contentDigest, /^sha256:/u);
  assert.match(binding.contentExcerpt, /requirements artifact body/u);
  assert.deepEqual(input.fpTransformRequest.causalInputContentRefs, [
    "result://t182/requirements"
  ]);
  assert.deepEqual(input.fpTransformRequest.causalInputContentDigests, [
    binding.contentDigest
  ]);
  assert.deepEqual(input.fpTransformRequest.causalInputContentExcerpts, [
    binding.contentExcerpt
  ]);
});

test("T-182 binds same-vector rejected payload evidence into retry repair context", () => {
  const basis = withTargetAssetSurface(
    buildThreeStageBasis({ defaultRegime: "F_P" }),
    1,
    { renderedViewDigestPolicyRef: "policy://abg/instruction-causal/excerpt" }
  );
  const targetCarrier = targetCarrierForVector(basis, 1);
  const resultRef = "result://t182/design-attempt-1";
  const payloadRef = "payload://t182/design-attempt-1";
  const digest = "digest://t182/design-attempt-1";
  const events = captureEmit([
    constructActorResultArtifactObservedEvent({
      invocation: actorInvocation(basis, 1, resultRef),
      artifactRef: resultRef,
      artifactPayload: {
        kind: "t182_design_candidate",
        materializedFileSummaries: [
          {
            path: "src/test/scala/ExampleSpec.scala",
            digest: "sha256:t182",
            contentPreview: "val bad = MissingApi.default"
          }
        ]
      }
    }),
    constructPayloadObservedEvent({
      basis,
      vectorIndex: 1,
      payloadRef,
      payloadClass: targetCarrier.outputCarrierKind,
      contractRef: targetCarrier.contractRef,
      digest,
      producerRef: "worker://t182",
      sourceEventRef: resultRef,
      actorInvocationId: "actor-invocation://t182/1",
      authorityRef: "authority://t182/design-attempt-1",
      inputDigest: "source-projection://t182/vector-1",
      policyRefs: ["policy://t182"]
    }),
    constructPayloadRejectedEvent({
      basis,
      vectorIndex: 1,
      payloadRef,
      rejectionClass: "contract_invalid",
      contractRef: targetCarrier.contractRef,
      contractDigest: targetCarrier.configDigest,
      digest,
      reason: "sbt Test/compile exited 1: value default is not a member of MissingApi",
      policyRefs: ["policy://t182"]
    })
  ]);
  const input = constructEnginePluginInput({
    contract: defaultFpDispatchPlugin.contract,
    basis,
    projection: deriveRuntimeAggregateProjection(basis, events),
    replayEvents: events,
    vectorIndex: 1,
    edge: basis.graph.vectors[1].name,
    regime: "F_P",
    actorInvocationRef: Object.freeze({
      ...actorInvocationRef(1),
      attemptIndex: 2
    }),
    targetCarrierDefaults
  });

  assert.equal(input.instructionCausalContext.status, "bound");
  const [binding] = input.instructionCausalContext.bindings;
  assert.equal(binding.bindingRole, "same_vector_retry_repair");
  assert.equal(binding.sourceVectorIndex, 1);
  assert.equal(binding.targetVectorIndex, 1);
  assert.equal(binding.payloadRef, payloadRef);
  assert.match(binding.contentExcerpt, /sbt Test\/compile exited 1/u);
  assert.match(binding.contentExcerpt, /MissingApi\.default/u);
  assert.deepEqual(input.fpTransformRequest.causalInputContentRefs, [resultRef]);
  assert.match(
    input.fpTransformRequest.causalInputContentExcerpts[0],
    /value default is not a member/u
  );
});

test("T-182 blocks causal carry when prior output digest drifts", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = firstVectorOutputEvents(basis, {
    validationDigest: "digest://t182/drifted"
  });
  const projection = deriveRuntimeAggregateProjection(basis, events);
  const causal = deriveInstructionCausalContextProjection({
    basis,
    runtimeProjection: projection,
    events,
    vectorIndex: 1,
    targetCarrierDefaults
  });

  assert.equal(causal.status, "blocked");
  assert.equal(causal.bindings.length, 0);
  assert.equal(causal.missingInputRefs.length, 1);
  assert.match(causal.missingInputRefs[0], /digest drift/u);
});

test("T-182 runner does not invoke F_P when causal carry is blocked", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const replayEvents = firstVectorOutputEvents(basis, {
    validationDigest: "digest://t182/drifted"
  });
  const emittedEvents = [];
  let dispatchCalls = 0;
  const fpDispatch = Object.freeze({
    contract: defaultFpDispatchPlugin.contract,
    dispatch: () => {
      dispatchCalls += 1;
      throw new Error("blocked causal carry must not invoke F_P dispatch");
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    runtimeEvents: replayEvents,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    targetCarrierDefaults,
    plugins: { fpDispatch }
  });

  assert.equal(dispatchCalls, 0);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepEqual(
    emittedEvents.map((event) => event.kind),
    [
      "basis_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "instruction_prompt_manifest_projected",
      "fp_dispatch_requested",
      "instruction_causal_context_bound",
      "terminal_reached"
    ]
  );
  const causalEvent = emittedEvents.find(
    (event) => event.kind === "instruction_causal_context_bound"
  );
  assert.equal(causalEvent.status, "blocked");
  assert.equal(causalEvent.missingInputRefs.length, 1);
});

test("T-182 does not invent causal input when no prior vector is closed", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const causal = deriveInstructionCausalContextProjection({
    basis,
    runtimeProjection: projection,
    events: [],
    vectorIndex: 0,
    targetCarrierDefaults
  });

  assert.equal(causal.status, "empty");
  assert.deepEqual(causal.bindingRefs, []);
  assert.deepEqual(causal.missingInputRefs, []);
});
