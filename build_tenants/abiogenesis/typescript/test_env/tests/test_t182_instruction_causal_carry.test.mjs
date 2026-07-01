// Validates: T-182
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-RUN
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructEnginePluginInput,
  constructEvidenceAdmittedEvent,
  constructInstructionCausalContextBoundEvent,
  constructPayloadObservedEvent,
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
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

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

function targetCarrierForVector(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  return resolveTargetCarrierContractBinding({
    vector,
    defaults: targetCarrierDefaults
  });
}

function firstVectorOutputEvents(basis, options = {}) {
  const targetCarrier = targetCarrierForVector(basis, 0);
  const payloadRef = "payload://t182/requirements";
  const evidenceRef = "evidence://t182/requirements";
  const digest = "digest://t182/requirements";
  const observedDigest = options.observedDigest ?? digest;
  const validationDigest = options.validationDigest ?? digest;
  return captureEmit([
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
  ]);
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
  assert.equal(binding.payloadRef, "payload://t182/requirements");
  assert.deepEqual(binding.evidenceRefs, ["evidence://t182/requirements"]);
  assert.equal(input.fpTransformRequest.instructionCausalStatus, "bound");
  assert.deepEqual(input.fpTransformRequest.causalInputBindingRefs, [
    binding.bindingRef
  ]);
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
  assert.deepEqual(bound.payloadRefs, ["payload://t182/requirements"]);
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
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
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
