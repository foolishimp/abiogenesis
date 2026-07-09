// Validates: REQ-P-POLICY
// Validates: REQ-R-ABG3-RUN
// Validates: T-072

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  constructEnginePluginContract,
  constructEvidenceAdmittedEvent,
  constructFpDispatchOutcome,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  loadGtlTargetCarrierDefaultsBundle,
  publicStart,
  resolveTargetCarrierContractBinding,
  start
} from "../../build/semantic/code/src/index.js";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

function vectorClosedEvent(plannedEvent) {
  return {
    kind: "vector_closed",
    basisId: plannedEvent.basisId,
    graphCallId: plannedEvent.graphCallId,
    frameId: plannedEvent.frameId,
    vectorIndex: plannedEvent.vectorIndex,
    edge: plannedEvent.edge,
    closureKind: "assessed"
  };
}

const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();

function basisForStart(input, context) {
  return admitExecutionBasis({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId,
    workKey: context.workKey,
    frameId: context.frameId,
    frameLineageId: context.frameLineageId
  });
}

function admittedTargetCarrierOutputEvents(input, context, vectorIndex) {
  const basis = basisForStart(input, context);
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  const targetCarrier = resolveTargetCarrierContractBinding({
    vector,
    defaults: targetCarrierDefaults
  });
  const payloadRef = `payload://m04/replay/${vectorIndex}`;
  const evidenceRef = `evidence://m04/replay/${vectorIndex}`;
  const digest = `digest://m04/replay/${vectorIndex}`;
  return [
    constructPayloadObservedEvent({
      basis,
      vectorIndex,
      payloadRef,
      payloadClass: targetCarrier.outputCarrierKind,
      contractRef: targetCarrier.contractRef,
      digest,
      producerRef: "worker://m04/replay",
      sourceEventRef: `result://m04/replay/${vectorIndex}`,
      authorityRef: `authority://m04/replay/${vectorIndex}`,
      inputDigest: `source-projection://m04/replay/${vectorIndex}`,
      policyRefs: ["policy://m04/replay"]
    }),
    constructPayloadValidatedEvent({
      basis,
      vectorIndex,
      payloadRef,
      contractRef: targetCarrier.contractRef,
      contractDigest: targetCarrier.configDigest,
      digest,
      validationRef: `validation://m04/replay/${vectorIndex}`,
      evidenceRef,
      policyRefs: ["policy://m04/replay"]
    }),
    constructEvidenceAdmittedEvent({
      basis,
      vectorIndex,
      evidenceRef,
      payloadRef,
      authorityRef: `authority://m04/replay/${vectorIndex}`,
      authorityDigest: `authority-digest://m04/replay/${vectorIndex}`,
      inputDigest: `source-projection://m04/replay/${vectorIndex}`,
      providerRefs: ["worker://m04/replay"],
      policyRefs: ["policy://m04/replay"]
    })
  ];
}

test("T-072 M04 start: public start delegates to the ABG-owned iterate runner", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const events = [];

  const outcome = start(input, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_evaluated",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_closed",
      "fd_advance_ready",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_evaluated",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_closed",
      "fd_advance_ready",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_evaluated",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached"
    ]
  );
});

test("T-072 M04 start: F_P remains a lawful dispatch stop from the same engine path", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://m03-iteration"
  });
  const events = [];

  const outcome = start(input, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "instruction_prompt_manifest_projected",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "payload_observed",
      "payload_validated",
      "actor_invocation_closed",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged"
    ]
  );
});

test("T-072 M04 start: vector-closed F_P replay advances on re-entry without redispatching the same vector", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://m03-iteration"
  });
  const firstEvents = [];
  const firstOutcome = start(input, context, (event) => {
    firstEvents.push(event);
  });
  const replayEvents = canonicalRuntimeEvents([
    ...firstEvents,
    ...admittedTargetCarrierOutputEvents(input, context, 0),
    vectorClosedEvent(
      firstEvents.find(
        (event) =>
          event.kind === "vector_traversal_planned" &&
          event.edge === "input_set→requirements"
      )
    )
  ]);
  const secondEvents = [];
  const dispatchedEdges = [];
  const fpDispatch = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://test/no-same-edge-fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch: (pluginInput) => {
      assert.equal(secondEvents.at(-1)?.kind, "actor_invocation_started");
      dispatchedEdges.push(pluginInput.edge);
      assert.notEqual(pluginInput.edge, "input_set→requirements");
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://test/${pluginInput.edge}`,
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });

  const secondOutcome = start(
    input,
    {
      ...context,
      runtimeEvents: replayEvents
    },
    (event) => {
      secondEvents.push(event);
    },
    { fpDispatch }
  );

  assert.equal(firstOutcome.kind, "blocked");
  assert.equal(firstOutcome.stopPredicate, "dispatch_required");
  assert.equal(secondOutcome.kind, "blocked");
  assert.equal(secondOutcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(dispatchedEdges, ["requirements→design"]);
  assert.deepStrictEqual(
    secondEvents.map((event) => event.kind),
    [
      "registry_entry_admitted",
      // T-217 WITNESS-005: a resumed invocation stamps its substrate segment
      "run_segment_opened",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "instruction_prompt_manifest_projected",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "instruction_causal_context_bound",
      "actor_invocation_started",
      "payload_observed",
      "payload_validated",
      "actor_invocation_closed",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged"
    ]
  );
  assert.deepStrictEqual(
    secondEvents
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.edge),
    ["requirements→design"]
  );
});

test("T-072 M04 start scopes a mixed workspace replay log to the active basis", () => {
  const first = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null,
    runId: "run://m03-iteration/previous"
  });
  const previousEvents = [];
  const firstOutcome = start(first.input, first.context, (event) => {
    previousEvents.push(event);
  });
  assert.equal(firstOutcome.kind, "converged");

  const second = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null,
    runId: "run://m03-iteration/current"
  });
  const secondEvents = [];
  const secondOutcome = start(
    second.input,
    {
      ...second.context,
      runtimeEvents: canonicalRuntimeEvents(previousEvents)
    },
    (event) => {
      secondEvents.push(event);
    }
  );

  assert.equal(secondOutcome.kind, "converged");
  assert.equal(secondOutcome.terminalKind, "converged");
  assert.deepStrictEqual(
    secondEvents.filter((event) => event.kind === "basis_admitted").length,
    1
  );
  assert(
    secondEvents.every(
      (event) =>
        !("basisId" in event) ||
        event.basisId.includes("run://m03-iteration/current")
    )
  );
});

test("B-016 M04 publicStart compatibility: legacy entry delegates to the same engine path", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const startEvents = [];
  const publicEvents = [];

  const startOutcome = start(input, context, (event) => {
    startEvents.push(event);
  });
  const publicOutcome = publicStart(input, context, (event) => {
    publicEvents.push(event);
  });

  assert.deepStrictEqual(publicOutcome, startOutcome);
  assert.equal(publicEvents[0].kind, "lever_resolution_admitted");
  assert.deepStrictEqual(
    publicEvents.slice(1).map((event) => event.kind),
    startEvents.map((event) => event.kind)
  );
  assert.equal(publicOutcome.kind, "converged");
});
